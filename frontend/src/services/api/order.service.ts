import api from "@/services/api";

// ── Types ────────────────────────────────────────────────────────────
export interface OrderItemData {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: string;
}

export interface SubOrderData {
  id: string;
  vendor_id: string;
  subtotal: string;
  status: string;
  tracking_number: string | null;
  courier: string | null;
  items: OrderItemData[];
  created_at: string;
}

export interface OrderData {
  id: string;
  customer_id: string;
  total_amount: string;
  vat_amount: string;
  cod_fee: string;
  payment_method: string | null;
  payment_status: string;
  delivery_emirate: string;
  delivery_address: string;
  delivery_landmark: string | null;
  phone: string | null;
  notes: string | null;
  status: string;
  stripe_payment_intent_id: string | null;
  sub_orders: SubOrderData[];
  created_at: string;
  updated_at: string;
}

export interface PlaceOrderRequest {
  delivery_address: string;
  delivery_emirate: string;
  payment_method: string;
  phone: string;
  delivery_landmark?: string;
  notes?: string;
}

export interface PlaceOrderResponse {
  order: OrderData;
}

export interface ReturnOrderRequest {
  reason: string;
  comments?: string;
}

// ── Order API Functions ──────────────────────────────────────────────
export const orderService = {
  /**
   * Place a new order from the user's cart
   */
  placeOrder: async (data: PlaceOrderRequest): Promise<PlaceOrderResponse> => {
    const response = await api.post("/orders", data);
    return response.data.data;
  },

  /**
   * Get all orders for the authenticated user
   */
  getOrders: async (): Promise<{ orders: OrderData[] }> => {
    const response = await api.get("/orders");
    return response.data.data;
  },

  /**
   * Get a single order by ID
   */
  getOrderById: async (orderId: string): Promise<{ order: OrderData }> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data;
  },

  /**
   * Cancel a pending or confirmed order
   */
  cancelOrder: async (orderId: string): Promise<{ message: string; order: OrderData }> => {
    const response = await api.post(`/orders/${orderId}/cancel`);
    return response.data.data;
  },

  /**
   * Submit a return request for a delivered order
   */
  returnOrder: async (orderId: string, data: ReturnOrderRequest): Promise<{ message: string }> => {
    const response = await api.post(`/orders/${orderId}/return`, data);
    return response.data;
  },

  /**
   * Get tracking information for an order
   */
  getTracking: async (orderId: string): Promise<{ tracking: any[] }> => {
    const response = await api.get(`/orders/${orderId}/tracking`);
    return response.data.data;
  },
};
