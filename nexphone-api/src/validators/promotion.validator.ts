import { z } from "zod";

export const createCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Coupon code must be at least 3 characters")
    .max(30, "Coupon code cannot exceed 30 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Coupon code can only contain letters, numbers, hyphens, and underscores")
    .optional(),
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(120),
  description: z.string().trim().max(500).optional().default(""),
  type: z.enum(["promo_code", "sale_campaign", "automatic"]).default("promo_code").optional(),
  discountType: z.enum(["percentage", "fixed_amount", "free_shipping", "buy_x_get_y"]),
  discountValue: z.coerce.number().min(0, "Discount value must be 0 or greater"),
  minOrderValue: z.coerce.number().min(0).optional(),
  maxDiscountAmount: z.coerce.number().min(0).optional(),
  scope: z
    .enum(["all_products", "specific_products", "specific_brands", "min_order_value"])
    .default("all_products")
    .optional(),
  targetItems: z.array(z.string().trim()).optional().default(["All Products"]),
  status: z.enum(["active", "scheduled", "expired", "disabled"]).default("active").optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  usageLimit: z.coerce.number().int().min(1).nullable().optional(),
  customerLimit: z.coerce.number().int().min(1).default(1).optional(),
  campaignTag: z.string().trim().optional(),
  bannerColor: z
    .enum(["indigo", "rose", "amber", "emerald", "purple", "cyan"])
    .default("indigo")
    .optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required"),
  cartTotal: z.coerce.number().min(0).optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        price: z.coerce.number().min(0),
        quantity: z.coerce.number().int().min(1),
        brand: z.string().optional(),
        title: z.string().optional(),
      })
    )
    .optional(),
});

export const applyCouponSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required"),
  cartTotal: z.coerce.number().min(0).optional(),
  cartId: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        price: z.coerce.number().min(0),
        quantity: z.coerce.number().int().min(1),
        brand: z.string().optional(),
        title: z.string().optional(),
      })
    )
    .optional(),
});

export const queryPromotionSchema = z.object({
  status: z.string().optional(),
  type: z.string().optional(),
  scope: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["recent", "highest_discount", "most_used", "revenue_desc", "ending_soon"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
export type QueryPromotionInput = z.infer<typeof queryPromotionSchema>;
