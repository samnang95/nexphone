import type {
  Promotion,
  PromotionFilterParams,
  PromotionSummaryMetrics,
  CreatePromotionPayload,
} from "@/types/promotion";
import { appConfig } from "@/config/env";

const nowTime = Date.now();
const ONE_DAY = 1000 * 60 * 60 * 24;

const FALLBACK_PROMOTIONS: Promotion[] = [
  {
    id: "promo-001",
    code: "NEXLAUNCH20",
    title: "NexPhone 15 Pro Commercial Launch",
    description: "Launch coupon providing 20% discount on all NexPhone 15 Pro Max and Enterprise hardware configurations.",
    type: "promo_code",
    discountType: "percentage",
    discountValue: 20,
    minOrderValue: 800,
    maxDiscountAmount: 400,
    scope: "specific_products",
    targetItems: ["NexPhone 15 Pro Max", "NexPhone Enterprise Edge Fleet Pack"],
    status: "active",
    startDate: new Date(nowTime - 7 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 21 * ONE_DAY).toISOString(),
    usageLimit: 1000,
    usedCount: 342,
    customerLimit: 1,
    campaignTag: "Flagship Launch",
    bannerColor: "indigo",
    revenueGenerated: 348500,
    ordersCount: 342,
    createdAt: new Date(nowTime - 7 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 1 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-002",
    code: "FLEETVIP100",
    title: "Enterprise Fleet Upgrade Voucher",
    description: "Instant $100 off bulk orders exceeding $1,500 for corporate verified accounts.",
    type: "promo_code",
    discountType: "fixed_amount",
    discountValue: 100,
    minOrderValue: 1500,
    scope: "all_products",
    targetItems: ["All Catalog Products"],
    status: "active",
    startDate: new Date(nowTime - 14 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 45 * ONE_DAY).toISOString(),
    usageLimit: 250,
    usedCount: 89,
    customerLimit: 2,
    campaignTag: "Enterprise VIP",
    bannerColor: "purple",
    revenueGenerated: 168200,
    ordersCount: 89,
    createdAt: new Date(nowTime - 14 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 2 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-003",
    code: "FREESHIP",
    title: "Global Express Courier Shipping",
    description: "Complimentary worldwide express air dispatch on all mobile fleets over $300.",
    type: "promo_code",
    discountType: "free_shipping",
    discountValue: 0,
    minOrderValue: 300,
    scope: "all_products",
    targetItems: ["All Catalog Products"],
    status: "active",
    startDate: new Date(nowTime - 30 * ONE_DAY).toISOString(),
    endDate: null,
    usageLimit: null,
    usedCount: 1280,
    customerLimit: 5,
    campaignTag: "Shipping Perk",
    bannerColor: "emerald",
    revenueGenerated: 940000,
    ordersCount: 1280,
    createdAt: new Date(nowTime - 30 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 1 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-004",
    title: "NexPhone Spring Fleet Expo 2026",
    description: "Sitewide seasonal commercial campaign offering 12% off entire order plus 1 year free Satellite VoIP service trial.",
    type: "sale_campaign",
    discountType: "percentage",
    discountValue: 12,
    minOrderValue: 500,
    maxDiscountAmount: 350,
    scope: "all_products",
    targetItems: ["Entire Hardware Catalog"],
    status: "active",
    startDate: new Date(nowTime - 3 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 4 * ONE_DAY).toISOString(),
    usageLimit: null,
    usedCount: 512,
    campaignTag: "Spring Expo",
    bannerColor: "cyan",
    revenueGenerated: 624000,
    ordersCount: 512,
    createdAt: new Date(nowTime - 5 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 1 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-005",
    title: "Titanium Premiere Accessories Flash Sale",
    description: "Exclusive 25% reduction on high-durability titanium cases, MagSafe power hubs, and encrypted audio accessories.",
    type: "sale_campaign",
    discountType: "percentage",
    discountValue: 25,
    scope: "specific_brands",
    targetItems: ["NexPhone Labs Titanium Series", "Encrypted Peripherals"],
    status: "active",
    startDate: new Date(nowTime - 1 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 2 * ONE_DAY).toISOString(),
    usageLimit: 300,
    usedCount: 214,
    campaignTag: "Flash Sale",
    bannerColor: "rose",
    revenueGenerated: 42800,
    ordersCount: 214,
    createdAt: new Date(nowTime - 1 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime).toISOString(),
  },
  {
    id: "promo-006",
    code: "CYBEREARLY",
    title: "Cyber Surge VIP Early Bird Access",
    description: "Exclusive pre-launch promo code granting 15% discount for registered fleet managers prior to public Cyber Week.",
    type: "promo_code",
    discountType: "percentage",
    discountValue: 15,
    minOrderValue: 1000,
    maxDiscountAmount: 600,
    scope: "all_products",
    targetItems: ["All Catalog Products"],
    status: "scheduled",
    startDate: new Date(nowTime + 7 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 21 * ONE_DAY).toISOString(),
    usageLimit: 500,
    usedCount: 0,
    customerLimit: 1,
    campaignTag: "Cyber Surge",
    bannerColor: "indigo",
    revenueGenerated: 0,
    ordersCount: 0,
    createdAt: new Date(nowTime - 2 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 2 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-007",
    title: "Black Friday Global Fleet Surge 2026",
    description: "Massive upcoming sitewide hardware sale with up to 30% off tier 2 bulk orders and subsidized data roaming.",
    type: "sale_campaign",
    discountType: "percentage",
    discountValue: 30,
    minOrderValue: 2000,
    maxDiscountAmount: 1200,
    scope: "all_products",
    targetItems: ["Enterprise Fleet Bundles"],
    status: "scheduled",
    startDate: new Date(nowTime + 18 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 25 * ONE_DAY).toISOString(),
    usageLimit: null,
    usedCount: 0,
    campaignTag: "Black Friday",
    bannerColor: "amber",
    revenueGenerated: 0,
    ordersCount: 0,
    createdAt: new Date(nowTime - 4 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 4 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-008",
    title: "Enterprise Tier 3 Volume Auto-Rebate",
    description: "Automatic checkout reduction of $600 for enterprise purchase orders totaling over $5,000.",
    type: "automatic",
    discountType: "fixed_amount",
    discountValue: 600,
    minOrderValue: 5000,
    scope: "min_order_value",
    targetItems: ["Orders above $5,000 USD"],
    status: "active",
    startDate: new Date(nowTime - 60 * ONE_DAY).toISOString(),
    endDate: null,
    usageLimit: null,
    usedCount: 76,
    campaignTag: "Volume Rebate",
    bannerColor: "emerald",
    revenueGenerated: 485000,
    ordersCount: 76,
    createdAt: new Date(nowTime - 60 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 10 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-009",
    code: "SUMMER50",
    title: "Mid-Year Mid-Summer Upgrade Voucher",
    description: "Summer promotional discount of $50 off on select NexPhone Lite models.",
    type: "promo_code",
    discountType: "fixed_amount",
    discountValue: 50,
    minOrderValue: 400,
    scope: "specific_products",
    targetItems: ["NexPhone Lite"],
    status: "expired",
    startDate: new Date(nowTime - 90 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime - 15 * ONE_DAY).toISOString(),
    usageLimit: 200,
    usedCount: 200,
    customerLimit: 1,
    campaignTag: "Summer Promo",
    bannerColor: "amber",
    revenueGenerated: 98000,
    ordersCount: 200,
    createdAt: new Date(nowTime - 90 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 15 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-010",
    title: "Q3 Inventory Deprecation Clearance",
    description: "Final clearance event for Gen 11 devices with 35% clearance markdown.",
    type: "sale_campaign",
    discountType: "percentage",
    discountValue: 35,
    scope: "specific_products",
    targetItems: ["NexPhone Gen 11 Refurbished"],
    status: "expired",
    startDate: new Date(nowTime - 45 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime - 5 * ONE_DAY).toISOString(),
    usageLimit: 150,
    usedCount: 148,
    campaignTag: "Clearance",
    bannerColor: "rose",
    revenueGenerated: 74200,
    ordersCount: 148,
    createdAt: new Date(nowTime - 45 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 5 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-011",
    code: "DEVTEST10",
    title: "Sandbox Testing Voucher",
    description: "Internal engineering test discount code for automated telemetry pipelines.",
    type: "promo_code",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 100,
    scope: "all_products",
    targetItems: ["Sandbox Environments"],
    status: "disabled",
    startDate: new Date(nowTime - 20 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 100 * ONE_DAY).toISOString(),
    usageLimit: 50,
    usedCount: 12,
    customerLimit: 1,
    campaignTag: "Internal QA",
    bannerColor: "purple",
    revenueGenerated: 2400,
    ordersCount: 12,
    createdAt: new Date(nowTime - 20 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 1 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-012",
    title: "Gov & Education Fleet Starter Rebate",
    description: "Automatic $300 equipment subsidy for verified academic laboratories and municipal agencies.",
    type: "automatic",
    discountType: "fixed_amount",
    discountValue: 300,
    minOrderValue: 2500,
    scope: "specific_brands",
    targetItems: ["NexPhone Education Labs"],
    status: "active",
    startDate: new Date(nowTime - 40 * ONE_DAY).toISOString(),
    endDate: null,
    usageLimit: 100,
    usedCount: 41,
    campaignTag: "Public Sector",
    bannerColor: "cyan",
    revenueGenerated: 145000,
    ordersCount: 41,
    createdAt: new Date(nowTime - 40 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 3 * ONE_DAY).toISOString(),
  },
];

const localPromotions = [...FALLBACK_PROMOTIONS];

export const PromotionService = {
  /**
   * Get all promotions with optional filtering and sorting
   */
  async getPromotions(params: PromotionFilterParams = {}): Promise<Promotion[]> {
    try {
      const query = new URLSearchParams();
      if (params.searchQuery) query.append("search", params.searchQuery);
      if (params.type && params.type !== "all") query.append("type", params.type);
      if (params.status && params.status !== "all") query.append("status", params.status);
      if (params.sortBy) query.append("sortBy", params.sortBy);

      const qs = query.toString() ? `?${query.toString()}` : "";
      const res = await fetch(`${appConfig.apiUrl}/api/promotions${qs}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : localPromotions;
    } catch {
      // Graceful fallback to client-side data
      let result = [...localPromotions];
      if (params.searchQuery) {
        const q = params.searchQuery.toLowerCase().trim();
        result = result.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.code && p.code.toLowerCase().includes(q)) ||
            p.description.toLowerCase().includes(q) ||
            (p.campaignTag && p.campaignTag.toLowerCase().includes(q))
        );
      }
      if (params.type && params.type !== "all") {
        result = result.filter((p) => p.type === params.type);
      }
      if (params.status && params.status !== "all") {
        result = result.filter((p) => p.status === params.status);
      }
      if (params.sortBy === "highest_discount") {
        result.sort((a, b) => b.discountValue - a.discountValue);
      } else if (params.sortBy === "most_used") {
        result.sort((a, b) => b.usedCount - a.usedCount);
      } else if (params.sortBy === "revenue_desc") {
        result.sort((a, b) => b.revenueGenerated - a.revenueGenerated);
      } else if (params.sortBy === "ending_soon") {
        result.sort((a, b) => {
          if (!a.endDate) return 1;
          if (!b.endDate) return -1;
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        });
      } else {
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return result;
    }
  },

  /**
   * Get promotion by ID or Code
   */
  async getPromotionById(id: string): Promise<Promotion> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/promotions/${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      const found = localPromotions.find(
        (p) => p.id === id || (p.code && p.code.toUpperCase() === id.toUpperCase())
      );
      if (!found) throw new Error("Promotion not found");
      return found;
    }
  },

  /**
   * Create discount / promo code / sale campaign
   */
  async createPromotion(payload: CreatePromotionPayload): Promise<Promotion> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/promotions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${res.status}`);
      }
      const created = await res.json();
      localPromotions.unshift(created);
      return created;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("already exists")) {
        throw err;
      }
      const now = new Date().toISOString();
      const code = payload.code
        ? payload.code.trim().toUpperCase()
        : payload.type === "promo_code"
        ? `NEX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
        : undefined;

      const newPromo: Promotion = {
        id: `promo-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
        code,
        title: payload.title.trim(),
        description: payload.description || "Active promotion",
        type: payload.type,
        discountType: payload.discountType,
        discountValue: Number(payload.discountValue) || 0,
        minOrderValue: payload.minOrderValue,
        maxDiscountAmount: payload.maxDiscountAmount,
        scope: payload.scope,
        targetItems: payload.targetItems || ["All Products"],
        status: payload.status || "active",
        startDate: payload.startDate || now,
        endDate: payload.endDate || null,
        usageLimit: payload.usageLimit,
        usedCount: 0,
        customerLimit: payload.customerLimit || 1,
        campaignTag: payload.campaignTag || (payload.type === "sale_campaign" ? "Sale Campaign" : "Promo Code"),
        bannerColor: payload.bannerColor || "indigo",
        revenueGenerated: 0,
        ordersCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      localPromotions.unshift(newPromo);
      return newPromo;
    }
  },

  /**
   * Update / Edit discount
   */
  async updatePromotion(id: string, payload: Partial<CreatePromotionPayload>): Promise<Promotion> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/promotions/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${res.status}`);
      }
      const updated = await res.json();
      const idx = localPromotions.findIndex((p) => p.id === id);
      if (idx !== -1) localPromotions[idx] = updated;
      return updated;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("already in use")) {
        throw err;
      }
      const idx = localPromotions.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Promotion not found");

      const current = localPromotions[idx]!;
      const updated: Promotion = {
        ...current,
        title: payload.title !== undefined ? payload.title.trim() : current.title,
        code: payload.code !== undefined ? (payload.code ? payload.code.trim().toUpperCase() : undefined) : current.code,
        description: payload.description !== undefined ? payload.description.trim() : current.description,
        type: payload.type || current.type,
        discountType: payload.discountType || current.discountType,
        discountValue: payload.discountValue !== undefined ? Number(payload.discountValue) : current.discountValue,
        minOrderValue: payload.minOrderValue !== undefined ? payload.minOrderValue : current.minOrderValue,
        maxDiscountAmount: payload.maxDiscountAmount !== undefined ? payload.maxDiscountAmount : current.maxDiscountAmount,
        scope: payload.scope || current.scope,
        targetItems: payload.targetItems !== undefined ? payload.targetItems : current.targetItems,
        status: payload.status || current.status,
        startDate: payload.startDate || current.startDate,
        endDate: payload.endDate !== undefined ? payload.endDate : current.endDate,
        usageLimit: payload.usageLimit !== undefined ? payload.usageLimit : current.usageLimit,
        customerLimit: payload.customerLimit !== undefined ? payload.customerLimit : current.customerLimit,
        campaignTag: payload.campaignTag !== undefined ? payload.campaignTag.trim() : current.campaignTag,
        bannerColor: payload.bannerColor || current.bannerColor,
        updatedAt: new Date().toISOString(),
      };
      localPromotions[idx] = updated;
      return updated;
    }
  },

  /**
   * Delete discount
   */
  async deletePromotion(id: string): Promise<Promotion> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/promotions/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const idx = localPromotions.findIndex((p) => p.id === id);
      if (idx !== -1) localPromotions.splice(idx, 1);
      return data.promotion;
    } catch {
      const idx = localPromotions.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Promotion not found");
      const [deleted] = localPromotions.splice(idx, 1);
      return deleted!;
    }
  },

  /**
   * Toggle promotion status (active, disabled, etc.)
   */
  async toggleStatus(id: string, status: Promotion["status"]): Promise<Promotion> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/promotions/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const updated = await res.json();
      const idx = localPromotions.findIndex((p) => p.id === id);
      if (idx !== -1) localPromotions[idx] = updated;
      return updated;
    } catch {
      const idx = localPromotions.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Promotion not found");
      const current = localPromotions[idx]!;
      const updated: Promotion = {
        ...current,
        status,
        updatedAt: new Date().toISOString(),
      };
      localPromotions[idx] = updated;
      return updated;
    }
  },

  /**
   * Get summary telemetry metrics for Promotion Management
   */
  async getMetrics(): Promise<PromotionSummaryMetrics> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/promotions-metrics`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      const totalPromotions = localPromotions.length;
      const activePromotions = localPromotions.filter((p) => p.status === "active").length;
      const scheduledCampaigns = localPromotions.filter((p) => p.status === "scheduled").length;
      const expiredPromotions = localPromotions.filter((p) => p.status === "expired").length;

      const totalRedemptions = localPromotions.reduce((acc, p) => acc + (p.usedCount || 0), 0);
      const totalRevenueGenerated = localPromotions.reduce((acc, p) => acc + (p.revenueGenerated || 0), 0);

      const totalDiscountGiven = localPromotions.reduce((acc, p) => {
        if (p.discountType === "fixed_amount") {
          return acc + p.discountValue * (p.usedCount || 0);
        } else if (p.discountType === "percentage") {
          return acc + Math.round((p.revenueGenerated || 0) * (p.discountValue / 100));
        } else {
          return acc + (p.usedCount || 0) * 35;
        }
      }, 0);

      const activePromoCodesCount = localPromotions.filter(
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
    }
  },
};
