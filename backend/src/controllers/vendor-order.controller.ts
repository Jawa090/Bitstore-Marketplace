import { Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response";
import { AuthRequest } from "../types/auth.types";
import { AppError } from "../utils/AppError";
import * as VendorOrderService from "../services/vendor-order.service";

// ─────────────────────────────────────────────────────────────────────────
// GET /api/vendor/orders
// List all sub-orders belonging to the authenticated vendor.
// ─────────────────────────────────────────────────────────────────────────
export const listOrdersHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await VendorOrderService.getVendorOrders(req.vendor!.id);
    sendSuccess(res, "Vendor orders retrieved successfully.", { orders });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/vendor/orders/:id
// Update the status (and optionally tracking number) of a sub-order.
// ─────────────────────────────────────────────────────────────────────────
export const updateOrderHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subOrderId = req.params.id as string;
    if (!subOrderId) throw new AppError("Sub-order ID is required.", 400);

    const { status, tracking_number } = req.body;
    if (!status) throw new AppError("status is required.", 400);

    const order = await VendorOrderService.updateOrderStatus(
      req.vendor!.id,
      subOrderId,
      status,
      tracking_number
    );

    sendSuccess(res, "Order status updated successfully.", { order });
  } catch (error) {
    next(error);
  }
};
