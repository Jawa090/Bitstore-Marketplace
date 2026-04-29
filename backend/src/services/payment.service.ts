import { AppDataSource } from "../config/database";
import { stripe } from "../config/stripe";
import { Order } from "../entities/Order";
import { AppError } from "../utils/AppError";
import { OrderStatus, PaymentStatus } from "../utils/constants";

// ─────────────────────────────────────────────────────────────────────────
// CREATE PAYMENT INTENT
// Creates a Stripe PaymentIntent for the given order and stores the
// intent ID on the order row so the webhook can look it up later.
// Returns the client_secret that the frontend passes to Stripe.js.
// ─────────────────────────────────────────────────────────────────────────
export const createPaymentIntent = async (
  userId: string,
  orderId: string
): Promise<{ clientSecret: string }> => {
  const orderRepo = AppDataSource.getRepository(Order);

  const order = await orderRepo.findOne({
    where: { id: orderId, customer_id: userId },
  });

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  if (order.payment_status === PaymentStatus.PAID) {
    throw new AppError("This order has already been paid.", 400);
  }

  // Stripe requires the smallest currency unit (fils for AED → × 100)
  const amount = Math.round(parseFloat(order.total_amount) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "aed",
    metadata: { order_id: orderId },
  });

  // Persist the intent ID so the webhook can resolve back to this order
  order.stripe_payment_intent_id = paymentIntent.id;
  await orderRepo.save(order);

  if (!paymentIntent.client_secret) {
    throw new AppError("Stripe did not return a client secret.", 500);
  }

  return { clientSecret: paymentIntent.client_secret };
};

// ─────────────────────────────────────────────────────────────────────────
// HANDLE WEBHOOK
// Verifies the Stripe signature and processes the event.
// IMPORTANT: rawBody must be the unparsed Buffer — do not pass a JSON object.
// ─────────────────────────────────────────────────────────────────────────
export const handleWebhook = async (
  rawBody: Buffer | string,
  signature: string
): Promise<{ received: boolean }> => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new AppError("STRIPE_WEBHOOK_SECRET is not configured.", 500);
  }

  // Stripe.Event / Stripe.PaymentIntent namespace types are inaccessible under
  // TS 6 + stripe@22 module resolution, so we use the return type inferred
  // directly from constructEvent and a minimal inline shape for the data object.
  type StripePaymentIntentData = { id: string };

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    // Signature mismatch — return 400 so Stripe retries correctly
    throw new AppError(`Webhook signature verification failed: ${err.message}`, 400);
  }

  // ── Handle events ──────────────────────────────────────────────────
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as StripePaymentIntentData;

    const orderRepo = AppDataSource.getRepository(Order);
    const order = await orderRepo.findOne({
      where: { stripe_payment_intent_id: paymentIntent.id },
    });

    if (order) {
      order.payment_status = PaymentStatus.PAID;
      order.status = OrderStatus.CONFIRMED;
      await orderRepo.save(order);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as StripePaymentIntentData;

    const orderRepo = AppDataSource.getRepository(Order);
    const order = await orderRepo.findOne({
      where: { stripe_payment_intent_id: paymentIntent.id },
    });

    if (order) {
      order.payment_status = PaymentStatus.FAILED;
      await orderRepo.save(order);
    }
  }

  return { received: true };
};
