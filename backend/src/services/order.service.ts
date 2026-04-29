import { AppDataSource } from "../config/database";
import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItem";
import { Order } from "../entities/Order";
import { SubOrder } from "../entities/SubOrder";
import { OrderItem } from "../entities/OrderItem";
import { ReturnRequest } from "../entities/ReturnRequest";
import { AppError } from "../utils/AppError";
import { OrderStatus, SubOrderStatus } from "../utils/constants";



// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────
interface PlaceOrderPayload {
  delivery_address: string;
  delivery_emirate: string;
  payment_method: string;
  phone: string;
  delivery_landmark?: string;
  notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// PLACE ORDER
// Wraps everything in a single DB transaction so a failure at any step
// rolls back all inserts and leaves the cart untouched.
// ─────────────────────────────────────────────────────────────────────────
export const placeOrder = async (
  userId: string,
  payload: PlaceOrderPayload
): Promise<Order> => {
  // ── 1. Fetch the user's cart ────────────────────────────────────────
  const cart = await AppDataSource.getRepository(Cart).findOne({
    where: { user_id: userId },
    relations: ["items", "items.product", "items.product.vendor"],
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty.", 400);
  }

  // ── 2. Group cart items by real vendor ────────────────────────────────
  const vendorMap = new Map<string, CartItem[]>();
  for (const item of cart.items) {
    if (!item.product || !item.product.vendor) {
      throw new AppError(
        `Product or vendor data missing for cart item ${item.id}. Cannot place order.`,
        400
      );
    }
    const vendorId = item.product.vendor.id;
    const group = vendorMap.get(vendorId) ?? [];
    group.push(item);
    vendorMap.set(vendorId, group);
  }

  // Calculate order totals using real product prices
  const subtotalRaw = cart.items.reduce(
    (sum, i) => sum + i.quantity * Number(i.product.price),
    0
  );
  const vatAmount = parseFloat((subtotalRaw * 0.05).toFixed(2)); // 5% UAE VAT
  const codFee =
    payload.payment_method === "cod"
      ? parseFloat((subtotalRaw * 0.01).toFixed(2)) // 1% COD fee
      : 0;
  const totalAmount = parseFloat(
    (subtotalRaw + vatAmount + codFee).toFixed(2)
  );

  // ── 3. Open a transaction ───────────────────────────────────────────
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // COD orders are immediately actionable — mark them confirmed so the
    // fulfillment team can start processing without waiting for a payment event.
    // Card/wallet orders stay pending until the Stripe webhook confirms payment.
    const isCod = payload.payment_method === "cod";
    const initialOrderStatus = isCod ? OrderStatus.CONFIRMED : OrderStatus.PENDING;
    const initialSubOrderStatus = isCod ? SubOrderStatus.CONFIRMED : SubOrderStatus.PENDING;

    // Step A — Insert master Order
    const order = queryRunner.manager.create(Order, {
      customer_id: userId,
      total_amount: String(totalAmount),
      vat_amount: String(vatAmount),
      cod_fee: String(codFee),
      payment_method: payload.payment_method ?? null,
      status: initialOrderStatus,
      // payment_status intentionally omitted — entity default (UNPAID) applies
      delivery_emirate: payload.delivery_emirate,
      delivery_address: payload.delivery_address,
      delivery_landmark: payload.delivery_landmark ?? null,
      phone: payload.phone ?? null,
      notes: payload.notes ?? null,
    });
    const savedOrder = await queryRunner.manager.save(Order, order);

    // Step B & C — One SubOrder per vendor, then OrderItems under it
    for (const [vendorId, vendorItems] of vendorMap) {
      const vendorSubtotal = vendorItems.reduce(
        (sum, i) => sum + i.quantity * Number(i.product.price),
        0
      );

      const subOrder = queryRunner.manager.create(SubOrder, {
        order_id: savedOrder.id,
        vendor_id: vendorId,
        subtotal: String(parseFloat(vendorSubtotal.toFixed(2))),
        status: initialSubOrderStatus,
      });
      const savedSubOrder = await queryRunner.manager.save(SubOrder, subOrder);

      const orderItems = vendorItems.map((ci) =>
        queryRunner.manager.create(OrderItem, {
          sub_order_id: savedSubOrder.id,
          product_id: ci.product_id,
          quantity: ci.quantity,
          unit_price: String(Number(ci.product.price)),
        })
      );
      await queryRunner.manager.save(OrderItem, orderItems);
    }

    // Step D — Clear the cart for COD only (delete items, keep the cart row).
    // For Card payments, the cart must survive until Stripe confirms payment.
    // The frontend will call DELETE /api/cart upon successful payment confirmation.
    if (payload.payment_method === 'cod') {
      await queryRunner.manager.delete(CartItem, { cart_id: cart.id });
    }

    // ── 4. Commit ─────────────────────────────────────────────────────
    await queryRunner.commitTransaction();

    // Return the saved order with all relations eagerly loaded
    return getOrderById(userId, savedOrder.id);
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET USER ORDERS  (list, newest first)
// ─────────────────────────────────────────────────────────────────────────
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  return AppDataSource.getRepository(Order).find({
    where: { customer_id: userId },
    relations: ["sub_orders", "sub_orders.items"],
    order: { created_at: "DESC" },
  });
};

// ─────────────────────────────────────────────────────────────────────────
// GET ORDER BY ID  (must belong to the requesting user)
// ─────────────────────────────────────────────────────────────────────────
export const getOrderById = async (
  userId: string,
  orderId: string
): Promise<Order> => {
  const order = await AppDataSource.getRepository(Order).findOne({
    where: { id: orderId, customer_id: userId },
    relations: ["sub_orders", "sub_orders.items"],
  });

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  return order;
};

// ─────────────────────────────────────────────────────────────────────────
// CANCEL ORDER
// Only cancellable while status is 'pending' or 'confirmed'.
// Cancels the master Order and all its SubOrders atomically.
// ─────────────────────────────────────────────────────────────────────────
export const cancelOrder = async (
  userId: string,
  orderId: string
): Promise<Order> => {
  const order = await getOrderById(userId, orderId);

  const cancellable: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.CONFIRMED];
  if (!cancellable.includes(order.status)) {
    throw new AppError("Order cannot be cancelled at this stage.", 400);
  }

  // Mutate statuses — cascade: ['update'] on sub_orders propagates the saves
  order.status = OrderStatus.CANCELLED;
  order.sub_orders.forEach((so) => {
    so.status = SubOrderStatus.CANCELLED;
  });

  await AppDataSource.getRepository(Order).save(order);

  return getOrderById(userId, orderId);
};

// ─────────────────────────────────────────────────────────────────────────
// CREATE RETURN REQUEST
// Only allowed once an order has been delivered.
// Inserts a ReturnRequest and flips the master Order to 'returned'.
// ─────────────────────────────────────────────────────────────────────────
interface ReturnPayload {
  reason: string;
  comments?: string;
}

export const createReturnRequest = async (
  userId: string,
  orderId: string,
  payload: ReturnPayload
): Promise<ReturnRequest> => {
  const order = await getOrderById(userId, orderId);

  if (order.status !== OrderStatus.DELIVERED) {
    throw new AppError("Only delivered orders can be returned.", 400);
  }

  const returnRequest = AppDataSource.getRepository(ReturnRequest).create({
    order_id: orderId,
    customer_id: userId,
    reason: payload.reason,
    comments: payload.comments ?? null,
  });

  const saved = await AppDataSource.getRepository(ReturnRequest).save(returnRequest);

  // Mark the master order as returned
  order.status = OrderStatus.RETURNED;
  await AppDataSource.getRepository(Order).save(order);

  return saved;
};

// ─────────────────────────────────────────────────────────────────────────
// GET ORDER TRACKING
// Returns a per-vendor tracking summary for every SubOrder on the order.
// ─────────────────────────────────────────────────────────────────────────
interface TrackingEntry {
  subOrderId: string;
  vendorId: string;
  status: string;
  tracking_number: string | null;
  courier: string | null;
}

export const getOrderTracking = async (
  userId: string,
  orderId: string
): Promise<TrackingEntry[]> => {
  const order = await getOrderById(userId, orderId);

  return order.sub_orders.map((so) => ({
    subOrderId: so.id,
    vendorId: so.vendor_id,
    status: so.status,
    tracking_number: so.tracking_number,
    courier: so.courier,
  }));
};
