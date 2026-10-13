import { Router } from "express";
import { authenticate, optionalAuthenticate, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createProductSchema,
  updateProductSchema,
  queryProductSchema,
  addColorSchema,
  updateColorSchema,
  addStorageSchema,
  updateStorageSchema,
  updatePricingSchema,
  updateSpecificationsSchema,
  addImageSchema,
  deleteImageSchema,
  setPrimaryImageSchema,
  updateModel3DSchema,
} from "../validators/product.validator";
import * as controller from "../controllers/product.controller";
import * as reviewController from "../controllers/review.controller";
import { createReviewSchema } from "../validators/review.validator";

export const productsRouter = Router();

// Public / client routes (with optional auth for admin view enhancements)
productsRouter.get("/", optionalAuthenticate, validate({ query: queryProductSchema }), controller.getAllPhones);
productsRouter.get("/featured", optionalAuthenticate, controller.getFeaturedPhones);
productsRouter.get("/new-arrivals", optionalAuthenticate, controller.getNewArrivals);
productsRouter.get("/best-sellers", optionalAuthenticate, controller.getBestSellers);
productsRouter.get("/search", optionalAuthenticate, controller.searchPhones);

// ==========================================
// Sub-Resource: Colors
// ==========================================
productsRouter.get("/:id/colors", optionalAuthenticate, controller.getColors);
productsRouter.post("/:id/colors", authenticate, requireAdmin, validate({ body: addColorSchema }), controller.addColor);
productsRouter.put("/:id/colors/:colorId", authenticate, requireAdmin, validate({ body: updateColorSchema }), controller.updateColor);
productsRouter.patch("/:id/colors/:colorId", authenticate, requireAdmin, validate({ body: updateColorSchema }), controller.updateColor);
productsRouter.delete("/:id/colors/:colorId", authenticate, requireAdmin, controller.deleteColor);

// ==========================================
// Sub-Resource: Storage & RAM Variants
// ==========================================
productsRouter.get(["/:id/storage", "/:id/variants"], optionalAuthenticate, controller.getStorageOptions);
productsRouter.post(["/:id/storage", "/:id/variants"], authenticate, requireAdmin, validate({ body: addStorageSchema }), controller.addStorageOption);
productsRouter.put(["/:id/storage/:storageId", "/:id/variants/:storageId"], authenticate, requireAdmin, validate({ body: updateStorageSchema }), controller.updateStorageOption);
productsRouter.patch(["/:id/storage/:storageId", "/:id/variants/:storageId"], authenticate, requireAdmin, validate({ body: updateStorageSchema }), controller.updateStorageOption);
productsRouter.delete(["/:id/storage/:storageId", "/:id/variants/:storageId"], authenticate, requireAdmin, controller.deleteStorageOption);

// ==========================================
// Sub-Resource: Pricing
// ==========================================
productsRouter.get("/:id/pricing", optionalAuthenticate, controller.getPricing);
productsRouter.patch("/:id/pricing", authenticate, requireAdmin, validate({ body: updatePricingSchema }), controller.updatePricing);
productsRouter.put("/:id/pricing", authenticate, requireAdmin, validate({ body: updatePricingSchema }), controller.updatePricing);

// ==========================================
// Sub-Resource: Specifications
// ==========================================
productsRouter.get("/:id/specifications", optionalAuthenticate, controller.getSpecifications);
productsRouter.put("/:id/specifications", authenticate, requireAdmin, validate({ body: updateSpecificationsSchema }), controller.updateSpecifications);
productsRouter.patch("/:id/specifications", authenticate, requireAdmin, validate({ body: updateSpecificationsSchema }), controller.updateSpecifications);

// ==========================================
// Sub-Resource: Product Images
// ==========================================
productsRouter.get("/:id/images", optionalAuthenticate, controller.getImages);
productsRouter.post("/:id/images", authenticate, requireAdmin, validate({ body: addImageSchema }), controller.addImages);
productsRouter.delete("/:id/images", authenticate, requireAdmin, validate({ body: deleteImageSchema }), controller.deleteImage);
productsRouter.patch("/:id/images/primary", authenticate, requireAdmin, validate({ body: setPrimaryImageSchema }), controller.setPrimaryImage);

// ==========================================
// Sub-Resource: 3D Model
// ==========================================
productsRouter.get("/:id/model-3d", optionalAuthenticate, controller.getModel3D);
productsRouter.put("/:id/model-3d", authenticate, requireAdmin, validate({ body: updateModel3DSchema }), controller.updateModel3D);
productsRouter.patch("/:id/model-3d", authenticate, requireAdmin, validate({ body: updateModel3DSchema }), controller.updateModel3D);

// ==========================================
// Sub-Resource: Product Reviews & Ratings
// ==========================================
productsRouter.get("/:id/reviews", optionalAuthenticate, reviewController.getProductReviews);
productsRouter.post("/:id/reviews", optionalAuthenticate, validate({ body: createReviewSchema }), reviewController.createReview);

// Core Phone details and CRUD (must stay after sub-resource routes to avoid greedy :id matching subpaths)
productsRouter.get("/:id", optionalAuthenticate, controller.getPhoneByIdOrSlug);
productsRouter.post("/", authenticate, requireAdmin, validate({ body: createProductSchema }), controller.createPhone);
productsRouter.put("/:id", authenticate, requireAdmin, validate({ body: updateProductSchema }), controller.updatePhone);
productsRouter.patch("/:id", authenticate, requireAdmin, validate({ body: updateProductSchema }), controller.updatePhone);
productsRouter.delete("/:id", authenticate, requireAdmin, controller.deletePhone);
