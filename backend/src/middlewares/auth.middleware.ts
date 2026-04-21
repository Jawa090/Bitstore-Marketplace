import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../types/auth.types";
import redisClient from "../config/redis";

// ─────────────────────────────────────────────────────────────────────
// protect — verifies the Bearer token and attaches req.user
// ─────────────────────────────────────────────────────────────────────
export const protect = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extract token from "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided. Please log in.", 401);
    }
    const token = authHeader.split(" ")[1];

    // 2. Check Redis blacklist (fail-open if Redis is down)
    try {
      if (redisClient.isReady) {
        const isBlacklisted = await redisClient.get(token);
        if (isBlacklisted) {
          throw new AppError("Token has been revoked. Please login again.", 401);
        }
      }
    } catch (blacklistError) {
      // Re-throw our own AppError (token was actually blacklisted)
      if (blacklistError instanceof AppError) throw blacklistError;
      // Redis is down — log warning but don't block the user
      console.warn("⚠️  Redis unavailable for blacklist check:", (blacklistError as Error).message);
    }

    // 3. Verify signature and expiry
    const secret = process.env.JWT_SECRET || "your-secret-key";
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      throw new AppError("Invalid or expired token. Please log in again.", 401);
    }

    // 3. Fetch the user from the database
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: decoded.id } });
    if (!user) {
      throw new AppError("The user belonging to this token no longer exists.", 401);
    }

    // 4. Guard deactivated accounts
    if (!user.is_active) {
      throw new AppError("Your account has been deactivated. Contact support.", 403);
    }

    // 5. Strip password_hash before attaching to req
    const { password_hash, ...safeUser } = user;
    req.user = safeUser;

    next();
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// requireRole — restricts access to specific roles
// Usage: router.get('/admin-only', protect, requireRole('admin'), handler)
// ─────────────────────────────────────────────────────────────────────
export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("Not authenticated.", 401));
    }
    // Role check will be implemented when UserRole entity query is added
    next();
  };
};
