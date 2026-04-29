import { Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { Vendor } from "../entities/Vendor";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../types/auth.types";
import { VendorStatus } from "../utils/constants";

// ─────────────────────────────────────────────────────────────────────
// isVendorApproved — verifies the user has an approved vendor profile
// Must run AFTER the `protect` auth middleware.
// On success, attaches `req.vendor` for downstream handlers.
// ─────────────────────────────────────────────────────────────────────
export const isVendorApproved = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated.", 401);
    }

    const vendor = await AppDataSource.getRepository(Vendor).findOne({
      where: { user: { id: req.user.id } },
    });

    if (!vendor || vendor.status !== VendorStatus.APPROVED) {
      throw new AppError(
        "Only approved vendors can perform this action.",
        403
      );
    }

    // Attach vendor to request for downstream controllers
    req.vendor = vendor;
    next();
  } catch (error) {
    next(error);
  }
};
