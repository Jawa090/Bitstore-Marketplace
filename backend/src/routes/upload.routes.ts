import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload.middleware";
import * as uploadController from "../controllers/upload.controller";

const router = Router();

// All upload routes require authentication
router.use(protect);

// Upload image
router.post("/image", upload.single("file"), uploadController.uploadImage);

export default router;
