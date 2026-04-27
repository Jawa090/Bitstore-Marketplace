import axios from "axios";

// ── Axios instance ──────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Flag to prevent multiple simultaneous refresh attempts ──────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// ── Request interceptor: attach accessToken if present ──────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: auto-refresh on 401 ──────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401 errors that aren't already retries
    // and aren't the login/register/refresh endpoints themselves
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register") &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/google")
    ) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        // No refresh token — force logout
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          "http://localhost:3000/api/auth/refresh",
          { refreshToken }
        );
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is also expired — force logout
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Attach the backend's error message for easy access in components
    const backendMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;
    error.displayMessage = backendMessage;
    return Promise.reject(error);
  }
);

// ── Auth helpers ────────────────────────────────────────────────────
export const forgotPassword = (email: string) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (token: string, newPassword: string) =>
  api.post("/auth/reset-password", { token, newPassword });

// ── User / Profile helpers ───────────────────────────────────────────
export const updateUserProfile = (data: any) => api.put("/users/profile", data);

export const uploadProfilePicture = (file: File) => {
  const form = new FormData();
  form.append("avatar", file);
  return api.post("/users/profile-picture", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getAddresses = () => api.get("/users/addresses");
export const addAddress = (data: any) => api.post("/users/addresses", data);
export const updateAddress = (id: string, data: any) => api.put(`/users/addresses/${id}`, data);
export const deleteAddress = (id: string) => api.delete(`/users/addresses/${id}`);

export const getNotifications = () => api.get("/users/notifications");
export const markNotificationRead = (id: string) => api.put(`/users/notifications/${id}/read`);

// ── Cart helpers ────────────────────────────────────────────────────
export const fetchCart = () => api.get("/cart");
export const addCartItem = (productId: string, quantity: number = 1) =>
  api.post("/cart/items", { productId, quantity });
export const updateCartItem = (productId: string, quantity: number) =>
  api.put(`/cart/items/${productId}`, { quantity });
export const removeCartItem = (productId: string) =>
  api.delete(`/cart/items/${productId}`);
export const clearCartApi = () => api.delete("/cart");
export const syncCartApi = (items: { productId: string; quantity: number }[]) =>
  api.post("/cart/sync", { items });

// ── Checkout profile guard ──────────────────────────────────────────
export const validateCheckoutProfile = () => api.get("/users/me");

// ── Order helpers ───────────────────────────────────────────────────
export const placeOrder = (data: {
  delivery_address: string;
  delivery_emirate: string;
  payment_method: string;
  phone: string;
  delivery_landmark?: string;
  notes?: string;
}) => api.post("/orders", data);

export const getOrders = () => api.get("/orders");
export const getOrderById = (id: string) => api.get(`/orders/${id}`);
export const cancelOrder = (id: string) => api.post(`/orders/${id}/cancel`);
export const returnOrder = (id: string, data: { reason: string; comments?: string }) =>
  api.post(`/orders/${id}/return`, data);

// ── Payment helpers ─────────────────────────────────────────────────
export const createPaymentIntent = (orderId: string) =>
  api.post("/payments/create-intent", { orderId });

export default api;
