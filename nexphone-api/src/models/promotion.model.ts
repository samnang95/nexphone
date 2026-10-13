import mongoose, { Schema, Document, Model } from "mongoose";

export type PromotionType = "promo_code" | "sale_campaign" | "automatic";
export type DiscountType = "percentage" | "fixed_amount" | "free_shipping" | "buy_x_get_y";
export type PromotionScope = "all_products" | "specific_products" | "specific_brands" | "min_order_value";
export type PromotionStatus = "active" | "scheduled" | "expired" | "disabled";
export type BannerColor = "indigo" | "rose" | "amber" | "emerald" | "purple" | "cyan";

export interface PromotionDocument extends Document {
  id: string;
  code?: string;
  title: string;
  description: string;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  scope: PromotionScope;
  targetItems: string[];
  status: PromotionStatus;
  startDate: string;
  endDate: string | null;
  usageLimit?: number | null;
  usedCount: number;
  customerLimit?: number;
  campaignTag?: string;
  bannerColor?: BannerColor;
  revenueGenerated: number;
  ordersCount: number;
  createdAt: string;
  updatedAt: string;
}

const PromotionSchema = new Schema<PromotionDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, uppercase: true, trim: true, index: true, sparse: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    type: {
      type: String,
      enum: ["promo_code", "sale_campaign", "automatic"],
      default: "promo_code",
      index: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed_amount", "free_shipping", "buy_x_get_y"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    scope: {
      type: String,
      enum: ["all_products", "specific_products", "specific_brands", "min_order_value"],
      default: "all_products",
    },
    targetItems: [{ type: String }],
    status: {
      type: String,
      enum: ["active", "scheduled", "expired", "disabled"],
      default: "active",
      index: true,
    },
    startDate: { type: String, required: true },
    endDate: { type: String, default: null },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    customerLimit: { type: Number, default: 1 },
    campaignTag: { type: String, default: "Promo Code" },
    bannerColor: {
      type: String,
      enum: ["indigo", "rose", "amber", "emerald", "purple", "cyan"],
      default: "indigo",
    },
    revenueGenerated: { type: Number, default: 0 },
    ordersCount: { type: Number, default: 0 },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Helpful compound indexes
PromotionSchema.index({ status: 1, type: 1 });
PromotionSchema.index({ code: 1, status: 1 });

export const Promotion: Model<PromotionDocument> = mongoose.models.Promotion || mongoose.model<PromotionDocument>("Promotion", PromotionSchema);
