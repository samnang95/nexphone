export type PromotionType = "promo_code" | "sale_campaign" | "automatic";

export type DiscountType = "percentage" | "fixed_amount" | "free_shipping" | "buy_x_get_y";

export type PromotionStatus = "active" | "scheduled" | "expired" | "disabled";

export type DiscountScope = "all_products" | "specific_products" | "specific_brands" | "min_order_value";

export type CampaignTheme = "indigo" | "rose" | "amber" | "emerald" | "purple" | "cyan";

export interface Promotion {
  id: string;
  code?: string; // Uppercase coupon code, e.g. "NEXLAUNCH20"
  title: string;
  description: string;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: number; // e.g. 20 for 20%, 100 for $100
  minOrderValue?: number; // Minimum cart value in USD
  maxDiscountAmount?: number; // Cap for percentage discounts
  scope: DiscountScope;
  targetItems?: string[]; // E.g. ["NexPhone 15 Pro Max", "NexPhone Enterprise Edge"]
  status: PromotionStatus;
  startDate: string; // ISO 8601
  endDate: string | null; // ISO 8601 or null for unlimited
  usageLimit?: number | null; // Total redeems allowed, null = unlimited
  usedCount: number;
  customerLimit?: number; // Max uses per customer
  campaignTag?: string; // e.g. "Flash Sale", "Black Friday", "Fleet Expo", "VIP Tier"
  bannerColor?: CampaignTheme;
  revenueGenerated: number; // Total order revenue attributed in USD
  ordersCount: number; // Total orders placed with this promotion
  createdAt: string;
  updatedAt: string;
}

export interface PromotionFilterParams {
  searchQuery?: string;
  type?: PromotionType | "all";
  status?: PromotionStatus | "all";
  discountType?: DiscountType | "all";
  sortBy?: "highest_discount" | "most_used" | "recent" | "ending_soon" | "revenue_desc";
  page?: number;
  limit?: number;
}

export interface PromotionSummaryMetrics {
  totalPromotions: number;
  activePromotions: number;
  scheduledCampaigns: number;
  expiredPromotions: number;
  totalRedemptions: number;
  totalDiscountGiven: number;
  totalRevenueGenerated: number;
  activePromoCodesCount: number;
}

export interface CreatePromotionPayload {
  title: string;
  code?: string;
  description: string;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  scope: DiscountScope;
  targetItems?: string[];
  status?: PromotionStatus;
  startDate: string;
  endDate?: string | null;
  usageLimit?: number | null;
  customerLimit?: number;
  campaignTag?: string;
  bannerColor?: CampaignTheme;
}

export interface UpdatePromotionPayload extends Partial<CreatePromotionPayload> {
  id: string;
}
