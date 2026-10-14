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
  createNewArrivalSchema,
  updateNewArrivalSchema,
  createBestSellerSchema,
  updateBestSellerSchema,
} from "../validators/homepage.validator";
import * as controller from "../controllers/homepage.controller";

export const contentRouter = Router();

// ==========================================
// 1. Composite Homepage Payload
// ==========================================
contentRouter.get(["/api/content/homepage", "/api/homepage", "/homepage", "/content/homepage"], optionalAuthenticate, controller.getHomepageOverview);

// ==========================================
// 2. Homepage Banners API
// ==========================================
contentRouter.get(["/api/content/banners", "/api/homepage/banners", "/api/banners", "/banners"], optionalAuthenticate, validate({ query: queryBannerSchema }), controller.getBanners);
contentRouter.post(["/api/content/banners", "/api/homepage/banners", "/api/banners", "/banners"], optionalAuthenticate, validate({ body: createBannerSchema }), controller.createBanner);
contentRouter.get(["/api/content/banners/:id", "/api/homepage/banners/:id", "/api/banners/:id", "/banners/:id"], optionalAuthenticate, controller.getBannerById);
contentRouter.put(["/api/content/banners/:id", "/api/homepage/banners/:id", "/api/banners/:id", "/banners/:id"], optionalAuthenticate, validate({ body: updateBannerSchema }), controller.updateBanner);
contentRouter.patch(["/api/content/banners/:id", "/api/homepage/banners/:id", "/api/banners/:id", "/banners/:id"], optionalAuthenticate, validate({ body: updateBannerSchema }), controller.updateBanner);
contentRouter.delete(["/api/content/banners/:id", "/api/homepage/banners/:id", "/api/banners/:id", "/banners/:id"], optionalAuthenticate, controller.deleteBanner);

// ==========================================
// 3. Featured Products API
// ==========================================
contentRouter.get(["/api/content/featured", "/api/homepage/featured-products", "/api/homepage/featured", "/api/products/featured", "/homepage/featured", "/products/featured"], optionalAuthenticate, validate({ query: queryFeaturedProductsSchema }), controller.getFeaturedProducts);
contentRouter.post(["/api/content/featured", "/api/homepage/featured-products", "/api/homepage/featured", "/homepage/featured"], optionalAuthenticate, validate({ body: createFeaturedProductSchema }), controller.createFeaturedProduct);
contentRouter.put(["/api/content/featured/:id", "/api/homepage/featured-products/:id", "/api/homepage/featured/:id", "/homepage/featured/:id"], optionalAuthenticate, validate({ body: updateFeaturedProductSchema }), controller.updateFeaturedProduct);
contentRouter.patch(["/api/content/featured/:id", "/api/homepage/featured-products/:id", "/api/homepage/featured/:id", "/homepage/featured/:id"], optionalAuthenticate, validate({ body: updateFeaturedProductSchema }), controller.updateFeaturedProduct);
contentRouter.delete(["/api/content/featured/:id", "/api/homepage/featured-products/:id", "/api/homepage/featured/:id", "/homepage/featured/:id"], optionalAuthenticate, controller.deleteFeaturedProduct);

// ==========================================
// 4. Promotional Sections API
// ==========================================
contentRouter.get(["/api/content/promo-sections", "/api/homepage/promotional-sections", "/api/homepage/sections", "/homepage/sections"], optionalAuthenticate, validate({ query: querySectionSchema }), controller.getPromotionalSections);
contentRouter.put(["/api/content/promo-sections/reorder", "/api/homepage/sections/reorder", "/api/homepage/promotional-sections/reorder", "/homepage/sections/reorder"], optionalAuthenticate, validate({ body: reorderSectionsSchema }), controller.reorderPromotionalSections);
contentRouter.post(["/api/content/promo-sections/reorder", "/api/homepage/sections/reorder", "/api/homepage/promotional-sections/reorder", "/homepage/sections/reorder"], optionalAuthenticate, validate({ body: reorderSectionsSchema }), controller.reorderPromotionalSections);
contentRouter.post(["/api/content/promo-sections", "/api/homepage/promotional-sections", "/api/homepage/sections", "/homepage/sections"], optionalAuthenticate, validate({ body: createSectionSchema }), controller.createPromotionalSection);
contentRouter.get(["/api/content/promo-sections/:id", "/api/homepage/promotional-sections/:id", "/api/homepage/sections/:id", "/homepage/sections/:id"], optionalAuthenticate, controller.getPromotionalSectionById);
contentRouter.put(["/api/content/promo-sections/:id", "/api/homepage/promotional-sections/:id", "/api/homepage/sections/:id", "/homepage/sections/:id",], optionalAuthenticate, validate({ body: updateSectionSchema }), controller.updatePromotionalSection);
contentRouter.patch(["/api/content/promo-sections/:id", "/api/homepage/promotional-sections/:id", "/api/homepage/sections/:id", "/homepage/sections/:id",], optionalAuthenticate, validate({ body: updateSectionSchema }), controller.updatePromotionalSection);
contentRouter.delete(["/api/content/promo-sections/:id", "/api/homepage/promotional-sections/:id", "/api/homepage/sections/:id", "/homepage/sections/:id",], optionalAuthenticate, controller.deletePromotionalSection);

// ==========================================
// 5. Storefront: New Arrivals
// ==========================================
contentRouter.get(["/api/content/new-arrivals", "/api/homepage/new-arrivals", "/api/new-arrivals"], optionalAuthenticate, controller.getNewArrivals);
contentRouter.get(["/api/content/new-arrivals/:id", "/api/homepage/new-arrivals/:id", "/api/new-arrivals/:id"], optionalAuthenticate, controller.getNewArrivalById);
contentRouter.post(["/api/content/new-arrivals", "/api/homepage/new-arrivals", "/api/new-arrivals"], optionalAuthenticate, validate({ body: createNewArrivalSchema }), controller.createNewArrival);
contentRouter.put(["/api/content/new-arrivals/:id", "/api/homepage/new-arrivals/:id", "/api/new-arrivals/:id"], optionalAuthenticate, validate({ body: updateNewArrivalSchema }), controller.updateNewArrival);
contentRouter.patch(["/api/content/new-arrivals/:id", "/api/homepage/new-arrivals/:id", "/api/new-arrivals/:id"], optionalAuthenticate, validate({ body: updateNewArrivalSchema }), controller.updateNewArrival);
contentRouter.delete(["/api/content/new-arrivals/:id", "/api/homepage/new-arrivals/:id", "/api/new-arrivals/:id"], optionalAuthenticate, controller.deleteNewArrival);

// ==========================================
// 6. Storefront: Best Sellers
// ==========================================
contentRouter.get(["/api/content/best-sellers", "/api/homepage/best-sellers", "/api/best-sellers"], optionalAuthenticate, controller.getBestSellers);
contentRouter.get(["/api/content/best-sellers/:id", "/api/homepage/best-sellers/:id", "/api/best-sellers/:id"], optionalAuthenticate, controller.getBestSellerById);
contentRouter.post(["/api/content/best-sellers", "/api/homepage/best-sellers", "/api/best-sellers"], optionalAuthenticate, validate({ body: createBestSellerSchema }), controller.createBestSeller);
contentRouter.put(["/api/content/best-sellers/:id", "/api/homepage/best-sellers/:id", "/api/best-sellers/:id"], optionalAuthenticate, validate({ body: updateBestSellerSchema }), controller.updateBestSeller);
contentRouter.patch(["/api/content/best-sellers/:id", "/api/homepage/best-sellers/:id", "/api/best-sellers/:id"], optionalAuthenticate, validate({ body: updateBestSellerSchema }), controller.updateBestSeller);
contentRouter.delete(["/api/content/best-sellers/:id", "/api/homepage/best-sellers/:id", "/api/best-sellers/:id"], optionalAuthenticate, controller.deleteBestSeller);

// ==========================================
// 7. Content Summary Metrics API
// ==========================================
contentRouter.get(["/api/content/metrics", "/api/homepage/metrics"], optionalAuthenticate, controller.getContentMetrics);
