import jwt from "jsonwebtoken";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { UserRoleEntity } from "../entities/UserRole";
import { Profile } from "../entities/Profile";
import { UserRole } from "../utils/constants";
import { hashPassword, comparePassword } from "../utils/password";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { sendEmail } from "../utils/email";

// ── Repository references ───────────────────────────────────────────
const userRepo = () => AppDataSource.getRepository(User);
const roleRepo = () => AppDataSource.getRepository(UserRoleEntity);
const profileRepo = () => AppDataSource.getRepository(Profile);

/**
 * Strip sensitive fields from user object before returning to client.
 */
const sanitizeUser = (user: User) => {
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

// ─────────────────────────────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────────────────────────────
export const registerUser = async (data: RegisterInput) => {
  // confirm_password is destructured and discarded — it must not be passed to TypeORM
  const { full_name, email, password, phone, emirate, confirm_password: _ } = data;

  // 1. Check if email already exists
  const existingUser = await userRepo().findOne({ where: { email } });
  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  // 2. Hash the password
  const password_hash = await hashPassword(password);

  // 3. Create and save the User
  const user = userRepo().create({
    email,
    password_hash,
    full_name,
    phone: phone || null,
    emirate: emirate as any,
  });
  await userRepo().save(user);

  // 4. Assign default "customer" role
  const role = roleRepo().create({
    user_id: user.id,
    role: UserRole.CUSTOMER,
  });
  await roleRepo().save(role);

  // 5. Create an empty profile
  const profile = profileRepo().create({
    user_id: user.id,
    display_name: full_name,
  });
  await profileRepo().save(profile);

  // 6. Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // 7. Return sanitized user + tokens
  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

// ─────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────
export const loginUser = async (email: string, password: string) => {
  // 1. Find user by email
  const user = await userRepo().findOne({ where: { email } });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // 2. Check if account is active
  if (!user.is_active) {
    throw new AppError("Your account has been deactivated. Contact support.", 403);
  }

  // 3. Ensure user has a password (not a Google-only account)
  if (!user.password_hash) {
    throw new AppError(
      "This account uses Google sign-in. Please log in with Google.",
      400
    );
  }

  // 4. Compare passwords
  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  // 5. Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // 6. Return sanitized user + tokens
  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

// ─────────────────────────────────────────────────────────────────────
// GOOGLE LOGIN
// ─────────────────────────────────────────────────────────────────────
export const googleLogin = async (idToken: string) => {
  // 1. Verify the Google ID token
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  let payload: TokenPayload | undefined;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload()!;
  } catch {
    throw new AppError("Invalid or expired Google token", 401);
  }

  if (!payload || !payload.email) {
    throw new AppError("Could not retrieve user info from Google", 400);
  }

  const { email, name, picture, sub: google_id } = payload;

  // 2. Find existing user by email
  let user = await userRepo().findOne({ where: { email } });

  if (!user) {
    // 3a. New user — create account (no password_hash since they use Google)
    user = userRepo().create({
      email,
      full_name: name || email,
      google_id,
      avatar_url: picture ?? null,
      password_hash: null,
      email_verified: true,
    });
    await userRepo().save(user);

    // Assign default "customer" role
    const role = roleRepo().create({ user_id: user.id, role: UserRole.CUSTOMER });
    await roleRepo().save(role);

    // Create empty profile
    const profile = profileRepo().create({ user_id: user.id, display_name: name || email });
    await profileRepo().save(profile);
  } else {
    // 3b. Existing user — link google_id if not already set
    if (!user.google_id) {
      user.google_id = google_id;
    }
    if (picture && !user.avatar_url) {
      user.avatar_url = picture;
    }
    await userRepo().save(user);
  }

  // 4. Guard against deactivated accounts
  if (!user.is_active) {
    throw new AppError("Your account has been deactivated. Contact support.", 403);
  }

  // 5. Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

// ─────────────────────────────────────────────────────────────────────
// REFRESH TOKEN
// ─────────────────────────────────────────────────────────────────────
export const refreshTokens = async (token: string) => {
  // 1. Verify the refresh token
  const secret = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";
  let decoded: any;
  try {
    decoded = jwt.verify(token, secret);
  } catch {
    throw new AppError("Invalid or expired refresh token. Please log in again.", 401);
  }

  // 2. Confirm the user still exists and is active
  const user = await userRepo().findOne({ where: { id: decoded.id } });
  if (!user) {
    throw new AppError("The user belonging to this token no longer exists.", 401);
  }
  if (!user.is_active) {
    throw new AppError("Your account has been deactivated. Contact support.", 403);
  }

  // 3. Rotate both tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return { accessToken, refreshToken };
};

// ─────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────────────────────────────
export const forgotPassword = async (email: string): Promise<void> => {
  // 1. Look up the user — always respond with the same message to prevent
  //    email enumeration attacks; only skip sending if not found.
  const user = await userRepo().findOne({ where: { email } });
  if (!user) return; // silently bail — caller returns a generic success

  // 2. Generate a short-lived reset token (15 min)
  const resetSecret = process.env.JWT_RESET_SECRET || "your-reset-secret-key";
  const resetToken = jwt.sign({ id: user.id }, resetSecret, { expiresIn: "15m" });

  // 3. Build the reset URL (points at the frontend reset page)
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  // 4. Send the email
  await sendEmail({
    to: user.email,
    subject: "BitStores — Password Reset Request",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:8px;">
        <h2 style="color:#1a1a1a;">Reset Your Password</h2>
        <p style="color:#555;">Hi ${user.full_name},</p>
        <p style="color:#555;">
          We received a request to reset your BitStores account password.
          Click the button below to choose a new password. This link expires in <strong>15 minutes</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:24px 0;padding:12px 28px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
          Reset Password
        </a>
        <p style="color:#999;font-size:13px;">
          If you did not request this, you can safely ignore this email —
          your password will not change.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="color:#bbb;font-size:12px;">
          &copy; ${new Date().getFullYear()} BitStores. All rights reserved.
        </p>
      </div>
    `,
  });
};

// ─────────────────────────────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────────────────────────────
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  // 1. Verify the reset token
  const resetSecret = process.env.JWT_RESET_SECRET || "your-reset-secret-key";
  let decoded: any;
  try {
    decoded = jwt.verify(token, resetSecret);
  } catch {
    throw new AppError("Reset link is invalid or has expired. Please request a new one.", 400);
  }

  // 2. Fetch the user
  const user = await userRepo().findOne({ where: { id: decoded.id } });
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  // 3. Hash the new password and persist it
  user.password_hash = await hashPassword(newPassword);
  await userRepo().save(user);
};
