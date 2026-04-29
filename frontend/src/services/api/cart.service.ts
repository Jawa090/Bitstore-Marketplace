import api from "@/services/api";

// ── Types ────────────────────────────────────────────────────────────
export interface CartItemResponse {
  product_id: string;
  quantity: number;
  available_stock: number;
}

export interface CartResponse {
  cart: {
    id: string;
    user_id: string;
    items: CartItemResponse[];
    updated_at: string;
  };
}

// ── Cart API Functions ───────────────────────────────────────────────
export const cartService = {
  /**
   * Get the current user's cart
   */
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get("/cart");
    return response.data.data;
  },

  /**
   * Add an item to the cart
   */
  addItem: async (productId: string, quantity: number = 1): Promise<CartResponse> => {
    const response = await api.post("/cart/items", { productId, quantity });
    return response.data.data;
  },

  /**
   * Update item quantity in cart
   */
  updateItem: async (productId: string, quantity: number): Promise<CartResponse> => {
    const response = await api.put(`/cart/items/${productId}`, { quantity });
    return response.data.data;
  },

  /**
   * Remove an item from cart
   */
  removeItem: async (productId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/cart/items/${productId}`);
    return response.data;
  },

  /**
   * Clear entire cart
   */
  clearCart: async (): Promise<{ message: string }> => {
    const response = await api.delete("/cart");
    return response.data;
  },

  /**
   * Sync guest cart items after login
   */
  syncCart: async (items: { productId: string; quantity: number }[]): Promise<CartResponse> => {
    const response = await api.post("/cart/sync", { items });
    return response.data.data;
  },
};
