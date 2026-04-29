import { Router } from "express";
import * as collectionController from "../controllers/collection.controller";

const router = Router();

// ── Public Collection Routes ────────────────────────────────────────
router.get("/", collectionController.getCollections);
router.get("/:slug", collectionController.getCollectionBySlug);

export default router;
