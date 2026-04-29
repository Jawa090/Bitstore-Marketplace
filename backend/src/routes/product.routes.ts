import { Router } from "express";
import * as productController from "../controllers/product.controller";

const router = Router();

// ── Public Product Routes ───────────────────────────────────────────
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.get("/slug/:slug", productController.getProductBySlug);
router.get("/slug/:slug/related", productController.getRelatedProducts);
router.get("/slug/:slug/variants", productController.getProductVariants);

export default router;