import type {
  AdminNotification,
  OrderNotificationTrigger,
  NotificationSummaryMetrics,
  SendNotificationPayload,
  UpdateTriggerPayload,
} from "@/types/notification";
import { appConfig } from "@/config/env";

const notifNow = Date.now();
const NOTIF_DAY = 1000 * 60 * 60 * 24;

const FALLBACK_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "notif-anc-001",
    title: "🚀 Unveiling NexPhone Fold Ultra",
    body: "Dual-OLED aerospace hinge, 120Hz micro-bezel displays, and uninterrupted direct-to-satellite voice mesh. Pre-orders are now officially open.",
    type: "announcement",
    channels: ["push", "email", "sms", "in_app"],
    targetAudience: "all",
    status: "sent",
    scheduledAt: null,
    sentAt: new Date(notifNow - 1 * NOTIF_DAY).toISOString(),
    recipientCount: 29800,
    deliveryRate: 99.6,
    openRate: 54.1,
    clickRate: 23.8,
    actionUrl: "/products/p4",
    metadata: { productId: "p4", badge: "New Flagship Drop" },
    createdAt: new Date(notifNow - 2 * NOTIF_DAY).toISOString(),
    updatedAt: new Date(notifNow - 1 * NOTIF_DAY).toISOString(),
  },
  {
    id: "notif-ord-001",
    title: "📦 Order #NX-ORD-9042 Shipped",
    body: "Your NexPhone 15 Pro Max package has been dispatched via DHL Express (Airway Bill: TRK-1209-7712). Estimated delivery in 2 business days.",
    type: "order",
    channels: ["push", "email", "sms"],
    targetAudience: "order_customers",
    status: "sent",
    scheduledAt: null,
    sentAt: new Date(notifNow - 2 * NOTIF_DAY).toISOString(),
    recipientCount: 1,
    deliveryRate: 100,
    openRate: 85.0,
    clickRate: 62.5,
    actionUrl: "/orders/NX-ORD-9042",
    metadata: { orderId: "NX-ORD-9042", trackingNumber: "TRK-1209-7712" },
    createdAt: new Date(notifNow - 2 * NOTIF_DAY).toISOString(),
    updatedAt: new Date(notifNow - 2 * NOTIF_DAY).toISOString(),
  },
  {
    id: "notif-prm-001",
    title: "⚡ Flash Sale: 20% Off Flagships",
    body: "Exclusive 48-hour access for verified accounts! Use coupon code FLASH20 at checkout for instant savings across the 15 Pro Max series.",
    type: "promotional",
    channels: ["push", "email", "in_app"],
    targetAudience: "all",
    status: "sent",
    scheduledAt: null,
    sentAt: new Date(notifNow - 3 * NOTIF_DAY).toISOString(),
    recipientCount: 18450,
    deliveryRate: 99.2,
    openRate: 37.8,
    clickRate: 14.6,
    actionUrl: "/promotions",
    metadata: { promoCode: "FLASH20", badge: "20% OFF" },
    createdAt: new Date(notifNow - 4 * NOTIF_DAY).toISOString(),
    updatedAt: new Date(notifNow - 3 * NOTIF_DAY).toISOString(),
  },
  {
    id: "notif-ord-002",
    title: "✅ Order Confirmed: #NX-ORD-9041",
    body: "Thank you for your order! 5x NexPhone 15 Enterprise Edge devices are being prepared for automated zero-touch provisioning.",
    type: "order",
    channels: ["push", "email"],
    targetAudience: "order_customers",
    status: "sent",
    scheduledAt: null,
    sentAt: new Date(notifNow - 5 * NOTIF_DAY).toISOString(),
    recipientCount: 1,
    deliveryRate: 100,
    openRate: 91.2,
    clickRate: 40.0,
    actionUrl: "/orders/NX-ORD-9041",
    metadata: { orderId: "NX-ORD-9041" },
    createdAt: new Date(notifNow - 5 * NOTIF_DAY).toISOString(),
    updatedAt: new Date(notifNow - 5 * NOTIF_DAY).toISOString(),
  },
  {
    id: "notif-prm-002",
    title: "💼 Trade-In Boost: Up to $800 Fleet Credit",
    body: "Upgrade your corporate devices before quarter-end and receive boosted valuation credits on all eligible legacy handsets.",
    type: "promotional",
    channels: ["email", "in_app"],
    targetAudience: "enterprise_vip",
    status: "sent",
    scheduledAt: null,
    sentAt: new Date(notifNow - 6 * NOTIF_DAY).toISOString(),
    recipientCount: 2400,
    deliveryRate: 98.9,
    openRate: 46.2,
    clickRate: 18.5,
    actionUrl: "/promotions",
    metadata: { badge: "Enterprise Incentive" },
    createdAt: new Date(notifNow - 7 * NOTIF_DAY).toISOString(),
    updatedAt: new Date(notifNow - 6 * NOTIF_DAY).toISOString(),
  },
  {
    id: "notif-anc-002",
    title: "📸 NexPhone 15 Studio: Now In Stock",
    body: "Designed for content creators and field engineers with ProRes 4K HDR recording and ultra-low noise audio arrays.",
    type: "announcement",
    channels: ["push", "in_app"],
    targetAudience: "all",
    status: "sent",
    scheduledAt: null,
    sentAt: new Date(notifNow - 8 * NOTIF_DAY).toISOString(),
    recipientCount: 14200,
    deliveryRate: 99.1,
    openRate: 41.5,
    clickRate: 16.2,
    actionUrl: "/products/p3",
    metadata: { productId: "p3", badge: "In Stock" },
    createdAt: new Date(notifNow - 9 * NOTIF_DAY).toISOString(),
    updatedAt: new Date(notifNow - 8 * NOTIF_DAY).toISOString(),
  },
  {
    id: "notif-prm-003",
    title: "🛰 Complimentary Satellite VoIP 1-Year Trial",
    body: "Receive 1 full year of complimentary Global Satellite VoIP connectivity with any fleet order over 10 units.",
    type: "promotional",
    channels: ["push", "email"],
    targetAudience: "enterprise_vip",
    status: "scheduled",
    scheduledAt: new Date(notifNow + 3 * NOTIF_DAY).toISOString(),
    sentAt: null,
    recipientCount: 3100,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    actionUrl: "/promotions",
    metadata: { badge: "Satellite Bundle" },
    createdAt: new Date(notifNow - 1 * NOTIF_DAY).toISOString(),
    updatedAt: new Date(notifNow).toISOString(),
  },
  {
    id: "notif-ord-003",
    title: "📬 Shipment Delivered: #NX-ORD-9040",
    body: "Your shipment has been securely delivered to your enterprise receiving dock. Digital warranty care is now active.",
    type: "order",
    channels: ["push", "in_app"],
    targetAudience: "order_customers",
    status: "sent",
    scheduledAt: null,
    sentAt: new Date(notifNow - 9 * NOTIF_DAY).toISOString(),
    recipientCount: 1,
    deliveryRate: 100,
    openRate: 88.0,
    clickRate: 25.0,
    actionUrl: "/orders/NX-ORD-9040",
    metadata: { orderId: "NX-ORD-9040" },
    createdAt: new Date(notifNow - 9 * NOTIF_DAY).toISOString(),
    updatedAt: new Date(notifNow - 9 * NOTIF_DAY).toISOString(),
  },
];

const FALLBACK_TRIGGERS: OrderNotificationTrigger[] = [
  {
    id: "trig-001",
    event: "order_created",
    title: "Order Placed & Awaiting Payment",
    description: "Dispatched immediately upon checkout completion.",
    defaultTemplateTitle: "Order Confirmed: #{order_id}",
    defaultTemplateBody: "Hi {customer_name}, we received your order of {item_count} items. We are processing your hardware reservation.",
    enabled: true,
    channels: ["email", "in_app"],
    triggersCount: 1248,
    lastTriggeredAt: new Date(notifNow - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "trig-002",
    event: "order_confirmed",
    title: "Payment & Order Verified",
    description: "Triggered once payment gateway acknowledges charge.",
    defaultTemplateTitle: "Payment Verified for #{order_id}",
    defaultTemplateBody: "Your payment of {amount} has cleared. Your units have been queued for automated staging.",
    enabled: true,
    channels: ["email", "push"],
    triggersCount: 1190,
    lastTriggeredAt: new Date(notifNow - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "trig-003",
    event: "order_shipped",
    title: "Dispatched with Carrier Tracking",
    description: "Sent as soon as warehouse scans airway bill.",
    defaultTemplateTitle: "Your NexPhone Order is On The Way! ({tracking_number})",
    defaultTemplateBody: "Shipment dispatched via {carrier}. Track your live delivery: {tracking_url}",
    enabled: true,
    channels: ["push", "email", "sms"],
    triggersCount: 942,
    lastTriggeredAt: new Date(notifNow - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "trig-004",
    event: "out_for_delivery",
    title: "Out for Final Mile Delivery",
    description: "Local driver has loaded parcel into delivery vehicle.",
    defaultTemplateTitle: "Out for Delivery Today: #{order_id}",
    defaultTemplateBody: "Your courier will deliver your package today before 6:00 PM. Signature required.",
    enabled: true,
    channels: ["push", "sms"],
    triggersCount: 885,
    lastTriggeredAt: new Date(notifNow - 1000 * 60 * 180).toISOString(),
  },
  {
    id: "trig-005",
    event: "order_delivered",
    title: "Shipment Delivered",
    description: "Courier confirms successful drop-off at destination.",
    defaultTemplateTitle: "Delivered: Order #{order_id}",
    defaultTemplateBody: "Your NexPhone package has been delivered. Welcome to the NexPhone ecosystem!",
    enabled: true,
    channels: ["push", "in_app", "email"],
    triggersCount: 852,
    lastTriggeredAt: new Date(notifNow - 1000 * 60 * 240).toISOString(),
  },
  {
    id: "trig-006",
    event: "order_cancelled",
    title: "Order Cancelled or Refunded",
    description: "Sent when an order is cancelled or refunded.",
    defaultTemplateTitle: "Refund Notice: Order #{order_id}",
    defaultTemplateBody: "Your cancellation request has been executed and a full refund of {amount} has been initiated.",
    enabled: false,
    channels: ["email"],
    triggersCount: 41,
    lastTriggeredAt: new Date(notifNow - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
];

const localNotifications = [...FALLBACK_NOTIFICATIONS];
const localTriggers = [...FALLBACK_TRIGGERS];

export const NotificationService = {
  async getNotifications(filters?: {
    type?: string;
    status?: string;
    search?: string;
  }): Promise<AdminNotification[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type && filters.type !== "all") params.append("type", filters.type);
      if (filters?.status && filters.status !== "all") params.append("status", filters.status);
      if (filters?.search) params.append("search", filters.search);

      const qs = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`${appConfig.apiUrl}/api/notifications${qs}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      let filtered = [...localNotifications];
      if (filters?.type && filters.type !== "all") {
        filtered = filtered.filter((n) => n.type === filters.type);
      }
      if (filters?.status && filters.status !== "all") {
        filtered = filtered.filter((n) => n.status === filters.status);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.body.toLowerCase().includes(q) ||
            (n.metadata?.orderId && n.metadata.orderId.toLowerCase().includes(q))
        );
      }
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  async sendNotification(payload: SendNotificationPayload): Promise<AdminNotification> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const created = await res.json();
      localNotifications.unshift(created);
      return created;
    } catch {
      const now = new Date().toISOString();
      const isScheduled = Boolean(payload.scheduleTime);
      let recipientCount = 1;
      if (payload.targetAudience === "all") recipientCount = 28400;
      else if (payload.targetAudience === "enterprise_vip") recipientCount = 3200;
      else if (payload.targetAudience === "order_customers") recipientCount = 4850;
      else if (payload.targetAudience === "active_devices") recipientCount = 12600;
      else recipientCount = 850;

      const newRecord: AdminNotification = {
        id: `notif-${Date.now().toString(36)}`,
        title: payload.title.trim(),
        body: payload.body.trim(),
        type: payload.type,
        channels: payload.channels,
        targetAudience: payload.targetAudience,
        status: isScheduled ? "scheduled" : "sent",
        scheduledAt: isScheduled && payload.scheduleTime ? new Date(payload.scheduleTime).toISOString() : null,
        sentAt: isScheduled ? null : now,
        recipientCount,
        deliveryRate: isScheduled ? 0 : 99.4,
        openRate: isScheduled ? 0 : Number((35 + Math.random() * 20).toFixed(1)),
        clickRate: isScheduled ? 0 : Number((10 + Math.random() * 15).toFixed(1)),
        actionUrl: payload.actionUrl,
        metadata: payload.metadata,
        createdAt: now,
        updatedAt: now,
      };
      localNotifications.unshift(newRecord);
      return newRecord;
    }
  },

  async updateNotification(id: string, updates: Partial<SendNotificationPayload>): Promise<AdminNotification> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/notifications/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const updated = await res.json();
      const idx = localNotifications.findIndex((n) => n.id === id);
      if (idx !== -1) localNotifications[idx] = updated;
      return updated;
    } catch {
      const idx = localNotifications.findIndex((n) => n.id === id);
      if (idx === -1) throw new Error("Notification not found");
      const current = localNotifications[idx]!;
      const updated: AdminNotification = {
        ...current,
        title: updates.title !== undefined ? updates.title.trim() : current.title,
        body: updates.body !== undefined ? updates.body.trim() : current.body,
        channels: updates.channels || current.channels,
        targetAudience: updates.targetAudience || current.targetAudience,
        actionUrl: updates.actionUrl !== undefined ? updates.actionUrl : current.actionUrl,
        metadata: updates.metadata !== undefined ? updates.metadata : current.metadata,
        scheduledAt: updates.scheduleTime !== undefined ? (updates.scheduleTime ? new Date(updates.scheduleTime).toISOString() : null) : current.scheduledAt,
        updatedAt: new Date().toISOString(),
      };
      localNotifications[idx] = updated;
      return updated;
    }
  },

  async deleteNotification(id: string): Promise<AdminNotification> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/notifications/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const idx = localNotifications.findIndex((n) => n.id === id);
      if (idx !== -1) localNotifications.splice(idx, 1);
      return data.item;
    } catch {
      const idx = localNotifications.findIndex((n) => n.id === id);
      if (idx === -1) throw new Error("Notification not found");
      const [deleted] = localNotifications.splice(idx, 1);
      return deleted!;
    }
  },

  async resendNotification(id: string): Promise<AdminNotification> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/notifications/${encodeURIComponent(id)}/resend`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const created = await res.json();
      localNotifications.unshift(created);
      return created;
    } catch {
      const found = localNotifications.find((n) => n.id === id);
      if (!found) throw new Error("Notification not found");
      const now = new Date().toISOString();
      const resentRecord: AdminNotification = {
        ...found,
        id: `notif-${Date.now().toString(36)}`,
        status: "sent",
        sentAt: now,
        scheduledAt: null,
        deliveryRate: 99.5,
        openRate: Number((35 + Math.random() * 20).toFixed(1)),
        clickRate: Number((10 + Math.random() * 15).toFixed(1)),
        createdAt: now,
        updatedAt: now,
      };
      localNotifications.unshift(resentRecord);
      return resentRecord;
    }
  },

  async getTriggers(): Promise<OrderNotificationTrigger[]> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/notifications/triggers`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      return [...localTriggers];
    }
  },

  async updateTrigger(id: string, updates: UpdateTriggerPayload): Promise<OrderNotificationTrigger> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/notifications/triggers/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const updated = await res.json();
      const idx = localTriggers.findIndex((t) => t.id === id);
      if (idx !== -1) localTriggers[idx] = updated;
      return updated;
    } catch {
      const idx = localTriggers.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error("Trigger not found");
      const current = localTriggers[idx]!;
      const updated: OrderNotificationTrigger = {
        ...current,
        enabled: updates.enabled !== undefined ? updates.enabled : current.enabled,
        channels: updates.channels || current.channels,
        defaultTemplateTitle: updates.defaultTemplateTitle || current.defaultTemplateTitle,
        defaultTemplateBody: updates.defaultTemplateBody || current.defaultTemplateBody,
      };
      localTriggers[idx] = updated;
      return updated;
    }
  },

  async getMetrics(): Promise<NotificationSummaryMetrics> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/notifications/metrics`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      const sentNotifications = localNotifications.filter((n) => n.status === "sent");
      const totalSent = sentNotifications.length;

      const avgDeliveryRate =
        totalSent > 0
          ? Number((sentNotifications.reduce((acc, n) => acc + (n.deliveryRate || 0), 0) / totalSent).toFixed(1))
          : 99.4;

      const avgOpenRate =
        totalSent > 0
          ? Number((sentNotifications.reduce((acc, n) => acc + (n.openRate || 0), 0) / totalSent).toFixed(1))
          : 42.5;

      const avgClickRate =
        totalSent > 0
          ? Number((sentNotifications.reduce((acc, n) => acc + (n.clickRate || 0), 0) / totalSent).toFixed(1))
          : 15.8;

      const totalOrderAlerts = localNotifications.filter((n) => n.type === "order").length;
      const totalPromotionalSent = localNotifications.filter((n) => n.type === "promotional").length;
      const totalAnnouncementsSent = localNotifications.filter((n) => n.type === "announcement").length;
      const activeAutomationsCount = localTriggers.filter((t) => t.enabled).length;

      return {
        totalSent,
        avgDeliveryRate,
        avgOpenRate,
        avgClickRate,
        totalOrderAlerts,
        totalPromotionalSent,
        totalAnnouncementsSent,
        activeAutomationsCount,
      };
    }
  },
};
