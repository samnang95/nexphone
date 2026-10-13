import mongoose, { Schema, Document, Model } from "mongoose";

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "paid" | "pending" | "refunded" | "failed";
export type PaymentMethod = "credit_card" | "stripe" | "apple_pay" | "corporate_wire" | "purchase_order";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  variantCapacity?: string;
  variantRam?: string;
  colorName?: string;
  colorHex?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AddressInfo {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderTimelineEntry {
  id: string;
  status: OrderStatus;
  label: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface OrderDocument extends Document {
  id: string;
  orderNumber: string;
  sessionId?: string;
  userId?: string;
  status: OrderStatus;
  customer: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    shippingAddress: AddressInfo;
    billingAddress?: AddressInfo;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  appliedPromo?: {
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null;
  payment: {
    status: PaymentStatus;
    method: PaymentMethod;
    methodLabel: string;
    transactionId?: string;
    clientSecret?: string;
    paidAt?: string;
    amount: number;
    currency: string;
    failureReason?: string;
  };
  shipping: {
    carrier: string;
    service: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
    shippedAt?: string;
    deliveredAt?: string;
  };
  timeline: OrderTimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

const AddressSchema = new Schema(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const OrderItemSchema = new Schema(
  {
    id: { type: String, required: true },
    productId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    variantCapacity: { type: String },
    variantRam: { type: String },
    colorName: { type: String },
    colorHex: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const TimelineSchema = new Schema(
  {
    id: { type: String, required: true },
    status: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: String, required: true },
    actor: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    sessionId: { type: String, index: true },
    userId: { type: String, index: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    customer: {
      id: { type: String },
      name: { type: String, required: true },
      email: { type: String, required: true, index: true },
      phone: { type: String, required: true },
      company: { type: String },
      shippingAddress: { type: AddressSchema, required: true },
      billingAddress: { type: AddressSchema },
    },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    appliedPromo: {
      code: { type: String },
      discountType: { type: String },
      discountValue: { type: Number },
      discountAmount: { type: Number },
    },
    payment: {
      status: {
        type: String,
        enum: ["paid", "pending", "refunded", "failed"],
        default: "pending",
        index: true,
      },
      method: {
        type: String,
        enum: ["credit_card", "stripe", "apple_pay", "corporate_wire", "purchase_order"],
        default: "credit_card",
      },
      methodLabel: { type: String, default: "Encrypted Credit Card" },
      transactionId: { type: String, index: true },
      clientSecret: { type: String },
      paidAt: { type: String },
      amount: { type: Number, required: true },
      currency: { type: String, default: "USD" },
      failureReason: { type: String },
    },
    shipping: {
      carrier: { type: String, default: "NexExpress Armored Courier" },
      service: { type: String, default: "Standard Armored Courier" },
      trackingNumber: { type: String },
      trackingUrl: { type: String },
      estimatedDelivery: { type: String },
      shippedAt: { type: String },
      deliveredAt: { type: String },
    },
    timeline: [TimelineSchema],
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ "payment.transactionId": 1 });

export const Order: Model<OrderDocument> = mongoose.models.Order || mongoose.model<OrderDocument>("Order", OrderSchema);