import { Response } from "express";
import { sendSuccess } from "../utils/response";
import { AuthRequest } from "../types/auth.types";

// ─────────────────────────────────────────────────────────────────────
// GET /api/users/me
// ─────────────────────────────────────────────────────────────────────
export const getMe = (req: AuthRequest, res: Response): void => {
  // req.user is already sanitized (no password_hash) by the protect middleware
  sendSuccess(res, "Profile retrieved successfully", { user: req.user });
};
