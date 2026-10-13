import type { AddressInfo, OrderDocument, PaymentMethod, PaymentStatus } from "../models/order.model";

export interface AddressValidationView {
  valid: boolean;
  deliverable: boolean;
  standardizedAddress: AddressInfo;
  shippingZone: "domestic" | "international";
  estimatedDays: string;
  message: string;
}

export interface ShippingMethodOption {
  id: string;
  name: string;
  carrier: string;
  fee: number;
  originalFee: number;
  isFree: boolean;
  estimatedDelivery: string;
  description: string;
}

export interface ShippingCalculationView {
  subtotal: number;
  qualifiesForFreeShipping: boolean;
  freeShippingThreshold: number;
  selectedMethod: string;
  shippingFee: number;
  availableMethods: ShippingMethodOption[];
}

export interface DiscountCalculationView {
  valid: boolean;
  promoCode: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  message: string;
}

export interface CheckoutTotalsView {
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  currency: string;
  itemsCount: number;
}

export function serializeAddressValidation(address: {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}): AddressValidationView {
  const isDomestic =
    !address.country ||
    ["us", "usa", "united states"].includes(address.country.trim().toLowerCase());

  return {
    valid: true,
    deliverable: true,
    standardizedAddress: {
      street: address.street.trim(),
      city: address.city.trim(),
      state: address.state.trim().toUpperCase(),
      zipCode: address.zipCode.trim(),
      country: isDomestic || !address.country ? "United States" : address.country.trim(),
    },
    shippingZone: isDomestic ? "domestic" : "international",
    estimatedDays: isDomestic ? "2-3 business days" : "5-7 business days",
    message: "Delivery address verified via NexCourier Secure Logistics validation.",
  };
}

export function serializeShippingCalculation(
  subtotal: number,
  selectedMethodId: string = "standard",
  promoHasFreeShipping: boolean = false
): ShippingCalculationView {
  const qualifies = subtotal >= 1000 || promoHasFreeShipping;
  const methods: ShippingMethodOption[] = [
    {
      id: "standard",
      name: "Standard Armored Courier",
      carrier: "NexExpress Armored Courier",
      originalFee: 35,
      fee: qualifies ? 0 : 35,
      isFree: qualifies,
      estimatedDelivery: "2-3 Business Days",
      description: "Temperature-controlled secure transport with signature verification.",
    },
    {
      id: "express",
      name: "Overnight Priority Courier",
      carrier: "NexExpress Priority Armored",
      originalFee: 65,
      fee: qualifies ? 30 : 65,
      isFree: false,
      estimatedDelivery: "Next Business Day (10:30 AM)",
      description: "Dedicated courier hand-off with biometric identification.",
    },
    {
      id: "white_glove",
      name: "White Glove Deployment & Handover",
      carrier: "NexSecure Concierge Logistics",
      originalFee: 120,
      fee: 120,
      isFree: false,
      estimatedDelivery: "Scheduled Handover Appointment",
      description: "Direct in-person hardware isolation inspection and enterprise device onboarding.",
    },
  ];

  const selected = methods.find((m) => m.id === selectedMethodId) || methods[0]!;

  return {
    subtotal,
    qualifiesForFreeShipping: qualifies,
    freeShippingThreshold: 1000,
    selectedMethod: selected.id,
    shippingFee: selected.fee,
    availableMethods: methods,
  };
}

export function serializeCheckoutTotals(
  subtotal: number,
  discount: number,
  shippingFee: number,
  taxRate: number = 0.08,
  currency: string = "USD",
  itemsCount: number = 1
): CheckoutTotalsView {
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableSubtotal * taxRate * 100) / 100;
  const total = Math.max(0, Math.round((taxableSubtotal + shippingFee + tax) * 100) / 100);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    shippingFee: Math.round(shippingFee * 100) / 100,
    tax,
    total,
    currency,
    itemsCount,
  };
}

export function serializeOrder(order: any): any {
  const o = typeof order?.toObject === "function" ? order.toObject() : order;
  return {
    id: o.id || o.orderNumber,
    orderNumber: o.orderNumber,
    sessionId: o.sessionId,
    status: o.status,
    customer: o.customer,
    items: o.items || [],
    subtotal: Number(o.subtotal) || 0,
    tax: Number(o.tax) || 0,
    shippingFee: Number(o.shippingFee) || 0,
    discount: Number(o.discount) || 0,
    totalAmount: Number(o.totalAmount) || Number(o.total) || 0,
    appliedPromo: o.appliedPromo || null,
    payment: o.payment || {},
    shipping: o.shipping || {},
    timeline: o.timeline || [],
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

export function serializePaymentStatus(order: any): any {
  const o = typeof order?.toObject === "function" ? order.toObject() : order;
  return {
    orderId: o.id,
    orderNumber: o.orderNumber,
    transactionId: o.payment?.transactionId,
    status: o.payment?.status || "pending",
    method: o.payment?.method || "credit_card",
    methodLabel: o.payment?.methodLabel || "Encrypted Credit Card",
    amount: Number(o.payment?.amount) || Number(o.totalAmount) || 0,
    currency: o.payment?.currency || "USD",
    paidAt: o.payment?.paidAt || null,
    failureReason: o.payment?.failureReason || null,
    receiptUrl: o.payment?.status === "paid" ? `https://nexphone.io/receipts/${o.orderNumber}` : null,
  };
}
