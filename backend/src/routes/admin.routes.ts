import { Router } from "express";
import { protect, isAdmin } from "../middlewares/auth.middleware";
import * as adminController from "../controllers/admin.controller";

const router = Router();

// ── All admin routes require authentication + admin role ────────────
router.use(protect, isAdmin);

// ─────────────────────────────────────────────────────────────────────
// DASHBOARD ROUTES
// ─────────────────────────────────────────────────────────────────────
router.get("/dashboard/stats", adminController.getDashboardStats);

// ─────────────────────────────────────────────────────────────────────
// USER MANAGEMENT ROUTES
// ─────────────────────────────────────────────────────────────────────
router.get("/users/stats", adminController.getUserStats);
router.post("/users/bulk-action", adminController.bulkUserAction);
router.get("/users/:id/activity", adminController.getUserActivity);
router.get("/users/:id", adminController.getUserById);
router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/role", adminController.changeUserRole);
router.patch("/users/:id/status", adminController.toggleUserStatus);

// ─────────────────────────────────────────────────────────────────────
// CATALOG MANAGEMENT ROUTES
// ─────────────────────────────────────────────────────────────────────
// Products
router.get("/products/low-stock", adminController.getLowStockProducts);
router.patch("/products/:id/featured", adminController.toggleProductFeatured);
router.get("/products", adminController.getAllProducts);
router.delete("/products/:id", adminController.deleteProduct);

// Categories
router.post("/categories", adminController.createCategory);
router.put("/categories/:id", adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);

// ─────────────────────────────────────────────────────────────────────
// AUDIT & REPORTING ROUTES
// ─────────────────────────────────────────────────────────────────────
router.get("/audit-logs", adminController.getAuditLogs);
router.get("/reports/sales", adminController.getSalesReport);
router.get("/search", adminController.globalSearch);

export default router;
