export interface PublicPromotionView {
  id: string;
  code?: string;
  title: string;
  description: string;
  type: string;
  discountType: string;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  scope: string;
  targetItems: string[];
  bannerColor: string;
  campaignTag: string;
  startDate: string;
  endDate: string | null;
  isExpiringSoon?: boolean;
}

export interface CouponValidationView {
  valid: boolean;
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  cartTotal: number;
  finalTotal: number;
  message: string;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  promotion?: {
    id: string;
    title: string;
    description: string;
    bannerColor: string;
  };
}

export function serializePublicPromotion(doc: any): PublicPromotionView {
  const p = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  const now = Date.now();
  const end = p.endDate ? new Date(p.endDate).getTime() : null;
  const isExpiringSoon = end !== null ? end - now < 3 * 24 * 60 * 60 * 1000 && end > now : false;

  return {
    id: p.id || String(p._id),
    code: p.code,
    title: p.title,
    description: p.description || "",
    type: p.type || "promo_code",
    discountType: p.discountType,
    discountValue: Number(p.discountValue) || 0,
    minOrderValue: p.minOrderValue !== undefined ? Number(p.minOrderValue) : undefined,
    maxDiscountAmount: p.maxDiscountAmount !== undefined ? Number(p.maxDiscountAmount) : undefined,
    scope: p.scope || "all_products",
    targetItems: Array.isArray(p.targetItems) ? p.targetItems : [],
    bannerColor: p.bannerColor || "indigo",
    campaignTag: p.campaignTag || "Promotion",
    startDate: p.startDate,
    endDate: p.endDate || null,
    isExpiringSoon,
  };
}

export function serializePromotion(doc: any, options: { isAdmin?: boolean } = {}): any {
  const p = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  const base = {
    id: p.id || String(p._id),
    code: p.code,
    title: p.title,
    description: p.description || "",
    type: p.type || "promo_code",
    discountType: p.discountType,
    discountValue: Number(p.discountValue) || 0,
    minOrderValue: p.minOrderValue !== undefined ? Number(p.minOrderValue) : undefined,
    maxDiscountAmount: p.maxDiscountAmount !== undefined ? Number(p.maxDiscountAmount) : undefined,
    scope: p.scope || "all_products",
    targetItems: Array.isArray(p.targetItems) ? p.targetItems : [],
    status: p.status || "active",
    startDate: p.startDate,
    endDate: p.endDate || null,
    usageLimit: p.usageLimit !== undefined ? p.usageLimit : null,
    usedCount: Number(p.usedCount) || 0,
    customerLimit: Number(p.customerLimit) || 1,
    campaignTag: p.campaignTag || "Promotion",
    bannerColor: p.bannerColor || "indigo",
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };

  if (options.isAdmin) {
    return {
      ...base,
      revenueGenerated: Number(p.revenueGenerated) || 0,
      ordersCount: Number(p.ordersCount) || 0,
    };
  }

  return base;
}
