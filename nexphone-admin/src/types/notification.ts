export type NotificationType =
  | "order"
  | "promotional"
  | "announcement"
  | "system"
  | "custom";

export type NotificationChannel = "push" | "email" | "sms" | "in_app";

export type NotificationAudience =
  | "all"
  | "enterprise_vip"
  | "order_customers"
  | "active_devices"
  | "custom_segment";

export type NotificationStatus = "sent" | "scheduled" | "draft" | "failed";

export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  channels: NotificationChannel[];
  targetAudience: NotificationAudience;
  status: NotificationStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  deliveryRate: number; // e.g. 99.4
  openRate: number; // e.g. 42.8
  clickRate: number; // e.g. 15.3
  actionUrl?: string;
  metadata?: {
    orderId?: string;
    productId?: string;
    promoCode?: string;
    trackingNumber?: string;
    badge?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type OrderTriggerEvent =
  | "order_created"
  | "order_confirmed"
  | "order_shipped"
  | "out_for_delivery"
  | "order_delivered"
  | "order_cancelled";

export interface OrderNotificationTrigger {
  id: string;
  event: OrderTriggerEvent;
  title: string;
  description: string;
  defaultTemplateTitle: string;
  defaultTemplateBody: string;
  enabled: boolean;
  channels: NotificationChannel[];
  triggersCount: number;
  lastTriggeredAt?: string;
}

export interface NotificationSummaryMetrics {
  totalSent: number;
  avgDeliveryRate: number;
  avgOpenRate: number;
  avgClickRate: number;
  totalOrderAlerts: number;
  totalPromotionalSent: number;
  totalAnnouncementsSent: number;
  activeAutomationsCount: number;
}

export interface SendNotificationPayload {
  title: string;
  body: string;
  type: NotificationType;
  channels: NotificationChannel[];
  targetAudience: NotificationAudience;
  actionUrl?: string;
  scheduleTime?: string | null; // ISO string if scheduled, null if immediate
  metadata?: {
    orderId?: string;
    productId?: string;
    promoCode?: string;
    trackingNumber?: string;
    badge?: string;
  };
}

export interface UpdateTriggerPayload {
  enabled?: boolean;
  channels?: NotificationChannel[];
  defaultTemplateTitle?: string;
  defaultTemplateBody?: string;
}

export type NotificationTab =
  | "overview"
  | "all"
  | "order"
  | "promotional"
  | "announcements"
  | "triggers"
  | "preview";
