import type { Request, Response } from "express";
import { uploadService } from "../services/upload.service";
import * as userService from "../services/user.service";
import { HttpError } from "../utils/httpError";

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