import { Response, NextFunction } from "express";
import { sendCreated, sendSuccess } from "../utils/response";
import { AuthRequest } from "../types/auth.types";
import { AppError } from "../utils/AppError";
import * as VendorService from "../services/vendor.service";

// ─────────────────────────────────────────────────────────────────────────
// POST /api/vendor/apply
// Submit a vendor onboarding application for the authenticated user.
// ─────────────────────────────────────────────────────────────────────────
export const applyHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      store_name,
      store_description,
      emirate,
      address,
      contact_email,
      contact_phone,
      license_number,
      license_expiry_date,
      license_document_url,
    } = req.body;

    // Basic validation
    if (!store_name) throw new AppError("store_name is required.", 400);
    if (!emirate) throw new AppError("emirate is required.", 400);
    if (!license_number) throw new AppError("license_number is required.", 400);
    if (!license_expiry_date)
      throw new AppError("license_expiry_date is required.", 400);

    const vendor = await VendorService.applyForVendor(req.user!.id, {
      store_name,
      store_description,
      emirate,
      address,
      contact_email,
      contact_phone,
      license_number,
      license_expiry_date,
      license_document_url,
    });

    sendCreated(res, "Vendor application submitted successfully.", { vendor });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/vendor/check
// Return the user's vendor profile/status, or null if they haven't applied.
// ─────────────────────────────────────────────────────────────────────────
export const checkHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vendor = await VendorService.checkVendorStatus(req.user!.id);
    sendSuccess(res, "Vendor status retrieved.", { vendor });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/vendor/overview
// Return dashboard metrics for the authenticated vendor.
// ─────────────────────────────────────────────────────────────────────────
export const getOverviewHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const overview = await VendorService.getVendorOverview(req.vendor!.id);
    sendSuccess(res, "Vendor overview retrieved.", overview);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/vendor/settings
// Return the vendor's store profile/settings.
// ─────────────────────────────────────────────────────────────────────────
export const getSettingsHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vendor = await VendorService.getVendorSettings(req.vendor!.id);
    sendSuccess(res, "Vendor settings retrieved.", { vendor });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/vendor/settings
// Update the vendor's store profile/settings.
// ─────────────────────────────────────────────────────────────────────────
export const updateSettingsHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vendor = await VendorService.updateVendorSettings(
      req.vendor!.id,
      req.body
    );
    sendSuccess(res, "Vendor settings updated successfully.", { vendor });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/vendor/payouts
// Return all payout records for the authenticated vendor.
// ─────────────────────────────────────────────────────────────────────────
export const getPayoutsHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payouts = await VendorService.getVendorPayouts(req.vendor!.id);
    sendSuccess(res, "Vendor payouts retrieved.", { payouts });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/vendor/analytics
// Return revenue chart data and recent orders for the vendor dashboard.
// ─────────────────────────────────────────────────────────────────────────
export const getAnalyticsHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const analytics = await VendorService.getVendorAnalytics(req.vendor!.id);
    sendSuccess(res, "Vendor analytics retrieved.", analytics);
  } catch (error) {
    next(error);
  }
};
