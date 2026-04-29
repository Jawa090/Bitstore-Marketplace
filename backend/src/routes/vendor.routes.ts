import { Router } from "express";
import * as vendorController from "../controllers/vendor.controller";
import * as vendorProductController from "../controllers/vendor-product.controller";
import * as vendorOrderController from "../controllers/vendor-order.controller";
import { protect } from "../middlewares/auth.middleware";
import { isVendorApproved } from "../middlewares/vendor.middleware";

const router = Router();

// All vendor routes require authentication
router.use(protect as any);

// POST /api/vendor/apply — submit a vendor onboarding application
router.post("/apply", vendorController.applyHandler);

// GET  /api/vendor/check — check authenticated user's vendor status
router.get("/check", vendorController.checkHandler);

// ── Approved-vendor-only routes ─────────────────────────────────────
// GET  /api/vendor/overview — vendor dashboard metrics
router.get("/overview", isVendorApproved as any, vendorController.getOverviewHandler);

// GET  /api/vendor/settings — vendor store profile
router.get("/settings", isVendorApproved as any, vendorController.getSettingsHandler);

// PUT  /api/vendor/settings — update vendor store profile
router.put("/settings", isVendorApproved as any, vendorController.updateSettingsHandler);

// POST /api/vendor/products — create a product for the vendor
router.post("/products", isVendorApproved as any, vendorProductController.createProductHandler);

// GET  /api/vendor/products — list the vendor's products
router.get("/products", isVendorApproved as any, vendorProductController.listProductsHandler);

// PUT  /api/vendor/products/:id — update a vendor product
router.put("/products/:id", isVendorApproved as any, vendorProductController.updateProductHandler);

// DELETE /api/vendor/products/:id — soft-delete a vendor product
router.delete("/products/:id", isVendorApproved as any, vendorProductController.deleteProductHandler);

// GET  /api/vendor/payouts — list vendor's payout history
router.get("/payouts", isVendorApproved as any, vendorController.getPayoutsHandler);

// GET  /api/vendor/analytics — revenue chart & recent orders
router.get("/analytics", isVendorApproved as any, vendorController.getAnalyticsHandler);

// GET  /api/vendor/orders     — list vendor's sub-orders
router.get("/orders", isVendorApproved as any, vendorOrderController.listOrdersHandler);

// PUT  /api/vendor/orders/:id — update sub-order status & tracking
router.put("/orders/:id", isVendorApproved as any, vendorOrderController.updateOrderHandler);

export default router;
