import { z } from "zod";

export const wishlistColorSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1, "Color name is required"),
  hex: z.string().trim().min(1, "Color hex is required"),
  imageUrl: z.string().url().or(z.literal("")).optional(),
});

export const wishlistStorageSchema = z.object({
  id: z.string().trim().optional(),
  capacity: z.string().trim().min(1, "Capacity is required"),
  ram: z.string().trim().min(1, "RAM is required"),
  sku: z.string().trim().optional(),
  price: z.coerce.number().positive().optional(),
});

export const addToWishlistSchema = z.object({
  productId: z.string().trim().min(1, "productId is required"),
  selectedColor: wishlistColorSchema.optional(),
  selectedStorage: wishlistStorageSchema.optional(),
});

export const toggleWishlistSchema = z.object({
  productId: z.string().trim().min(1, "productId is required"),
  selectedColor: wishlistColorSchema.optional(),
  selectedStorage: wishlistStorageSchema.optional(),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
export type ToggleWishlistInput = z.infer<typeof toggleWishlistSchema>;
