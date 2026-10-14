import { Router } from "express";
import { optionalAuthenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createBannerSchema,
  updateBannerSchema,
  queryBannerSchema,
  createFeaturedProductSchema,
  updateFeaturedProductSchema,
  queryFeaturedProductsSchema,
  createSectionSchema,
  updateSectionSchema,
  querySectionSchema,
  reorderSectionsSchema,
} from "../validators/homepage.validator";
import * as controller from "../controllers/homepage.controller";

export const homepageRouter = Router();

// ==========================================
// 1. Composite Storefront Homepage Payload
// ==========================================
homepageRouter.get(["/api/homepage", "/homepage", "/api/content/homepage", "/content/homepage"], optionalAuthenticate, controller.getHomepageOverview);

// ==========================================
// 2. Homepage Banners
// ==========================================
homepageRouter.get(["/api/homepage/banners", "/homepage/banners", "/api/banners", "/banners"], optionalAuthenticate, validate({ query: queryBannerSchema }), controller.getBanners);
homepageRouter.post(["/api/homepage/banners", "/homepage/banners", "/api/banners", "/banners"], optionalAuthenticate, validate({ body: createBannerSchema }), controller.createBanner);
homepageRouter.get(["/api/homepage/banners/:id", "/homepage/banners/:id", "/api/banners/:id", "/banners/:id"], optionalAuthenticate, controller.getBannerById);
homepageRouter.put(["/api/homepage/banners/:id", "/homepage/banners/:id", "/api/banners/:id", "/banners/:id"], optionalAuthenticate, validate({ body: updateBannerSchema }), controller.updateBanner);
homepageRouter.patch(["/api/homepage/banners/:id", "/homepage/banners/:id", "/api/banners/:id", "/banners/:id"], optionalAuthenticate, validate({ body: updateBannerSchema }), controller.updateBanner);
homepageRouter.delete(["/api/homepage/banners/:id", "/homepage/banners/:id", "/api/banners/:id", "/banners/:id"], optionalAuthenticate, controller.deleteBanner);

// ==========================================
// 3. Featured Products
// ==========================================
homepageRouter.get(["/api/homepage/featured-products","/homepage/featured-products","/api/homepage/featured","/homepage/featured","/api/products/featured","/products/featured"], optionalAuthenticate, validate({ query: queryFeaturedProductsSchema }), controller.getFeaturedProducts);
homepageRouter.post(["/api/homepage/featured-products","/homepage/featured-products","/api/homepage/featured","/homepage/featured",],optionalAuthenticate,validate({ body: createFeaturedProductSchema }),controller.createFeaturedProduct);
homepageRouter.put(["/api/homepage/featured-products/:id","/homepage/featured-products/:id","/api/homepage/featured/:id","/homepage/featured/:id",],optionalAuthenticate,validate({ body: updateFeaturedProductSchema }),controller.updateFeaturedProduct);
homepageRouter.patch(["/api/homepage/featured-products/:id","/homepage/featured-products/:id","/api/homepage/featured/:id","/homepage/featured/:id",],optionalAuthenticate,validate({ body: updateFeaturedProductSchema }),controller.updateFeaturedProduct);
homepageRouter.delete(["/api/homepage/featured-products/:id","/homepage/featured-products/:id","/api/homepage/featured/:id","/homepage/featured/:id",],optionalAuthenticate,controller.deleteFeaturedProduct);

// ==========================================
// 4. Promotional Sections
// ==========================================
homepageRouter.get(["/api/homepage/promotional-sections","/homepage/promotional-sections","/api/homepage/sections","/homepage/sections"],optionalAuthenticate,validate({ query: querySectionSchema }),controller.getPromotionalSections);
homepageRouter.put(["/api/homepage/sections/reorder","/homepage/sections/reorder","/api/homepage/promotional-sections/reorder","/homepage/promotional-sections/reorder",],optionalAuthenticate,validate({ body: reorderSectionsSchema }),controller.reorderPromotionalSections);
homepageRouter.post(["/api/homepage/sections/reorder","/homepage/sections/reorder","/api/homepage/promotional-sections/reorder","/homepage/promotional-sections/reorder",],optionalAuthenticate,validate({ body: reorderSectionsSchema }),controller.reorderPromotionalSections);
homepageRouter.post(["/api/homepage/promotional-sections","/homepage/promotional-sections","/api/homepage/sections","/homepage/sections",],optionalAuthenticate,validate({ body: createSectionSchema }),controller.createPromotionalSection);
homepageRouter.get(["/api/homepage/promotional-sections/:id","/homepage/promotional-sections/:id","/api/homepage/sections/:id","/homepage/sections/:id",],optionalAuthenticate,controller.getPromotionalSectionById);
homepageRouter.put(["/api/homepage/promotional-sections/:id","/homepage/promotional-sections/:id","/api/homepage/sections/:id","/homepage/sections/:id",],optionalAuthenticate,validate({ body: updateSectionSchema }), controller.updatePromotionalSection);
homepageRouter.patch(["/api/homepage/promotional-sections/:id","/homepage/promotional-sections/:id","/api/homepage/sections/:id","/homepage/sections/:id",],optionalAuthenticate,validate({ body: updateSectionSchema }),controller.updatePromotionalSection);
homepageRouter.delete(["/api/homepage/promotional-sections/:id","/homepage/promotional-sections/:id","/api/homepage/sections/:id","/homepage/sections/:id",],optionalAuthenticate,controller.deletePromotionalSection);
