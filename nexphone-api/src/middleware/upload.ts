import multer from "multer";
import path from "node:path";
import { HttpError } from "../utils/httpError";

const storage = multer.memoryStorage();

const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const ALLOWED_IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];

const ALLOWED_3D_EXTS = [".glb", ".gltf", ".obj", ".usdz", ".fbx", ".bin", ".zip"];
const ALLOWED_3D_MIMES = [
  "model/gltf-binary",
  "model/gltf+json",
  "model/obj",
  "model/vnd.usdz+zip",
  "application/octet-stream",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
];

const imageFileFilter = (
  _req: any,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_IMAGE_MIMES.includes(file.mimetype) || ALLOWED_IMAGE_EXTS.includes(ext)) {
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

const model3DFileFilter = (
  _req: any,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_3D_EXTS.includes(ext) || ALLOWED_3D_MIMES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      HttpError.badRequest(
        `Invalid 3D model file type. Allowed formats: ${ALLOWED_3D_EXTS.join(", ")}`,
        "INVALID_3D_FILE_TYPE"
      )
    );
  }
};

const universalFileFilter = (
  _req: any,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isImage = ALLOWED_IMAGE_MIMES.includes(file.mimetype) || ALLOWED_IMAGE_EXTS.includes(ext);
  const is3D = ALLOWED_3D_EXTS.includes(ext) || ALLOWED_3D_MIMES.includes(file.mimetype);

  if (isImage || is3D) {
    callback(null, true);
  } else {
    callback(
      HttpError.badRequest(
        "Unsupported file type. Please upload a valid image or 3D model asset.",
        "UNSUPPORTED_MEDIA_TYPE"
      )
    );
  }
};

export const imageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
});

export const model3DUpload = multer({
  storage,
  fileFilter: model3DFileFilter,
  limits: {
    fileSize: 60 * 1024 * 1024, // 60MB
  },
});

export const universalUpload = multer({
  storage,
  fileFilter: universalFileFilter,
  limits: {
    fileSize: 60 * 1024 * 1024, // 60MB
  },
});
