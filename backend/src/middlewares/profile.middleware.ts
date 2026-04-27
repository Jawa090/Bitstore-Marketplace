import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";

// ─────────────────────────────────────────────────────────────────────
// Middleware: requireCompleteProfile
// Blocks checkout-like operations unless phone + emirate are set.
// ─────────────────────────────────────────────────────────────────────
export const requireCompleteProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "unauthorized", message: "Authentication required." });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      res.status(401).json({ success: false, error: "unauthorized", message: "User not found." });
      return;
    }

    if (!user.phone || !user.emirate) {
      res.status(403).json({
        success: false,
        error: "profile_incomplete",
        message: "Please provide your phone number and Emirate to proceed to checkout.",
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
