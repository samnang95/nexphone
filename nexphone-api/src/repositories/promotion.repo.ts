import { Promotion, type PromotionDocument, type PromotionStatus, type PromotionType } from "../models/promotion.model";
import { PromotionRecord, promotionsStore } from "../data/promotions.data";
import { isDatabaseConnected } from "../config/database";

export interface PromotionQueryFilters {
  status?: string;
  type?: string;
  scope?: string;
  search?: string;
  campaignTag?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

let seeded = false;
export async function ensurePromotionsSeeded(): Promise<void> {
  if (seeded || !isDatabaseConnected()) return;
  try {
    const count = await Promotion.countDocuments();
    if (count === 0) {
      await Promotion.insertMany(promotionsStore);
      console.log(`🎟️  [Promotions Repo] Auto-seeded ${promotionsStore.length} promotions to MongoDB.`);
    }
    seeded = true;
  } catch (error) {
    console.warn("⚠️  [Promotions Repo] Could not auto-seed promotions to MongoDB:", (error as Error).message);
  }
}

export const promotionRepository = {
  async find(
    filters: PromotionQueryFilters = {},
    sortBy: string = "recent",
    pagination?: PaginationOptions
  ): Promise<{ promotions: any[]; total: number }> {
    await ensurePromotionsSeeded();

    if (isDatabaseConnected()) {
      return this.findMongo(filters, sortBy, pagination);
    }
    return this.findInMemory(filters, sortBy, pagination);
  },

  async findActive(): Promise<any[]> {
    await ensurePromotionsSeeded();
    const now = new Date().toISOString();

    if (isDatabaseConnected()) {
      return Promotion.find({
        status: "active",
        startDate: { $lte: now },
        $or: [{ endDate: null }, { endDate: { $gte: now } }],
      }).lean();
    }

    return promotionsStore.filter((p) => {
      if (p.status !== "active") return false;
      if (p.startDate && p.startDate > now) return false;
      if (p.endDate && p.endDate < now) return false;
      if (p.usageLimit && p.usedCount >= p.usageLimit) return false;
      return true;
    });
  },

  async findByIdOrCode(idOrCode: string): Promise<any | null> {
    await ensurePromotionsSeeded();
    const clean = idOrCode.trim();
    const upper = clean.toUpperCase();

    if (isDatabaseConnected()) {
      return Promotion.findOne({
        $or: [{ id: clean }, { code: upper }],
      }).lean();
    }

    return promotionsStore.find((p) => p.id === clean || (p.code && p.code.toUpperCase() === upper)) || null;
  },

  async findByCode(code: string): Promise<any | null> {
    await ensurePromotionsSeeded();
    const upper = code.trim().toUpperCase();

    if (isDatabaseConnected()) {
      return Promotion.findOne({ code: upper }).lean();
    }

    return promotionsStore.find((p) => p.code && p.code.toUpperCase() === upper) || null;
  },

  async create(data: Partial<PromotionRecord>): Promise<any> {
    await ensurePromotionsSeeded();
    const now = new Date().toISOString();
    const id = data.id || `promo-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;

    const newRecord: PromotionRecord = {
      id,
      code: data.code ? data.code.trim().toUpperCase() : undefined,
      title: data.title || "Promotional Campaign",
      description: data.description || "",
      type: data.type || (data.code ? "promo_code" : "sale_campaign"),
      discountType: data.discountType || "percentage",
      discountValue: Number(data.discountValue) || 0,
      minOrderValue: data.minOrderValue !== undefined ? Number(data.minOrderValue) : undefined,
      maxDiscountAmount: data.maxDiscountAmount !== undefined ? Number(data.maxDiscountAmount) : undefined,
      scope: data.scope || "all_products",
      targetItems: data.targetItems || ["All Products"],
      status: data.status || "active",
      startDate: data.startDate || now,
      endDate: data.endDate || null,
      usageLimit: data.usageLimit !== undefined ? data.usageLimit : null,
      usedCount: data.usedCount || 0,
      customerLimit: data.customerLimit || 1,
      campaignTag: data.campaignTag || (data.type === "sale_campaign" ? "Sale Campaign" : "Promo Code"),
      bannerColor: data.bannerColor || "indigo",
      revenueGenerated: data.revenueGenerated || 0,
      ordersCount: data.ordersCount || 0,
      createdAt: data.createdAt || now,
      updatedAt: now,
    };

    // Keep in-memory store synchronized
    promotionsStore.unshift(newRecord);

    if (isDatabaseConnected()) {
      const doc = await Promotion.create(newRecord);
      return doc.toObject();
    }

    return newRecord;
  },

  async update(id: string, updates: Partial<PromotionRecord>): Promise<any | null> {
    await ensurePromotionsSeeded();
    const clean = id.trim();
    const upper = clean.toUpperCase();
    const now = new Date().toISOString();

    const inMemoryIndex = promotionsStore.findIndex(
      (p) => p.id === clean || (p.code && p.code.toUpperCase() === upper)
    );

    let updatedRecord: any = null;
    if (inMemoryIndex !== -1) {
      const current = promotionsStore[inMemoryIndex]!;
      updatedRecord = {
        ...current,
        ...updates,
        code: updates.code !== undefined ? (updates.code ? updates.code.trim().toUpperCase() : undefined) : current.code,
        updatedAt: now,
      };
      promotionsStore[inMemoryIndex] = updatedRecord;
    }

    if (isDatabaseConnected()) {
      const doc = await Promotion.findOneAndUpdate(
        { $or: [{ id: clean }, { code: upper }] },
        { ...updates, updatedAt: now },
        { new: true, lean: true }
      );
      return doc || updatedRecord;
    }

    return updatedRecord;
  },

  async delete(id: string): Promise<any | null> {
    await ensurePromotionsSeeded();
    const clean = id.trim();
    const upper = clean.toUpperCase();

    const inMemoryIndex = promotionsStore.findIndex(
      (p) => p.id === clean || (p.code && p.code.toUpperCase() === upper)
    );
    let deleted: any = null;
    if (inMemoryIndex !== -1) {
      const [removed] = promotionsStore.splice(inMemoryIndex, 1);
      deleted = removed;
    }

    if (isDatabaseConnected()) {
      const doc = await Promotion.findOneAndDelete({
        $or: [{ id: clean }, { code: upper }],
      }).lean();
      return doc || deleted;
    }

    return deleted;
  },

  async incrementUsage(id: string, orderValue: number = 0, discountAmount: number = 0): Promise<void> {
    await ensurePromotionsSeeded();
    const clean = id.trim();
    const upper = clean.toUpperCase();

    const inMemory = promotionsStore.find(
      (p) => p.id === clean || (p.code && p.code.toUpperCase() === upper)
    );
    if (inMemory) {
      inMemory.usedCount = (inMemory.usedCount || 0) + 1;
      inMemory.ordersCount = (inMemory.ordersCount || 0) + 1;
      inMemory.revenueGenerated = (inMemory.revenueGenerated || 0) + orderValue;
      inMemory.updatedAt = new Date().toISOString();
    }

    if (isDatabaseConnected()) {
      await Promotion.updateOne(
        { $or: [{ id: clean }, { code: upper }] },
        {
          $inc: {
            usedCount: 1,
            ordersCount: 1,
            revenueGenerated: orderValue,
          },
          $set: { updatedAt: new Date().toISOString() },
        }
      );
    }
  },

  async getMetrics(): Promise<{
    totalPromotions: number;
    activePromotions: number;
    scheduledCampaigns: number;
    expiredPromotions: number;
    totalRedemptions: number;
    totalDiscountGiven: number;
    totalRevenueGenerated: number;
    activePromoCodesCount: number;
  }> {
    await ensurePromotionsSeeded();
    let records = promotionsStore;

    if (isDatabaseConnected()) {
      records = await Promotion.find({}).lean();
    }

    const totalPromotions = records.length;
    const activePromotions = records.filter((p) => p.status === "active").length;
    const scheduledCampaigns = records.filter((p) => p.status === "scheduled").length;
    const expiredPromotions = records.filter((p) => p.status === "expired").length;
    const totalRedemptions = records.reduce((acc, p) => acc + (p.usedCount || 0), 0);
    const totalRevenueGenerated = records.reduce((acc, p) => acc + (p.revenueGenerated || 0), 0);
    const totalDiscountGiven = records.reduce((acc, p) => {
      if (p.discountType === "fixed_amount") {
        return acc + p.discountValue * (p.usedCount || 0);
      } else if (p.discountType === "percentage") {
        return acc + Math.round((p.revenueGenerated || 0) * (p.discountValue / 100));
      } else {
        return acc + (p.usedCount || 0) * 35;
      }
    }, 0);

    const activePromoCodesCount = records.filter(
      (p) => p.type === "promo_code" && p.status === "active"
    ).length;

    return {
      totalPromotions,
      activePromotions,
      scheduledCampaigns,
      expiredPromotions,
      totalRedemptions,
      totalDiscountGiven,
      totalRevenueGenerated,
      activePromoCodesCount,
    };
  },

  // Internal helpers
  findInMemory(
    filters: PromotionQueryFilters,
    sortBy: string,
    pagination?: PaginationOptions
  ): { promotions: any[]; total: number } {
    let result = [...promotionsStore];

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.code && p.code.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q) ||
          (p.campaignTag && p.campaignTag.toLowerCase().includes(q)) ||
          (p.targetItems && p.targetItems.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (filters.type && filters.type !== "all") {
      result = result.filter((p) => p.type === filters.type);
    }

    if (filters.status && filters.status !== "all") {
      result = result.filter((p) => p.status === filters.status);
    }

    if (filters.campaignTag) {
      result = result.filter((p) => p.campaignTag?.toLowerCase() === filters.campaignTag?.toLowerCase());
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
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = result.length;
    if (pagination) {
      const start = (pagination.page - 1) * pagination.limit;
      result = result.slice(start, start + pagination.limit);
    }

    return { promotions: result, total };
  },

  async findMongo(
    filters: PromotionQueryFilters,
    sortBy: string,
    pagination?: PaginationOptions
  ): Promise<{ promotions: PromotionDocument[]; total: number }> {
    const query: any = {};

    if (filters.search) {
      const q = filters.search.trim();
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { code: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { campaignTag: { $regex: q, $options: "i" } },
      ];
    }

    if (filters.type && filters.type !== "all") {
      query.type = filters.type;
    }

    if (filters.status && filters.status !== "all") {
      query.status = filters.status;
    }

    let sort: any = { createdAt: -1 };
    if (sortBy === "highest_discount") sort = { discountValue: -1 };
    else if (sortBy === "most_used") sort = { usedCount: -1 };
    else if (sortBy === "revenue_desc") sort = { revenueGenerated: -1 };
    else if (sortBy === "ending_soon") sort = { endDate: 1 };

    const total = await Promotion.countDocuments(query);
    let q = Promotion.find(query).sort(sort);

    if (pagination) {
      q = q.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }

    const promotions = await q.lean();
    return { promotions: promotions as any[], total };
  },
};
