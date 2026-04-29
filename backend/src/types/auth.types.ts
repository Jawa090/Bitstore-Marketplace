import { Request } from 'express';
import { User } from '../entities/User';

/**
 * Extends the Express Request to include the authenticated user.
 * Use this interface in any middleware or controller that sits behind `protect`.
 *
 * Usage:
 *   import { AuthRequest } from '../types/auth.types';
 *   export const myController = (req: AuthRequest, res: Response) => { ... }
 */
export interface AuthRequest extends Request {
  user?: Omit<User, 'password_hash'>;
  userRoles?: string[]; // Array of user roles (e.g., ['customer', 'admin'])
}
