import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import { protect } from "../middlewares/auth.middleware";

// NOTE: express.raw({ type: 'application/json' }) for the /webhook path is
// registered in app.ts BEFORE the global express.json() middleware.
// That is the only place it can work — by the time a route-level middleware
// runs, express.json() has already consumed the body stream.

const router = Router();

// POST /api/payments/create-intent — authenticated, returns Stripe client_secret
router.post(
  "/create-intent",
  protect as any,
  paymentController.createIntentHandler
);

// POST /api/payments/webhook — NO auth (Stripe calls this directly)
// Body arrives as raw Buffer thanks to the app.ts pre-registration.
router.post("/webhook", paymentController.webhookHandler);

export default router;
