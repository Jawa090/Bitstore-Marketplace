import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import brandRoutes from "./brand.routes";

const router = Router();

// ── Mount sub-routers ───────────────────────────────────────────────
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// ── Product Management Routes ───────────────────────────────────────
router.use("/v1/products", productRoutes);
router.use("/v1/categories", categoryRoutes);
router.use("/v1/brands", brandRoutes);

// Future routes will be mounted here:
// router.use("/vendor", vendorRoutes);
// router.use("/orders", orderRoutes);
// router.use("/admin", adminRoutes);

export default router;
