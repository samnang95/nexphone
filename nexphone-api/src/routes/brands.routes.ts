import { Router } from "express";
import { authenticate, optionalAuthenticate, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createBrandSchema,
  updateBrandSchema,
  queryBrandSchema,
} from "../validators/brand.validator";
import * as controller from "../controllers/brand.controller";

export const brandsRouter = Router();

// Public / client endpoints
brandsRouter.get("/", optionalAuthenticate, validate({ query: queryBrandSchema }), controller.getAllBrands);
brandsRouter.get("/:id", optionalAuthenticate, controller.getBrandById);

// Admin-only management endpoints
brandsRouter.post("/", authenticate, requireAdmin, validate({ body: createBrandSchema }), controller.createBrand);

brandsRouter.put(
  "/:id",
  authenticate,
  requireAdmin,
  validate({ body: updateBrandSchema }),
  controller.updateBrand
);

brandsRouter.patch(
  "/:id",
  authenticate,
  requireAdmin,
  validate({ body: updateBrandSchema }),
  controller.updateBrand
);

brandsRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  controller.deleteBrand
);
