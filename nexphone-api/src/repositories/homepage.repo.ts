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
import {
  HomepageBanner,
  FeaturedPhone,
  PromotionalSection,
  NewArrival,
  BestSeller,
} from "../models/content.model";
import { isDatabaseConnected } from "../config/database";

let contentSeeded = false;

export async function ensureContentSeeded(): Promise<void> {
  if (contentSeeded || !isDatabaseConnected()) return;
  try {
    const [bannerCount, featCount, secCount, newCount, bestCount] = await Promise.all([
      HomepageBanner.countDocuments(),
      FeaturedPhone.countDocuments(),
      PromotionalSection.countDocuments(),
      NewArrival.countDocuments(),
      BestSeller.countDocuments(),
    ]);

    if (bannerCount === 0 && homepageBannersStore.length > 0) {
      await HomepageBanner.insertMany(homepageBannersStore);
    }
    if (featCount === 0 && featuredPhonesStore.length > 0) {
      await FeaturedPhone.insertMany(featuredPhonesStore);
    }
    if (secCount === 0 && promotionalSectionsStore.length > 0) {
      await PromotionalSection.insertMany(promotionalSectionsStore);
    }
    if (newCount === 0 && newArrivalsStore.length > 0) {
      await NewArrival.insertMany(newArrivalsStore);
    }
    if (bestCount === 0 && bestSellersStore.length > 0) {
      await BestSeller.insertMany(bestSellersStore);
    }
    contentSeeded = true;
  } catch (error) {
    console.warn("⚠️  [Homepage Repo] Could not auto-seed content to MongoDB:", (error as Error).message);
  }
}

export class HomepageRepository {
  // ==========================================
  // 1. Homepage Banners
  // ==========================================
  async getBanners(options: { status?: string; limit?: number } = {}): Promise<HomepageBannerRecord[]> {
    await ensureContentSeeded();

    if (isDatabaseConnected()) {
      const query: any = {};
      if (options.status && options.status !== "all") {
        query.status = options.status;
      }
      let mQuery = HomepageBanner.find(query).sort({ displayOrder: 1 }).lean();
      if (options.limit && options.limit > 0) {
        mQuery = mQuery.limit(options.limit);
      }
      const results = (await mQuery) as unknown as HomepageBannerRecord[];
      return results;
    }

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
    await ensureContentSeeded();

    if (isDatabaseConnected()) {
      const doc = await HomepageBanner.findOne({ id }).lean();
      return (doc as unknown as HomepageBannerRecord) || null;
    }

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
    await ensureContentSeeded();

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

    if (isDatabaseConnected()) {
      await HomepageBanner.create(newBanner);
    }

    return newBanner;
  }

  async updateBanner(id: string, updates: Partial<HomepageBannerRecord>): Promise<HomepageBannerRecord | null> {
    await ensureContentSeeded();

    const index = homepageBannersStore.findIndex((b) => b.id === id);
    const now = new Date().toISOString();

    if (isDatabaseConnected()) {
      const updated = await HomepageBanner.findOneAndUpdate(
        { id },
        { ...updates, updatedAt: now },
        { new: true }
      ).lean();
      if (updated && index !== -1) {
        homepageBannersStore[index] = { ...homepageBannersStore[index]!, ...updates, updatedAt: now };
      }
      return (updated as unknown as HomepageBannerRecord) || null;
    }

    if (index === -1) return null;
    const current = homepageBannersStore[index]!;
    const updated: HomepageBannerRecord = {
      ...current,
      ...updates,
      id: current.id,
      updatedAt: now,
    };
    homepageBannersStore[index] = updated;
    return updated;
  }

  async deleteBanner(id: string): Promise<HomepageBannerRecord | null> {
    await ensureContentSeeded();

    const index = homepageBannersStore.findIndex((b) => b.id === id);

    if (isDatabaseConnected()) {
      const deleted = await HomepageBanner.findOneAndDelete({ id }).lean();
      if (index !== -1) {
        homepageBannersStore.splice(index, 1);
      }
      return (deleted as unknown as HomepageBannerRecord) || null;
    }

    if (index === -1) return null;
    const [deleted] = homepageBannersStore.splice(index, 1);
    return deleted || null;
  }

  // ==========================================
  // 2. Featured Products
  // ==========================================
  async getFeaturedProducts(options: { status?: string; limit?: number; series?: string } = {}): Promise<FeaturedPhoneRecord[]> {
    await ensureContentSeeded();

    if (isDatabaseConnected()) {
      const query: any = {};
      if (options.status && options.status !== "all") {
        query.status = options.status;
      }
      if (options.series) {
        query.series = new RegExp(options.series, "i");
      }
      let mQuery = FeaturedPhone.find(query).sort({ displayOrder: 1 }).lean();
      if (options.limit && options.limit > 0) {
        mQuery = mQuery.limit(options.limit);
      }
      const results = (await mQuery) as unknown as FeaturedPhoneRecord[];
      return results;
    }

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
    await ensureContentSeeded();

    if (isDatabaseConnected()) {
      const doc = await FeaturedPhone.findOne({ $or: [{ id }, { productId: id }] }).lean();
      return (doc as unknown as FeaturedPhoneRecord) || null;
    }

    const item = featuredPhonesStore.find((f) => f.id === id || f.productId === id);
    return item || null;
  }

  async createFeaturedProduct(data: {
    productId?: string;
    productName: string;
    productSubtitle?: string;
    productPrice: number;
    productImage?: string;
    imageUrl?: string;
    series?: string;
    badge?: string;
    headline?: string;
    displayOrder?: number;
    status?: "active" | "hidden";
    rating?: number;
    highlightSpecs?: string[];
  }): Promise<FeaturedPhoneRecord> {
    await ensureContentSeeded();

    const now = new Date().toISOString();
    const item: FeaturedPhoneRecord = {
      id: `feat-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      productId: data.productId || `prod-${Date.now().toString(36)}`,
      productName: data.productName.trim(),
      productSubtitle: (data.productSubtitle || "Featured Flagship Model").trim(),
      productPrice: Number(data.productPrice) || 1199,
      productImage:
        data.productImage ||
        data.imageUrl ||
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

    if (isDatabaseConnected()) {
      await FeaturedPhone.create(item);
    }

    return item;
  }

  async updateFeaturedProduct(id: string, updates: Partial<FeaturedPhoneRecord>): Promise<FeaturedPhoneRecord | null> {
    await ensureContentSeeded();

    const index = featuredPhonesStore.findIndex((f) => f.id === id || f.productId === id);
    const now = new Date().toISOString();

    if (isDatabaseConnected()) {
      const updated = await FeaturedPhone.findOneAndUpdate(
        { $or: [{ id }, { productId: id }] },
        { ...updates, updatedAt: now },
        { new: true }
      ).lean();
      if (updated && index !== -1) {
        featuredPhonesStore[index] = { ...featuredPhonesStore[index]!, ...updates, updatedAt: now };
      }
      return (updated as unknown as FeaturedPhoneRecord) || null;
    }

    if (index === -1) return null;
    const current = featuredPhonesStore[index]!;
    const updated: FeaturedPhoneRecord = {
      ...current,
      ...updates,
      id: current.id,
      updatedAt: now,
    };
    featuredPhonesStore[index] = updated;
    return updated;
  }

  async deleteFeaturedProduct(id: string): Promise<FeaturedPhoneRecord | null> {
    await ensureContentSeeded();

    const index = featuredPhonesStore.findIndex((f) => f.id === id || f.productId === id);

    if (isDatabaseConnected()) {
      const deleted = await FeaturedPhone.findOneAndDelete({
        $or: [{ id }, { productId: id }],
      }).lean();
      if (index !== -1) {
        featuredPhonesStore.splice(index, 1);
      }
      return (deleted as unknown as FeaturedPhoneRecord) || null;
    }

    if (index === -1) return null;
    const [deleted] = featuredPhonesStore.splice(index, 1);
    return deleted || null;
  }

  // ==========================================
  // 3. Promotional Sections
  // ==========================================
  async getPromotionalSections(options: { status?: string } = {}): Promise<PromotionalSectionRecord[]> {
    await ensureContentSeeded();

    if (isDatabaseConnected()) {
      const query: any = {};
      if (options.status && options.status !== "all") {
        query.status = options.status;
      }
      const results = await PromotionalSection.find(query).sort({ displayOrder: 1 }).lean();
      return results as unknown as PromotionalSectionRecord[];
    }

    let sections = [...promotionalSectionsStore];
    if (options.status && options.status !== "all") {
      sections = sections.filter((s) => s.status === options.status);
    }
    sections.sort((a, b) => a.displayOrder - b.displayOrder);
    return sections;
  }

  async getPromotionalSectionById(id: string): Promise<PromotionalSectionRecord | null> {
    await ensureContentSeeded();

    if (isDatabaseConnected()) {
      const doc = await PromotionalSection.findOne({ $or: [{ id }, { sectionKey: id }] }).lean();
      return (doc as unknown as PromotionalSectionRecord) || null;
    }

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
    await ensureContentSeeded();

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

    if (isDatabaseConnected()) {
      await PromotionalSection.create(section);
    }

    return section;
  }

  async updatePromotionalSection(id: string, updates: Partial<PromotionalSectionRecord>): Promise<PromotionalSectionRecord | null> {
    await ensureContentSeeded();

    const index = promotionalSectionsStore.findIndex((s) => s.id === id || s.sectionKey === id);
    const now = new Date().toISOString();

    if (isDatabaseConnected()) {
      const updated = await PromotionalSection.findOneAndUpdate(
        { $or: [{ id }, { sectionKey: id }] },
        { ...updates, updatedAt: now },
        { new: true }
      ).lean();
      if (updated && index !== -1) {
        promotionalSectionsStore[index] = { ...promotionalSectionsStore[index]!, ...updates, updatedAt: now };
      }
      return (updated as unknown as PromotionalSectionRecord) || null;
    }

    if (index === -1) return null;
    const current = promotionalSectionsStore[index]!;
    const updated: PromotionalSectionRecord = {
      ...current,
      ...updates,
      id: current.id,
      updatedAt: now,
    };
    promotionalSectionsStore[index] = updated;
    return updated;
  }

  async deletePromotionalSection(id: string): Promise<PromotionalSectionRecord | null> {
    await ensureContentSeeded();

    const index = promotionalSectionsStore.findIndex((s) => s.id === id || s.sectionKey === id);

    if (isDatabaseConnected()) {
      const deleted = await PromotionalSection.findOneAndDelete({
        $or: [{ id }, { sectionKey: id }],
      }).lean();
      if (index !== -1) {
        promotionalSectionsStore.splice(index, 1);
      }
      return (deleted as unknown as PromotionalSectionRecord) || null;
    }

    if (index === -1) return null;
    const [deleted] = promotionalSectionsStore.splice(index, 1);
    return deleted || null;
  }

  async reorderSections(sectionIds: string[]): Promise<PromotionalSectionRecord[]> {
    await ensureContentSeeded();

    const now = new Date().toISOString();
    sectionIds.forEach((id, idx) => {
      const sec = promotionalSectionsStore.find((s) => s.id === id || s.sectionKey === id);
      if (sec) {
        sec.displayOrder = idx + 1;
        sec.updatedAt = now;
      }
    });

    if (isDatabaseConnected()) {
      await Promise.all(
        sectionIds.map((id, idx) =>
          PromotionalSection.updateOne(
            { $or: [{ id }, { sectionKey: id }] },
            { $set: { displayOrder: idx + 1, updatedAt: now } }
          )
        )
      );
    }

    return [...promotionalSectionsStore].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  // ==========================================
  // 4. New Arrivals Management
  // ==========================================
  async getNewArrivals(options: { status?: string; limit?: number } = {}): Promise<NewArrivalRecord[]> {
    await ensureContentSeeded();

    if (isDatabaseConnected()) {
      const query: any = {};
      if (options.status && options.status !== "all") {
        query.status = options.status;
      }
      let mQuery = NewArrival.find(query).sort({ displayOrder: 1 }).lean();
      if (options.limit && options.limit > 0) {
        mQuery = mQuery.limit(options.limit);
      }
      const results = (await mQuery) as unknown as NewArrivalRecord[];
      return results;
    }

    let items = [...newArrivalsStore];
    if (options.status && options.status !== "all") {
      items = items.filter((n) => n.status === options.status);
    }
    items.sort((a, b) => a.displayOrder - b.displayOrder);
    if (options.limit && options.limit > 0) {
      items = items.slice(0, options.limit);
    }
    return items;
  }

  async getNewArrivalById(id: string): Promise<NewArrivalRecord | null> {
    await ensureContentSeeded();

    if (isDatabaseConnected()) {
      const doc = await NewArrival.findOne({ $or: [{ id }, { productId: id }] }).lean();
      return (doc as unknown as NewArrivalRecord) || null;
    }

    const item = newArrivalsStore.find((n) => n.id === id || n.productId === id);
    return item || null;
  }

  async createNewArrival(data: {
    productId?: string;
    productName: string;
    productSubtitle?: string;
    productPrice: number;
    productImage?: string;
    series?: string;
    releaseDate?: string;
    tag?: string;
    isPreOrder?: boolean;
    displayOrder?: number;
    status?: "active" | "hidden";
    initialStock?: number;
  }): Promise<NewArrivalRecord> {
    await ensureContentSeeded();

    const now = new Date().toISOString();
    const item: NewArrivalRecord = {
      id: `new-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      productId: data.productId || `prod-${Date.now().toString(36)}`,
      productName: data.productName.trim(),
      productSubtitle: (data.productSubtitle || "Latest Hardware Drop").trim(),
      productPrice: Number(data.productPrice) || 999,
      productImage:
        data.productImage ||
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
      series: data.series || "Pro Series",
      releaseDate: data.releaseDate || now,
      tag: (data.tag || "Just Dropped").trim(),
      isPreOrder: Boolean(data.isPreOrder),
      displayOrder: data.displayOrder ?? newArrivalsStore.length + 1,
      status: data.status || "active",
      initialStock: Number(data.initialStock) || 500,
      createdAt: now,
      updatedAt: now,
    };

    newArrivalsStore.push(item);

    if (isDatabaseConnected()) {
      await NewArrival.create(item);
    }

    return item;
  }

  async updateNewArrival(id: string, updates: Partial<NewArrivalRecord>): Promise<NewArrivalRecord | null> {
    await ensureContentSeeded();

    const index = newArrivalsStore.findIndex((n) => n.id === id || n.productId === id);
    const now = new Date().toISOString();

    if (isDatabaseConnected()) {
      const updated = await NewArrival.findOneAndUpdate(
        { $or: [{ id }, { productId: id }] },
        { ...updates, updatedAt: now },
        { new: true }
      ).lean();
      if (updated && index !== -1) {
        newArrivalsStore[index] = { ...newArrivalsStore[index]!, ...updates, updatedAt: now };
      }
      return (updated as unknown as NewArrivalRecord) || null;
    }

    if (index === -1) return null;
    const current = newArrivalsStore[index]!;
    const updated: NewArrivalRecord = {
      ...current,
      ...updates,
      id: current.id,
      updatedAt: now,
    };
    newArrivalsStore[index] = updated;
    return updated;
  }

  async deleteNewArrival(id: string): Promise<NewArrivalRecord | null> {
    await ensureContentSeeded();

    const index = newArrivalsStore.findIndex((n) => n.id === id || n.productId === id);

    if (isDatabaseConnected()) {
      const deleted = await NewArrival.findOneAndDelete({
        $or: [{ id }, { productId: id }],
      }).lean();
      if (index !== -1) {
        newArrivalsStore.splice(index, 1);
      }
      return (deleted as unknown as NewArrivalRecord) || null;
    }

    if (index === -1) return null;
    const [deleted] = newArrivalsStore.splice(index, 1);
    return deleted || null;
  }

  // ==========================================
  // 5. Best Sellers Management
  // ==========================================
  async getBestSellers(options: { status?: string; limit?: number } = {}): Promise<BestSellerRecord[]> {
    await ensureContentSeeded();

    if (isDatabaseConnected()) {
      const query: any = {};
      if (options.status && options.status !== "all") {
        query.status = options.status;
      }
      let mQuery = BestSeller.find(query).sort({ rank: 1 }).lean();
      if (options.limit && options.limit > 0) {
        mQuery = mQuery.limit(options.limit);
      }
      const results = (await mQuery) as unknown as BestSellerRecord[];
      return results;
    }

    let items = [...bestSellersStore];
    if (options.status && options.status !== "all") {
      items = items.filter((b) => b.status === options.status);
    }
    items.sort((a, b) => a.rank - b.rank);
    if (options.limit && options.limit > 0) {
      items = items.slice(0, options.limit);
    }
    return items;
  }

  async getBestSellerById(id: string): Promise<BestSellerRecord | null> {
    await ensureContentSeeded();

    if (isDatabaseConnected()) {
      const doc = await BestSeller.findOne({ $or: [{ id }, { productId: id }] }).lean();
      return (doc as unknown as BestSellerRecord) || null;
    }

    const item = bestSellersStore.find((b) => b.id === id || b.productId === id);
    return item || null;
  }

  async createBestSeller(data: {
    productId?: string;
    productName: string;
    productSubtitle?: string;
    productPrice: number;
    productImage?: string;
    series?: string;
    rank?: number;
    unitsSold?: number;
    badge?: string;
    satisfactionRate?: number;
    monthlyGrowth?: number;
    status?: "active" | "hidden";
  }): Promise<BestSellerRecord> {
    await ensureContentSeeded();

    const now = new Date().toISOString();
    const item: BestSellerRecord = {
      id: `best-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      productId: data.productId || `prod-${Date.now().toString(36)}`,
      productName: data.productName.trim(),
      productSubtitle: (data.productSubtitle || "Top Volume Device").trim(),
      productPrice: Number(data.productPrice) || 1299,
      productImage:
        data.productImage ||
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
      series: data.series || "Pro Series",
      rank: Number(data.rank) || bestSellersStore.length + 1,
      unitsSold: Number(data.unitsSold) || 10000,
      badge: (data.badge || "Top Seller").trim(),
      satisfactionRate: Number(data.satisfactionRate) || 98.5,
      monthlyGrowth: Number(data.monthlyGrowth) || 12.0,
      status: data.status || "active",
      createdAt: now,
      updatedAt: now,
    };

    bestSellersStore.push(item);

    if (isDatabaseConnected()) {
      await BestSeller.create(item);
    }

    return item;
  }

  async updateBestSeller(id: string, updates: Partial<BestSellerRecord>): Promise<BestSellerRecord | null> {
    await ensureContentSeeded();

    const index = bestSellersStore.findIndex((b) => b.id === id || b.productId === id);
    const now = new Date().toISOString();

    if (isDatabaseConnected()) {
      const updated = await BestSeller.findOneAndUpdate(
        { $or: [{ id }, { productId: id }] },
        { ...updates, updatedAt: now },
        { new: true }
      ).lean();
      if (updated && index !== -1) {
        bestSellersStore[index] = { ...bestSellersStore[index]!, ...updates, updatedAt: now };
      }
      return (updated as unknown as BestSellerRecord) || null;
    }

    if (index === -1) return null;
    const current = bestSellersStore[index]!;
    const updated: BestSellerRecord = {
      ...current,
      ...updates,
      id: current.id,
      updatedAt: now,
    };
    bestSellersStore[index] = updated;
    return updated;
  }

  async deleteBestSeller(id: string): Promise<BestSellerRecord | null> {
    await ensureContentSeeded();

    const index = bestSellersStore.findIndex((b) => b.id === id || b.productId === id);

    if (isDatabaseConnected()) {
      const deleted = await BestSeller.findOneAndDelete({
        $or: [{ id }, { productId: id }],
      }).lean();
      if (index !== -1) {
        bestSellersStore.splice(index, 1);
      }
      return (deleted as unknown as BestSellerRecord) || null;
    }

    if (index === -1) return null;
    const [deleted] = bestSellersStore.splice(index, 1);
    return deleted || null;
  }

  // ==========================================
  // 6. Content Metrics
  // ==========================================
  async getMetrics() {
    await ensureContentSeeded();

    if (isDatabaseConnected()) {
      const [
        activeBanners,
        totalBanners,
        featuredPhonesCount,
        newArrivalsCount,
        bestSellersCount,
        activePromoSections,
        banners,
      ] = await Promise.all([
        HomepageBanner.countDocuments({ status: "active" }),
        HomepageBanner.countDocuments(),
        FeaturedPhone.countDocuments({ status: "active" }),
        NewArrival.countDocuments({ status: "active" }),
        BestSeller.countDocuments({ status: "active" }),
        PromotionalSection.countDocuments({ status: "active" }),
        HomepageBanner.find({}, "impressions clicks").lean(),
      ]);

      const totalBannerImpressions = banners.reduce((acc, b: any) => acc + (b.impressions || 0), 0);
      const totalBannerClicks = banners.reduce((acc, b: any) => acc + (b.clicks || 0), 0);
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
