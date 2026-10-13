import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters.").max(100).optional(),
  phone: z
    .string()
    .trim()
    .max(32)
    .regex(/^[+\d][\d\s().-]{5,31}$/, "Please enter a valid phone number.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  company: z.string().trim().max(120).optional(),
});

export const updateAvatarSchema = z.object({
  avatarUrl: z.string().trim().min(1, "Avatar URL is required.").max(2048),
});

export const addressInputSchema = z.object({
  type: z.enum(["home", "work", "other"]).default("home"),
  label: z.string().trim().min(1, "Address label is required (e.g. Home, Office).").max(60),
  recipient: z.string().trim().min(1, "Recipient name is required.").max(100),
  phone: z
    .string()
    .trim()
    .min(6, "Please enter a valid phone number.")
    .max(32)
    .regex(/^[+\d][\d\s().-]{5,31}$/, "Please enter a valid phone number."),
  street: z.string().trim().min(1, "Street address is required.").max(200),
  apartment: z.string().trim().max(60).optional(),
  city: z.string().trim().min(1, "City is required.").max(100),
  state: z.string().trim().min(1, "State / Province is required.").max(100),
  zipCode: z.string().trim().min(1, "Postal / ZIP code is required.").max(20),
  country: z.string().trim().min(1, "Country is required.").max(100),
  instructions: z.string().trim().max(500).optional(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = addressInputSchema.partial();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateAvatarInput = z.infer<typeof updateAvatarSchema>;
export type AddressInput = z.infer<typeof addressInputSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
