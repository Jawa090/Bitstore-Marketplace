import { Request, Response, NextFunction } from "express";
import { sendSuccess, sendCreated } from "../utils/response";
import { AuthRequest } from "../types/auth.types";
import { AppError } from "../utils/AppError";
import * as PaymentService from "../services/payment.service";

// ─────────────────────────────────────────────────────────────────────────
// POST /api/payments/create-intent
// Creates a Stripe PaymentIntent and returns the client_secret to the
// frontend so it can complete the payment with Stripe.js / Elements.
// ─────────────────────────────────────────────────────────────────────────
export const createIntentHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.body;
    if (!orderId) throw new AppError("orderId is required.", 400);

    const result = await PaymentService.createPaymentIntent(
      req.user!.id,
      orderId
    );

    sendCreated(res, "Payment intent created.", result);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/payments/webhook
// Receives Stripe webhook events.
//
// CRITICAL:
//   • This route is NOT behind auth middleware — Stripe calls it directly.
//   • express.raw({ type: 'application/json' }) is applied at the route
//     level (in payment.routes.ts) and BEFORE the global express.json()
//     in app.ts (registered via app.use('/api/payments/webhook', express.raw(…))
//     so the raw Buffer is preserved for signature verification.
// ─────────────────────────────────────────────────────────────────────────
export const webhookHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const signature = req.headers["stripe-signature"];

    if (!signature || typeof signature !== "string") {
      throw new AppError("Missing stripe-signature header.", 400);
    }

    // req.body is a raw Buffer here (not parsed JSON) thanks to express.raw()
    const result = await PaymentService.handleWebhook(req.body, signature);

    sendSuccess(res, "Webhook received.", result);
  } catch (error) {
    next(error);
  }
};
