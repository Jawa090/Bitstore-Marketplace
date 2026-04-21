import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// POST /api/auth/register
router.post("/register", validateMiddleware(registerSchema), authController.register);

// POST /api/auth/google
router.post("/google", authController.googleAuth);

// POST /api/auth/login
router.post("/login", validateMiddleware(loginSchema), authController.login);

// POST /api/auth/refresh  — issues a new token pair
router.post("/refresh", authController.refresh);

// POST /api/auth/logout  — protected; client must send a valid access token
router.post("/logout", protect, authController.logout);

// POST /api/auth/forgot-password  — public
router.post("/forgot-password", authController.forgotPassword);

// POST /api/auth/reset-password   — public (token carries the identity)
router.post("/reset-password", authController.resetPassword);

export default router;
