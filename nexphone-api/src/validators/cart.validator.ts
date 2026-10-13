import { z } from "zod";

export const cartColorSchema = z.object({
  id: z.string().trim().min(1, "Color id is required"),
  name: z.string().trim().min(1, "Color name is required"),
  hex: z.string().trim().min(1, "Color hex is required"),
  imageUrl: z.string().url().or(z.literal("")).optional(),
  inStock: z.boolean().optional(),
});

export const cartStorageSchema = z.object({
  id: z.string().trim().min(1, "Storage variant id is required"),
  capacity: z.string().trim().min(1, "Storage capacity is required"),
  ram: z.string().trim().min(1, "RAM configuration is required"),
  sku: z.string().trim().min(1, "SKU is required"),
  price: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0).optional(),
});

export const addToCartSchema = z.object({
  productId: z.string().trim().min(1, "productId is required"),
  productName: z.string().trim().optional(),
  productSlug: z.string().trim().optional(),
  productImage: z.string().optional(),
  series: z.string().optional(),
  color: cartColorSchema,
  storage: cartStorageSchema,
  unitPrice: z.coerce.number().positive("Unit price must be positive").optional(),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1").default(1),
});

export const updateCartItemQuantitySchema = z.object({
  quantity: z.coerce.number().int().min(0, "Quantity must be at least 0"),
  color: cartColorSchema.optional(),
  storage: cartStorageSchema.optional(),
  unitPrice: z.coerce.number().positive().optional(),
});

export const applyPromoSchema = z.object({
  code: z.string().trim().min(1, "Promo code is required").max(50),
});

export const calculateCartSchema = z.object({
  items: z.array(addToCartSchema).optional(),
  promoCode: z.string().trim().optional(),
  taxRate: z.coerce.number().min(0).max(1).optional(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemQuantityInput = z.infer<typeof updateCartItemQuantitySchema>;
export type ApplyPromoInput = z.infer<typeof applyPromoSchema>;
export type CalculateCartInput = z.infer<typeof calculateCartSchema>;
