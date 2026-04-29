import api from "./index";

// ─────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────

export const getDashboardStats = async () => {
  const response = await api.get("/api/v1/admin/dashboard/stats");
  return response.data;
};

export const getSalesReport = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await api.get(
    `/api/v1/admin/reports/sales?${params.toString()}`
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────

export const getAllUsers = async (
  page: number = 1,
  limit: number = 20,
  search?: string
) => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (search) params.append("search", search);

  const response = await api.get(`/api/v1/admin/users?${params.toString()}`);
  return response.data;
};

export const getUserById = async (userId: string) => {
  const response = await api.get(`/api/v1/admin/users/${userId}`);
  return response.data;
};

export const getUserStats = async () => {
  const response = await api.get("/api/v1/admin/users/stats");
  return response.data;
};

export const getUserActivity = async (userId: string) => {
  const response = await api.get(`/api/v1/admin/users/${userId}/activity`);
  return response.data;
};

export const changeUserRole = async (userId: string, role: string) => {
  const response = await api.patch(`/api/v1/admin/users/${userId}/role`, {
    role,
  });
  return response.data;
};

export const toggleUserStatus = async (userId: string) => {
  const response = await api.patch(`/api/v1/admin/users/${userId}/status`);
  return response.data;
};

export const bulkUserAction = async (userIds: string[], action: string) => {
  const response = await api.post("/api/v1/admin/users/bulk-action", {
    userIds,
    action,
  });
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────
// PRODUCT MANAGEMENT
// ─────────────────────────────────────────────────────────────────────

export const getAllProducts = async (
  page: number = 1,
  limit: number = 20,
  filters?: {
    search?: string;
    category_id?: string;
    brand_id?: string;
    vendor_id?: string;
    condition?: string;
    is_active?: boolean;
  }
) => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  if (filters?.search) params.append("search", filters.search);
  if (filters?.category_id) params.append("category_id", filters.category_id);
  if (filters?.brand_id) params.append("brand_id", filters.brand_id);
  if (filters?.vendor_id) params.append("vendor_id", filters.vendor_id);
  if (filters?.condition) params.append("condition", filters.condition);
  if (filters?.is_active !== undefined)
    params.append("is_active", filters.is_active.toString());

  const response = await api.get(
    `/api/v1/admin/products?${params.toString()}`
  );
  return response.data;
};

export const deleteProduct = async (productId: string) => {
  const response = await api.delete(`/api/v1/admin/products/${productId}`);
  return response.data;
};

export const toggleProductFeatured = async (productId: string) => {
  const response = await api.patch(
    `/api/v1/admin/products/${productId}/featured`
  );
  return response.data;
};

export const getLowStockProducts = async (threshold: number = 10) => {
  const response = await api.get(
    `/api/v1/admin/products/low-stock?threshold=${threshold}`
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────
// CATEGORY MANAGEMENT
// ─────────────────────────────────────────────────────────────────────

export const createCategory = async (data: {
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  parent_id?: string;
  display_order?: number;
}) => {
  const response = await api.post("/api/v1/admin/categories", data);
  return response.data;
};

export const updateCategory = async (
  categoryId: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    icon_url?: string;
    parent_id?: string;
    display_order?: number;
    is_active?: boolean;
  }
) => {
  const response = await api.put(`/api/v1/admin/categories/${categoryId}`, data);
  return response.data;
};

export const deleteCategory = async (categoryId: string) => {
  const response = await api.delete(`/api/v1/admin/categories/${categoryId}`);
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────────────────────────────

export const getAuditLogs = async (
  page: number = 1,
  limit: number = 50,
  filters?: {
    action?: string;
    entity_type?: string;
    user_id?: string;
  }
) => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  if (filters?.action) params.append("action", filters.action);
  if (filters?.entity_type) params.append("entity_type", filters.entity_type);
  if (filters?.user_id) params.append("user_id", filters.user_id);

  const response = await api.get(`/api/v1/admin/audit-logs?${params.toString()}`);
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────
// GLOBAL SEARCH
// ─────────────────────────────────────────────────────────────────────

export const globalSearch = async (query: string) => {
  const response = await api.get(`/api/v1/admin/search?q=${encodeURIComponent(query)}`);
  return response.data;
};
