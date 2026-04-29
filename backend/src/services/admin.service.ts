import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { UserRoleEntity } from "../entities/UserRole";
import { Product } from "../entities/Product";
import { Category } from "../entities/Category";
import { Brand } from "../entities/Brand";
import { AuditLog } from "../entities/AuditLog";
import { Order } from "../entities/Order";
import { AppError } from "../utils/AppError";
import { UserRole } from "../utils/constants";
import { Between, LessThan, MoreThanOrEqual } from "typeorm";

const userRepo = () => AppDataSource.getRepository(User);
const userRoleRepo = () => AppDataSource.getRepository(UserRoleEntity);
const productRepo = () => AppDataSource.getRepository(Product);
const categoryRepo = () => AppDataSource.getRepository(Category);
const brandRepo = () => AppDataSource.getRepository(Brand);
const auditLogRepo = () => AppDataSource.getRepository(AuditLog);
const orderRepo = () => AppDataSource.getRepository(Order);

// ─────────────────────────────────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────

/**
 * Get all users with pagination and search
 */
export const getAllUsers = async (
  page: number = 1,
  limit: number = 20,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const queryBuilder = userRepo()
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.roles", "roles")
    .select([
      "user.id",
      "user.email",
      "user.full_name",
      "user.phone",
      "user.emirate",
      "user.is_active",
      "user.email_verified",
      "user.created_at",
      "user.updated_at",
      "roles.role",
    ])
    .orderBy("user.created_at", "DESC")
    .skip(skip)
    .take(limit);

  // Search by email or name
  if (search) {
    queryBuilder.where(
      "user.email ILIKE :search OR user.full_name ILIKE :search",
      { search: `%${search}%` }
    );
  }

  const [users, total] = await queryBuilder.getManyAndCount();

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get user by ID with full details
 */
export const getUserById = async (userId: string) => {
  const user = await userRepo()
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.roles", "roles")
    .leftJoinAndSelect("user.profile", "profile")
    .where("user.id = :userId", { userId })
    .select([
      "user.id",
      "user.email",
      "user.full_name",
      "user.phone",
      "user.phone_verified",
      "user.emirate",
      "user.avatar_url",
      "user.is_active",
      "user.email_verified",
      "user.created_at",
      "user.updated_at",
      "roles.id",
      "roles.role",
      "roles.created_at",
      "profile",
    ])
    .getOne();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

/**
 * Change user role
 */
export const changeUserRole = async (
  userId: string,
  newRole: UserRole,
  adminId: string
) => {
  // Prevent admin from changing their own role
  if (userId === adminId) {
    throw new AppError("You cannot change your own role", 400);
  }

  const user = await userRepo().findOne({ where: { id: userId } });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Check if user already has this role
  const existingRole = await userRoleRepo().findOne({
    where: { user_id: userId, role: newRole },
  });

  if (existingRole) {
    throw new AppError(`User already has the ${newRole} role`, 400);
  }

  // Remove all existing roles and add new one
  await userRoleRepo().delete({ user_id: userId });

  const userRole = userRoleRepo().create({
    user_id: userId,
    role: newRole,
  });

  await userRoleRepo().save(userRole);

  return {
    message: `User role changed to ${newRole}`,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: newRole,
    },
  };
};

/**
 * Toggle user status (active/blocked)
 */
export const toggleUserStatus = async (userId: string, adminId: string) => {
  // Prevent admin from blocking themselves
  if (userId === adminId) {
    throw new AppError("You cannot change your own status", 400);
  }

  const user = await userRepo().findOne({ where: { id: userId } });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.is_active = !user.is_active;
  await userRepo().save(user);

  // Log the action
  await logAuditAction(
    adminId,
    user.is_active ? "ACTIVATE_USER" : "BLOCK_USER",
    "user",
    userId,
    { email: user.email, full_name: user.full_name }
  );

  return {
    message: `User ${user.is_active ? "activated" : "blocked"} successfully`,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      is_active: user.is_active,
    },
  };
};

/**
 * Get user statistics
 */
export const getUserStats = async () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalUsers, activeUsers, newUsersToday] = await Promise.all([
    userRepo().count(),
    userRepo().count({ where: { is_active: true } }),
    userRepo().count({
      where: {
        created_at: MoreThanOrEqual(todayStart),
      },
    }),
  ]);

  const bannedUsers = totalUsers - activeUsers;

  // Get users by role
  const adminCount = await userRoleRepo().count({
    where: { role: UserRole.ADMIN },
  });
  const vendorCount = await userRoleRepo().count({
    where: { role: UserRole.VENDOR },
  });
  const customerCount = await userRoleRepo().count({
    where: { role: UserRole.CUSTOMER },
  });

  return {
    total: totalUsers,
    active: activeUsers,
    banned: bannedUsers,
    newToday: newUsersToday,
    byRole: {
      admin: adminCount,
      vendor: vendorCount,
      customer: customerCount,
    },
  };
};

/**
 * Get user activity (login history and recent actions)
 */
export const getUserActivity = async (userId: string) => {
  const user = await userRepo().findOne({ where: { id: userId } });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Get audit logs related to this user
  const recentActions = await auditLogRepo()
    .createQueryBuilder("log")
    .where("log.user_id = :userId OR log.entity_id = :userId", { userId })
    .orderBy("log.created_at", "DESC")
    .take(50)
    .getMany();

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      created_at: user.created_at,
      is_active: user.is_active,
    },
    recentActions: recentActions.map((log) => ({
      id: log.id,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      details: log.details,
      created_at: log.created_at,
    })),
  };
};

/**
 * Bulk action on users (block or delete)
 */
export const bulkUserAction = async (
  userIds: string[],
  action: "block" | "delete",
  adminId: string
) => {
  // Prevent admin from affecting themselves
  if (userIds.includes(adminId)) {
    throw new AppError("You cannot perform bulk actions on yourself", 400);
  }

  const users = await userRepo().findByIds(userIds);

  if (users.length === 0) {
    throw new AppError("No valid users found", 404);
  }

  let successCount = 0;

  if (action === "block") {
    for (const user of users) {
      user.is_active = false;
      await userRepo().save(user);
      await logAuditAction(adminId, "BULK_BLOCK_USER", "user", user.id, {
        email: user.email,
      });
      successCount++;
    }
  } else if (action === "delete") {
    for (const user of users) {
      await logAuditAction(adminId, "BULK_DELETE_USER", "user", user.id, {
        email: user.email,
      });
      await userRepo().remove(user);
      successCount++;
    }
  }

  return {
    message: `Successfully ${action === "block" ? "blocked" : "deleted"} ${successCount} user(s)`,
    successCount,
    totalRequested: userIds.length,
  };
};

// ─────────────────────────────────────────────────────────────────────
// CATALOG MANAGEMENT
// ─────────────────────────────────────────────────────────────────────

/**
 * Get all products with advanced filters (admin view)
 */
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
  const skip = (page - 1) * limit;

  const queryBuilder = productRepo()
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.category", "category")
    .leftJoinAndSelect("product.brand", "brand")
    .leftJoinAndSelect("product.vendor", "vendor")
    .leftJoinAndSelect("product.images", "images")
    .orderBy("product.created_at", "DESC")
    .skip(skip)
    .take(limit);

  // Apply filters
  if (filters?.search) {
    queryBuilder.andWhere(
      "product.name ILIKE :search OR product.description ILIKE :search",
      { search: `%${filters.search}%` }
    );
  }

  if (filters?.category_id) {
    queryBuilder.andWhere("product.category_id = :categoryId", {
      categoryId: filters.category_id,
    });
  }

  if (filters?.brand_id) {
    queryBuilder.andWhere("product.brand_id = :brandId", {
      brandId: filters.brand_id,
    });
  }

  if (filters?.vendor_id) {
    queryBuilder.andWhere("product.vendor_id = :vendorId", {
      vendorId: filters.vendor_id,
    });
  }

  if (filters?.condition) {
    queryBuilder.andWhere("product.condition = :condition", {
      condition: filters.condition,
    });
  }

  if (filters?.is_active !== undefined) {
    queryBuilder.andWhere("product.is_active = :isActive", {
      isActive: filters.is_active,
    });
  }

  const [products, total] = await queryBuilder.getManyAndCount();

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Delete product (admin only)
 */
export const deleteProduct = async (productId: string, adminId: string) => {
  const product = await productRepo().findOne({ where: { id: productId } });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  await logAuditAction(adminId, "DELETE_PRODUCT", "product", productId, {
    name: product.name,
    slug: product.slug,
  });

  await productRepo().remove(product);

  return {
    message: "Product deleted successfully",
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
    },
  };
};

/**
 * Toggle product featured status
 */
export const toggleProductFeatured = async (
  productId: string,
  adminId: string
) => {
  const product = await productRepo().findOne({ where: { id: productId } });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  product.is_featured = !product.is_featured;
  await productRepo().save(product);

  await logAuditAction(
    adminId,
    product.is_featured ? "FEATURE_PRODUCT" : "UNFEATURE_PRODUCT",
    "product",
    productId,
    { name: product.name }
  );

  return {
    message: `Product ${product.is_featured ? "featured" : "unfeatured"} successfully`,
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      is_featured: product.is_featured,
    },
  };
};

/**
 * Get low stock products
 */
export const getLowStockProducts = async (threshold: number = 10) => {
  const products = await productRepo()
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.category", "category")
    .leftJoinAndSelect("product.brand", "brand")
    .leftJoinAndSelect("product.vendor", "vendor")
    .where("product.stock_quantity <= :threshold", { threshold })
    .andWhere("product.is_active = :isActive", { isActive: true })
    .orderBy("product.stock_quantity", "ASC")
    .getMany();

  return {
    products,
    count: products.length,
    threshold,
  };
};

/**
 * Create new category (admin only)
 */
export const createCategory = async (
  data: {
    name: string;
    slug: string;
    description?: string;
    icon_url?: string;
    parent_id?: string;
    display_order?: number;
  },
  adminId: string
) => {
  // Check if slug already exists
  const existingCategory = await categoryRepo().findOne({
    where: { slug: data.slug },
  });

  if (existingCategory) {
    throw new AppError("Category with this slug already exists", 409);
  }

  // If parent_id provided, verify it exists
  if (data.parent_id) {
    const parentCategory = await categoryRepo().findOne({
      where: { id: data.parent_id },
    });
    if (!parentCategory) {
      throw new AppError("Parent category not found", 404);
    }
  }

  const category = categoryRepo().create(data);
  await categoryRepo().save(category);

  await logAuditAction(adminId, "CREATE_CATEGORY", "category", category.id, {
    name: category.name,
    slug: category.slug,
  });

  return category;
};

/**
 * Update category (admin only)
 */
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
  },
  adminId: string
) => {
  const category = await categoryRepo().findOne({ where: { id: categoryId } });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  // Check if new slug conflicts with existing
  if (data.slug && data.slug !== category.slug) {
    const existingCategory = await categoryRepo().findOne({
      where: { slug: data.slug },
    });
    if (existingCategory) {
      throw new AppError("Category with this slug already exists", 409);
    }
  }

  // If parent_id provided, verify it exists and prevent circular reference
  if (data.parent_id) {
    if (data.parent_id === categoryId) {
      throw new AppError("Category cannot be its own parent", 400);
    }
    const parentCategory = await categoryRepo().findOne({
      where: { id: data.parent_id },
    });
    if (!parentCategory) {
      throw new AppError("Parent category not found", 404);
    }
  }

  // Update fields
  Object.assign(category, data);
  await categoryRepo().save(category);

  await logAuditAction(adminId, "UPDATE_CATEGORY", "category", categoryId, {
    name: category.name,
    changes: data,
  });

  return category;
};

/**
 * Delete category (admin only)
 */
export const deleteCategory = async (categoryId: string, adminId: string) => {
  const category = await categoryRepo().findOne({
    where: { id: categoryId },
    relations: ["products"],
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  // Check if category has products
  const productCount = await productRepo().count({
    where: { category_id: categoryId },
  });

  if (productCount > 0) {
    throw new AppError(
      `Cannot delete category with ${productCount} linked product(s). Please reassign or delete products first.`,
      400
    );
  }

  // Check if category has subcategories
  const subcategoryCount = await categoryRepo().count({
    where: { parent_id: categoryId },
  });

  if (subcategoryCount > 0) {
    throw new AppError(
      `Cannot delete category with ${subcategoryCount} subcategory(ies). Please delete subcategories first.`,
      400
    );
  }

  await logAuditAction(adminId, "DELETE_CATEGORY", "category", categoryId, {
    name: category.name,
    slug: category.slug,
  });

  await categoryRepo().remove(category);

  return {
    message: "Category deleted successfully",
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────────────────────────────

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  const [totalUsers, totalProducts, totalBrands, totalCategories] =
    await Promise.all([
      userRepo().count(),
      productRepo().count(),
      brandRepo().count(),
      categoryRepo().count(),
    ]);

  // Get active users count
  const activeUsers = await userRepo().count({ where: { is_active: true } });

  // Get active products count
  const activeProducts = await productRepo().count({
    where: { is_active: true },
  });

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      blocked: totalUsers - activeUsers,
    },
    products: {
      total: totalProducts,
      active: activeProducts,
      inactive: totalProducts - activeProducts,
    },
    brands: {
      total: totalBrands,
    },
    categories: {
      total: totalCategories,
    },
  };
};

/**
 * Get audit logs
 */
export const getAuditLogs = async (
  page: number = 1,
  limit: number = 50,
  filters?: {
    action?: string;
    entity_type?: string;
    user_id?: string;
  }
) => {
  const skip = (page - 1) * limit;

  const queryBuilder = auditLogRepo()
    .createQueryBuilder("log")
    .leftJoinAndSelect("log.user", "user")
    .orderBy("log.created_at", "DESC")
    .skip(skip)
    .take(limit);

  if (filters?.action) {
    queryBuilder.andWhere("log.action = :action", { action: filters.action });
  }

  if (filters?.entity_type) {
    queryBuilder.andWhere("log.entity_type = :entityType", {
      entityType: filters.entity_type,
    });
  }

  if (filters?.user_id) {
    queryBuilder.andWhere("log.user_id = :userId", {
      userId: filters.user_id,
    });
  }

  const [logs, total] = await queryBuilder.getManyAndCount();

  return {
    logs: logs.map((log) => ({
      id: log.id,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      details: log.details,
      ip_address: log.ip_address,
      created_at: log.created_at,
      user: log.user
        ? {
            id: log.user.id,
            email: log.user.email,
            full_name: log.user.full_name,
          }
        : null,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Global search across multiple entities
 */
export const globalSearch = async (query: string) => {
  if (!query || query.length < 2) {
    return {
      vendors: [],
      orders: [],
      products: [],
      users: [],
    };
  }

  const searchPattern = `%${query}%`;

  // Search vendors
  const vendorRepo = AppDataSource.getRepository("Vendor");
  const vendors = await vendorRepo
    .createQueryBuilder("vendor")
    .select([
      "vendor.id",
      "vendor.store_name",
      "vendor.emirate",
      "vendor.verification_status",
    ])
    .where("vendor.store_name ILIKE :query", { query: searchPattern })
    .limit(5)
    .getMany();

  // Search orders
  const orders = await orderRepo()
    .createQueryBuilder("order")
    .select([
      "order.id",
      "order.total_amount",
      "order.delivery_emirate",
      "order.status",
    ])
    .where("order.id::text ILIKE :query", { query: searchPattern })
    .orWhere("order.delivery_emirate ILIKE :query", { query: searchPattern })
    .limit(5)
    .getMany();

  // Search products
  const products = await productRepo()
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.brand", "brand")
    .select(["product.id", "product.name", "product.slug", "brand.name"])
    .where("product.name ILIKE :query", { query: searchPattern })
    .limit(5)
    .getMany();

  // Search users
  const users = await userRepo()
    .createQueryBuilder("user")
    .select(["user.id", "user.full_name", "user.email"])
    .where("user.full_name ILIKE :query", { query: searchPattern })
    .orWhere("user.email ILIKE :query", { query: searchPattern })
    .limit(5)
    .getMany();

  return {
    vendors,
    orders,
    products,
    users,
  };
};

/**
 * Get sales report
 */
export const getSalesReport = async (
  startDate?: Date,
  endDate?: Date
) => {
  const queryBuilder = orderRepo()
    .createQueryBuilder("order")
    .select([
      "COUNT(order.id) as total_orders",
      "SUM(order.total_amount) as total_revenue",
      "AVG(order.total_amount) as average_order_value",
      "SUM(order.vat_amount) as total_vat",
    ])
    .where("order.status != :status", { status: "cancelled" });

  if (startDate && endDate) {
    queryBuilder.andWhere("order.created_at BETWEEN :startDate AND :endDate", {
      startDate,
      endDate,
    });
  }

  const result = await queryBuilder.getRawOne();

  // Get order count by status
  const ordersByStatus = await orderRepo()
    .createQueryBuilder("order")
    .select("order.status", "status")
    .addSelect("COUNT(order.id)", "count")
    .groupBy("order.status")
    .getRawMany();

  // Get top products
  const topProducts = await AppDataSource.query(`
    SELECT 
      p.id,
      p.name,
      p.slug,
      COUNT(oi.id) as order_count,
      SUM(oi.quantity) as total_quantity,
      SUM(oi.unit_price * oi.quantity) as total_revenue
    FROM products p
    INNER JOIN order_items oi ON oi.product_id = p.id
    INNER JOIN sub_orders so ON so.id = oi.sub_order_id
    INNER JOIN orders o ON o.id = so.order_id
    WHERE o.status != 'cancelled'
    ${startDate && endDate ? `AND o.created_at BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'` : ""}
    GROUP BY p.id, p.name, p.slug
    ORDER BY total_revenue DESC
    LIMIT 10
  `);

  return {
    summary: {
      totalOrders: parseInt(result.total_orders) || 0,
      totalRevenue: parseFloat(result.total_revenue) || 0,
      averageOrderValue: parseFloat(result.average_order_value) || 0,
      totalVat: parseFloat(result.total_vat) || 0,
    },
    ordersByStatus: ordersByStatus.map((item) => ({
      status: item.status,
      count: parseInt(item.count),
    })),
    topProducts: topProducts.map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      orderCount: parseInt(item.order_count),
      totalQuantity: parseInt(item.total_quantity),
      totalRevenue: parseFloat(item.total_revenue),
    })),
    dateRange: {
      startDate: startDate || null,
      endDate: endDate || null,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────

/**
 * Log audit action
 */
async function logAuditAction(
  userId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  details?: Record<string, any>
) {
  try {
    const auditLog = auditLogRepo().create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: details || null,
      ip_address: null, // Can be enhanced to capture IP from request
    });

    await auditLogRepo().save(auditLog);
  } catch (error) {
    console.error("Failed to log audit action:", error);
    // Don't throw error to prevent blocking main operation
  }
}
