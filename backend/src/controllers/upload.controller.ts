import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types";
import { sendSuccess } from "../utils/response";
import { uploadToCloudinary } from "../utils/cloudinary";

/**
 * POST /api/upload/image
 * Upload image to Cloudinary
 */
export const uploadImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
      return;
    }

    const folder = (req.body.folder as string) || "general";
    const result = await uploadToCloudinary(req.file.buffer, folder);

    sendSuccess(res, "Image uploaded successfully", {
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    next(error);
  }
};
