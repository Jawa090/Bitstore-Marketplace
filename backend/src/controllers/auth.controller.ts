import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as AuthService from "../services/auth.service";
import { sendCreated, sendSuccess, sendError } from "../utils/response";
import { AppError } from "../utils/AppError";
import redisClient, { blacklistToken } from "../config/redis";

// ─────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await AuthService.registerUser(req.body);

    sendCreated(res, "User registered successfully", {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/auth/google
// ─────────────────────────────────────────────────────────────────────
export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      throw new AppError("idToken is required", 400);
    }
    const result = await AuthService.googleLogin(idToken);
    sendSuccess(res, "Google sign-in successful", {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.loginUser(email, password);

    sendSuccess(res, "Login successful", {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────────────────────────────────
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError("refreshToken is required", 400);
    }
    const tokens = await AuthService.refreshTokens(refreshToken);
    sendSuccess(res, "Token refreshed successfully", tokens);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────────────
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // The protect middleware already validated the header, so this is safe.
    const token = req.headers.authorization!.split(" ")[1];

    // Decode without re-verifying — we only need the expiry timestamp.
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (decoded?.exp) {
      await blacklistToken(token, decoded.exp);
    }

    sendSuccess(res, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError("Email is required.", 400);

    // Service silently skips non-existent emails to prevent enumeration
    await AuthService.forgotPassword(email);

    // Always return the same response regardless of whether the email exists
    sendSuccess(
      res,
      "If an account with that email exists, a password reset link has been sent."
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────────────────
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    if (!token) throw new AppError("Reset token is required.", 400);
    if (!newPassword || newPassword.length < 8) {
      throw new AppError("New password must be at least 8 characters.", 400);
    }

    await AuthService.resetPassword(token, newPassword);
    sendSuccess(res, "Password reset successfully. You can now log in with your new password.");
  } catch (error) {
    next(error);
  }
};
