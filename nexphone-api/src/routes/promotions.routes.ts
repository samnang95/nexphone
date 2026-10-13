import { Router } from "express";
import { optionalAuthenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
  applyCouponSchema,
  queryPromotionSchema,
} from "../validators/promotion.validator";
import * as controller from "../controllers/promotion.controller";

export const promotionsRouter = Router();

// ==========================================
// 1. Get Active Promotions (Public / Storefront)
// ==========================================
promotionsRouter.get(["/api/promotions/active", "/promotions/active", "/api/coupons/active", "/coupons/active"], optionalAuthenticate, controller.getActivePromotions);

// ==========================================
// 2. Metrics & Dashboard Analytics (Admin)
// ==========================================
promotionsRouter.get(["/api/promotions-metrics", "/promotions-metrics", "/api/promotions/metrics", "/promotions/metrics"], optionalAuthenticate, controller.getPromotionMetrics);

// ==========================================
// 3. Validate Coupon
// ==========================================
promotionsRouter.post(["/api/promotions/validate", "/promotions/validate", "/api/coupons/validate", "/coupons/validate", "/api/promotions/coupons/validate"], optionalAuthenticate, validate({ body: validateCouponSchema }), controller.validateCoupon);

// ==========================================
// 4. Apply Coupon
// ==========================================
promotionsRouter.post(["/api/promotions/apply", "/promotions/apply", "/api/coupons/apply", "/coupons/apply", "/api/promotions/coupons/apply"], optionalAuthenticate, validate({ body: applyCouponSchema }), controller.applyCoupon);

// ==========================================
// 5. Toggle Status (Admin)
// ==========================================
promotionsRouter.patch(["/api/promotions/:id/status", "/promotions/:id/status", "/api/coupons/:id/status", "/coupons/:id/status"], optionalAuthenticate, controller.togglePromotionStatus);

// ==========================================
// 6. Sub-path: Specific Coupon Endpoints
// ==========================================
promotionsRouter.post(["/api/promotions/coupons", "/promotions/coupons"], optionalAuthenticate, validate({ body: createCouponSchema }), controller.createCoupon);

// ==========================================
// 7. Promotion / Coupon Details & Mutations
// (Must be after static sub-paths like /active, /validate, /apply)
// ==========================================
promotionsRouter.get(["/api/promotions/:id", "/promotions/:id", "/api/coupons/:id", "/coupons/:id"], optionalAuthenticate, controller.getPromotionDetails);
promotionsRouter.put(["/api/promotions/coupons/:id", "/promotions/coupons/:id", "/api/promotions/:id", "/promotions/:id", "/api/coupons/:id", "/coupons/:id"], optionalAuthenticate, validate({ body: updateCouponSchema }), controller.updateCoupon);
promotionsRouter.patch(["/api/promotions/coupons/:id", "/promotions/coupons/:id", "/api/promotions/:id", "/promotions/:id", "/api/coupons/:id", "/coupons/:id"], optionalAuthenticate, validate({ body: updateCouponSchema }), controller.updateCoupon);
promotionsRouter.delete(["/api/promotions/coupons/:id", "/promotions/coupons/:id", "/api/promotions/:id", "/promotions/:id", "/api/coupons/:id", "/coupons/:id"], optionalAuthenticate, controller.deleteCoupon);

// ==========================================
// 8. Root Collection: Query & Create
// ==========================================
promotionsRouter.get(["/api/promotions", "/promotions", "/api/coupons", "/coupons"], optionalAuthenticate, validate({ query: queryPromotionSchema }), controller.getAllPromotions);
promotionsRouter.post(["/api/promotions", "/promotions", "/api/coupons", "/coupons"], optionalAuthenticate, validate({ body: createCouponSchema }), controller.createCoupon);
