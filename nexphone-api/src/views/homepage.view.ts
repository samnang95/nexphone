import {
  HomepageBannerRecord,
  FeaturedPhoneRecord,
  PromotionalSectionRecord,
  NewArrivalRecord,
  BestSellerRecord,
} from "../data/content.data";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function serializeBanner(b: HomepageBannerRecord) {
  return {
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    badge: b.badge,
    primaryCta: b.primaryCta,
    secondaryCta: b.secondaryCta,
    imageUrl: b.imageUrl,
    gradientOverlay: b.gradientOverlay,
    alignment: b.alignment,
    displayOrder: b.displayOrder,
    status: b.status,
    startDate: b.startDate,
    endDate: b.endDate,
    impressions: b.impressions || 0,
    clicks: b.clicks || 0,
    ctr: b.ctr || 0.0,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

export function serializeFeaturedProduct(f: FeaturedPhoneRecord) {
  return {
    id: f.id,
    productId: f.productId,
    productName: f.productName,
    productSubtitle: f.productSubtitle,
    productPrice: f.productPrice,
    formattedPrice: formatCurrency(f.productPrice),
    productImage: f.productImage,
    series: f.series,
    badge: f.badge,
    headline: f.headline,
    displayOrder: f.displayOrder,
    status: f.status,
    rating: f.rating,
    highlightSpecs: f.highlightSpecs || [],
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
  };
}

export function serializeSection(s: PromotionalSectionRecord) {
  return {
    id: s.id,
    sectionKey: s.sectionKey,
    title: s.title,
    subtitle: s.subtitle,
    type: s.type,
    ctaLabel: s.ctaLabel,
    ctaUrl: s.ctaUrl,
    imageUrl: s.imageUrl,
    accentColor: s.accentColor,
    displayOrder: s.displayOrder,
    status: s.status,
    features: s.features || [],
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export function serializeNewArrival(n: NewArrivalRecord | any) {
  const id = n.id || (n._id ? String(n._id) : "");
  return {
    id,
    productId: n.productId,
    productName: n.productName,
    productSubtitle: n.productSubtitle,
    productPrice: n.productPrice,
    formattedPrice: formatCurrency(n.productPrice),
    productImage: n.productImage,
    series: n.series,
    releaseDate: n.releaseDate,
    tag: n.tag,
    isPreOrder: Boolean(n.isPreOrder),
    displayOrder: n.displayOrder,
    status: n.status,
    initialStock: n.initialStock,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  };
}

export function serializeBestSeller(b: BestSellerRecord | any) {
  const id = b.id || (b._id ? String(b._id) : "");
  return {
    id,
    productId: b.productId,
    productName: b.productName,
    productSubtitle: b.productSubtitle,
    productPrice: b.productPrice,
    formattedPrice: formatCurrency(b.productPrice),
    productImage: b.productImage,
    series: b.series,
    rank: b.rank,
    unitsSold: b.unitsSold,
    badge: b.badge,
    satisfactionRate: b.satisfactionRate,
    monthlyGrowth: b.monthlyGrowth,
    status: b.status,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

export function serializeHomepagePayload(data: {
  banners: HomepageBannerRecord[];
  featuredProducts: FeaturedPhoneRecord[];
  promotionalSections: PromotionalSectionRecord[];
  newArrivals?: NewArrivalRecord[];
  bestSellers?: BestSellerRecord[];
  metrics?: any;
}) {
  return {
    banners: data.banners.map(serializeBanner),
    featuredProducts: data.featuredProducts.map(serializeFeaturedProduct),
    promotionalSections: data.promotionalSections.map(serializeSection),
    newArrivals: (data.newArrivals || []).map(serializeNewArrival),
    bestSellers: (data.bestSellers || []).map(serializeBestSeller),
    meta: {
      generatedAt: new Date().toISOString(),
      activeBannersCount: data.banners.length,
      featuredProductsCount: data.featuredProducts.length,
      promoSectionsCount: data.promotionalSections.length,
    },
  };
}
