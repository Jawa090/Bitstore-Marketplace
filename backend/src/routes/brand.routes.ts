import { Router } from "express";
import * as brandController from "../controllers/brand.controller";

const router = Router();

// ── Public Brand Routes ─────────────────────────────────────────────
router.get("/", brandController.getBrands);
router.get("/:id", brandController.getBrandById);
router.get("/slug/:slug", brandController.getBrandBySlug);

export default router;