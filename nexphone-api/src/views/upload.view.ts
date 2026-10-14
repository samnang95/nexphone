import type { MediaAssetDocument } from "../models/media.model";
import type { MediaAssetRecord } from "../repositories/upload.repo";

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function serializeMediaAsset(asset: MediaAssetDocument | MediaAssetRecord | any) {
  const id = asset._id ? String(asset._id) : String(asset.id);
  const bytes = Number(asset.bytes) || 0;

  return {
    id,
    assetType: asset.assetType || "general",
    originalFilename: asset.originalFilename,
    mimeType: asset.mimeType,
    format: asset.format,
    bytes,
    formattedSize: formatBytes(bytes),
    url: asset.url,
    secureUrl: asset.secureUrl || asset.url,
    publicId: asset.publicId,
    folder: asset.folder,
    width: asset.width || null,
    height: asset.height || null,
    storageProvider: asset.storageProvider || "local",
    metadata: asset.metadata || {},
    uploadedBy: asset.uploadedBy || null,
    createdAt: asset.createdAt ? new Date(asset.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: asset.updatedAt ? new Date(asset.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export function serializeMediaAssetList(data: {
  assets: Array<MediaAssetDocument | MediaAssetRecord>;
  total: number;
  page: number;
  limit: number;
}) {
  const totalPages = Math.ceil(data.total / data.limit) || 1;
  const serialized = data.assets.map(serializeMediaAsset);

  return {
    success: true,
    total: data.total,
    files: serialized,
    assets: serialized,
    pagination: {
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages,
      hasNext: data.page < totalPages,
      hasPrev: data.page > 1,
    },
  };
}
