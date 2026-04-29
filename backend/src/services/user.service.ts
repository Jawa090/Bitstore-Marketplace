import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { Profile } from "../entities/Profile";
import { Address } from "../entities/Address";
import { UserNotification } from "../entities/UserNotification";
import { AppError } from "../utils/AppError";
import cloudinary from "../utils/cloudinary";

// ── Repository helpers ─────────────────────────────────────────────
const userRepo = () => AppDataSource.getRepository(User);
const profileRepo = () => AppDataSource.getRepository(Profile);
const addressRepo = () => AppDataSource.getRepository(Address);
const notificationRepo = () => AppDataSource.getRepository(UserNotification);

// ─────────────────────────────────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────────────────────────────────
export const updateProfile = async (
  userId: string,
  data: {
    display_name?: string;
    phone?: string | null;
    emirate?: string | null;
    avatar_url?: string | null;
  }
) => {
  const { display_name, ...userFields } = data;

  // 1. Update the User table (phone, emirate, avatar_url)
  const filteredUserFields = Object.fromEntries(
    Object.entries(userFields).filter(([, v]) => v !== undefined)
  );
  if (Object.keys(filteredUserFields).length > 0) {
    await userRepo().update({ id: userId }, filteredUserFields as any);
  }

  // 2. Update the User table (full_name) and Profile table (display_name)
  if (display_name !== undefined) {
    await userRepo().update({ id: userId }, { full_name: display_name });
    await profileRepo().update({ user_id: userId }, { display_name });
  }

  // 3. Return fresh user (without password_hash)
  const user = await userRepo().findOne({ where: { id: userId } });
  if (!user) throw new AppError("User not found.", 404);
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

// ─────────────────────────────────────────────────────────────────────
// UPLOAD PROFILE PICTURE
// ─────────────────────────────────────────────────────────────────────
export const uploadProfilePicture = async (
  userId: string,
  fileBuffer: Buffer
): Promise<string> => {
  // Stream the buffer to Cloudinary
  const avatarUrl = await new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "bitstores/profiles",
        public_id: `user_${userId}`,
        overwrite: true,
        resource_type: "image",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result) return reject(new AppError("Image upload failed.", 500));
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });

  // Persist the new URL to the User table
  await userRepo().update({ id: userId }, { avatar_url: avatarUrl });

  return avatarUrl;
};

// ─────────────────────────────────────────────────────────────────────
// ADDRESSES
// ─────────────────────────────────────────────────────────────────────
export const getUserAddresses = async (userId: string) => {
  return addressRepo().find({
    where: { user_id: userId },
    order: { is_default: "DESC", created_at: "ASC" },
  });
};

export const addAddress = async (
  userId: string,
  data: {
    label: string;
    emirate: string;
    address: string;
    landmark?: string | null;
    phone?: string | null;
    is_default?: boolean;
  }
) => {
  // If this address should be default, clear the flag on all others first
  if (data.is_default) {
    await addressRepo().update({ user_id: userId }, { is_default: false });
  }

  const newAddress = addressRepo().create({ user_id: userId, ...data });
  return addressRepo().save(newAddress);
};

export const updateAddress = async (
  userId: string,
  addressId: string,
  data: Partial<{
    label: string;
    emirate: string;
    address: string;
    landmark: string | null;
    phone: string | null;
    is_default: boolean;
  }>
) => {
  // Verify ownership
  const existing = await addressRepo().findOne({
    where: { id: addressId, user_id: userId },
  });
  if (!existing) throw new AppError("Address not found.", 404);

  // If setting this as default, clear the flag on all other addresses
  if (data.is_default) {
    await addressRepo().update({ user_id: userId }, { is_default: false });
  }

  await addressRepo().update({ id: addressId }, data as any);
  return addressRepo().findOne({ where: { id: addressId } });
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const existing = await addressRepo().findOne({
    where: { id: addressId, user_id: userId },
  });
  if (!existing) throw new AppError("Address not found.", 404);

  await addressRepo().delete({ id: addressId });
};

// ─────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────
export const getUserNotifications = async (userId: string) => {
  return notificationRepo().find({
    where: { user_id: userId },
    order: { created_at: "DESC" },
  });
};

export const markNotificationRead = async (
  userId: string,
  notificationId: string
) => {
  const notification = await notificationRepo().findOne({
    where: { id: notificationId, user_id: userId },
  });
  if (!notification) throw new AppError("Notification not found.", 404);

  await notificationRepo().update({ id: notificationId }, { is_read: true });
  return notificationRepo().findOne({ where: { id: notificationId } });
};
