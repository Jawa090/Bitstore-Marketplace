import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password using bcrypt.
 * Uses 12 rounds — good balance between security and speed.
 */
export const hashPassword = async (plainText: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainText, salt);
};

/**
 * Compare a plain-text password against a bcrypt hash.
 * Returns true if they match, false otherwise.
 */
export const comparePassword = async (
  plainText: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(plainText, hash);
};
