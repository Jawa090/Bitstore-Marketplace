import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import cartRoutes from "./cart.routes";
import orderRoutes from "./order.routes";
import paymentRoutes from "./payment.routes";
import vendorRoutes from "./vendor.routes";

const router = Router();

// ── Mount sub-routers ───────────────────────────────────────────────
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/vendor", vendorRoutes);

// Future routes will be mounted here:
// router.use("/products", productRoutes);
// router.use("/admin", adminRoutes);

export default router;
