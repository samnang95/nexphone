import mongoose, { Schema, Document, Model } from "mongoose";

export interface WishlistItemColor {
  id?: string;
  name: string;
  hex: string;
  imageUrl?: string;
}

export interface WishlistItemStorage {
  id?: string;
  capacity: string;
  ram: string;
  sku?: string;
  price?: number;
}

export interface WishlistItemRecord {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  series: string;
  subtitle: string;
  basePrice: number;
  compareAtPrice?: number;
  rating: number;
  inStock: boolean;
  selectedColor?: WishlistItemColor;
  selectedStorage?: WishlistItemStorage;
  addedAt: Date;
}

export interface WishlistDocument extends Document {
  id: string;
  userId?: string;
  sessionId?: string;
  items: WishlistItemRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistItemColorSchema = new Schema<WishlistItemColor>(
  {
    id: { type: String },
    name: { type: String, required: true },
    hex: { type: String, required: true },
    imageUrl: { type: String },
  },
  { _id: false }
);

const WishlistItemStorageSchema = new Schema<WishlistItemStorage>(
  {
    id: { type: String },
    capacity: { type: String, required: true },
    ram: { type: String, required: true },
    sku: { type: String },
    price: { type: Number },
  },
  { _id: false }
);

const WishlistItemSchema = new Schema<WishlistItemRecord>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productSlug: { type: String, default: "" },
    productImage: { type: String, default: "" },
    series: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    basePrice: { type: Number, required: true, default: 0 },
    compareAtPrice: { type: Number },
    rating: { type: Number, default: 5 },
    inStock: { type: Boolean, default: true },
    selectedColor: { type: WishlistItemColorSchema },
    selectedStorage: { type: WishlistItemStorageSchema },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const WishlistSchema = new Schema<WishlistDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, sparse: true, index: true },
    sessionId: { type: String, sparse: true, index: true },
    items: { type: [WishlistItemSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export const Wishlist: Model<WishlistDocument> = mongoose.models.Wishlist || mongoose.model<WishlistDocument>("Wishlist", WishlistSchema);
