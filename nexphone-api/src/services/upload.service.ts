import { UploadApiResponse, UploadApiOptions } from "cloudinary";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary";
import { HttpError } from "../utils/httpError";

export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export const uploadService = {
  /**
   * Upload a memory buffer (e.g. from multer) to Cloudinary
   */
  async uploadBuffer(
    buffer: Buffer,
    options: {
      folder?: string;
      publicId?: string;
      transformation?: UploadApiOptions["transformation"];
    } = {}
  ): Promise<UploadResult> {
    if (!isCloudinaryConfigured()) {
      throw HttpError.internal("Cloudinary storage is not configured.", "STORAGE_NOT_CONFIGURED");
    }

    const { folder = "nexphone/general", publicId, transformation } = options;

    return new Promise<UploadResult>((resolve, reject) => {
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
          });
        }
      );

      uploadStream.end(buffer);
    });
  },

  /**
   * Upload base64 or Data URI string to Cloudinary
   */
  async uploadBase64(
    dataUri: string,
    options: { folder?: string; publicId?: string } = {}
  ): Promise<UploadResult> {
    if (!isCloudinaryConfigured()) {
      throw HttpError.internal("Cloudinary storage is not configured.", "STORAGE_NOT_CONFIGURED");
    }

    const { folder = "nexphone/general", publicId } = options;

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
      };
    } catch (err: any) {
      throw HttpError.badRequest(
        err?.message || "Failed to upload image to Cloudinary.",
        "IMAGE_UPLOAD_FAILED"
      );
    }
  },

  /**
   * Delete an image by its public_id
   */
  async deleteImage(publicId: string): Promise<boolean> {
    if (!isCloudinaryConfigured()) return false;
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return res.result === "ok";
    } catch {
      return false;
    }
  },
};
