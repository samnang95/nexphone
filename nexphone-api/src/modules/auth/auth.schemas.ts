import { z } from "zod";

const REGISTER_REQUIRED = "Full name, email, and password are required.";
const LOGIN_REQUIRED = "Email and password are required.";
const RESET_REQUIRED = "Email, recovery code, and new password are required.";
const RESET_INVALID_CODE = "Invalid or expired recovery code. Please request a new code.";

// bcrypt only uses the first 72 bytes, so longer passwords would be silently truncated.
const newPassword = (requiredMsg: string) =>
  z
    .string({ error: requiredMsg })
    .min(8, "Password must be at least 8 characters long.")
    .max(72, "Password must be at most 72 characters long.");

const emailField = (requiredMsg: string) =>
  z
    .string({ error: requiredMsg })
    .trim()
    .min(1, requiredMsg)
    .max(254)
    .toLowerCase()
    .pipe(z.email("Please enter a valid email address."));

// Unknown keys (role, tier, status, ...) are stripped, so they can never reach the model.
export const registerSchema = z.object({
  name: z.string({ error: REGISTER_REQUIRED }).trim().min(1, REGISTER_REQUIRED).max(100),
  email: emailField(REGISTER_REQUIRED),
  phone: z
    .string()
    .trim()
    .max(32)
    .regex(/^[+\d][\d\s().-]{5,31}$/, "Please enter a valid phone number.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  password: newPassword(REGISTER_REQUIRED),
  accountType: z.string().trim().max(32).optional(),
  company: z.string().trim().max(120).optional(),
});

export const loginSchema = z.object({
  // Accepts an email address or (for customers) a phone number, as before.
  email: z.string({ error: LOGIN_REQUIRED }).trim().min(1, LOGIN_REQUIRED).max(254),
  password: z.string({ error: LOGIN_REQUIRED }).min(1, LOGIN_REQUIRED).max(1024),
});

export const forgotPasswordSchema = z.object({
  email: z.string({ error: "Email address is required." }).trim().min(1, "Email address is required.").max(254),
});

export const resetPasswordSchema = z.object({
  email: z.string({ error: RESET_REQUIRED }).trim().min(1, RESET_REQUIRED).max(254),
  code: z.preprocess(
    (v) => (typeof v === "number" ? String(v) : v),
    z.string({ error: RESET_REQUIRED }).trim().regex(/^\d{6}$/, RESET_INVALID_CODE)
  ),
  newPassword: newPassword(RESET_REQUIRED),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ error: "Current password is required." })
    .min(1, "Current password is required.")
    .max(1024),
  newPassword: newPassword("New password is required."),
  confirmPassword: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export { RESET_INVALID_CODE };
