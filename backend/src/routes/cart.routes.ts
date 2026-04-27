import { Router } from "express";
import * as cartController from "../controllers/cart.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// All cart routes require authentication
router.use(protect as any);

// GET    /api/cart              — get current user's cart
router.get("/", cartController.getCart);

// POST   /api/cart/items        — add item to cart
router.post("/items", cartController.addItem);

// POST   /api/cart/sync         — merge guest cart items after login
router.post("/sync", cartController.syncCart);

// PUT    /api/cart/items/:productId  — update item quantity
router.put("/items/:productId", cartController.updateItem);

// DELETE /api/cart/items/:productId  — remove item from cart
router.delete("/items/:productId", cartController.removeItem);

// DELETE /api/cart              — clear entire cart
router.delete("/", cartController.clearCart);

export default router;
