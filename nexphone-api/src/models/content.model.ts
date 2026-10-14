import mongoose, { Schema, Document, Model } from "mongoose";
import {
  HomepageBannerRecord,
  FeaturedPhoneRecord,
  PromotionalSectionRecord,
  NewArrivalRecord,
  BestSellerRecord,
} from "../data/content.data";

export interface HomepageBannerDocument extends Omit<HomepageBannerRecord, "id">, Document {
  id: string;
}

export interface FeaturedPhoneDocument extends Omit<FeaturedPhoneRecord, "id">, Document {
  id: string;
}

export interface PromotionalSectionDocument extends Omit<PromotionalSectionRecord, "id">, Document {
  id: string;
}

export interface NewArrivalDocument extends Omit<NewArrivalRecord, "id">, Document {
  id: string;
}

export interface BestSellerDocument extends Omit<BestSellerRecord, "id">, Document {
  id: string;
}

// 1. Homepage Banner Schema
const HomepageBannerSchema = new Schema<HomepageBannerDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    badge: { type: String, default: "Featured", trim: true },
    primaryCta: {
      label: { type: String, required: true },
      url: { type: String, required: true },
    },
    secondaryCta: {
      label: { type: String },
      url: { type: String },
    },
    imageUrl: { type: String, default: "" },
    gradientOverlay: { type: String, default: "" },
    alignment: {
      type: String,
      enum: ["left", "center", "right"],
      default: "left",
    },
    displayOrder: { type: Number, default: 1, index: true },
    status: {
      type: String,
      enum: ["active", "scheduled", "draft", "hidden"],
      default: "active",
      index: true,
    },
    startDate: { type: String, default: () => new Date().toISOString() },
    endDate: { type: String, default: null },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    ctr: { type: Number, default: 0.0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// 2. Featured Phone Schema
const FeaturedPhoneSchema = new Schema<FeaturedPhoneDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    productId: { type: String, default: "" },
    productName: { type: String, required: true, trim: true },
    productSubtitle: { type: String, default: "", trim: true },
    productPrice: { type: Number, required: true, min: 0 },
    productImage: { type: String, default: "" },
    series: { type: String, default: "Pro Series" },
    badge: { type: String, default: "", trim: true },
    headline: { type: String, default: "", trim: true },
    displayOrder: { type: Number, default: 1, index: true },
    status: {
      type: String,
      enum: ["active", "hidden"],
      default: "active",
      index: true,
    },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    highlightSpecs: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// 3. Promotional Section Schema
const PromotionalSectionSchema = new Schema<PromotionalSectionDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    sectionKey: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    type: {
      type: String,
      enum: ["split_banner", "feature_grid", "countdown_bar", "trust_badges", "callout_card"],
      default: "split_banner",
    },
    ctaLabel: { type: String, default: "Learn More" },
    ctaUrl: { type: String, default: "/products" },
    imageUrl: { type: String, default: "" },
    accentColor: {
      type: String,
      enum: ["indigo", "cyan", "emerald", "amber", "rose", "purple"],
      default: "indigo",
    },
    displayOrder: { type: Number, default: 1, index: true },
    status: {
      type: String,
      enum: ["active", "hidden"],
      default: "active",
      index: true,
    },
    features: [
      {
        icon: { type: String, default: "" },
        title: { type: String, default: "" },
        desc: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// 4. New Arrival Schema
const NewArrivalSchema = new Schema<NewArrivalDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    productId: { type: String, default: "" },
    productName: { type: String, required: true, trim: true },
    productSubtitle: { type: String, default: "", trim: true },
    productPrice: { type: Number, required: true, min: 0 },
    productImage: { type: String, default: "" },
    series: { type: String, default: "Pro Series" },
    releaseDate: { type: String, default: () => new Date().toISOString() },
    tag: { type: String, default: "Just Dropped", trim: true },
    isPreOrder: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 1, index: true },
    status: {
      type: String,
      enum: ["active", "hidden"],
      default: "active",
      index: true,
    },
    initialStock: { type: Number, default: 500 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// 5. Best Seller Schema
const BestSellerSchema = new Schema<BestSellerDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    productId: { type: String, default: "" },
    productName: { type: String, required: true, trim: true },
    productSubtitle: { type: String, default: "", trim: true },
    productPrice: { type: Number, required: true, min: 0 },
    productImage: { type: String, default: "" },
    series: { type: String, default: "Pro Series" },
    rank: { type: Number, default: 1, index: true },
    unitsSold: { type: Number, default: 1000 },
    badge: { type: String, default: "Top Seller", trim: true },
    satisfactionRate: { type: Number, default: 98.5 },
    monthlyGrowth: { type: Number, default: 12.0 },
    status: {
      type: String,
      enum: ["active", "hidden"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

export const HomepageBanner: Model<HomepageBannerDocument> =
  mongoose.models.HomepageBanner || mongoose.model<HomepageBannerDocument>("HomepageBanner", HomepageBannerSchema);

export const FeaturedPhone: Model<FeaturedPhoneDocument> =
  mongoose.models.FeaturedPhone || mongoose.model<FeaturedPhoneDocument>("FeaturedPhone", FeaturedPhoneSchema);

export const PromotionalSection: Model<PromotionalSectionDocument> =
  mongoose.models.PromotionalSection || mongoose.model<PromotionalSectionDocument>("PromotionalSection", PromotionalSectionSchema);

export const NewArrival: Model<NewArrivalDocument> =
  mongoose.models.NewArrival || mongoose.model<NewArrivalDocument>("NewArrival", NewArrivalSchema);

export const BestSeller: Model<BestSellerDocument> =
  mongoose.models.BestSeller || mongoose.model<BestSellerDocument>("BestSeller", BestSellerSchema);
