import api from "@/services/api";

// ── Types ────────────────────────────────────────────────────────────
export interface CreatePaymentIntentRequest {
  orderId: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  orderId: string;
}

// ── Payment API Functions ────────────────────────────────────────────
export const paymentService = {
  /**
   * Create a Stripe Payment Intent for an order
   */
  createPaymentIntent: async (orderId: string): Promise<CreatePaymentIntentResponse> => {
    const response = await api.post("/payments/create-intent", { orderId });
    return response.data.data;
  },
};
