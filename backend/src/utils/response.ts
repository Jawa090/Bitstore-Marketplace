import { Response } from "express";

/**
 * Standard API response envelope.
 *
 * Success shape:
 * {
 *   success: true,
 *   message: "User registered successfully",
 *   data: { user: {...}, accessToken: "..." }
 * }
 *
 * Error shape:
 * {
 *   success: false,
 *   message: "Validation failed",
 *   error: "Email already exists"
 * }
 */
interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

export const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: any,
  error?: any
): void => {
  const body: ApiResponse = { success, message };

  if (data !== undefined && data !== null) {
    body.data = data;
  }

  if (error !== undefined && error !== null) {
    body.error = error;
  }

  res.status(statusCode).json(body);
};

// ── Convenience helpers ─────────────────────────────────────────────

export const sendSuccess = (
  res: Response,
  message: string,
  data?: any,
  statusCode: number = 200
): void => {
  sendResponse(res, statusCode, true, message, data);
};

export const sendError = (
  res: Response,
  message: string,
  error?: any,
  statusCode: number = 400
): void => {
  sendResponse(res, statusCode, false, message, undefined, error);
};

export const sendCreated = (
  res: Response,
  message: string,
  data?: any
): void => {
  sendResponse(res, 201, true, message, data);
};
