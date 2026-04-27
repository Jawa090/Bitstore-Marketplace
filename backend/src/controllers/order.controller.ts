import { Response, NextFunction } from "express";
import { sendSuccess, sendCreated } from "../utils/response";
import { AuthRequest } from "../types/auth.types";
import { AppError } from "../utils/AppError";
import * as OrderService from "../services/order.service";

// ─────────────────────────────────────────────────────────────────────────
// POST /api/orders
// Place a new order from the authenticated user's current cart.
// ─────────────────────────────────────────────────────────────────────────
export const placeOrderHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { delivery_address, delivery_emirate, payment_method, phone } =
      req.body;

    if (!delivery_address)
      throw new AppError("delivery_address is required.", 400);
    if (!delivery_emirate)
      throw new AppError("delivery_emirate is required.", 400);
    if (!payment_method)
      throw new AppError("payment_method is required.", 400);
    if (!phone) throw new AppError("phone is required.", 400);

    const order = await OrderService.placeOrder(req.user!.id, {
      delivery_address,
      delivery_emirate,
      payment_method,
      phone,
      delivery_landmark: req.body.delivery_landmark,
      notes: req.body.notes,
    });

    sendCreated(res, "Order placed successfully.", { order });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/orders
// Return all orders belonging to the authenticated user.
// ─────────────────────────────────────────────────────────────────────────
export const getOrdersHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await OrderService.getUserOrders(req.user!.id);
    sendSuccess(res, "Orders retrieved successfully.", { orders });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id
// Return a single order with full relations (sub-orders + items).
// ─────────────────────────────────────────────────────────────────────────
export const getOrderDetailHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderId = req.params.id as string;
    if (!orderId) throw new AppError("Order ID is required.", 400);

    const order = await OrderService.getOrderById(req.user!.id, orderId);
    sendSuccess(res, "Order retrieved successfully.", { order });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/orders/:id/cancel
// Cancel a pending or confirmed order.
// ─────────────────────────────────────────────────────────────────────────
export const cancelOrderHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderId = req.params.id as string;
    const order = await OrderService.cancelOrder(req.user!.id, orderId);
    sendSuccess(res, "Order cancelled successfully.", { order });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/orders/:id/return
// Submit a return request for a delivered order.
// ─────────────────────────────────────────────────────────────────────────
export const returnOrderHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderId = req.params.id as string;
    const { reason, comments } = req.body;

    if (!reason) throw new AppError("reason is required.", 400);

    const returnRequest = await OrderService.createReturnRequest(
      req.user!.id,
      orderId,
      { reason, comments }
    );
    sendSuccess(res, "Return request submitted successfully.", { returnRequest });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id/tracking
// Return per-vendor tracking info for every sub-order.
// ─────────────────────────────────────────────────────────────────────────
export const getTrackingHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderId = req.params.id as string;
    const tracking = await OrderService.getOrderTracking(req.user!.id, orderId);
    sendSuccess(res, "Tracking information retrieved successfully.", { tracking });
  } catch (error) {
    next(error);
  }
};
