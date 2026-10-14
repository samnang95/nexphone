import { Router, type RequestHandler } from "express";
import { authenticate, requireAdmin, optionalAuthenticate } from "../middleware/auth";
import { imageUpload, model3DUpload } from "../middleware/upload";
import { validate } from "../middleware/validate";
import {
  uploadProductImageSchema,
  uploadBrandLogoSchema,
  uploadHomepageBannerSchema,
  upload3DModelSchema,
  deleteFileSchema,
  listUploadsQuerySchema,
} from "../validators/upload.validator";
import * as controller from "../controllers/upload.controller";

export const uploadRouter = Router();

// Normalizes single file from either req.file or req.files array
const normalizeUploadedFile: RequestHandler = (req, _res, next) => {
  if (!req.file && Array.isArray(req.files) && req.files.length > 0) {
    req.file = req.files[0];
  }
  next();
};

// ==========================================
// Backward Compatible General & Avatar Uploads
// ==========================================
uploadRouter.post(
  "/image",
  authenticate,
  imageUpload.any(),
  normalizeUploadedFile,
  controller.uploadSingleImage
);

uploadRouter.post(
  "/avatar",
  authenticate,
  imageUpload.any(),
  normalizeUploadedFile,
  controller.uploadUserAvatar
);

// ==========================================
// 1. Upload Product Images
// ==========================================
uploadRouter.post(
  ["/products", "/product-image", "/products/image"],
  authenticate,
  requireAdmin,
  imageUpload.any(),
  normalizeUploadedFile,
  validate({ body: uploadProductImageSchema }),
  controller.uploadProductImage
);

// ==========================================
// 2. Upload Brand Logos
// ==========================================
uploadRouter.post(
  ["/brands", "/brand-logo", "/brands/logo"],
  authenticate,
  requireAdmin,
  imageUpload.any(),
  normalizeUploadedFile,
  validate({ body: uploadBrandLogoSchema }),
  controller.uploadBrandLogo
);

// ==========================================
// 3. Upload Homepage Banners
// ==========================================
uploadRouter.post(
  ["/banners", "/banner", "/homepage-banners"],
  authenticate,
  requireAdmin,
  imageUpload.any(),
  normalizeUploadedFile,
  validate({ body: uploadHomepageBannerSchema }),
  controller.uploadHomepageBanner
);

// ==========================================
// 4. Upload 3D Phone Models
// ==========================================
uploadRouter.post(
  ["/models-3d", "/3d-model", "/models", "/3d"],
  authenticate,
  requireAdmin,
  model3DUpload.any(),
  normalizeUploadedFile,
  validate({ body: upload3DModelSchema }),
  controller.upload3DModel
);

// ==========================================
// 5. Delete Uploaded Files
// ==========================================
uploadRouter.delete(
  ["/files/:id", "/files"],
  authenticate,
  requireAdmin,
  validate({ body: deleteFileSchema }),
  controller.deleteFile
);

uploadRouter.post(
  "/delete",
  authenticate,
  requireAdmin,
  validate({ body: deleteFileSchema }),
  controller.deleteFile
);

// ==========================================
// 6. List & Get Uploaded Files
// ==========================================
uploadRouter.get(
  ["/files", "/"],
  authenticate,
  requireAdmin,
  validate({ query: listUploadsQuerySchema }),
  controller.listFiles
);

uploadRouter.get(
  "/files/:id",
  authenticate,
  requireAdmin,
  controller.getFileById
);
