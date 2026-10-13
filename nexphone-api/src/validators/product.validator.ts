import { z } from "zod";

const colorOptionSchema = z.object({
  id: z.string().trim().min(1, "Color id is required"),
  name: z.string().trim().min(1, "Color name is required"),
  hex: z.string().trim().min(1, "Color hex code is required"),
  inStock: z.boolean().default(true),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

const storageVariantSchema = z.object({
  id: z.string().trim().min(1, "Storage id is required"),
  capacity: z.string().trim().min(1, "Capacity is required"),
  ram: z.string().trim().min(1, "RAM is required"),
  price: z.number().positive("Price must be positive"),
  comparePrice: z.number().positive().optional(),
  stock: z.number().int().min(0, "Stock cannot be negative").default(0),
  sku: z.string().trim().min(1, "SKU is required"),
});

const model3DSchema = z.object({
  enabled: z.boolean().default(false),
  modelUrl: z.string().trim().default(""),
  fileFormat: z.enum(["glb", "gltf", "obj", "usdz"]).default("glb"),
  fileSize: z.string().trim().default(""),
  polygonCount: z.number().int().min(0).default(0),
  autoRotate: z.boolean().default(false),
  defaultColor: z.string().trim().default("#000000"),
  wireframeSupported: z.boolean().default(false),
});

export const createProductSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(2, "Product name must be at least 2 characters"),
  slug: z.string().trim().toLowerCase().optional(),
  subtitle: z.string().trim().optional().default(""),
  series: z.string().trim().min(1, "Product series is required"),
  brand: z.string().trim().default("NexPhone"),
  status: z.enum(["published", "draft", "archived"]).default("published"),
  basePrice: z.number().positive("Base price must be greater than 0"),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  rating: z.number().min(0).max(5).default(5.0),
  reviewCount: z.number().int().min(0).default(0),
  salesCount: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  imageUrl: z.string().url().optional().or(z.literal("")),
  images: z.array(z.string()).default([]),
  colors: z.array(colorOptionSchema).min(1, "At least one color option is required"),
  storageOptions: z.array(storageVariantSchema).min(1, "At least one storage option is required"),
  specifications: z.record(z.string(), z.any()).default({}),
  model3D: model3DSchema.optional(),
});

export const updateProductSchema = createProductSchema.partial().omit({ id: true });

export const queryProductSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  q: z.string().trim().optional(),
  series: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  status: z.enum(["published", "draft", "archived", "all"]).optional(),
  priceRange: z.enum(["all", "under-700", "700-1200", "1200-1800", "above-1800"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  inStock: z.enum(["true", "false", "1", "0"]).optional(),
  inStockOnly: z.enum(["true", "false", "1", "0"]).optional(),
  isFeatured: z.enum(["true", "false", "1", "0"]).optional(),
  isNewArrival: z.enum(["true", "false", "1", "0"]).optional(),
  isBestSeller: z.enum(["true", "false", "1", "0"]).optional(),
  sort: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  paginated: z.enum(["true", "false", "1", "0"]).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type QueryProductInput = z.infer<typeof queryProductSchema>;
