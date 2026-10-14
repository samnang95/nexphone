import { z } from "zod";

export const uploadProductImageSchema = z.object({
  productId: z.string().trim().optional(),
  isPrimary: z.preprocess(
    (val) => val === true || val === "true" || val === 1 || val === "1",
    z.boolean().optional()
  ),
  color: z.string().trim().optional(),
  altText: z.string().trim().max(255).optional(),
});

export const uploadBrandLogoSchema = z.object({
  brandId: z.string().trim().optional(),
  brandSlug: z.string().trim().optional(),
  theme: z.enum(["light", "dark", "monochrome", "default"]).optional().default("default"),
  altText: z.string().trim().max(255).optional(),
});

export const uploadHomepageBannerSchema = z.object({
  placement: z.enum(["hero", "promo_strip", "category", "footer", "secondary", "slider"]).optional().default("hero"),
  deviceTarget: z.enum(["all", "desktop", "mobile", "tablet"]).optional().default("all"),
  title: z.string().trim().max(200).optional(),
  linkUrl: z.string().trim().optional(),
});

export const upload3DModelSchema = z.object({
  productId: z.string().trim().optional(),
  polygonCount: z.coerce.number().int().min(0).optional(),
  autoRotate: z.preprocess(
    (val) => val === true || val === "true" || val === 1 || val === "1",
    z.boolean().optional().default(true)
  ),
  defaultColor: z.string().trim().optional(),
  wireframeSupported: z.preprocess(
    (val) => val === true || val === "true" || val === 1 || val === "1",
    z.boolean().optional().default(true)
  ),
});

export const deleteFileSchema = z.object({
  publicId: z.string().trim().optional(),
  fileId: z.string().trim().optional(),
});

export const listUploadsQuerySchema = z.object({
  assetType: z
    .enum(["product_image", "brand_logo", "homepage_banner", "3d_model", "avatar", "general", "all"])
    .optional()
    .default("all"),
  folder: z.string().trim().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
