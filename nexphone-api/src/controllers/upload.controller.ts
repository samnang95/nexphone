import type { Request, Response } from "express";
import { uploadService } from "../services/upload.service";
import * as userService from "../services/user.service";
import { HttpError } from "../utils/httpError";

// ==========================================
// Backward Compatible General & Avatar Uploads
// ==========================================
export async function uploadSingleImage(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw HttpError.badRequest("Please select an image file to upload.", "NO_FILE_PROVIDED");
  }
  const folder = typeof req.query.folder === "string" ? req.query.folder : "nexphone/uploads";
  const result = await uploadService.uploadBuffer(req.file.buffer, {
    folder,
  });

  res.status(201).json({
    success: true,
    message: "Image uploaded successfully to Cloudinary.",
    ...result,
  });
}

export async function uploadUserAvatar(req: Request, res: Response): Promise<void> {
  let secureUrl = "";
  if (req.file) {
    const result = await uploadService.uploadBuffer(req.file.buffer, {
      folder: "nexphone/avatars",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });
    secureUrl = result.secureUrl;
  } else if (req.body?.image && typeof req.body.image === "string") {
    // Support base64 or data URI
    const result = await uploadService.uploadBase64(req.body.image, {
      folder: "nexphone/avatars",
    });
    secureUrl = result.secureUrl;
  } else {
    throw HttpError.badRequest("Please provide an image file or base64 data.", "NO_IMAGE_PROVIDED");
  }
  const updatedUser = await userService.updateAvatar(req.auth!.user._id, secureUrl);
  res.json({
    success: true,
    message: "Avatar uploaded and updated successfully.",
    avatarUrl: secureUrl,
    user: updatedUser,
  });
}

// ==========================================
// 1. Upload Product Images
// ==========================================
export async function uploadProductImage(req: Request, res: Response): Promise<void> {
  const result = await uploadService.uploadProductImage(req.file, req.body, req.auth?.user);
  res.status(201).json(result);
}

// ==========================================
// 2. Upload Brand Logos
// ==========================================
export async function uploadBrandLogo(req: Request, res: Response): Promise<void> {
  const result = await uploadService.uploadBrandLogo(req.file, req.body, req.auth?.user);
  res.status(201).json(result);
}

// ==========================================
// 3. Upload Homepage Banners
// ==========================================
export async function uploadHomepageBanner(req: Request, res: Response): Promise<void> {
  const result = await uploadService.uploadHomepageBanner(req.file, req.body, req.auth?.user);
  res.status(201).json(result);
}

// ==========================================
// 4. Upload 3D Phone Models
// ==========================================
export async function upload3DModel(req: Request, res: Response): Promise<void> {
  const result = await uploadService.upload3DModel(req.file, req.body, req.auth?.user);
  res.status(201).json(result);
}

// ==========================================
// 5. Delete Uploaded Files
// ==========================================
export async function deleteFile(req: Request, res: Response): Promise<void> {
  const targetId =
    (req.params.id as string) ||
    (req.params[0] as string) ||
    (req.query.publicId as string) ||
    (req.query.fileId as string) ||
    (req.body?.publicId as string) ||
    (req.body?.fileId as string);

  if (!targetId) {
    throw HttpError.badRequest("Please provide a file ID or publicId to delete.", "TARGET_REQUIRED");
  }

  const result = await uploadService.deleteFile(targetId, req.auth?.user);
  res.json(result);
}

// ==========================================
// 6. List & Get Uploaded Files
// ==========================================
export async function listFiles(req: Request, res: Response): Promise<void> {
  const result = await uploadService.listFiles({
    assetType: req.query.assetType as string,
    folder: req.query.folder as string,
    search: req.query.search as string,
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });
  res.json(result);
}

export async function getFileById(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await uploadService.getFileById(id);
  res.json(result);
}