import {
  HomepageBannerRecord,
  FeaturedPhoneRecord,
  NewArrivalRecord,
  BestSellerRecord,
  PromotionalSectionRecord,
  homepageBannersStore,
  featuredPhonesStore,
  newArrivalsStore,
  bestSellersStore,
  promotionalSectionsStore,
} from "../data/content.data";
import { productRepository } from "./product.repo";

export class HomepageRepository {
  // ==========================================
  // 1. Homepage Banners
  // ==========================================
  async getBanners(options: { status?: string; limit?: number } = {}): Promise<HomepageBannerRecord[]> {
    let banners = [...homepageBannersStore];

    if (options.status && options.status !== "all") {
      banners = banners.filter((b) => b.status === options.status);
    }

    banners.sort((a, b) => a.displayOrder - b.displayOrder);

    if (options.limit && options.limit > 0) {
      banners = banners.slice(0, options.limit);
    }

    return banners;
  }

  async getBannerById(id: string): Promise<HomepageBannerRecord | null> {
    const banner = homepageBannersStore.find((b) => b.id === id);
    return banner || null;
  }

  async createBanner(data: {
    title: string;
    subtitle?: string;
    badge?: string;
    primaryCta: { label: string; url: string };
    secondaryCta?: { label: string; url: string };
    imageUrl?: string;
    gradientOverlay?: string;
    alignment?: "left" | "center" | "right";
    displayOrder?: number;
    status?: "active" | "scheduled" | "draft" | "hidden";
    startDate?: string;
    endDate?: string | null;
  }): Promise<HomepageBannerRecord> {
    const now = new Date().toISOString();
    const newBanner: HomepageBannerRecord = {
      id: `banner-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      title: data.title.trim(),
      subtitle: (data.subtitle || "").trim(),
      badge: (data.badge || "Featured").trim(),
      primaryCta: data.primaryCta || { label: "Configure & Order", url: "/products" },
      secondaryCta: data.secondaryCta,
      imageUrl:
        data.imageUrl ||
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80",
      gradientOverlay: data.gradientOverlay || "from-indigo-950/95 via-slate-900/80 to-transparent",
      alignment: data.alignment || "left",
      displayOrder: data.displayOrder ?? homepageBannersStore.length + 1,
      status: data.status || "active",
      startDate: data.startDate || now,
      endDate: data.endDate ?? null,
      impressions: 0,
      clicks: 0,
      ctr: 0.0,
      createdAt: now,
      updatedAt: now,
    };

    homepageBannersStore.push(newBanner);
    return newBanner;
  }

  async updateBanner(id: string, updates: Partial<HomepageBannerRecord>): Promise<HomepageBannerRecord | null> {
    const index = homepageBannersStore.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const current = homepageBannersStore[index]!;
    const updated: HomepageBannerRecord = {
      ...current,
      ...updates,
      id: current.id,
      updatedAt: new Date().toISOString(),
    };

    homepageBannersStore[index] = updated;
    return updated;
  }

  async deleteBanner(id: string): Promise<HomepageBannerRecord | null> {
    const index = homepageBannersStore.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const [deleted] = homepageBannersStore.splice(index, 1);
    return deleted || null;
  }

  // ==========================================
  // 2. Featured Products
  // ==========================================
  async getFeaturedProducts(options: { status?: string; limit?: number; series?: string } = {}): Promise<FeaturedPhoneRecord[]> {
    let items = [...featuredPhonesStore];

    if (options.status && options.status !== "all") {
      items = items.filter((f) => f.status === options.status);
    }
    if (options.series) {
      const lower = options.series.toLowerCase();
      items = items.filter((f) => f.series.toLowerCase().includes(lower));
    }

    items.sort((a, b) => a.displayOrder - b.displayOrder);

    if (options.limit && options.limit > 0) {
      items = items.slice(0, options.limit);
    }

    return items;
  }

  async getFeaturedProductById(id: string): Promise<FeaturedPhoneRecord | null> {
    const item = featuredPhonesStore.find((f) => f.id === id || f.productId === id);
    return item || null;
  }

  async createFeaturedProduct(data: {
    productId?: string;
    productName: string;
    productSubtitle?: string;
    productPrice: number;
    productImage?: string;
    series?: string;
    badge?: string;
    headline?: string;
    displayOrder?: number;
    status?: "active" | "hidden";
    rating?: number;
    highlightSpecs?: string[];
  }): Promise<FeaturedPhoneRecord> {
    const now = new Date().toISOString();
    const item: FeaturedPhoneRecord = {
      id: `feat-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      productId: data.productId || `prod-${Date.now().toString(36)}`,
      productName: data.productName.trim(),
      productSubtitle: (data.productSubtitle || "Featured Flagship Model").trim(),
      productPrice: Number(data.productPrice) || 1199,
      productImage:
        data.productImage ||
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
      series: data.series || "Pro Series",
      badge: (data.badge || "Featured").trim(),
      headline: (data.headline || "Enterprise-grade satellite communicator").trim(),
      displayOrder: data.displayOrder ?? featuredPhonesStore.length + 1,
      status: data.status || "active",
      rating: Number(data.rating) || 4.9,
      highlightSpecs: Array.isArray(data.highlightSpecs) && data.highlightSpecs.length > 0
        ? data.highlightSpecs
        : ["Satellite VoIP", "Titanium Frame", "Kyber-1024 Security"],
      createdAt: now,
      updatedAt: now,
    };

    featuredPhonesStore.push(item);
    return item;
  }

  async updateFeaturedProduct(id: string, updates: Partial<FeaturedPhoneRecord>): Promise<FeaturedPhoneRecord | null> {
    const index = featuredPhonesStore.findIndex((f) => f.id === id || f.productId === id);
    if (index === -1) return null;

    const current = featuredPhonesStore[index]!;
    const updated: FeaturedPhoneRecord = {
      ...current,
      ...updates,
      id: current.id,
      updatedAt: new Date().toISOString(),
    };

    featuredPhonesStore[index] = updated;
    return updated;
  }

  async deleteFeaturedProduct(id: string): Promise<FeaturedPhoneRecord | null> {
    const index = featuredPhonesStore.findIndex((f) => f.id === id || f.productId === id);
    if (index === -1) return null;

    const [deleted] = featuredPhonesStore.splice(index, 1);
    return deleted || null;
  }

  // ==========================================
  // 3. Promotional Sections
  // ==========================================
  async getPromotionalSections(options: { status?: string } = {}): Promise<PromotionalSectionRecord[]> {
    let sections = [...promotionalSectionsStore];

    if (options.status && options.status !== "all") {
      sections = sections.filter((s) => s.status === options.status);
    }

    sections.sort((a, b) => a.displayOrder - b.displayOrder);
    return sections;
  }

  async getPromotionalSectionById(id: string): Promise<PromotionalSectionRecord | null> {
    const section = promotionalSectionsStore.find((s) => s.id === id || s.sectionKey === id);
    return section || null;
  }

  async createPromotionalSection(data: {
    sectionKey: string;
    title: string;
    subtitle?: string;
    type?: "split_banner" | "feature_grid" | "countdown_bar" | "trust_badges" | "callout_card";
    ctaLabel?: string;
    ctaUrl?: string;
    imageUrl?: string;
    accentColor?: "indigo" | "cyan" | "emerald" | "amber" | "rose" | "purple";
    displayOrder?: number;
    status?: "active" | "hidden";
    features?: Array<{ icon: string; title: string; desc: string }>;
  }): Promise<PromotionalSectionRecord> {
    const now = new Date().toISOString();
    const section: PromotionalSectionRecord = {
      id: `sec-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      sectionKey: data.sectionKey.trim(),
      title: data.title.trim(),
      subtitle: (data.subtitle || "").trim(),
      type: data.type || "split_banner",
      ctaLabel: data.ctaLabel || "Learn More",
      ctaUrl: data.ctaUrl || "/products",
      imageUrl: data.imageUrl,
      accentColor: data.accentColor || "indigo",
      displayOrder: data.displayOrder ?? promotionalSectionsStore.length + 1,
      status: data.status || "active",
      features: Array.isArray(data.features) ? data.features : [],
      createdAt: now,
      updatedAt: now,
    };

    promotionalSectionsStore.push(section);
    return section;
  }

  async updatePromotionalSection(id: string, updates: Partial<PromotionalSectionRecord>): Promise<PromotionalSectionRecord | null> {
    const index = promotionalSectionsStore.findIndex((s) => s.id === id || s.sectionKey === id);
    if (index === -1) return null;

    const current = promotionalSectionsStore[index]!;
    const updated: PromotionalSectionRecord = {
      ...current,
      ...updates,
      id: current.id,
      updatedAt: new Date().toISOString(),
    };

    promotionalSectionsStore[index] = updated;
    return updated;
  }

  async deletePromotionalSection(id: string): Promise<PromotionalSectionRecord | null> {
    const index = promotionalSectionsStore.findIndex((s) => s.id === id || s.sectionKey === id);
    if (index === -1) return null;

    const [deleted] = promotionalSectionsStore.splice(index, 1);
    return deleted || null;
  }

  async reorderSections(sectionIds: string[]): Promise<PromotionalSectionRecord[]> {
    sectionIds.forEach((id, idx) => {
      const sec = promotionalSectionsStore.find((s) => s.id === id || s.sectionKey === id);
      if (sec) {
        sec.displayOrder = idx + 1;
        sec.updatedAt = new Date().toISOString();
      }
    });

    return [...promotionalSectionsStore].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  // ==========================================
  // 4. Ancillary Stores (New Arrivals & Best Sellers)
  // ==========================================
  async getNewArrivals(): Promise<NewArrivalRecord[]> {
    return [...newArrivalsStore].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getBestSellers(): Promise<BestSellerRecord[]> {
    return [...bestSellersStore].sort((a, b) => a.rank - b.rank);
  }

  // ==========================================
  // 5. Content Metrics
  // ==========================================
  async getMetrics() {
    const activeBanners = homepageBannersStore.filter((b) => b.status === "active").length;
    const totalBanners = homepageBannersStore.length;
    const featuredPhonesCount = featuredPhonesStore.filter((f) => f.status === "active").length;
    const newArrivalsCount = newArrivalsStore.filter((n) => n.status === "active").length;
    const bestSellersCount = bestSellersStore.filter((b) => b.status === "active").length;
    const activePromoSections = promotionalSectionsStore.filter((p) => p.status === "active").length;

    const totalBannerImpressions = homepageBannersStore.reduce((acc, b) => acc + (b.impressions || 0), 0);
    const totalBannerClicks = homepageBannersStore.reduce((acc, b) => acc + (b.clicks || 0), 0);
    const avgCtr =
      totalBannerImpressions > 0
        ? Number(((totalBannerClicks / totalBannerImpressions) * 100).toFixed(1))
        : 0;

    return {
      activeBanners,
      totalBanners,
      featuredPhonesCount,
      newArrivalsCount,
      bestSellersCount,
      activePromoSections,
      totalBannerImpressions,
      totalBannerClicks,
      avgCtr,
    };
  }
}

export const homepageRepository = new HomepageRepository();
