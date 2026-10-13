import { z } from "zod";

export const createBrandSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(2, "Brand name must be at least 2 characters"),
  slug: z.string().trim().toLowerCase().optional(),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, "Brand code must be at least 2 characters")
    .max(10, "Brand code cannot exceed 10 characters"),
  logoUrl: z.string().url("Invalid logo URL").optional().or(z.literal("")),
  logoIcon: z
    .enum(["shield", "sparkles", "cpu", "globe", "zap", "gem", "layers"])
    .default("sparkles"),
  accentColor: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Accent color must be a valid hex code (e.g. #6366f1)")
    .default("#6366f1"),
  description: z.string().trim().default(""),
  country: z.string().trim().min(1, "Country is required").default("United States"),
  headquarters: z.string().trim().default(""),
  foundedYear: z.coerce.number().int().min(1800).max(2100).default(2024),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  supportEmail: z.string().email("Invalid support email").optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
  tier: z.enum(["Flagship", "Enterprise", "OEM Partner", "Strategic"]).default("Strategic"),
  isFeatured: z.boolean().default(false),
  marketShare: z.string().trim().default("0.0%"),
  rating: z.coerce.number().min(0).max(5).default(5.0),
});

export const updateBrandSchema = createBrandSchema.partial().omit({ id: true });

export const queryBrandSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().trim().optional(),
  q: z.string().trim().optional(),
  status: z.enum(["active", "inactive", "pending", "all"]).optional(),
  tier: z.enum(["Flagship", "Enterprise", "OEM Partner", "Strategic", "all"]).optional(),
  country: z.string().trim().optional(),
  isFeatured: z.enum(["true", "false", "1", "0"]).optional(),
  sort: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  paginated: z.enum(["true", "false", "1", "0"]).optional(),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type QueryBrandInput = z.infer<typeof queryBrandSchema>;
