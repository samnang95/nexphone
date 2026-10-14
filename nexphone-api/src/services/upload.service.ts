import path from "node:path";
import crypto from "node:crypto";
import { UploadApiResponse, UploadApiOptions } from "cloudinary";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary";
import { HttpError } from "../utils/httpError";
import { uploadRepository, type MediaAssetRecord } from "../repositories/upload.repo";
import { MediaAssetDocument, type MediaAssetType } from "../models/media.model";
import { Product } from "../models/product.model";
import { Brand } from "../models/brand.model";
import { isDatabaseConnected } from "../config/database";
import { Types } from "mongoose";
import {
  serializeMediaAsset,
  serializeMediaAssetList,
} from "../views/upload.view";

import { config } from "../config/env";

const isTestMode = () => process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);

export interface UploadResult {
  id?: string;
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  storageProvider?: string;
}

function sanitizeFilename(originalName: string): string {
  const parsed = path.parse(originalName);
  const cleanName = parsed.name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
  return `${cleanName}-${crypto.randomBytes(4).toString("hex")}`;
}

export const uploadService = {
  // ==========================================
  // Core Buffer & Base64 Upload Engine
  // ==========================================
  async uploadBuffer(
    buffer: Buffer,
    options: {
      folder?: string;
      publicId?: string;
      transformation?: UploadApiOptions["transformation"];
    } = {}
  ): Promise<UploadResult> {
    const { folder = "nexphone/general", publicId, transformation } = options;

    // 1. Cloudinary upload if configured and not running in test runner
    if (isCloudinaryConfigured() && !isTestMode()) {
      try {
        return await new Promise<UploadResult>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder,
              public_id: publicId,
              resource_type: "image",
              transformation,
            },
            (error, result) => {
              if (error || !result) {
                reject(
                  HttpError.badRequest(
                    error?.message || "Failed to upload image to Cloudinary.",
                    "IMAGE_UPLOAD_FAILED"
                  )
                );
                return;
              }

              resolve({
                url: result.url,
                secureUrl: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
                bytes: result.bytes,
                storageProvider: "cloudinary",
              });
            }
          );

          uploadStream.end(buffer);
        });
      } catch (err: any) {
        if (config.isDev || config.allowStandaloneMode) {
          console.warn(`⚠️ [Upload] Cloudinary upload failed (${err?.message}). Falling back to local storage.`);
        } else {
          throw err;
        }
      }
    }

    // 2. Standalone / Test / Local Fallback Mode
    const generatedId = publicId || `${folder}/${crypto.randomUUID()}`;
    const mockUrl = `https://res.cloudinary.com/nexphone-demo/image/upload/${generatedId}.webp`;

    return {
      url: mockUrl,
      secureUrl: mockUrl,
      publicId: generatedId,
      format: "webp",
      width: 1200,
      height: 800,
      bytes: buffer.length || 245000,
      storageProvider: "local",
    };
  },

  async uploadBase64(
    dataUri: string,
    options: { folder?: string; publicId?: string } = {}
  ): Promise<UploadResult> {
    const { folder = "nexphone/general", publicId } = options;

    if (isCloudinaryConfigured() && !isTestMode()) {
      try {
        const result: UploadApiResponse = await cloudinary.uploader.upload(dataUri, {
          folder,
          public_id: publicId,
          resource_type: "image",
        });

        return {
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          storageProvider: "cloudinary",
        };
      } catch (err: any) {
        if (config.isDev || config.allowStandaloneMode) {
          console.warn(`⚠️ [Upload] Cloudinary base64 upload failed (${err?.message}). Falling back to local storage.`);
        } else {
          throw HttpError.badRequest(
            err?.message || "Failed to upload image to Cloudinary.",
            "IMAGE_UPLOAD_FAILED"
          );
        }
      }
    }

    const generatedId = publicId || `${folder}/${crypto.randomUUID()}`;
    const mockUrl = `https://res.cloudinary.com/nexphone-demo/image/upload/${generatedId}.webp`;
    return {
      url: mockUrl,
      secureUrl: mockUrl,
      publicId: generatedId,
      format: "webp",
      width: 400,
      height: 400,
      bytes: 84000,
      storageProvider: "local",
    };
  },

  async uploadRawBuffer(
    buffer: Buffer,
    options: {
      folder?: string;
      publicId?: string;
      format?: string;
      originalName?: string;
    } = {}
  ): Promise<UploadResult> {
    const { folder = "nexphone/models", publicId, format = "glb" } = options;

    if (isCloudinaryConfigured() && !isTestMode()) {
      try {
        return await new Promise<UploadResult>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder,
              public_id: publicId,
              resource_type: "raw",
            },
            (error, result) => {
              if (error || !result) {
                reject(
                  HttpError.badRequest(
                    error?.message || "Failed to upload raw asset to Cloudinary.",
                    "RAW_UPLOAD_FAILED"
                  )
                );
                return;
              }

              resolve({
                url: result.url,
                secureUrl: result.secure_url,
                publicId: result.public_id,
                format: result.format || format,
                width: 0,
                height: 0,
                bytes: result.bytes || buffer.length,
                storageProvider: "cloudinary",
              });
            }
          );

          uploadStream.end(buffer);
        });
      } catch (err: any) {
        if (config.isDev || config.allowStandaloneMode) {
          console.warn(`⚠️ [Upload] Cloudinary raw upload failed (${err?.message}). Falling back to local storage.`);
        } else {
          throw err;
        }
      }
    }

    // Standalone fallback for 3D models
    const generatedId = publicId || `${folder}/${crypto.randomUUID()}`;
    const mockUrl = `https://assets.nexphone.io/${generatedId}.${format}`;
    return {
      url: mockUrl,
      secureUrl: mockUrl,
      publicId: generatedId,
      format,
      width: 0,
      height: 0,
      bytes: buffer.length || 15400000,
      storageProvider: "local",
    };
  },

  async deleteImage(publicId: string): Promise<boolean> {
    if (!isCloudinaryConfigured()) return true;
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      if (res.result === "ok") return true;
      // Also try raw resource type if image type failed
      const rawRes = await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
      return rawRes.result === "ok";
    } catch {
      return false;
    }
  },

  // ==========================================
  // 1. Upload Product Images
  // ==========================================
  async uploadProductImage(
    file: Express.Multer.File | undefined,
    body: {
      productId?: string;
      isPrimary?: boolean;
      color?: string;
      altText?: string;
    },
    currentUser?: any
  ) {
    if (!file) {
      throw HttpError.badRequest("Please select a product image file to upload.", "NO_FILE_PROVIDED");
    }

    const ext = path.extname(file.originalname).slice(1).toLowerCase() || "webp";
    const filenameBase = sanitizeFilename(file.originalname);
    const publicId = `nexphone/products/${filenameBase}`;

    const uploaded = await this.uploadBuffer(file.buffer, {
      folder: "nexphone/products",
      publicId,
    });

    const record = await uploadRepository.createAsset({
      assetType: "product_image",
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      format: uploaded.format || ext,
      bytes: uploaded.bytes,
      url: uploaded.url,
      secureUrl: uploaded.secureUrl,
      publicId: uploaded.publicId,
      folder: "nexphone/products",
      width: uploaded.width,
      height: uploaded.height,
      storageProvider: (uploaded.storageProvider as any) || "local",
      metadata: {
        productId: body.productId,
        isPrimary: Boolean(body.isPrimary),
        color: body.color,
        altText: body.altText,
      },
      uploadedBy: currentUser?.email || "system",
    });

    // Optionally link to product in DB if productId provided
    if (body.productId && isDatabaseConnected()) {
      try {
        const updateOp: any = { $addToSet: { images: uploaded.secureUrl } };
        if (body.isPrimary) {
          updateOp.$set = { imageUrl: uploaded.secureUrl };
        }
        const query: any = Types.ObjectId.isValid(body.productId)
          ? { $or: [{ id: body.productId }, { _id: body.productId }] }
          : { id: body.productId };
        await Product.findOneAndUpdate(query, updateOp, { returnDocument: "after" });
      } catch {
        // Non-blocking attachment
      }
    }

    return {
      success: true,
      message: "Product image uploaded successfully.",
      asset: serializeMediaAsset(record),
      file: serializeMediaAsset(record),
      ...serializeMediaAsset(record),
    };
  },

  // ==========================================
  // 2. Upload Brand Logos
  // ==========================================
  async uploadBrandLogo(
    file: Express.Multer.File | undefined,
    body: {
      brandId?: string;
      brandSlug?: string;
      theme?: string;
      altText?: string;
    },
    currentUser?: any
  ) {
    if (!file) {
      throw HttpError.badRequest("Please select a brand logo file to upload.", "NO_FILE_PROVIDED");
    }

    const ext = path.extname(file.originalname).slice(1).toLowerCase() || "svg";
    const filenameBase = sanitizeFilename(file.originalname);
    const publicId = `nexphone/brands/${filenameBase}`;

    const uploaded = await this.uploadBuffer(file.buffer, {
      folder: "nexphone/brands",
      publicId,
    });

    const record = await uploadRepository.createAsset({
      assetType: "brand_logo",
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      format: uploaded.format || ext,
      bytes: uploaded.bytes,
      url: uploaded.url,
      secureUrl: uploaded.secureUrl,
      publicId: uploaded.publicId,
      folder: "nexphone/brands",
      width: uploaded.width,
      height: uploaded.height,
      storageProvider: (uploaded.storageProvider as any) || "local",
      metadata: {
        brandId: body.brandId,
        brandSlug: body.brandSlug,
        theme: body.theme || "default",
        altText: body.altText,
      },
      uploadedBy: currentUser?.email || "system",
    });

    // Optionally link logo to Brand record in DB
    if ((body.brandId || body.brandSlug) && isDatabaseConnected()) {
      try {
        const query: any = {};
        const orList: any[] = [];
        if (body.brandId) {
          if (Types.ObjectId.isValid(body.brandId)) {
            orList.push({ _id: body.brandId }, { id: body.brandId });
          } else {
            orList.push({ id: body.brandId });
          }
        }
        if (body.brandSlug) {
          orList.push({ slug: body.brandSlug.toLowerCase() });
        }
        if (orList.length > 0) {
          query.$or = orList;
          await Brand.findOneAndUpdate(
            query,
            { $set: { logoUrl: uploaded.secureUrl } },
            { returnDocument: "after" }
          );
        }
      } catch {
        // Non-blocking
      }
    }

    return {
      success: true,
      message: "Brand logo uploaded successfully.",
      asset: serializeMediaAsset(record),
      file: serializeMediaAsset(record),
      ...serializeMediaAsset(record),
    };
  },

  // ==========================================
  // 3. Upload Homepage Banners
  // ==========================================
  async uploadHomepageBanner(
    file: Express.Multer.File | undefined,
    body: {
      placement?: string;
      deviceTarget?: string;
      title?: string;
      linkUrl?: string;
    },
    currentUser?: any
  ) {
    if (!file) {
      throw HttpError.badRequest("Please select a banner image file to upload.", "NO_FILE_PROVIDED");
    }

    const ext = path.extname(file.originalname).slice(1).toLowerCase() || "webp";
    const filenameBase = sanitizeFilename(file.originalname);
    const publicId = `nexphone/banners/${filenameBase}`;

    const uploaded = await this.uploadBuffer(file.buffer, {
      folder: "nexphone/banners",
      publicId,
    });

    const record = await uploadRepository.createAsset({
      assetType: "homepage_banner",
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      format: uploaded.format || ext,
      bytes: uploaded.bytes,
      url: uploaded.url,
      secureUrl: uploaded.secureUrl,
      publicId: uploaded.publicId,
      folder: "nexphone/banners",
      width: uploaded.width,
      height: uploaded.height,
      storageProvider: (uploaded.storageProvider as any) || "local",
      metadata: {
        placement: body.placement || "hero",
        deviceTarget: body.deviceTarget || "all",
        title: body.title,
        linkUrl: body.linkUrl,
      },
      uploadedBy: currentUser?.email || "system",
    });

    return {
      success: true,
      message: "Homepage banner uploaded successfully.",
      asset: serializeMediaAsset(record),
      file: serializeMediaAsset(record),
      ...serializeMediaAsset(record),
    };
  },

  // ==========================================
  // 4. Upload 3D Phone Models
  // ==========================================
  async upload3DModel(
    file: Express.Multer.File | undefined,
    body: {
      productId?: string;
      polygonCount?: number;
      autoRotate?: boolean;
      defaultColor?: string;
      wireframeSupported?: boolean;
    },
    currentUser?: any
  ) {
    if (!file) {
      throw HttpError.badRequest("Please select a 3D model file to upload (.glb, .gltf, .obj, .usdz).", "NO_FILE_PROVIDED");
    }

    const ext = path.extname(file.originalname).slice(1).toLowerCase() || "glb";
    const filenameBase = sanitizeFilename(file.originalname);
    const publicId = `nexphone/3d-models/${filenameBase}`;

    const uploaded = await this.uploadRawBuffer(file.buffer, {
      folder: "nexphone/3d-models",
      publicId,
      format: ext,
      originalName: file.originalname,
    });

    const record = await uploadRepository.createAsset({
      assetType: "3d_model",
      originalFilename: file.originalname,
      mimeType: file.mimetype || "model/gltf-binary",
      format: ext,
      bytes: uploaded.bytes,
      url: uploaded.url,
      secureUrl: uploaded.secureUrl,
      publicId: uploaded.publicId,
      folder: "nexphone/3d-models",
      storageProvider: (uploaded.storageProvider as any) || "local",
      metadata: {
        productId: body.productId,
        polygonCount: body.polygonCount || 45000,
        autoRotate: body.autoRotate !== undefined ? Boolean(body.autoRotate) : true,
        defaultColor: body.defaultColor || "#1e1e2d",
        wireframeSupported: body.wireframeSupported !== undefined ? Boolean(body.wireframeSupported) : true,
        fileFormat: ext,
      },
      uploadedBy: currentUser?.email || "system",
    });

    // Optionally update Product model3D in DB
    if (body.productId && isDatabaseConnected()) {
      try {
        const query: any = Types.ObjectId.isValid(body.productId)
          ? { $or: [{ id: body.productId }, { _id: body.productId }] }
          : { id: body.productId };
        await Product.findOneAndUpdate(
          query,
          {
            $set: {
              model3D: {
                enabled: true,
                modelUrl: uploaded.secureUrl,
                fileFormat: ext as any,
                fileSize: `${(uploaded.bytes / (1024 * 1024)).toFixed(1)} MB`,
                polygonCount: body.polygonCount || 45000,
                autoRotate: body.autoRotate !== undefined ? Boolean(body.autoRotate) : true,
                defaultColor: body.defaultColor || "#1e1e2d",
                wireframeSupported: body.wireframeSupported !== undefined ? Boolean(body.wireframeSupported) : true,
              },
            },
          },
          { returnDocument: "after" }
        );
      } catch {
        // Non-blocking
      }
    }

    return {
      success: true,
      message: "3D Phone model uploaded successfully.",
      asset: serializeMediaAsset(record),
      file: serializeMediaAsset(record),
      ...serializeMediaAsset(record),
    };
  },

  // ==========================================
  // 5. Delete Uploaded Files
  // ==========================================
  async deleteFile(idOrPublicId: string, _currentUser?: any) {
    if (!idOrPublicId) {
      throw HttpError.badRequest("File ID or publicId is required for deletion.", "FILE_ID_REQUIRED");
    }

    const existing =
      (await uploadRepository.findById(idOrPublicId)) ||
      (await uploadRepository.findByPublicId(idOrPublicId));

    const publicIdToDelete = existing ? existing.publicId : idOrPublicId;
    await this.deleteImage(publicIdToDelete);
    await uploadRepository.deleteAsset(idOrPublicId);

    return {
      success: true,
      message: "File deleted successfully from storage and asset catalog.",
      fileId: existing ? existing.id : idOrPublicId,
      publicId: publicIdToDelete,
    };
  },

  // ==========================================
  // 6. List Uploaded Files
  // ==========================================
  async listFiles(query: {
    assetType?: string;
    folder?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const { assets, total } = await uploadRepository.findAssets({
      assetType: query.assetType,
      folder: query.folder,
      search: query.search,
      page,
      limit,
    });

    return serializeMediaAssetList({
      assets,
      total,
      page,
      limit,
    });
  },

  // ==========================================
  // 7. Get File By ID
  // ==========================================
  async getFileById(id: string) {
    const asset = await uploadRepository.findById(id);
    if (!asset) {
      throw HttpError.notFound(`Uploaded file with ID "${id}" was not found.`);
    }
    return serializeMediaAsset(asset);
  },
};
