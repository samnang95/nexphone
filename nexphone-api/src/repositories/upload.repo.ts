import { Types } from "mongoose";
import { MediaAsset, type MediaAssetDocument, type MediaAssetType } from "../models/media.model";
import { isDatabaseConnected } from "../config/database";

export interface MediaAssetRecord {
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

// In-memory fallback for standalone/dev/test mode
export const inMemoryAssetsStore: MediaAssetRecord[] = [
  {
    id: "asset-seed-001",
    assetType: "product_image",
    originalFilename: "nexphone-ultra-front.webp",
    mimeType: "image/webp",
    format: "webp",
    bytes: 428000,
    url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1200&q=80",
    secureUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1200&q=80",
    publicId: "nexphone/products/nexphone-ultra-front",
    folder: "nexphone/products",
    width: 1200,
    height: 1600,
    storageProvider: "cloudinary",
    metadata: { productId: "prod-001", isPrimary: true, color: "Obsidian Black" },
    uploadedBy: "admin@nexphone.io",
    createdAt: new Date("2026-01-10T12:00:00Z"),
    updatedAt: new Date("2026-01-10T12:00:00Z"),
  },
  {
    id: "asset-seed-002",
    assetType: "brand_logo",
    originalFilename: "brand-nexphone-logo.svg",
    mimeType: "image/svg+xml",
    format: "svg",
    bytes: 18450,
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    secureUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    publicId: "nexphone/brands/brand-nexphone-logo",
    folder: "nexphone/brands",
    width: 400,
    height: 400,
    storageProvider: "cloudinary",
    metadata: { brandId: "brand-001", theme: "dark" },
    uploadedBy: "admin@nexphone.io",
    createdAt: new Date("2026-01-11T14:30:00Z"),
    updatedAt: new Date("2026-01-11T14:30:00Z"),
  },
  {
    id: "asset-seed-003",
    assetType: "homepage_banner",
    originalFilename: "flagship-event-banner.webp",
    mimeType: "image/webp",
    format: "webp",
    bytes: 840500,
    url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80",
    secureUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80",
    publicId: "nexphone/banners/flagship-event-banner",
    folder: "nexphone/banners",
    width: 1920,
    height: 800,
    storageProvider: "cloudinary",
    metadata: { placement: "hero", deviceTarget: "all", title: "Future of Neural Telephony" },
    uploadedBy: "admin@nexphone.io",
    createdAt: new Date("2026-01-15T09:00:00Z"),
    updatedAt: new Date("2026-01-15T09:00:00Z"),
  },
  {
    id: "asset-seed-004",
    assetType: "3d_model",
    originalFilename: "nexphone-pro-chassis.glb",
    mimeType: "model/gltf-binary",
    format: "glb",
    bytes: 14250000,
    url: "https://assets.nexphone.io/models/nexphone-pro-chassis.glb",
    secureUrl: "https://assets.nexphone.io/models/nexphone-pro-chassis.glb",
    publicId: "nexphone/3d-models/nexphone-pro-chassis",
    folder: "nexphone/3d-models",
    storageProvider: "cloudinary",
    metadata: {
      productId: "prod-001",
      polygonCount: 48200,
      autoRotate: true,
      fileFormat: "glb",
      defaultColor: "#1a1a24",
    },
    uploadedBy: "admin@nexphone.io",
    createdAt: new Date("2026-01-20T16:00:00Z"),
    updatedAt: new Date("2026-01-20T16:00:00Z"),
  },
];

export class UploadRepository {
  async createAsset(data: {
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
    storageProvider?: "cloudinary" | "local" | "memory";
    metadata?: Record<string, any>;
    uploadedBy?: string;
  }): Promise<MediaAssetDocument | MediaAssetRecord> {
    if (isDatabaseConnected()) {
      const _id = new Types.ObjectId();
      const asset = new MediaAsset({
        _id,
        ...data,
        storageProvider: data.storageProvider || "local",
        metadata: data.metadata || {},
      });
      await asset.save();
      return asset;
    }

    const newRecord: MediaAssetRecord = {
      id: `asset-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      ...data,
      storageProvider: data.storageProvider || "local",
      metadata: data.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryAssetsStore.unshift(newRecord);
    return newRecord;
  }

  async findById(id: string): Promise<MediaAssetDocument | MediaAssetRecord | null> {
    if (isDatabaseConnected() && Types.ObjectId.isValid(id)) {
      const asset = await MediaAsset.findById(id);
      if (asset) return asset;
    }

    const found = inMemoryAssetsStore.find((a) => a.id === id || a.publicId === id);
    return found || null;
  }

  async findByPublicId(publicId: string): Promise<MediaAssetDocument | MediaAssetRecord | null> {
    if (isDatabaseConnected()) {
      const asset = await MediaAsset.findOne({ publicId });
      if (asset) return asset;
    }

    const found = inMemoryAssetsStore.find((a) => a.publicId === publicId);
    return found || null;
  }

  async findAssets(filters: {
    assetType?: string;
    folder?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ assets: Array<MediaAssetDocument | MediaAssetRecord>; total: number }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    if (isDatabaseConnected()) {
      const overallCount = await MediaAsset.countDocuments({});
      if (overallCount === 0) {
        try {
          await MediaAsset.insertMany(
            inMemoryAssetsStore.map(({ id, ...rest }) => rest)
          );
        } catch {
          // ignore duplicate race
        }
      }

      const query: any = {};
      if (filters.assetType && filters.assetType !== "all") {
        query.assetType = filters.assetType;
      }
      if (filters.folder && filters.folder !== "all") {
        query.folder = filters.folder;
      }
      if (filters.search) {
        const regex = new RegExp(filters.search.trim(), "i");
        query.$or = [
          { originalFilename: regex },
          { publicId: regex },
          { "metadata.productId": regex },
          { "metadata.brandId": regex },
          { "metadata.title": regex },
        ];
      }

      const [assets, total] = await Promise.all([
        MediaAsset.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        MediaAsset.countDocuments(query),
      ]);

      return { assets, total };
    }

    let list = [...inMemoryAssetsStore];
    if (filters.assetType && filters.assetType !== "all") {
      list = list.filter((a) => a.assetType === filters.assetType);
    }
    if (filters.folder && filters.folder !== "all") {
      list = list.filter((a) => a.folder === filters.folder);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.originalFilename.toLowerCase().includes(s) ||
          a.publicId.toLowerCase().includes(s) ||
          (a.metadata?.title && String(a.metadata.title).toLowerCase().includes(s)) ||
          (a.metadata?.productId && String(a.metadata.productId).toLowerCase().includes(s)) ||
          (a.metadata?.brandId && String(a.metadata.brandId).toLowerCase().includes(s))
      );
    }

    const total = list.length;
    const paginated = list.slice(skip, skip + limit);
    return { assets: paginated, total };
  }

  async deleteAsset(idOrPublicId: string): Promise<boolean> {
    if (isDatabaseConnected()) {
      const query = Types.ObjectId.isValid(idOrPublicId)
        ? { _id: idOrPublicId }
        : { publicId: idOrPublicId };

      const res = await MediaAsset.deleteOne(query);
      if (res.deletedCount && res.deletedCount > 0) return true;
    }

    const index = inMemoryAssetsStore.findIndex(
      (a) => a.id === idOrPublicId || a.publicId === idOrPublicId
    );
    if (index !== -1) {
      inMemoryAssetsStore.splice(index, 1);
      return true;
    }

    return false;
  }
}

export const uploadRepository = new UploadRepository();
