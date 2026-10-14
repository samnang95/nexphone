import { z } from "zod";

// ==========================================
// 1. Banner Validation Schemas
// ==========================================
export const createBannerSchema = z.object({
  title: z.string().min(2, "Banner title must be at least 2 characters").max(100),
  subtitle: z.string().max(250).optional().default(""),
  badge: z.string().max(50).optional().default("Featured"),
  primaryCta: z.object({
    label: z.string().min(1, "Primary CTA label is required"),
    url: z.string().min(1, "Primary CTA URL is required"),
  }),
  secondaryCta: z
    .object({
      label: z.string().min(1),
      url: z.string().min(1),
    })
    .optional(),
  imageUrl: z.string().url("Image URL must be valid").optional().or(z.string().min(1)),
  gradientOverlay: z.string().optional(),
  alignment: z.enum(["left", "center", "right"]).optional().default("left"),
  displayOrder: z.coerce.number().int().min(1).optional(),
  status: z.enum(["active", "scheduled", "draft", "hidden"]).optional().default("active"),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
});

export const updateBannerSchema = createBannerSchema.partial();

export const queryBannerSchema = z.object({
  status: z.enum(["active", "scheduled", "draft", "hidden", "all"]).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

// ==========================================
// 2. Featured Product Validation Schemas
// ==========================================
export const createFeaturedProductSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(2, "Product name must be at least 2 characters"),
  productSubtitle: z.string().optional(),
  productPrice: z.coerce.number().min(0, "Price must be positive"),
  productImage: z.string().optional(),
  series: z.string().optional(),
  badge: z.string().optional(),
  headline: z.string().optional(),
  displayOrder: z.coerce.number().int().min(1).optional(),
  status: z.enum(["active", "hidden"]).optional().default("active"),
  rating: z.coerce.number().min(0).max(5).optional(),
  highlightSpecs: z.array(z.string()).optional(),
});

export const updateFeaturedProductSchema = createFeaturedProductSchema.partial();

export const queryFeaturedProductsSchema = z.object({
  status: z.enum(["active", "hidden", "all"]).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  series: z.string().optional(),
});

// ==========================================
// 3. Homepage Section Validation Schemas
// ==========================================
export const createSectionSchema = z.object({
  sectionKey: z.string().min(2, "Section key is required").max(60),
  title: z.string().min(2, "Section title is required").max(120),
  subtitle: z.string().max(300).optional().default(""),
  type: z
    .enum(["split_banner", "feature_grid", "countdown_bar", "trust_badges", "callout_card"])
    .optional()
    .default("split_banner"),
  ctaLabel: z.string().optional().default("Learn More"),
  ctaUrl: z.string().optional().default("/products"),
  imageUrl: z.string().optional(),
  accentColor: z
    .enum(["indigo", "cyan", "emerald", "amber", "rose", "purple"])
    .optional()
    .default("indigo"),
  displayOrder: z.coerce.number().int().min(1).optional(),
  status: z.enum(["active", "hidden"]).optional().default("active"),
  features: z
    .array(
      z.object({
        icon: z.string(),
        title: z.string(),
        desc: z.string(),
      })
    )
    .optional(),
});

export const updateSectionSchema = createSectionSchema.partial();

export const querySectionSchema = z.object({
  status: z.enum(["active", "hidden", "all"]).optional(),
});

export const reorderSectionsSchema = z.object({
  sectionIds: z.array(z.string()).min(1, "At least one section ID must be provided").optional(),
  orders: z
    .array(
      z.object({
        id: z.string(),
        displayOrder: z.coerce.number().int(),
      })
    )
    .optional(),
});

// ==========================================
// 4. New Arrivals Validation Schemas
// ==========================================
export const createNewArrivalSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(2, "Product name must be at least 2 characters"),
  productSubtitle: z.string().optional(),
  productPrice: z.coerce.number().min(0, "Price must be positive"),
  productImage: z.string().optional(),
  series: z.string().optional(),
  releaseDate: z.string().optional(),
  tag: z.string().optional().default("Just Dropped"),
  isPreOrder: z.boolean().optional().default(false),
  displayOrder: z.coerce.number().int().min(1).optional(),
  status: z.enum(["active", "hidden"]).optional().default("active"),
  initialStock: z.coerce.number().int().min(0).optional().default(500),
});

export const updateNewArrivalSchema = createNewArrivalSchema.partial();

// ==========================================
// 5. Best Sellers Validation Schemas
// ==========================================
export const createBestSellerSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(2, "Product name must be at least 2 characters"),
  productSubtitle: z.string().optional(),
  productPrice: z.coerce.number().min(0, "Price must be positive"),
  productImage: z.string().optional(),
  series: z.string().optional(),
  rank: z.coerce.number().int().min(1).optional(),
  unitsSold: z.coerce.number().int().min(0).optional(),
  badge: z.string().optional().default("Top Seller"),
  satisfactionRate: z.coerce.number().min(0).max(100).optional().default(98.5),
  monthlyGrowth: z.coerce.number().optional().default(12.0),
  status: z.enum(["active", "hidden"]).optional().default("active"),
});

export const updateBestSellerSchema = createBestSellerSchema.partial();

