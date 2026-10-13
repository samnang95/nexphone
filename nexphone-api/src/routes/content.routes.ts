import { Router, type Request, type Response } from "express";
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
import {
  NewArrivalRecord,
  BestSellerRecord,
  newArrivalsStore,
  bestSellersStore,
} from "../data/content.data";

export const contentRouter = Router();

// ==========================================
// 1. Composite Homepage Payload
// ==========================================
contentRouter.get(["/api/content/homepage", "/api/homepage"], optionalAuthenticate, controller.getHomepageOverview);

// ==========================================
// 2. Homepage Banners API
// ==========================================
contentRouter.get(["/api/content/banners", "/api/homepage/banners", "/api/banners"], optionalAuthenticate, validate({ query: queryBannerSchema }), controller.getBanners);
contentRouter.post(["/api/content/banners", "/api/homepage/banners", "/api/banners"], optionalAuthenticate, validate({ body: createBannerSchema }), controller.createBanner);
contentRouter.get(["/api/content/banners/:id", "/api/homepage/banners/:id", "/api/banners/:id"], optionalAuthenticate, controller.getBannerById);
contentRouter.put(["/api/content/banners/:id", "/api/homepage/banners/:id", "/api/banners/:id"], optionalAuthenticate, validate({ body: updateBannerSchema }), controller.updateBanner);
contentRouter.patch(["/api/content/banners/:id", "/api/homepage/banners/:id", "/api/banners/:id"], optionalAuthenticate, validate({ body: updateBannerSchema }), controller.updateBanner);
contentRouter.delete(["/api/content/banners/:id", "/api/homepage/banners/:id", "/api/banners/:id"], optionalAuthenticate, controller.deleteBanner);

// ==========================================
// 3. Featured Products API
// ==========================================
contentRouter.get(
  [
    "/api/content/featured",
    "/api/homepage/featured-products",
    "/api/homepage/featured",
    "/api/products/featured",
  ],
  optionalAuthenticate,
  validate({ query: queryFeaturedProductsSchema }),
  controller.getFeaturedProducts
);

contentRouter.post(
  [
    "/api/content/featured",
    "/api/homepage/featured-products",
    "/api/homepage/featured",
  ],
  optionalAuthenticate,
  validate({ body: createFeaturedProductSchema }),
  controller.createFeaturedProduct
);

contentRouter.put(
  [
    "/api/content/featured/:id",
    "/api/homepage/featured-products/:id",
    "/api/homepage/featured/:id",
  ],
  optionalAuthenticate,
  validate({ body: updateFeaturedProductSchema }),
  controller.updateFeaturedProduct
);

contentRouter.patch(
  [
    "/api/content/featured/:id",
    "/api/homepage/featured-products/:id",
    "/api/homepage/featured/:id",
  ],
  optionalAuthenticate,
  validate({ body: updateFeaturedProductSchema }),
  controller.updateFeaturedProduct
);

contentRouter.delete(
  [
    "/api/content/featured/:id",
    "/api/homepage/featured-products/:id",
    "/api/homepage/featured/:id",
  ],
  optionalAuthenticate,
  controller.deleteFeaturedProduct
);

// ==========================================
// 4. Promotional Sections API
// ==========================================
contentRouter.get(
  [
    "/api/content/promo-sections",
    "/api/homepage/promotional-sections",
    "/api/homepage/sections",
  ],
  optionalAuthenticate,
  validate({ query: querySectionSchema }),
  controller.getPromotionalSections
);

contentRouter.put(
  [
    "/api/content/promo-sections/reorder",
    "/api/homepage/sections/reorder",
    "/api/homepage/promotional-sections/reorder",
  ],
  optionalAuthenticate,
  validate({ body: reorderSectionsSchema }),
  controller.reorderPromotionalSections
);

contentRouter.post(
  [
    "/api/content/promo-sections/reorder",
    "/api/homepage/sections/reorder",
    "/api/homepage/promotional-sections/reorder",
  ],
  optionalAuthenticate,
  validate({ body: reorderSectionsSchema }),
  controller.reorderPromotionalSections
);

contentRouter.post(
  [
    "/api/content/promo-sections",
    "/api/homepage/promotional-sections",
    "/api/homepage/sections",
  ],
  optionalAuthenticate,
  validate({ body: createSectionSchema }),
  controller.createPromotionalSection
);

contentRouter.get(
  [
    "/api/content/promo-sections/:id",
    "/api/homepage/promotional-sections/:id",
    "/api/homepage/sections/:id",
  ],
  optionalAuthenticate,
  controller.getPromotionalSectionById
);

contentRouter.put(
  [
    "/api/content/promo-sections/:id",
    "/api/homepage/promotional-sections/:id",
    "/api/homepage/sections/:id",
  ],
  optionalAuthenticate,
  validate({ body: updateSectionSchema }),
  controller.updatePromotionalSection
);

contentRouter.patch(
  [
    "/api/content/promo-sections/:id",
    "/api/homepage/promotional-sections/:id",
    "/api/homepage/sections/:id",
  ],
  optionalAuthenticate,
  validate({ body: updateSectionSchema }),
  controller.updatePromotionalSection
);

contentRouter.delete(
  [
    "/api/content/promo-sections/:id",
    "/api/homepage/promotional-sections/:id",
    "/api/homepage/sections/:id",
  ],
  optionalAuthenticate,
  controller.deletePromotionalSection
);

// ==========================================
// 5. Ancillary: New Arrivals & Best Sellers (Storefront)
// ==========================================
contentRouter.get("/api/content/new-arrivals", (_req: Request, res: Response) => {
  const sorted = [...newArrivalsStore].sort((a, b) => a.displayOrder - b.displayOrder);
  res.json(sorted);
});

contentRouter.post("/api/content/new-arrivals", (req: Request, res: Response) => {
  const body = req.body || {};
  const now = new Date().toISOString();
  const newArrival: NewArrivalRecord = {
    id: `new-${Date.now().toString(36)}`,
    productId: String(body.productId || "p1"),
    productName: String(body.productName || "New Release"),
    productSubtitle: String(body.productSubtitle || "Latest Hardware Drop"),
    productPrice: Number(body.productPrice) || 999,
    productImage: String(
      body.productImage ||
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80"
    ),
    series: String(body.series || "Pro Series"),
    releaseDate: body.releaseDate || now,
    tag: String(body.tag || "Just Dropped").trim(),
    isPreOrder: Boolean(body.isPreOrder),
    displayOrder: Number(body.displayOrder) || newArrivalsStore.length + 1,
    status: body.status || "active",
    initialStock: Number(body.initialStock) || 500,
    createdAt: now,
    updatedAt: now,
  };
  newArrivalsStore.push(newArrival);
  res.status(201).json(newArrival);
});

contentRouter.put("/api/content/new-arrivals/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const index = newArrivalsStore.findIndex((n) => n.id === id);
  if (index === -1) {
    res.status(404).json({ error: "New arrival not found" });
    return;
  }
  const current = newArrivalsStore[index]!;
  const body = req.body || {};
  const updated: NewArrivalRecord = {
    ...current,
    tag: body.tag !== undefined ? String(body.tag).trim() : current.tag,
    isPreOrder: body.isPreOrder !== undefined ? Boolean(body.isPreOrder) : current.isPreOrder,
    displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : current.displayOrder,
    status: body.status || current.status,
    updatedAt: new Date().toISOString(),
  };
  newArrivalsStore[index] = updated;
  res.json(updated);
});

contentRouter.delete("/api/content/new-arrivals/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const index = newArrivalsStore.findIndex((n) => n.id === id);
  if (index === -1) {
    res.status(404).json({ error: "New arrival not found" });
    return;
  }
  const [deleted] = newArrivalsStore.splice(index, 1);
  res.json({ message: "New arrival removed", item: deleted });
});

contentRouter.get("/api/content/best-sellers", (_req: Request, res: Response) => {
  const sorted = [...bestSellersStore].sort((a, b) => a.rank - b.rank);
  res.json(sorted);
});

contentRouter.post("/api/content/best-sellers", (req: Request, res: Response) => {
  const body = req.body || {};
  const now = new Date().toISOString();
  const newBestSeller: BestSellerRecord = {
    id: `best-${Date.now().toString(36)}`,
    productId: String(body.productId || "p1"),
    productName: String(body.productName || "Best Selling Model"),
    productSubtitle: String(body.productSubtitle || "Top Volume Device"),
    productPrice: Number(body.productPrice) || 1299,
    productImage: String(
      body.productImage ||
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80"
    ),
    series: String(body.series || "Pro Series"),
    rank: Number(body.rank) || bestSellersStore.length + 1,
    unitsSold: Number(body.unitsSold) || 10000,
    badge: String(body.badge || "Top Seller").trim(),
    satisfactionRate: Number(body.satisfactionRate) || 98.5,
    monthlyGrowth: Number(body.monthlyGrowth) || 12.0,
    status: body.status || "active",
    createdAt: now,
    updatedAt: now,
  };
  bestSellersStore.push(newBestSeller);
  res.status(201).json(newBestSeller);
});

contentRouter.put("/api/content/best-sellers/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const index = bestSellersStore.findIndex((b) => b.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Best seller not found" });
    return;
  }
  const current = bestSellersStore[index]!;
  const body = req.body || {};
  const updated: BestSellerRecord = {
    ...current,
    rank: body.rank !== undefined ? Number(body.rank) : current.rank,
    badge: body.badge !== undefined ? String(body.badge).trim() : current.badge,
    unitsSold: body.unitsSold !== undefined ? Number(body.unitsSold) : current.unitsSold,
    status: body.status || current.status,
    updatedAt: new Date().toISOString(),
  };
  bestSellersStore[index] = updated;
  res.json(updated);
});

contentRouter.delete("/api/content/best-sellers/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const index = bestSellersStore.findIndex((b) => b.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Best seller not found" });
    return;
  }
  const [deleted] = bestSellersStore.splice(index, 1);
  res.json({ message: "Best seller removed", item: deleted });
});

// ==========================================
// 6. Content Summary Metrics API
// ==========================================
contentRouter.get(
  ["/api/content/metrics", "/api/homepage/metrics"],
  optionalAuthenticate,
  controller.getContentMetrics
);
