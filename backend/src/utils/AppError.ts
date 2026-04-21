/**
 * Custom application error with HTTP status code.
 * Throw this in services — the controller or global error handler catches it.
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details: any;

  constructor(message: string, statusCode: number = 400, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes from programming bugs
    this.details = details || null;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
