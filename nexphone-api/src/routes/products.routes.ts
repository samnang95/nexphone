import { Router } from "express";
import { authenticate, optionalAuthenticate, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createProductSchema,
  updateProductSchema,
  queryProductSchema,
} from "../validators/product.validator";
import * as controller from "../controllers/product.controller";

export const productsRouter = Router();

// Public / client routes (with optional auth for admin view enhancements)
productsRouter.get("/", optionalAuthenticate, validate({ query: queryProductSchema }), controller.getAllPhones);
productsRouter.get("/featured", optionalAuthenticate, controller.getFeaturedPhones);
productsRouter.get("/new-arrivals", optionalAuthenticate, controller.getNewArrivals);
productsRouter.get("/best-sellers", optionalAuthenticate, controller.getBestSellers);
productsRouter.get("/search", optionalAuthenticate, controller.searchPhones);
productsRouter.get("/:id", optionalAuthenticate, controller.getPhoneByIdOrSlug);

// Admin-only management endpoints
productsRouter.post("/", authenticate, requireAdmin, validate({ body: createProductSchema }), controller.createPhone);
productsRouter.put("/:id", authenticate, requireAdmin, validate({ body: updateProductSchema }), controller.updatePhone);
productsRouter.patch("/:id", authenticate, requireAdmin, validate({ body: updateProductSchema }), controller.updatePhone);
productsRouter.delete("/:id", authenticate, requireAdmin, controller.deletePhone);
