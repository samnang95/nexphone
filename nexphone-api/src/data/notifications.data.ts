// ==========================================
// NOTIFICATION MANAGEMENT SYSTEM
// ==========================================

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  type: "order" | "promotional" | "announcement" | "system" | "custom";
  channels: ("push" | "email" | "sms" | "in_app")[];
  targetAudience: "all" | "enterprise_vip" | "order_customers" | "active_devices" | "custom_segment";
  status: "sent" | "scheduled" | "draft" | "failed";
  scheduledAt: string | null;
  sentAt: string | null;
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
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderNotificationTriggerRecord {
  id: string;
  event: "order_created" | "order_confirmed" | "order_shipped" | "out_for_delivery" | "order_delivered" | "order_cancelled";
  title: string;
  description: string;
  defaultTemplateTitle: string;
  defaultTemplateBody: string;
  enabled: boolean;
  channels: ("push" | "email" | "sms" | "in_app")[];
  triggersCount: number;
  lastTriggeredAt?: string;
}

export const notifNow = Date.now();
export const NOTIF_DAY = 1000 * 60 * 60 * 24;

export const notificationsStore: NotificationRecord[] = [
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

export const orderNotificationTriggersStore: OrderNotificationTriggerRecord[] = [
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
