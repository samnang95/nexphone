export type ContentTab =
  | "overview"
  | "banners"
  | "featured"
  | "new_arrivals"
  | "best_sellers"
  | "promo_sections"
  | "preview";

export type ContentStatus = "active" | "scheduled" | "draft" | "hidden";
export interface HomepageBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  primaryCta: {
    label: string;
    url: string;
  };
  secondaryCta?: {
    label: string;
    url: string;
  };
  imageUrl: string;
  gradientOverlay: string;
  alignment: "left" | "center" | "right";
  displayOrder: number;
  status: ContentStatus;
  startDate: string;
  endDate?: string | null;
  impressions: number;
  clicks: number;
  ctr: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeaturedPhone {
  id: string;
  productId: string;
  productName: string;
  productSubtitle: string;
  productPrice: number;
  productImage: string;
  series: string;
  badge: string;
  headline: string;
  displayOrder: number;
  status: "active" | "hidden";
  rating: number;
  highlightSpecs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NewArrival {
  id: string;
  productId: string;
  productName: string;
  productSubtitle: string;
  productPrice: number;
  productImage: string;
  series: string;
  releaseDate: string;
  tag: string; 
  isPreOrder: boolean;
  displayOrder: number;
  status: "active" | "hidden";
  initialStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface BestSeller {
  id: string;
  productId: string;
  productName: string;
  productSubtitle: string;
  productPrice: number;
  productImage: string;
  series: string;
  rank: number;
  unitsSold: number;
  badge: string;
  satisfactionRate: number;
  monthlyGrowth: number;
  status: "active" | "hidden";
  createdAt: string;
  updatedAt: string;
}

export interface PromotionalSection {
  id: string;
  sectionKey: string;
  title: string;
  subtitle: string;
  type: "split_banner" | "feature_grid" | "countdown_bar" | "trust_badges" | "callout_card";
  ctaLabel: string;
  ctaUrl: string;
  imageUrl?: string;
  accentColor: "indigo" | "cyan" | "emerald" | "amber" | "rose" | "purple";
  displayOrder: number;
  status: "active" | "hidden";
  features?: Array<{
    icon: string;
    title: string;
    desc: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ContentSummaryMetrics {
  activeBanners: number;
  totalBanners: number;
  featuredPhonesCount: number;
  newArrivalsCount: number;
  bestSellersCount: number;
  activePromoSections: number;
  totalBannerImpressions: number;
  totalBannerClicks: number;
  avgCtr: number;
}

export interface CreateBannerPayload {
  title: string;
  subtitle: string;
  badge: string;
  primaryCta: { label: string; url: string };
  secondaryCta?: { label: string; url: string };
  imageUrl: string;
  gradientOverlay?: string;
  alignment?: "left" | "center" | "right";
  displayOrder?: number;
  status?: ContentStatus;
  startDate?: string;
  endDate?: string | null;
}

export interface CreateFeaturedPhonePayload {
  productId: string;
  productName: string;
  productSubtitle: string;
  productPrice: number;
  productImage: string;
  series: string;
  badge: string;
  headline: string;
  displayOrder?: number;
  status?: "active" | "hidden";
  rating?: number;
  highlightSpecs?: string[];
}

export interface CreateNewArrivalPayload {
  productId: string;
  productName: string;
  productSubtitle: string;
  productPrice: number;
  productImage: string;
  series: string;
  releaseDate?: string;
  tag: string;
  isPreOrder?: boolean;
  displayOrder?: number;
  status?: "active" | "hidden";
  initialStock?: number;
}

export interface CreateBestSellerPayload {
  productId: string;
  productName: string;
  productSubtitle: string;
  productPrice: number;
  productImage: string;
  series: string;
  rank: number;
  unitsSold: number;
  badge: string;
  satisfactionRate: number;
  monthlyGrowth?: number;
  status?: "active" | "hidden";
}

export interface CreatePromotionalSectionPayload {
  sectionKey: string;
  title: string;
  subtitle: string;
  type: PromotionalSection["type"];
  ctaLabel: string;
  ctaUrl: string;
  imageUrl?: string;
  accentColor: PromotionalSection["accentColor"];
  displayOrder?: number;
  status?: "active" | "hidden";
  features?: Array<{ icon: string; title: string; desc: string }>;
}
