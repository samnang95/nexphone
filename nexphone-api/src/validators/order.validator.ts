import { z } from "zod";
import { addressSchema, checkoutItemSchema } from "./checkout.validator";

export const createOrderSchema = z.object({
  customer: z.object({
    id: z.string().optional(),
    name: z.string().trim().min(2, "Customer name is required"),
    email: z.string().trim().email("Valid email is required"),
    phone: z.string().trim().min(7, "Phone number is required"),
    company: z.string().trim().optional(),
    shippingAddress: addressSchema,
    billingAddress: addressSchema.optional(),
  }),
  items: z.array(checkoutItemSchema).min(1, "Order must contain at least one item").optional(),
  shippingMethod: z.enum(["standard", "express", "white_glove"]).default("standard").optional(),
  promoCode: z.string().trim().optional(),
  paymentMethod: z
    .enum(["credit_card", "stripe", "apple_pay", "corporate_wire", "purchase_order"])
    .default("credit_card")
    .optional(),
  notes: z.string().trim().max(300).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
  carrier: z.string().trim().optional(),
  trackingNumber: z.string().trim().optional(),
  estimatedDelivery: z.string().trim().optional(),
  note: z.string().trim().max(300).optional(),
  performedBy: z.string().trim().optional(),
});

export const confirmRejectOrderSchema = z.object({
  action: z.enum(["confirm", "reject"]),
  reason: z.string().trim().max(300).optional(),
  note: z.string().trim().max(300).optional(),
  performedBy: z.string().trim().optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().max(300).optional(),
  note: z.string().trim().max(500).optional(),
  refundPayment: z.boolean().default(true).optional(),
  performedBy: z.string().trim().optional(),
});

export const queryOrderSchema = z.object({
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  search: z.string().optional(),
  userId: z.string().optional(),
  customerEmail: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ConfirmRejectOrderInput = z.infer<typeof confirmRejectOrderSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type QueryOrderInput = z.infer<typeof queryOrderSchema>;
