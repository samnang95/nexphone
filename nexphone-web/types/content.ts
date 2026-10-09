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
  accentColor: string;
  displayOrder: number;
  status: ContentStatus;
  features?: Array<{
    icon: string;
    title: string;
    desc: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
