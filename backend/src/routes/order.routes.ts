import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// All order routes require authentication
router.use(protect as any);

// POST   /api/orders      — place a new order from the user's cart
router.post("/", orderController.placeOrderHandler);

// GET    /api/orders      — list all orders for the authenticated user
router.get("/", orderController.getOrdersHandler);

// GET    /api/orders/:id           — get a single order (with sub-orders & items)
router.get("/:id", orderController.getOrderDetailHandler);

// POST   /api/orders/:id/cancel    — cancel a pending or confirmed order
router.post("/:id/cancel", orderController.cancelOrderHandler);

// POST   /api/orders/:id/return    — submit a return request (delivered orders only)
router.post("/:id/return", orderController.returnOrderHandler);

// GET    /api/orders/:id/tracking  — per-vendor shipping tracking info
router.get("/:id/tracking", orderController.getTrackingHandler);

export default router;
