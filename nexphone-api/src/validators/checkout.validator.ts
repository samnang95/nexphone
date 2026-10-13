import { z } from "zod";

export const addressSchema = z.object({
  street: z.string().trim().min(3, "Street address must be at least 3 characters").max(120),
  city: z.string().trim().min(2, "City is required").max(60),
  state: z.string().trim().min(2, "State / Province is required").max(40),
  zipCode: z.string().trim().min(3, "Zip / Postal code is required").max(20),
  country: z.string().trim().min(2, "Country is required").default("United States").optional(),
});

export const validateAddressSchema = addressSchema;

export const calculateShippingSchema = z.object({
  subtotal: z.coerce.number().min(0, "Subtotal must be 0 or greater"),
  shippingMethod: z.enum(["standard", "express", "white_glove"]).default("standard").optional(),
  promoCode: z.string().trim().optional(),
  address: addressSchema.optional(),
});

export const calculateDiscountSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required"),
  subtotal: z.coerce.number().min(0).optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        price: z.coerce.number().min(0),
        quantity: z.coerce.number().int().min(1),
      })
    )
    .optional(),
});

export const calculateTotalSchema = z.object({
  subtotal: z.coerce.number().min(0, "Subtotal must be 0 or greater"),
  shippingMethod: z.enum(["standard", "express", "white_glove"]).default("standard").optional(),
  promoCode: z.string().trim().optional(),
  address: addressSchema.optional(),
  taxRate: z.coerce.number().min(0).max(0.5).default(0.08).optional(),
});

export const checkoutItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().trim().min(1, "Product ID is required"),
  productName: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  variantCapacity: z.string().optional(),
  variantRam: z.string().optional(),
  colorName: z.string().optional(),
  colorHex: z.string().optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  unitPrice: z.coerce.number().min(0).optional(),
});

export const createCheckoutSessionSchema = z.object({
  customer: z.object({
    id: z.string().optional(),
    name: z.string().trim().min(2, "Customer name is required").max(100),
    email: z.string().trim().email("Valid email is required"),
    phone: z.string().trim().min(7, "Phone number is required"),
    company: z.string().trim().optional(),
    shippingAddress: addressSchema,
    billingAddress: addressSchema.optional(),
  }),
  items: z.array(checkoutItemSchema).optional(),
  shippingMethod: z.enum(["standard", "express", "white_glove"]).default("standard").optional(),
  promoCode: z.string().trim().optional(),
  paymentMethod: z
    .enum(["credit_card", "stripe", "apple_pay", "corporate_wire", "purchase_order"])
    .default("credit_card")
    .optional(),
  notes: z.string().trim().max(300).optional(),
});

export const createPaymentSchema = z.object({
  orderId: z.string().trim().optional(),
  transactionId: z.string().trim().optional(),
  paymentMethod: z
    .enum(["credit_card", "stripe", "apple_pay", "corporate_wire", "purchase_order"])
    .default("credit_card")
    .optional(),
  amount: z.coerce.number().min(0).optional(),
  currency: z.string().default("USD").optional(),
  cardDetails: z
    .object({
      last4: z.string().optional(),
      brand: z.string().optional(),
      expMonth: z.coerce.number().optional(),
      expYear: z.coerce.number().optional(),
    })
    .optional(),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().trim().optional(),
  transactionId: z.string().trim().optional(),
  status: z.enum(["paid", "failed", "pending"]).default("paid").optional(),
  paymentIntentId: z.string().optional(),
  failureReason: z.string().optional(),
});

export const paymentWebhookSchema = z.object({
  event: z.string().trim().min(1, "Event name is required"),
  data: z.record(z.string(), z.any()),
  signature: z.string().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CalculateShippingInput = z.infer<typeof calculateShippingSchema>;
export type CalculateDiscountInput = z.infer<typeof calculateDiscountSchema>;
export type CalculateTotalInput = z.infer<typeof calculateTotalSchema>;
export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type PaymentWebhookInput = z.infer<typeof paymentWebhookSchema>;
