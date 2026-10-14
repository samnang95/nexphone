import mongoose, { Schema, Document, Model } from "mongoose";

export type MediaAssetType =
  | "product_image"
  | "brand_logo"
  | "homepage_banner"
  | "3d_model"
  | "avatar"
  | "general";

export interface MediaAssetDocument extends Document {
  id: string;
  assetType: MediaAssetType;
  originalFilename: string;
  mimeType: string;
  format: string;
  bytes: number;
  url: string;
  secureUrl: string;
  publicId: string;
  folder: string;
  width?: number;
  height?: number;
  storageProvider: "cloudinary" | "local" | "memory";
  metadata?: Record<string, any>;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAssetSchema = new Schema<MediaAssetDocument>(
  {
    assetType: {
      type: String,
      enum: ["product_image", "brand_logo", "homepage_banner", "3d_model", "avatar", "general"],
      required: true,
      index: true,
    },
    originalFilename: { type: String, required: true },
    mimeType: { type: String, required: true },
    format: { type: String, required: true },
    bytes: { type: Number, required: true },
    url: { type: String, required: true },
    secureUrl: { type: String, required: true },
    publicId: { type: String, required: true, unique: true, index: true },
    folder: { type: String, required: true, index: true },
    width: { type: Number },
    height: { type: Number },
    storageProvider: {
      type: String,
      enum: ["cloudinary", "local", "memory"],
      default: "local",
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
    uploadedBy: { type: String, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = String(ret._id);
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const MediaAsset: Model<MediaAssetDocument> =
  mongoose.models.MediaAsset || mongoose.model<MediaAssetDocument>("MediaAsset", MediaAssetSchema);
