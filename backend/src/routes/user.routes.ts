import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { getMe } from "../controllers/user.controller";

const router = Router();

// All user routes require a valid token
router.use(protect);

// GET /api/users/me
router.get("/me", getMe);

export default router;
