import { Router, type Request, type Response } from "express";
import { PromotionRecord, promotionsStore } from "../data/promotions.data";

export const promotionsRouter = Router();

// GET /api/promotions
promotionsRouter.get("/api/promotions", (req: Request, res: Response) => {
  const { search, type, status, sortBy } = req.query;
  let result = [...promotionsStore];

  if (typeof search === "string" && search.trim()) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q) ||
        (p.campaignTag && p.campaignTag.toLowerCase().includes(q)) ||
        (p.targetItems && p.targetItems.some((t) => t.toLowerCase().includes(q)))
    );
  }

  if (typeof type === "string" && type !== "all") {
    result = result.filter((p) => p.type === type);
  }

  if (typeof status === "string" && status !== "all") {
    result = result.filter((p) => p.status === status);
  }

  if (sortBy === "highest_discount") {
    result.sort((a, b) => b.discountValue - a.discountValue);
  } else if (sortBy === "most_used") {
    result.sort((a, b) => b.usedCount - a.usedCount);
  } else if (sortBy === "revenue_desc") {
    result.sort((a, b) => b.revenueGenerated - a.revenueGenerated);
  } else if (sortBy === "ending_soon") {
    result.sort((a, b) => {
      if (!a.endDate) return 1;
      if (!b.endDate) return -1;
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    });
  } else {
    // Default: recent
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(result);
});

// GET /api/promotions/:id
promotionsRouter.get("/api/promotions/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const idUpper = id.toUpperCase();
  const promo = promotionsStore.find((p) => p.id === id || (p.code && p.code.toUpperCase() === idUpper));
  if (!promo) {
    res.status(404).json({ error: "Promotion not found" });
    return;
  }
  res.json(promo);
});

// POST /api/promotions (Create discount/promo code/sale campaign)
promotionsRouter.post("/api/promotions", (req: Request, res: Response) => {
  const body = req.body || {};
  if (!body.title || !body.discountType) {
    res.status(400).json({ error: "Title and discountType are required fields" });
    return;
  }

  // Format code if promo_code
  let formattedCode: string | undefined = undefined;
  if (body.type === "promo_code" || body.code) {
    formattedCode = String(body.code || `NEX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`).trim().toUpperCase();
    const existing = promotionsStore.find((p) => p.code === formattedCode);
    if (existing) {
      res.status(409).json({ error: `Promo code "${formattedCode}" already exists. Please choose a unique code.` });
      return;
    }
  }

  const now = new Date().toISOString();
  const newId = `promo-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;

  const newPromo: PromotionRecord = {
    id: newId,
    code: formattedCode,
    title: String(body.title).trim(),
    description: String(body.description || "Active promotion").trim(),
    type: body.type || (formattedCode ? "promo_code" : "sale_campaign"),
    discountType: body.discountType,
    discountValue: Number(body.discountValue) || 0,
    minOrderValue: body.minOrderValue ? Number(body.minOrderValue) : undefined,
    maxDiscountAmount: body.maxDiscountAmount ? Number(body.maxDiscountAmount) : undefined,
    scope: body.scope || "all_products",
    targetItems: Array.isArray(body.targetItems) ? body.targetItems : (body.targetItems ? [body.targetItems] : ["All Products"]),
    status: body.status || "active",
    startDate: body.startDate || now,
    endDate: body.endDate || null,
    usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
    usedCount: 0,
    customerLimit: body.customerLimit ? Number(body.customerLimit) : 1,
    campaignTag: body.campaignTag || (body.type === "sale_campaign" ? "Sale Campaign" : "Promo Code"),
    bannerColor: body.bannerColor || "indigo",
    revenueGenerated: 0,
    ordersCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  promotionsStore.unshift(newPromo);
  res.status(201).json(newPromo);
});

// PUT /api/promotions/:id (Edit discount)
promotionsRouter.put("/api/promotions/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const idUpper = id.toUpperCase();
  const index = promotionsStore.findIndex((p) => p.id === id || (p.code && p.code.toUpperCase() === idUpper));
  if (index === -1) {
    res.status(404).json({ error: "Promotion not found" });
    return;
  }

  const current = promotionsStore[index]!;
  const body = req.body || {};

  // Check code uniqueness if changing code
  if (body.code && body.code.toUpperCase() !== current.code) {
    const newCode = body.code.toUpperCase().trim();
    const existing = promotionsStore.find((p) => p.code === newCode && p.id !== current.id);
    if (existing) {
      res.status(409).json({ error: `Promo code "${newCode}" already in use by another promotion.` });
      return;
    }
  }

  const updated: PromotionRecord = {
    ...current,
    title: body.title !== undefined ? String(body.title).trim() : current.title,
    code: body.code !== undefined ? (body.code ? String(body.code).trim().toUpperCase() : undefined) : current.code,
    description: body.description !== undefined ? String(body.description).trim() : current.description,
    type: body.type || current.type,
    discountType: body.discountType || current.discountType,
    discountValue: body.discountValue !== undefined ? Number(body.discountValue) : current.discountValue,
    minOrderValue: body.minOrderValue !== undefined ? Number(body.minOrderValue) : current.minOrderValue,
    maxDiscountAmount: body.maxDiscountAmount !== undefined ? Number(body.maxDiscountAmount) : current.maxDiscountAmount,
    scope: body.scope || current.scope,
    targetItems: body.targetItems !== undefined ? (Array.isArray(body.targetItems) ? body.targetItems : [body.targetItems]) : current.targetItems,
    status: body.status || current.status,
    startDate: body.startDate || current.startDate,
    endDate: body.endDate !== undefined ? body.endDate : current.endDate,
    usageLimit: body.usageLimit !== undefined ? (body.usageLimit ? Number(body.usageLimit) : null) : current.usageLimit,
    customerLimit: body.customerLimit !== undefined ? Number(body.customerLimit) : current.customerLimit,
    campaignTag: body.campaignTag !== undefined ? String(body.campaignTag).trim() : current.campaignTag,
    bannerColor: body.bannerColor || current.bannerColor,
    updatedAt: new Date().toISOString(),
  };

  promotionsStore[index] = updated;
  res.json(updated);
});

// DELETE /api/promotions/:id (Delete discount)
promotionsRouter.delete("/api/promotions/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const idUpper = id.toUpperCase();
  const index = promotionsStore.findIndex((p) => p.id === id || (p.code && p.code.toUpperCase() === idUpper));
  if (index === -1) {
    res.status(404).json({ error: "Promotion not found" });
    return;
  }

  const [deleted] = promotionsStore.splice(index, 1);
  res.json({ message: "Promotion removed successfully", promotion: deleted });
});

// PATCH /api/promotions/:id/status (Toggle active/disabled/scheduled)
promotionsRouter.patch("/api/promotions/:id/status", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const idUpper = id.toUpperCase();
  const { status } = req.body || {};
  const index = promotionsStore.findIndex((p) => p.id === id || (p.code && p.code.toUpperCase() === idUpper));
  if (index === -1) {
    res.status(404).json({ error: "Promotion not found" });
    return;
  }

  if (!["active", "scheduled", "expired", "disabled"].includes(status)) {
    res.status(400).json({ error: "Invalid status value" });
    return;
  }

  promotionsStore[index] = {
    ...promotionsStore[index]!,
    status,
    updatedAt: new Date().toISOString(),
  };

  res.json(promotionsStore[index]);
});

// GET /api/promotions-metrics
promotionsRouter.get("/api/promotions-metrics", (_req: Request, res: Response) => {
  const totalPromotions = promotionsStore.length;
  const activePromotions = promotionsStore.filter((p) => p.status === "active").length;
  const scheduledCampaigns = promotionsStore.filter((p) => p.status === "scheduled").length;
  const expiredPromotions = promotionsStore.filter((p) => p.status === "expired").length;

  const totalRedemptions = promotionsStore.reduce((acc, p) => acc + (p.usedCount || 0), 0);
  const totalRevenueGenerated = promotionsStore.reduce((acc, p) => acc + (p.revenueGenerated || 0), 0);

  // Calculate approximate discount given
  const totalDiscountGiven = promotionsStore.reduce((acc, p) => {
    if (p.discountType === "fixed_amount") {
      return acc + p.discountValue * (p.usedCount || 0);
    } else if (p.discountType === "percentage") {
      // average ~15% on attributed sales
      return acc + Math.round((p.revenueGenerated || 0) * (p.discountValue / 100));
    } else {
      // free shipping (~$35 saved per order)
      return acc + (p.usedCount || 0) * 35;
    }
  }, 0);

  const activePromoCodesCount = promotionsStore.filter(
    (p) => p.type === "promo_code" && p.status === "active"
  ).length;

  res.json({
    totalPromotions,
    activePromotions,
    scheduledCampaigns,
    expiredPromotions,
    totalRedemptions,
    totalDiscountGiven,
    totalRevenueGenerated,
    activePromoCodesCount,
  });
});
