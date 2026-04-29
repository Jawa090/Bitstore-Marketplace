import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import brandRoutes from "./brand.routes";
import collectionRoutes from "./collection.routes";
import cartRoutes from "./cart.routes";
import orderRoutes from "./order.routes";
import paymentRoutes from "./payment.routes";
import adminRoutes from "./admin.routes";
import uploadRoutes from "./upload.routes";

const router = Router();

// ── Mount sub-routers ───────────────────────────────────────────────
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/upload", uploadRoutes);

// ── Product Management Routes ───────────────────────────────────────
router.use("/v1/products", productRoutes);
router.use("/v1/categories", categoryRoutes);
router.use("/v1/brands", brandRoutes);
router.use("/v1/collections", collectionRoutes);

// ── Admin Routes ────────────────────────────────────────────────────
router.use("/v1/admin", adminRoutes);

// Future routes will be mounted here:
// router.use("/vendor", vendorRoutes);

export default router;
