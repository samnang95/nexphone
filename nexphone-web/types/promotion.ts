export type PromotionType = "promo_code" | "sale_campaign" | "automatic";

export type DiscountType = "percentage" | "fixed_amount" | "free_shipping" | "buy_x_get_y";

export type PromotionStatus = "active" | "scheduled" | "expired" | "disabled";

export type CampaignTheme = "indigo" | "rose" | "amber" | "emerald" | "purple" | "cyan";

export interface Promotion {
  id: string;
  code?: string;
  title: string;
  description: string;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  targetItems?: string[];
  status: PromotionStatus;
  startDate: string;
  endDate: string | null;
  usedCount: number;
  campaignTag?: string;
  bannerColor?: CampaignTheme;
  revenueGenerated: number;
  ordersCount: number;
  createdAt: string;
  updatedAt: string;
}
