import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { imageUpload } from "../middleware/upload";
import * as controller from "../controllers/upload.controller";

export const uploadRouter = Router();

// General authenticated image upload (for products, banners, reviews, etc.)
uploadRouter.post("/image", authenticate, imageUpload.single("image"), controller.uploadSingleImage);

// Direct avatar upload route (also available under /api/user/avatar/upload)
uploadRouter.post("/avatar", authenticate, imageUpload.single("avatar"), controller.uploadUserAvatar);
