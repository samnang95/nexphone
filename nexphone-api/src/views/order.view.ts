import type { OrderStatus, PaymentStatus } from "../models/order.model";

export interface OrderSummaryView {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  itemsCount: number;
  subtotal: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  carrier?: string;
  trackingNumber?: string;
  customerName: string;
  customerEmail: string;
}

export interface OrderTrackingView {
  orderNumber: string;
  status: OrderStatus;
  carrier: string;
  service: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  currentStage: string;
  timeline: Array<{
    id: string;
    status: string;
    label: string;
    description: string;
    timestamp: string;
    actor: string;
  }>;
}

export function serializeOrderSummary(order: any): OrderSummaryView {
  const o = typeof order?.toObject === "function" ? order.toObject() : order;
  const items = Array.isArray(o.items) ? o.items : [];
  const itemsCount = items.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 0), 0);

  return {
    id: o.id || o.orderNumber,
    orderNumber: o.orderNumber,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    status: o.status,
    itemsCount,
    subtotal: Number(o.subtotal) || 0,
    totalAmount: Number(o.totalAmount) || Number(o.total) || 0,
    paymentStatus: o.payment?.status || "pending",
    paymentMethod: o.payment?.methodLabel || o.payment?.method || "Credit Card",
    carrier: o.shipping?.carrier,
    trackingNumber: o.shipping?.trackingNumber,
    customerName: o.customer?.name || "Customer",
    customerEmail: o.customer?.email || "",
  };
}

export function serializeOrderDetails(order: any): any {
  const o = typeof order?.toObject === "function" ? order.toObject() : order;
  return {
    id: o.id || o.orderNumber,
    orderNumber: o.orderNumber,
    sessionId: o.sessionId,
    userId: o.userId,
    status: o.status,
    cancelReason: o.cancelReason,
    customer: o.customer,
    items: Array.isArray(o.items) ? o.items : [],
    subtotal: Number(o.subtotal) || 0,
    tax: Number(o.tax) || 0,
    shippingFee: Number(o.shippingFee) || 0,
    discount: Number(o.discount) || 0,
    totalAmount: Number(o.totalAmount) || Number(o.total) || 0,
    appliedPromo: o.appliedPromo || null,
    payment: o.payment || {},
    shipping: o.shipping || {},
    timeline: Array.isArray(o.timeline) ? o.timeline : [],
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

export function serializeOrderTracking(order: any): OrderTrackingView {
  const o = typeof order?.toObject === "function" ? order.toObject() : order;

  const stageMap: Record<string, string> = {
    pending: "Order Placed & Awaiting Allocation",
    confirmed: "Order Confirmed & Inventory Allocated",
    processing: "Hardware Verification & Secure Packaging",
    shipped: "Dispatched with Armored Courier Transport",
    delivered: "Handed Over & Verified by Consignee",
    cancelled: "Order Cancelled",
  };

  return {
    orderNumber: o.orderNumber,
    status: o.status,
    carrier: o.shipping?.carrier || "NexExpress Armored Courier",
    service: o.shipping?.service || "Standard Armored Courier",
    trackingNumber: o.shipping?.trackingNumber,
    trackingUrl: o.shipping?.trackingUrl || (o.shipping?.trackingNumber ? `https://nexphone.io/track/${o.shipping.trackingNumber}` : undefined),
    estimatedDelivery: o.shipping?.estimatedDelivery || "2-3 Business Days",
    shippedAt: o.shipping?.shippedAt,
    deliveredAt: o.shipping?.deliveredAt,
    currentStage: stageMap[o.status] || "Processing",
    timeline: Array.isArray(o.timeline) ? o.timeline : [],
  };
}
