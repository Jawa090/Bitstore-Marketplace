import { Response, NextFunction } from "express";
import { sendSuccess, sendCreated } from "../utils/response";
import { AuthRequest } from "../types/auth.types";
import * as CartService from "../services/cart.service";
import { AppError } from "../utils/AppError";

// ─────────────────────────────────────────────────────────────────────
// GET /api/cart
// ─────────────────────────────────────────────────────────────────────
export const getCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cart = await CartService.getCart(req.user!.id);
    sendSuccess(res, "Cart retrieved successfully", { cart });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/cart/items
// ─────────────────────────────────────────────────────────────────────
export const addItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) throw new AppError("productId is required.", 400);

    const cart = await CartService.addItem(
      req.user!.id,
      productId,
      quantity || 1
    );
    sendCreated(res, "Item added to cart", { cart });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// PUT /api/cart/items/:productId
// ─────────────────────────────────────────────────────────────────────
export const updateItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = req.params.productId as string;
    const { quantity } = req.body;
    if (!quantity) throw new AppError("quantity is required.", 400);

    const cart = await CartService.updateItemQuantity(
      req.user!.id,
      productId,
      quantity
    );
    sendSuccess(res, "Cart item updated", { cart });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// DELETE /api/cart/items/:productId
// ─────────────────────────────────────────────────────────────────────
export const removeItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = req.params.productId as string;
    const cart = await CartService.removeItem(req.user!.id, productId);
    sendSuccess(res, "Item removed from cart", { cart });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// DELETE /api/cart
// ─────────────────────────────────────────────────────────────────────
export const clearCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cart = await CartService.clearCart(req.user!.id);
    sendSuccess(res, "Cart cleared", { cart });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/cart/sync  — merge guest cart into authenticated user's cart
// ─────────────────────────────────────────────────────────────────────
export const syncCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError("items must be a non-empty array.", 400);
    }

    // Validate shape of each item
    for (const item of items) {
      if (!item.productId || typeof item.productId !== "string") {
        throw new AppError("Each item must have a valid productId.", 400);
      }
      if (item.quantity != null && (typeof item.quantity !== "number" || item.quantity < 1)) {
        throw new AppError("Each item quantity must be a positive number.", 400);
      }
    }

    const cart = await CartService.syncCart(
      req.user!.id,
      items.map((i: any) => ({ productId: i.productId, quantity: i.quantity || 1 }))
    );
    sendSuccess(res, "Cart synced successfully", { cart });
  } catch (error) {
    next(error);
  }
};
