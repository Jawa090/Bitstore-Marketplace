import { AppDataSource } from "../config/database";
import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItem";
import { AppError } from "../utils/AppError";

const cartRepo = () => AppDataSource.getRepository(Cart);
const itemRepo = () => AppDataSource.getRepository(CartItem);

// ── Mock stock constant (replace with real Product DB check later) ───
const MOCK_AVAILABLE_STOCK = 10;

const checkStock = (requestedQty: number) => {
  if (requestedQty > MOCK_AVAILABLE_STOCK) {
    throw new AppError(
      `Requested quantity exceeds available stock (${MOCK_AVAILABLE_STOCK}).`,
      400
    );
  }
};

// ─────────────────────────────────────────────────────────────────────
// Find or create a cart for the given user
// ─────────────────────────────────────────────────────────────────────
const findOrCreateCart = async (userId: string): Promise<Cart> => {
  let cart = await cartRepo().findOne({
    where: { user_id: userId },
    relations: ["items"],
  });

  if (!cart) {
    cart = cartRepo().create({ user_id: userId, items: [] });
    await cartRepo().save(cart);
  }

  return cart;
};

// ─────────────────────────────────────────────────────────────────────
// GET CART (with stock info per item)
// ─────────────────────────────────────────────────────────────────────
export const getCart = async (userId: string) => {
  const cart = await findOrCreateCart(userId);

  // Enrich each item with available stock for the frontend
  const itemsWithStock = cart.items.map((item) => ({
    ...item,
    available_stock: MOCK_AVAILABLE_STOCK, // TODO: Replace with real Product DB lookup
  }));

  return { ...cart, items: itemsWithStock };
};

// ─────────────────────────────────────────────────────────────────────
// ADD ITEM (or increment quantity if it already exists)
// ─────────────────────────────────────────────────────────────────────
export const addItem = async (
  userId: string,
  productId: string,
  quantity: number = 1
) => {
  if (quantity < 1) throw new AppError("Quantity must be at least 1.", 400);

  const cart = await findOrCreateCart(userId);

  // Check if item already in cart
  const existing = cart.items.find((i) => i.product_id === productId);
  const totalQty = existing ? existing.quantity + quantity : quantity;

  // Stock validation
  checkStock(totalQty);

  if (existing) {
    existing.quantity = totalQty;
    await itemRepo().save(existing);
  } else {
    const newItem = itemRepo().create({
      cart_id: cart.id,
      product_id: productId,
      quantity,
    });
    await itemRepo().save(newItem);
  }

  // Return the refreshed cart
  return findOrCreateCart(userId);
};

// ─────────────────────────────────────────────────────────────────────
// UPDATE ITEM QUANTITY
// ─────────────────────────────────────────────────────────────────────
export const updateItemQuantity = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  if (quantity < 1) throw new AppError("Quantity must be at least 1.", 400);

  // Stock validation
  checkStock(quantity);

  const cart = await findOrCreateCart(userId);
  const item = cart.items.find((i) => i.product_id === productId);

  if (!item) {
    throw new AppError("Item not found in cart.", 404);
  }

  item.quantity = quantity;
  await itemRepo().save(item);

  return findOrCreateCart(userId);
};

// ─────────────────────────────────────────────────────────────────────
// REMOVE ITEM
// ─────────────────────────────────────────────────────────────────────
export const removeItem = async (userId: string, productId: string) => {
  const cart = await findOrCreateCart(userId);
  const item = cart.items.find((i) => i.product_id === productId);

  if (!item) {
    throw new AppError("Item not found in cart.", 404);
  }

  await itemRepo().remove(item);
  return findOrCreateCart(userId);
};

// ─────────────────────────────────────────────────────────────────────
// CLEAR CART
// ─────────────────────────────────────────────────────────────────────
export const clearCart = async (userId: string) => {
  const cart = await cartRepo().findOne({
    where: { user_id: userId },
  });

  if (cart) {
    await itemRepo().delete({ cart_id: cart.id });
  }

  return findOrCreateCart(userId);
};

// ─────────────────────────────────────────────────────────────────────
// SYNC CART (merge guest cart items into authenticated user's cart)
// ─────────────────────────────────────────────────────────────────────
export const syncCart = async (
  userId: string,
  items: { productId: string; quantity: number }[]
) => {
  for (const item of items) {
    await addItem(userId, item.productId, item.quantity);
  }
  return findOrCreateCart(userId);
};
