import multer from "multer";
import { HttpError } from "../utils/httpError";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      HttpError.badRequest(
        "Invalid file type. Only JPEG, PNG, WebP, GIF, and SVG images are allowed.",
        "INVALID_FILE_TYPE"
      )
    );
  }
};

export const imageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
