import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables.");
}

// Pinned to the API version shipped with stripe@22.x.
// Bump this string only after reviewing the Stripe changelog for breaking changes.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia" as any,
  typescript: true,
});
