// ─────────────────────────────────────────────────────────────────────
// UAE Emirates Enum
// Used by: User entity, Vendor entity, Address entity, Zod validators
// ─────────────────────────────────────────────────────────────────────
export enum Emirate {
  ABU_DHABI = "Abu Dhabi",
  DUBAI = "Dubai",
  SHARJAH = "Sharjah",
  AJMAN = "Ajman",
  UMM_AL_QUWAIN = "Umm Al Quwain",
  RAS_AL_KHAIMAH = "Ras Al Khaimah",
  FUJAIRAH = "Fujairah",
}

// ─────────────────────────────────────────────────────────────────────
// User Role Enum
// Used by: UserRole entity, role middleware
// ─────────────────────────────────────────────────────────────────────
export enum UserRole {
  CUSTOMER = "customer",
  VENDOR = "vendor",
  ADMIN = "admin",
}

// ─────────────────────────────────────────────────────────────────────
// Product Condition Enum
// ─────────────────────────────────────────────────────────────────────
export enum ProductCondition {
  NEW = "new",
  USED_LIKE_NEW = "used_like_new",
  USED_GOOD = "used_good",
  USED_FAIR = "used_fair",
  REFURBISHED = "refurbished",
}

// ─────────────────────────────────────────────────────────────────────
// Order Status Enum
// ─────────────────────────────────────────────────────────────────────
export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  RETURNED = "returned",
}

// ─────────────────────────────────────────────────────────────────────
// Vendor Status Enum
// ─────────────────────────────────────────────────────────────────────
export enum VendorStatus {
  PENDING = "pending",
  APPROVED = "approved",
  SUSPENDED = "suspended",
  REJECTED = "rejected",
}
