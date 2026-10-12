import { Router, type Request, type Response } from "express";
import { HomepageBannerRecord, FeaturedPhoneRecord, NewArrivalRecord, BestSellerRecord, PromotionalSectionRecord, homepageBannersStore, featuredPhonesStore, newArrivalsStore, bestSellersStore, promotionalSectionsStore } from "./content.data";

export const contentRouter = Router();

// --- Banners API ---
contentRouter.get("/api/content/banners", (_req: Request, res: Response) => {
  const sorted = [...homepageBannersStore].sort((a, b) => a.displayOrder - b.displayOrder);
  res.json(sorted);
});

contentRouter.post("/api/content/banners", (req: Request, res: Response) => {
  const body = req.body || {};
  if (!body.title) {
    res.status(400).json({ error: "Banner title is required" });
    return;
  }
  const now = new Date().toISOString();
  const newBanner: HomepageBannerRecord = {
    id: `banner-${Date.now().toString(36)}`,
    title: String(body.title).trim(),
    subtitle: String(body.subtitle || "").trim(),
    badge: String(body.badge || "Featured").trim(),
    primaryCta: body.primaryCta || { label: "Learn More", url: "/products" },
    secondaryCta: body.secondaryCta,
    imageUrl: String(body.imageUrl || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80"),
    gradientOverlay: String(body.gradientOverlay || "from-indigo-950/95 via-slate-900/80 to-transparent"),
    alignment: body.alignment || "left",
    displayOrder: Number(body.displayOrder) || homepageBannersStore.length + 1,
    status: body.status || "active",
    startDate: body.startDate || now,
    endDate: body.endDate || null,
    impressions: 0,
    clicks: 0,
    ctr: 0.0,
    createdAt: now,
    updatedAt: now,
  };
  homepageBannersStore.push(newBanner);
  res.status(201).json(newBanner);
});

contentRouter.put("/api/content/banners/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const index = homepageBannersStore.findIndex((b) => b.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Banner not found" });
    return;
  }
  const current = homepageBannersStore[index]!;
  const body = req.body || {};
  const updated: HomepageBannerRecord = {
    ...current,
    title: body.title !== undefined ? String(body.title).trim() : current.title,
    subtitle: body.subtitle !== undefined ? String(body.subtitle).trim() : current.subtitle,
    badge: body.badge !== undefined ? String(body.badge).trim() : current.badge,
    primaryCta: body.primaryCta || current.primaryCta,
    secondaryCta: body.secondaryCta !== undefined ? body.secondaryCta : current.secondaryCta,
    imageUrl: body.imageUrl || current.imageUrl,
    gradientOverlay: body.gradientOverlay || current.gradientOverlay,
    alignment: body.alignment || current.alignment,
    displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : current.displayOrder,
    status: body.status || current.status,
    startDate: body.startDate || current.startDate,
    endDate: body.endDate !== undefined ? body.endDate : current.endDate,
    updatedAt: new Date().toISOString(),
  };
  homepageBannersStore[index] = updated;
  res.json(updated);
});

contentRouter.delete("/api/content/banners/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const index = homepageBannersStore.findIndex((b) => b.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Banner not found" });
    return;
  }
  const [deleted] = homepageBannersStore.splice(index, 1);
  res.json({ message: "Banner deleted", banner: deleted });
});

// --- Featured Phones API ---
contentRouter.get("/api/content/featured", (_req: Request, res: Response) => {
  const sorted = [...featuredPhonesStore].sort((a, b) => a.displayOrder - b.displayOrder);
  res.json(sorted);
});

contentRouter.post("/api/content/featured", (req: Request, res: Response) => {
  const body = req.body || {};
  const now = new Date().toISOString();
  const newFeatured: FeaturedPhoneRecord = {
    id: `feat-${Date.now().toString(36)}`,
    productId: String(body.productId || "p1"),
    productName: String(body.productName || "NexPhone Pro"),
    productSubtitle: String(body.productSubtitle || "Featured Flagship"),
    productPrice: Number(body.productPrice) || 1199,
    productImage: String(body.productImage || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80"),
    series: String(body.series || "Pro Series"),
    badge: String(body.badge || "Featured").trim(),
    headline: String(body.headline || "Enterprise grade smartphone").trim(),
    displayOrder: Number(body.displayOrder) || featuredPhonesStore.length + 1,
    status: body.status || "active",
    rating: Number(body.rating) || 4.8,
    highlightSpecs: Array.isArray(body.highlightSpecs) ? body.highlightSpecs : ["Satellite VoIP", "Titanium Frame"],
    createdAt: now,
    updatedAt: now,
  };
  featuredPhonesStore.push(newFeatured);
  res.status(201).json(newFeatured);
});

contentRouter.put("/api/content/featured/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const index = featuredPhonesStore.findIndex((f) => f.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Featured phone entry not found" });
    return;
  }
  const current = featuredPhonesStore[index]!;
  const body = req.body || {};
  const updated: FeaturedPhoneRecord = {
    ...current,
    badge: body.badge !== undefined ? String(body.badge).trim() : current.badge,
    headline: body.headline !== undefined ? String(body.headline).trim() : current.headline,
    displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : current.displayOrder,
    status: body.status || current.status,
    highlightSpecs: Array.isArray(body.highlightSpecs) ? body.highlightSpecs : current.highlightSpecs,
    updatedAt: new Date().toISOString(),
  };
  featuredPhonesStore[index] = updated;
  res.json(updated);
});

contentRouter.delete("/api/content/featured/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const index = featuredPhonesStore.findIndex((f) => f.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Featured phone entry not found" });
    return;
  }
  const [deleted] = featuredPhonesStore.splice(index, 1);
  res.json({ message: "Featured phone removed", item: deleted });
});

// --- New Arrivals API ---
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
    productImage: String(body.productImage || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80"),
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

// --- Best Sellers API ---
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
    productImage: String(body.productImage || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80"),
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

// --- Promotional Sections API ---
contentRouter.get("/api/content/promo-sections", (_req: Request, res: Response) => {
  const sorted = [...promotionalSectionsStore].sort((a, b) => a.displayOrder - b.displayOrder);
  res.json(sorted);
});

contentRouter.post("/api/content/promo-sections", (req: Request, res: Response) => {
  const body = req.body || {};
  const now = new Date().toISOString();
  const newSection: PromotionalSectionRecord = {
    id: `sec-${Date.now().toString(36)}`,
    sectionKey: String(body.sectionKey || `section_${Date.now().toString(36)}`),
    title: String(body.title || "Promotional Block"),
    subtitle: String(body.subtitle || ""),
    type: body.type || "split_banner",
    ctaLabel: String(body.ctaLabel || "Learn More"),
    ctaUrl: String(body.ctaUrl || "/products"),
    imageUrl: body.imageUrl,
    accentColor: body.accentColor || "indigo",
    displayOrder: Number(body.displayOrder) || promotionalSectionsStore.length + 1,
    status: body.status || "active",
    features: Array.isArray(body.features) ? body.features : [],
    createdAt: now,
    updatedAt: now,
  };
  promotionalSectionsStore.push(newSection);
  res.status(201).json(newSection);
});

contentRouter.put("/api/content/promo-sections/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const index = promotionalSectionsStore.findIndex((s) => s.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Promotional section not found" });
    return;
  }
  const current = promotionalSectionsStore[index]!;
  const body = req.body || {};
  const updated: PromotionalSectionRecord = {
    ...current,
    title: body.title !== undefined ? String(body.title).trim() : current.title,
    subtitle: body.subtitle !== undefined ? String(body.subtitle).trim() : current.subtitle,
    ctaLabel: body.ctaLabel !== undefined ? String(body.ctaLabel).trim() : current.ctaLabel,
    ctaUrl: body.ctaUrl !== undefined ? String(body.ctaUrl).trim() : current.ctaUrl,
    accentColor: body.accentColor || current.accentColor,
    displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : current.displayOrder,
    status: body.status || current.status,
    updatedAt: new Date().toISOString(),
  };
  promotionalSectionsStore[index] = updated;
  res.json(updated);
});

contentRouter.delete("/api/content/promo-sections/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const index = promotionalSectionsStore.findIndex((s) => s.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Promotional section not found" });
    return;
  }
  const [deleted] = promotionalSectionsStore.splice(index, 1);
  res.json({ message: "Promotional section removed", item: deleted });
});

// --- Content Summary Metrics API ---
contentRouter.get("/api/content/metrics", (_req: Request, res: Response) => {
  const activeBanners = homepageBannersStore.filter((b) => b.status === "active").length;
  const totalBanners = homepageBannersStore.length;
  const featuredPhonesCount = featuredPhonesStore.filter((f) => f.status === "active").length;
  const newArrivalsCount = newArrivalsStore.filter((n) => n.status === "active").length;
  const bestSellersCount = bestSellersStore.filter((b) => b.status === "active").length;
  const activePromoSections = promotionalSectionsStore.filter((p) => p.status === "active").length;

  const totalBannerImpressions = homepageBannersStore.reduce((acc, b) => acc + (b.impressions || 0), 0);
  const totalBannerClicks = homepageBannersStore.reduce((acc, b) => acc + (b.clicks || 0), 0);
  const avgCtr =
    totalBannerImpressions > 0
      ? Number(((totalBannerClicks / totalBannerImpressions) * 100).toFixed(1))
      : 0;

  res.json({
    activeBanners,
    totalBanners,
    featuredPhonesCount,
    newArrivalsCount,
    bestSellersCount,
    activePromoSections,
    totalBannerImpressions,
    totalBannerClicks,
    avgCtr,
  });
});
