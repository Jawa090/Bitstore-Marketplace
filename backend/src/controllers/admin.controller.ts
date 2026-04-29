import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types";
import * as adminService from "../services/admin.service";
import { sendSuccess, sendCreated } from "../utils/response";
import { UserRole } from "../utils/constants";
import { AppError } from "../utils/AppError";

// ─────────────────────────────────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/users
 * Get all users with pagination and search
 */
export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const result = await adminService.getAllUsers(page, limit, search);

    sendSuccess(res, "Users fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/users/:id
 * Get user by ID with full details
 */
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const user = await adminService.getUserById(id);

    sendSuccess(res, "User details fetched successfully", { user });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:id/role
 * Change user role
 */
export const changeUserRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;

    // Validate role
    if (!role || !Object.values(UserRole).includes(role)) {
      throw new AppError(
        `Invalid role. Must be one of: ${Object.values(UserRole).join(", ")}`,
        400
      );
    }

    const result = await adminService.changeUserRole(
      id,
      role as UserRole,
      req.user!.id
    );

    sendSuccess(res, result.message, { user: result.user });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:id/status
 * Toggle user status (active/blocked)
 */
export const toggleUserStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const result = await adminService.toggleUserStatus(id, req.user!.id);

    sendSuccess(res, result.message, { user: result.user });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// CATALOG MANAGEMENT
// ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/products
 * Get all products with advanced filters
 */
export const getAllProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const filters = {
      search: req.query.search as string,
      category_id: req.query.category_id as string,
      brand_id: req.query.brand_id as string,
      vendor_id: req.query.vendor_id as string,
      condition: req.query.condition as string,
      is_active:
        req.query.is_active === "true"
          ? true
          : req.query.is_active === "false"
          ? false
          : undefined,
    };

    const result = await adminService.getAllProducts(page, limit, filters);

    sendSuccess(res, "Products fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/products/:id
 * Delete product
 */
export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const result = await adminService.deleteProduct(id, req.user!.id);

    sendSuccess(res, result.message, { product: result.product });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/categories
 * Create new category
 */
export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, slug, description, icon_url, parent_id, display_order } =
      req.body;

    // Validate required fields
    if (!name || !slug) {
      throw new AppError("Name and slug are required", 400);
    }

    const category = await adminService.createCategory(
      {
        name,
        slug,
        description,
        icon_url,
        parent_id,
        display_order,
      },
      req.user!.id
    );

    sendCreated(res, "Category created successfully", { category });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/dashboard/stats
 * Get dashboard statistics
 */
export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await adminService.getDashboardStats();

    sendSuccess(res, "Dashboard stats fetched successfully", { stats });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// ADVANCED USER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/users/stats
 * Get user statistics
 */
export const getUserStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await adminService.getUserStats();

    sendSuccess(res, "User stats fetched successfully", { stats });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/users/:id/activity
 * Get user activity history
 */
export const getUserActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const activity = await adminService.getUserActivity(id);

    sendSuccess(res, "User activity fetched successfully", activity);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/users/bulk-action
 * Perform bulk action on users
 */
export const bulkUserAction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userIds, action } = req.body;

    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new AppError("userIds must be a non-empty array", 400);
    }

    if (!action || !["block", "delete"].includes(action)) {
      throw new AppError("action must be either 'block' or 'delete'", 400);
    }

    const result = await adminService.bulkUserAction(
      userIds,
      action,
      req.user!.id
    );

    sendSuccess(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// ADVANCED PRODUCT MANAGEMENT
// ─────────────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/admin/products/:id/featured
 * Toggle product featured status
 */
export const toggleProductFeatured = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const result = await adminService.toggleProductFeatured(id, req.user!.id);

    sendSuccess(res, result.message, { product: result.product });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/products/low-stock
 * Get low stock products
 */
export const getLowStockProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 10;

    const result = await adminService.getLowStockProducts(threshold);

    sendSuccess(res, "Low stock products fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// ADVANCED CATEGORY MANAGEMENT
// ─────────────────────────────────────────────────────────────────────

/**
 * PUT /api/v1/admin/categories/:id
 * Update category
 */
export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, slug, description, icon_url, parent_id, display_order, is_active } =
      req.body;

    const category = await adminService.updateCategory(
      id,
      {
        name,
        slug,
        description,
        icon_url,
        parent_id,
        display_order,
        is_active,
      },
      req.user!.id
    );

    sendSuccess(res, "Category updated successfully", { category });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/categories/:id
 * Delete category
 */
export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const result = await adminService.deleteCategory(id, req.user!.id);

    sendSuccess(res, result.message, { category: result.category });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// AUDIT & REPORTING
// ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/audit-logs
 * Get audit logs
 */
export const getAuditLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const filters = {
      action: req.query.action as string,
      entity_type: req.query.entity_type as string,
      user_id: req.query.user_id as string,
    };

    const result = await adminService.getAuditLogs(page, limit, filters);

    sendSuccess(res, "Audit logs fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/reports/sales
 * Get sales report
 */
export const getSalesReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;

    const report = await adminService.getSalesReport(startDate, endDate);

    sendSuccess(res, "Sales report generated successfully", { report });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/search
 * Global search across entities
 */
export const globalSearch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query.q as string;

    if (!query || query.length < 2) {
      return sendSuccess(res, "Search query too short", {
        vendors: [],
        orders: [],
        products: [],
        users: [],
      });
    }

    const results = await adminService.globalSearch(query);

    sendSuccess(res, "Search completed successfully", results);
  } catch (error) {
    next(error);
  }
};
