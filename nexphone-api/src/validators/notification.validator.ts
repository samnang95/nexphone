import { z } from "zod";

export const sendNotificationSchema = z.object({
  title: z.string().min(2, "Notification title is required").max(200),
  body: z.string().min(2, "Notification body is required").max(2000),
  type: z
    .enum(["order", "promotional", "announcement", "system", "custom"])
    .default("custom"),
  channels: z
    .array(z.enum(["push", "email", "sms", "in_app"]))
    .optional()
    .default(["push"]),
  targetAudience: z
    .enum(["all", "enterprise_vip", "order_customers", "active_devices", "custom_segment"])
    .optional()
    .default("all"),
  recipientId: z.string().optional(),
  recipientEmail: z.string().email().optional(),
  actionUrl: z.string().optional(),
  scheduleTime: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updateNotificationSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  body: z.string().min(2).max(2000).optional(),
  channels: z.array(z.enum(["push", "email", "sms", "in_app"])).optional(),
  targetAudience: z
    .enum(["all", "enterprise_vip", "order_customers", "active_devices", "custom_segment"])
    .optional(),
  actionUrl: z.string().optional(),
  scheduleTime: z.string().optional().nullable(),
  status: z.enum(["sent", "scheduled", "draft", "failed"]).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const sendOrderUpdateSchema = z.object({
  orderId: z.string().min(1).optional(),
  event: z
    .enum([
      "order_created",
      "order_confirmed",
      "order_shipped",
      "out_for_delivery",
      "order_delivered",
      "order_cancelled",
    ])
    .optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  channels: z.array(z.enum(["push", "email", "sms", "in_app"])).optional(),
  recipientEmail: z.string().email().optional(),
  recipientId: z.string().optional(),
});

export const sendPromotionAnnouncementSchema = z.object({
  title: z.string().min(2, "Promotion title is required").max(200),
  body: z.string().min(2, "Promotion body is required").max(2000),
  promoCode: z.string().optional(),
  discountText: z.string().optional(),
  actionUrl: z.string().optional(),
  targetAudience: z
    .enum(["all", "enterprise_vip", "order_customers", "active_devices", "custom_segment"])
    .default("all"),
  channels: z
    .array(z.enum(["push", "email", "sms", "in_app"]))
    .optional()
    .default(["push", "in_app"]),
  scheduleTime: z.string().optional(),
});

export const queryNotificationSchema = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  targetAudience: z.string().optional(),
  unreadOnly: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const updateTriggerSchema = z.object({
  enabled: z.boolean().optional(),
  channels: z.array(z.enum(["push", "email", "sms", "in_app"])).optional(),
  defaultTemplateTitle: z.string().optional(),
  defaultTemplateBody: z.string().optional(),
});
