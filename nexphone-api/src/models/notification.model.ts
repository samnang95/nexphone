import mongoose, { Schema, Document, Model } from "mongoose";

export type NotificationType = "order" | "promotional" | "announcement" | "system" | "custom";
export type NotificationChannel = "push" | "email" | "sms" | "in_app";
export type NotificationTargetAudience =
  | "all"
  | "enterprise_vip"
  | "order_customers"
  | "active_devices"
  | "custom_segment";
export type NotificationStatus = "sent" | "scheduled" | "draft" | "failed";
export type OrderNotificationEvent =
  | "order_created"
  | "order_confirmed"
  | "order_shipped"
  | "out_for_delivery"
  | "order_delivered"
  | "order_cancelled";

export interface NotificationDocument extends Document {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  channels: NotificationChannel[];
  targetAudience: NotificationTargetAudience;
  recipientId?: string;
  recipientEmail?: string;
  status: NotificationStatus;
  isRead: boolean;
  readAt?: string | null;
  readBy?: string[];
  scheduledAt?: string | null;
  sentAt?: string | null;
  recipientCount: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  actionUrl?: string;
  metadata?: {
    orderId?: string;
    productId?: string;
    promoCode?: string;
    trackingNumber?: string;
    badge?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderNotificationTriggerDocument extends Document {
  id: string;
  event: OrderNotificationEvent;
  title: string;
  description: string;
  defaultTemplateTitle: string;
  defaultTemplateBody: string;
  enabled: boolean;
  channels: NotificationChannel[];
  triggersCount: number;
  lastTriggeredAt?: string;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ["order", "promotional", "announcement", "system", "custom"],
      default: "custom",
      index: true,
    },
    channels: [{ type: String, enum: ["push", "email", "sms", "in_app"] }],
    targetAudience: {
      type: String,
      enum: ["all", "enterprise_vip", "order_customers", "active_devices", "custom_segment"],
      default: "all",
      index: true,
    },
    recipientId: { type: String, index: true },
    recipientEmail: { type: String, index: true },
    status: {
      type: String,
      enum: ["sent", "scheduled", "draft", "failed"],
      default: "sent",
      index: true,
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: String, default: null },
    readBy: [{ type: String }],
    scheduledAt: { type: String, default: null },
    sentAt: { type: String, default: null },
    recipientCount: { type: Number, default: 1 },
    deliveryRate: { type: Number, default: 100 },
    openRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 },
    actionUrl: { type: String },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ targetAudience: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: -1 });

const OrderNotificationTriggerSchema = new Schema<OrderNotificationTriggerDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    event: {
      type: String,
      enum: [
        "order_created",
        "order_confirmed",
        "order_shipped",
        "out_for_delivery",
        "order_delivered",
        "order_cancelled",
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    defaultTemplateTitle: { type: String, required: true },
    defaultTemplateBody: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    channels: [{ type: String, enum: ["push", "email", "sms", "in_app"] }],
    triggersCount: { type: Number, default: 0 },
    lastTriggeredAt: { type: String },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const Notification: Model<NotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument>("Notification", NotificationSchema);

export const OrderNotificationTrigger: Model<OrderNotificationTriggerDocument> =
  mongoose.models.OrderNotificationTrigger ||
  mongoose.model<OrderNotificationTriggerDocument>(
    "OrderNotificationTrigger",
    OrderNotificationTriggerSchema
  );
