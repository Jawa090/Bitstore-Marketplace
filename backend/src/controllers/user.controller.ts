import { Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response";
import { AuthRequest } from "../types/auth.types";
import * as UserService from "../services/user.service";
import { AppError } from "../utils/AppError";

// ─────────────────────────────────────────────────────────────────────
// POST /api/users/profile-picture
// ─────────────────────────────────────────────────────────────────────
export const uploadProfilePicture = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) throw new AppError("No image file provided.", 400);

    const avatarUrl = await UserService.uploadProfilePicture(
      req.user!.id,
      req.file.buffer
    );

    sendSuccess(res, "Profile picture updated successfully", { avatar_url: avatarUrl });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/users/me
// ─────────────────────────────────────────────────────────────────────
export const getMe = (req: AuthRequest, res: Response): void => {
  sendSuccess(res, "Profile retrieved successfully", { user: req.user });
};

// ─────────────────────────────────────────────────────────────────────
// PUT /api/users/profile
// ─────────────────────────────────────────────────────────────────────
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { display_name, phone, emirate, avatar_url } = req.body;

    const user = await UserService.updateProfile(userId, {
      display_name,
      phone,
      emirate,
      avatar_url,
    });
    sendSuccess(res, "Profile updated successfully", { user });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/users/addresses
// ─────────────────────────────────────────────────────────────────────
export const getAddresses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const addresses = await UserService.getUserAddresses(req.user!.id);
    sendSuccess(res, "Addresses retrieved successfully", { addresses });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/users/addresses
// ─────────────────────────────────────────────────────────────────────
export const addAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { label, emirate, address, landmark, phone, is_default } = req.body;
    if (!label || !emirate || !address) {
      throw new AppError("label, emirate, and address are required.", 400);
    }

    const newAddress = await UserService.addAddress(req.user!.id, {
      label,
      emirate,
      address,
      landmark,
      phone,
      is_default,
    });
    res.status(201).json({ success: true, message: "Address added successfully", data: { address: newAddress } });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// PUT /api/users/addresses/:id
// ─────────────────────────────────────────────────────────────────────
export const updateAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updated = await UserService.updateAddress(
      req.user!.id,
      req.params.id as string,
      req.body
    );
    sendSuccess(res, "Address updated successfully", { address: updated });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// DELETE /api/users/addresses/:id
// ─────────────────────────────────────────────────────────────────────
export const deleteAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await UserService.deleteAddress(req.user!.id, req.params.id as string);
    sendSuccess(res, "Address deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/users/notifications
// ─────────────────────────────────────────────────────────────────────
export const getNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notifications = await UserService.getUserNotifications(req.user!.id);
    sendSuccess(res, "Notifications retrieved successfully", { notifications });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// PUT /api/users/notifications/:id/read
// ─────────────────────────────────────────────────────────────────────
export const markNotificationRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notification = await UserService.markNotificationRead(
      req.user!.id,
      req.params.id as string
    );
    sendSuccess(res, "Notification marked as read", { notification });
  } catch (error) {
    next(error);
  }
};
