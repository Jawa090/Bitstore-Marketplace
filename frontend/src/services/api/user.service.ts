import api from "@/services/api";

// ── Types ────────────────────────────────────────────────────────────
export interface Address {
  id: string;
  user_id: string;
  label: string;
  emirate: string;
  address: string;
  landmark: string | null;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  emirate: string | null;
  avatar_url: string | null;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone?: string;
  emirate?: string;
}

export interface AddAddressRequest {
  label: string;
  emirate: string;
  address: string;
  landmark?: string;
  phone?: string;
  is_default?: boolean;
}

// ── User API Functions ───────────────────────────────────────────────
export const userService = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<{ user: UserProfile }> => {
    const response = await api.get("/users/me");
    return response.data.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<{ user: UserProfile }> => {
    const response = await api.put("/users/profile", data);
    return response.data.data;
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (file: File): Promise<{ avatar_url: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await api.post("/users/profile-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  /**
   * Get all user addresses
   */
  getAddresses: async (): Promise<{ addresses: Address[] }> => {
    const response = await api.get("/users/addresses");
    return response.data.data;
  },

  /**
   * Add a new address
   */
  addAddress: async (data: AddAddressRequest): Promise<{ address: Address }> => {
    const response = await api.post("/users/addresses", data);
    return response.data.data;
  },

  /**
   * Update an existing address
   */
  updateAddress: async (id: string, data: Partial<AddAddressRequest>): Promise<{ address: Address }> => {
    const response = await api.put(`/users/addresses/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete an address
   */
  deleteAddress: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/users/addresses/${id}`);
    return response.data;
  },
};
