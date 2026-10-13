import mongoose, { Schema, Document, Model } from "mongoose";

export interface CartItemColor {
  id: string;
  name: string;
  hex: string;
  imageUrl?: string;
  inStock?: boolean;
}

export interface CartItemStorage {
  id: string;
  capacity: string;
  ram: string;
  sku: string;
  price?: number;
  stock?: number;
}

export interface CartItemRecord {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  series: string;
  color: CartItemColor;
  storage: CartItemStorage;
  unitPrice: number;
  quantity: number;
}

export interface AppliedPromoRecord {
  code: string;
  type: "percentage" | "fixed" | "shipping";
  amount: number;
  label: string;
}

export interface CartDocument extends Document {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItemRecord[];
  appliedPromo?: AppliedPromoRecord | null;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemColorSchema = new Schema<CartItemColor>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    hex: { type: String, required: true },
    imageUrl: { type: String },
    inStock: { type: Boolean, default: true },
  },
  { _id: false }
);

const CartItemStorageSchema = new Schema<CartItemStorage>(
  {
    id: { type: String, required: true },
    capacity: { type: String, required: true },
    ram: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number },
    stock: { type: Number },
  },
  { _id: false }
);

const CartItemSchema = new Schema<CartItemRecord>(
  {
    id: { type: String, required: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productSlug: { type: String, required: true },
    productImage: { type: String, default: "" },
    series: { type: String, default: "" },
    color: { type: CartItemColorSchema, required: true },
    storage: { type: CartItemStorageSchema, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const AppliedPromoSchema = new Schema<AppliedPromoRecord>(
  {
    code: { type: String, required: true },
    type: { type: String, enum: ["percentage", "fixed", "shipping"], required: true },
    amount: { type: Number, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

const CartSchema = new Schema<CartDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, sparse: true, index: true },
    sessionId: { type: String, sparse: true, index: true },
    items: { type: [CartItemSchema], default: [] },
    appliedPromo: { type: AppliedPromoSchema, default: null },
  },
  {
    timestamps: true,
  }
);

export const Cart: Model<CartDocument> = mongoose.models.Cart || mongoose.model<CartDocument>("Cart", CartSchema);