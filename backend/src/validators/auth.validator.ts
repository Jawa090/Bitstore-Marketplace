import { z } from 'zod';

const UAE_PHONE_REGEX = /^(\+9715\d{8}|05\d{8})$/;

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().check(z.email({ message: "Invalid email address" })),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
    phone: z
      .string()
      .check(z.regex(UAE_PHONE_REGEX, { message: "Invalid UAE phone number (e.g. +971501234567 or 0501234567)" })),
    emirate: z.enum(
      ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"],
      { error: "Please select a valid emirate" }
    ),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Inferred Types (Required downstream)
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
