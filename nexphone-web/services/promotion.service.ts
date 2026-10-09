import { appConfig } from "@/app/config/env";
import type { Promotion } from "@/types/promotion";

const API_BASE = appConfig.apiUrl.replace(/\/api\/?$/, "");

const nowTime = Date.now();
const ONE_DAY = 1000 * 60 * 60 * 24;

const FALLBACK_PROMOTIONS: Promotion[] = [
  {
    id: "promo-001",
    code: "NEXVIP15",
    title: "NexPhone Flagship 15% VIP Welcome",
    description: "Enjoy an instant 15% discount on all NexPhone Pro and Fold handsets for registered NexID members.",
    type: "promo_code",
    discountType: "percentage",
    discountValue: 15,
    minOrderValue: 999,
    maxDiscountAmount: 300,
    targetItems: ["NexPhone 15 Pro Max", "NexPhone Fold Ultra"],
    status: "active",
    startDate: new Date(nowTime - 5 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 25 * ONE_DAY).toISOString(),
    usedCount: 214,
    campaignTag: "Flagship VIP",
    bannerColor: "cyan",
    revenueGenerated: 320400,
    ordersCount: 214,
    createdAt: new Date(nowTime - 5 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime).toISOString(),
  },
  {
    id: "promo-002",
    code: "FLEET250",
    title: "$250 Corporate Fleet Deployment Credit",
    description: "Direct instant checkout offset when purchasing 2 or more devices for business teams.",
    type: "promo_code",
    discountType: "fixed_amount",
    discountValue: 250,
    minOrderValue: 2500,
    targetItems: ["NexPhone Enterprise Edge", "NexPhone 15 Pro Max"],
    status: "active",
    startDate: new Date(nowTime - 12 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 18 * ONE_DAY).toISOString(),
    usedCount: 88,
    campaignTag: "Enterprise Fleet",
    bannerColor: "indigo",
    revenueGenerated: 421000,
    ordersCount: 88,
    createdAt: new Date(nowTime - 12 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 1 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-003",
    code: "FREESHIP",
    title: "Global White-Glove Armored Courier Delivery",
    description: "Complimentary armored door-to-door courier delivery with biometric handover verification.",
    type: "promo_code",
    discountType: "free_shipping",
    discountValue: 100,
    minOrderValue: 500,
    status: "active",
    startDate: new Date(nowTime - 30 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 60 * ONE_DAY).toISOString(),
    usedCount: 640,
    campaignTag: "Global Logistics",
    bannerColor: "emerald",
    revenueGenerated: 890000,
    ordersCount: 640,
    createdAt: new Date(nowTime - 30 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 2 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-004",
    title: "Spring Hardware Trade-In Bonanza",
    description: "Exchange qualified older generation smartphones for up to $650 instant credit directly at checkout.",
    type: "sale_campaign",
    discountType: "fixed_amount",
    discountValue: 650,
    status: "active",
    startDate: new Date(nowTime - 10 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 14 * ONE_DAY).toISOString(),
    usedCount: 145,
    campaignTag: "Trade-In Event",
    bannerColor: "amber",
    revenueGenerated: 195000,
    ordersCount: 145,
    createdAt: new Date(nowTime - 10 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime).toISOString(),
  },
];

export const promotionService = {
  async getPromotions(): Promise<Promotion[]> {
    try {
      const res = await fetch(`${API_BASE}/api/promotions`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch promotions");
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : FALLBACK_PROMOTIONS;
    } catch {
      return FALLBACK_PROMOTIONS;
    }
  },
};
