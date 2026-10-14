import { z } from "zod";

export const updateAdminProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
  phone: z.string().trim().max(32).optional(),
  company: z.string().trim().max(120).optional(),
  avatarUrl: z.string().url("Avatar must be a valid URL").optional().or(z.literal("")),
});

export const changeAdminPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters"),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => !data.confirmPassword || data.newPassword === data.confirmPassword,
    {
      message: "New password and confirmation do not match.",
      path: ["confirmPassword"],
    }
  );

export const listAdminsQuerySchema = z.object({
  role: z.enum(["admin", "super_admin", "all"]).optional().default("all"),
  status: z.enum(["active", "disabled", "all"]).optional().default("all"),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const createAdminAccountSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Valid email required").max(254),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  role: z.enum(["admin", "super_admin"]).optional().default("admin"),
  phone: z.string().trim().max(32).optional(),
  company: z.string().trim().max(120).optional(),
  avatarUrl: z.string().url().optional(),
});

export const updateAdminAccountSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().max(254).optional(),
  role: z.enum(["admin", "super_admin"]).optional(),
  status: z.enum(["active", "disabled"]).optional(),
  phone: z.string().trim().max(32).optional(),
  company: z.string().trim().max(120).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  disabledReason: z.string().max(255).optional(),
});

export const disableAdminAccountSchema = z.object({
  reason: z.string().max(255).optional().default("Administrative action"),
});
