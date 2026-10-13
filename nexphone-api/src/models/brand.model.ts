import mongoose, { Schema, Document, Model } from "mongoose";

export type BrandStatus = "active" | "inactive" | "pending";
export type BrandTier = "Flagship" | "Enterprise" | "OEM Partner" | "Strategic";
export type BrandLogoIcon = "shield" | "sparkles" | "cpu" | "globe" | "zap" | "gem" | "layers";

export interface BrandDocument extends Document {
  id: string;
  name: string;
  slug: string;
  code: string;
  logoUrl?: string;
  logoIcon?: BrandLogoIcon;
  accentColor: string;
  description: string;
  country: string;
  headquarters: string;
  foundedYear: number;
  website: string;
  supportEmail: string;
  status: BrandStatus;
  tier: BrandTier;
  isFeatured: boolean;
  deviceCount: number;
  marketShare: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<BrandDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    code: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    logoUrl: { type: String },
    logoIcon: {
      type: String,
      enum: ["shield", "sparkles", "cpu", "globe", "zap", "gem", "layers"],
      default: "sparkles",
    },
    accentColor: { type: String, default: "#6366f1" },
    description: { type: String, default: "", trim: true },
    country: { type: String, default: "United States", index: true },
    headquarters: { type: String, default: "" },
    foundedYear: { type: Number, default: 2024 },
    website: { type: String, default: "" },
    supportEmail: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
      index: true,
    },
    tier: {
      type: String,
      enum: ["Flagship", "Enterprise", "OEM Partner", "Strategic"],
      default: "Strategic",
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    deviceCount: { type: Number, default: 0, min: 0 },
    marketShare: { type: String, default: "0.0%" },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

BrandSchema.index({
  name: "text",
  code: "text",
  country: "text",
  description: "text",
});

export const Brand: Model<BrandDocument> = mongoose.models.Brand || mongoose.model<BrandDocument>("Brand", BrandSchema);