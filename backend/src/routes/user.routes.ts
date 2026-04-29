import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import * as userController from "../controllers/user.controller";
import upload from "../middlewares/upload.middleware";

const router = Router();

// All user routes require a valid token
router.use(protect);

// ── Profile ──────────────────────────────────────────────────────────
router.get("/me", userController.getMe);
router.put("/profile", userController.updateProfile);
router.post(
  "/profile-picture",
  upload.single("avatar"),
  userController.uploadProfilePicture
);

// ── Addresses ────────────────────────────────────────────────────────
router.get("/addresses", userController.getAddresses);
router.post("/addresses", userController.addAddress);
router.put("/addresses/:id", userController.updateAddress);
router.delete("/addresses/:id", userController.deleteAddress);

// ── Notifications ─────────────────────────────────────────────────────
router.get("/notifications", userController.getNotifications);
router.put("/notifications/:id/read", userController.markNotificationRead);

export default router;
