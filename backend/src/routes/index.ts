import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";

const router = Router();

// ── Mount sub-routers ───────────────────────────────────────────────
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// Future routes will be mounted here:
// router.use("/products", productRoutes);
// router.use("/vendor", vendorRoutes);
// router.use("/orders", orderRoutes);
// router.use("/admin", adminRoutes);

export default router;
