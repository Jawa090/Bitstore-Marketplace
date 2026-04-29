import { AppDataSource } from "../config/database";
import { SubOrder } from "../entities/SubOrder";
import { AppError } from "../utils/AppError";
import { SubOrderStatus } from "../utils/constants";

// ─────────────────────────────────────────────────────────────────────────
// GET VENDOR ORDERS
// Returns all SubOrders belonging to the given vendor, with the parent
// Order (for customer info / shipping address) and OrderItems eagerly loaded.
// ─────────────────────────────────────────────────────────────────────────
export const getVendorOrders = async (
  vendorId: string
): Promise<SubOrder[]> => {
  return AppDataSource.getRepository(SubOrder).find({
    where: { vendor_id: vendorId },
    relations: ["order", "items"],
    order: { created_at: "DESC" },
  });
};

// ─────────────────────────────────────────────────────────────────────────
// UPDATE ORDER STATUS
// Allows a vendor to update the status (and optionally tracking number)
// of one of their SubOrders.  Includes a vendor ownership security check.
// ─────────────────────────────────────────────────────────────────────────
export const updateOrderStatus = async (
  vendorId: string,
  subOrderId: string,
  status: string,
  trackingNumber?: string
): Promise<SubOrder> => {
  const repo = AppDataSource.getRepository(SubOrder);

  const subOrder = await repo.findOne({
    where: { id: subOrderId, vendor_id: vendorId },
    relations: ["order", "items"],
  });

  if (!subOrder) {
    throw new AppError("Sub-order not found or does not belong to your store.", 404);
  }

  // Validate the incoming status against the enum
  const validStatuses = Object.values(SubOrderStatus) as string[];
  if (!validStatuses.includes(status)) {
    throw new AppError(
      `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
      400
    );
  }

  subOrder.status = status as SubOrderStatus;

  if (trackingNumber !== undefined) {
    subOrder.tracking_number = trackingNumber;
  }

  return repo.save(subOrder);
};
