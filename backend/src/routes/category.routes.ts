import { Router } from "express";
import * as categoryController from "../controllers/category.controller";

const router = Router();

// ── Public Category Routes ──────────────────────────────────────────
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.get("/slug/:slug", categoryController.getCategoryBySlug);

export default router;