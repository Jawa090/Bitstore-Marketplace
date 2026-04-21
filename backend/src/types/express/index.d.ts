import { User } from "../../entities/User";

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, "password_hash">;
    }
  }
}
