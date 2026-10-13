import mongoose, { Schema, Document, Model } from "mongoose";

export type ReviewStatus = "published" | "pending" | "flagged" | "rejected";
export type ModerationAction = "approved" | "dismissed_flag" | "rejected" | "deleted";

export interface ReviewReport {
  id: string;
  reporterId?: string;
  reporterName: string;
  reporterEmail?: string;
  reason: string;
  comment?: string;
  reportedAt: string;
}

export interface ReviewModerationEntry {
  moderatedBy: string;
  moderatedAt: string;
  action: ModerationAction;
  reason?: string;
  note?: string;
}

export interface ReviewDocument extends Document {
  id: string;
  reviewNumber: string;
  productId: string;
  productName: string;
  productSku?: string;
  productBrand?: string;
  productImage?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatarUrl?: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  unhelpfulVotes: number;
  status: ReviewStatus;
  isReported: boolean;
  reportsCount: number;
  reports?: ReviewReport[];
  moderationHistory?: ReviewModerationEntry[];
  createdAt: string;
  updatedAt: string;
}

const ReviewReportSchema = new Schema<ReviewReport>(
  {
    id: { type: String, required: true },
    reporterId: { type: String },
    reporterName: { type: String, required: true },
    reporterEmail: { type: String },
    reason: { type: String, required: true },
    comment: { type: String },
    reportedAt: { type: String, required: true },
  },
  { _id: false }
);

const ReviewModerationEntrySchema = new Schema<ReviewModerationEntry>(
  {
    moderatedBy: { type: String, required: true },
    moderatedAt: { type: String, required: true },
    action: {
      type: String,
      enum: ["approved", "dismissed_flag", "rejected", "deleted"],
      required: true,
    },
    reason: { type: String },
    note: { type: String },
  },
  { _id: false }
);

const ReviewSchema = new Schema<ReviewDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    reviewNumber: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    productSku: { type: String },
    productBrand: { type: String },
    productImage: { type: String },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerAvatarUrl: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5, index: true },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    isVerifiedPurchase: { type: Boolean, default: false },
    helpfulVotes: { type: Number, default: 0 },
    unhelpfulVotes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["published", "pending", "flagged", "rejected"],
      default: "published",
      index: true,
    },
    isReported: { type: Boolean, default: false, index: true },
    reportsCount: { type: Number, default: 0 },
    reports: [ReviewReportSchema],
    moderationHistory: [ReviewModerationEntrySchema],
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

ReviewSchema.index({ productId: 1, status: 1 });
ReviewSchema.index({ createdAt: -1 });

export const Review: Model<ReviewDocument> = mongoose.models.Review || mongoose.model<ReviewDocument>("Review", ReviewSchema);
