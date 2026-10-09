import type {
  HomepageBanner,
  FeaturedPhone,
  NewArrival,
  BestSeller,
  PromotionalSection,
  ContentSummaryMetrics,
  CreateBannerPayload,
  CreateFeaturedPhonePayload,
  CreateNewArrivalPayload,
  CreateBestSellerPayload,
  CreatePromotionalSectionPayload,
} from "@/types/content";
import { appConfig } from "@/config/env";

const contentNow = Date.now();
const DAY_MS = 1000 * 60 * 60 * 24;

const FALLBACK_BANNERS: HomepageBanner[] = [
  {
    id: "banner-001",
    title: "NexPhone 15 Pro Max",
    subtitle: "Titanium aerospace chassis with uninterrupted global satellite VoIP everywhere on Earth.",
    badge: "Flagship Premiere",
    primaryCta: { label: "Configure & Order", url: "/products/p1" },
    secondaryCta: { label: "Explore 3D Digital Twin", url: "/products/p1" },
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80",
    gradientOverlay: "from-indigo-950/95 via-slate-900/80 to-transparent",
    alignment: "left",
    displayOrder: 1,
    status: "active",
    startDate: new Date(contentNow - 14 * DAY_MS).toISOString(),
    endDate: new Date(contentNow + 30 * DAY_MS).toISOString(),
    impressions: 48200,
    clicks: 4580,
    ctr: 9.5,
    createdAt: new Date(contentNow - 14 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow - 1 * DAY_MS).toISOString(),
  },
  {
    id: "banner-002",
    title: "Enterprise Fleet Edge Pack",
    subtitle: "Zero-touch remote eSIM bulk provisioning with guaranteed 99.999% encrypted uptime.",
    badge: "Enterprise Edition",
    primaryCta: { label: "Deploy Corporate Fleet", url: "/products/p2" },
    secondaryCta: { label: "Request Volume Quote", url: "/orders" },
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
    gradientOverlay: "from-purple-950/95 via-slate-900/80 to-transparent",
    alignment: "left",
    displayOrder: 2,
    status: "active",
    startDate: new Date(contentNow - 10 * DAY_MS).toISOString(),
    endDate: new Date(contentNow + 40 * DAY_MS).toISOString(),
    impressions: 34100,
    clicks: 2980,
    ctr: 8.7,
    createdAt: new Date(contentNow - 10 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow - 2 * DAY_MS).toISOString(),
  },
  {
    id: "banner-003",
    title: "Spring Fleet Expo 2026",
    subtitle: "Sitewide promotional discount of 12% plus free Satellite VoIP trial for 1 full year.",
    badge: "Active Sale Event",
    primaryCta: { label: "Shop Spring Specials", url: "/promotions" },
    secondaryCta: { label: "View Coupon Details", url: "/promotions" },
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    gradientOverlay: "from-cyan-950/95 via-slate-900/80 to-transparent",
    alignment: "center",
    displayOrder: 3,
    status: "active",
    startDate: new Date(contentNow - 3 * DAY_MS).toISOString(),
    endDate: new Date(contentNow + 4 * DAY_MS).toISOString(),
    impressions: 21900,
    clicks: 2450,
    ctr: 11.2,
    createdAt: new Date(contentNow - 3 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow).toISOString(),
  },
  {
    id: "banner-004",
    title: "NexPhone Fold Ultra",
    subtitle: "Seamless Dual-OLED foldable architecture built for high-throughput mobile telemetry analysts.",
    badge: "Upcoming Drop",
    primaryCta: { label: "Join VIP Waitlist", url: "/products/p4" },
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
    gradientOverlay: "from-amber-950/95 via-slate-900/80 to-transparent",
    alignment: "left",
    displayOrder: 4,
    status: "scheduled",
    startDate: new Date(contentNow + 5 * DAY_MS).toISOString(),
    endDate: new Date(contentNow + 35 * DAY_MS).toISOString(),
    impressions: 0,
    clicks: 0,
    ctr: 0.0,
    createdAt: new Date(contentNow - 1 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow - 1 * DAY_MS).toISOString(),
  },
];

const FALLBACK_FEATURED: FeaturedPhone[] = [
  {
    id: "feat-001",
    productId: "p1",
    productName: "NexPhone 15 Pro Max",
    productSubtitle: "Aerospace Titanium & Satellite Transceiver",
    productPrice: 1399,
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
    series: "Pro Series",
    badge: "Editor's Choice",
    headline: "The ultimate enterprise flagship with mil-spec durability.",
    displayOrder: 1,
    status: "active",
    rating: 4.9,
    highlightSpecs: ["Satellite VoIP Mesh", "Grade 5 Titanium", "72h Fleet Battery"],
    createdAt: new Date(contentNow - 30 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow - 2 * DAY_MS).toISOString(),
  },
  {
    id: "feat-002",
    productId: "p2",
    productName: "NexPhone Enterprise Edge",
    productSubtitle: "Corporate Fleet 5-Device Bundle Pack",
    productPrice: 4299,
    productImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    series: "Enterprise",
    badge: "Fleet Standard",
    headline: "Pre-configured for zero-touch cloud enrollment.",
    displayOrder: 2,
    status: "active",
    rating: 4.8,
    highlightSpecs: ["Remote eSIM Provisioning", "End-to-End Encryption", "Fleet SLA Support"],
    createdAt: new Date(contentNow - 25 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow - 1 * DAY_MS).toISOString(),
  },
  {
    id: "feat-003",
    productId: "p4",
    productName: "NexPhone Fold Ultra",
    productSubtitle: "Titanium Dual-Screen Precision Hinge",
    productPrice: 1799,
    productImage: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80",
    series: "Foldable",
    badge: "Titanium Foldable",
    headline: "Transforms from compact phone into an 8-inch tablet.",
    displayOrder: 3,
    status: "active",
    rating: 4.7,
    highlightSpecs: ["120Hz Dual AMOLED", "Zero-Crease Hinge", "Multi-Window VoIP"],
    createdAt: new Date(contentNow - 15 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow - 3 * DAY_MS).toISOString(),
  },
  {
    id: "feat-004",
    productId: "p3",
    productName: "NexPhone Lite",
    productSubtitle: "High-Efficiency Everyday Communicator",
    productPrice: 699,
    productImage: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80",
    series: "Lite",
    badge: "Best Value",
    headline: "Flagship performance in a featherweight frame.",
    displayOrder: 4,
    status: "active",
    rating: 4.6,
    highlightSpecs: ["Snapdragon 8 Gen 3", "All-Day Battery", "Fast 65W GaN Charge"],
    createdAt: new Date(contentNow - 20 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow - 4 * DAY_MS).toISOString(),
  },
];

const FALLBACK_NEW_ARRIVALS: NewArrival[] = [
  {
    id: "new-001",
    productId: "p1",
    productName: "NexPhone 15 Pro Max (Titanium Natural)",
    productSubtitle: "New Raw Polished Finish with Ceramic Shield",
    productPrice: 1399,
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
    series: "Pro Series",
    releaseDate: new Date(contentNow - 5 * DAY_MS).toISOString(),
    tag: "Just Dropped",
    isPreOrder: false,
    displayOrder: 1,
    status: "active",
    initialStock: 450,
    createdAt: new Date(contentNow - 5 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow).toISOString(),
  },
  {
    id: "new-002",
    productId: "p4",
    productName: "NexPhone Fold Ultra Dual-SIM",
    productSubtitle: "Global Dual Active Satellite & 5G mmWave",
    productPrice: 1799,
    productImage: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80",
    series: "Foldable",
    releaseDate: new Date(contentNow + 12 * DAY_MS).toISOString(),
    tag: "Pre-Order Now",
    isPreOrder: true,
    displayOrder: 2,
    status: "active",
    initialStock: 200,
    createdAt: new Date(contentNow - 8 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow - 1 * DAY_MS).toISOString(),
  },
  {
    id: "new-003",
    productId: "acc-01",
    productName: "NexPhone Fleet Inductive Charger Hub",
    productSubtitle: "Multi-device 100W wireless dock with telemetry LED",
    productPrice: 249,
    productImage: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=600&q=80",
    series: "Accessories",
    releaseDate: new Date(contentNow - 3 * DAY_MS).toISOString(),
    tag: "New Hardware",
    isPreOrder: false,
    displayOrder: 3,
    status: "active",
    initialStock: 800,
    createdAt: new Date(contentNow - 3 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow).toISOString(),
  },
  {
    id: "new-004",
    productId: "p3",
    productName: "NexPhone Lite (Midnight Navy Edition)",
    productSubtitle: "Special edition anodized aerospace aluminum",
    productPrice: 699,
    productImage: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80",
    series: "Lite",
    releaseDate: new Date(contentNow - 2 * DAY_MS).toISOString(),
    tag: "New Colorway",
    isPreOrder: false,
    displayOrder: 4,
    status: "active",
    initialStock: 350,
    createdAt: new Date(contentNow - 2 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow).toISOString(),
  },
];

const FALLBACK_BEST_SELLERS: BestSeller[] = [
  {
    id: "best-001",
    productId: "p1",
    productName: "NexPhone 15 Pro Max",
    productSubtitle: "Top-selling enterprise executive communicator",
    productPrice: 1399,
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
    series: "Pro Series",
    rank: 1,
    unitsSold: 38420,
    badge: "#1 Fleet Bestseller",
    satisfactionRate: 99.2,
    monthlyGrowth: 18.5,
    status: "active",
    createdAt: new Date(contentNow - 90 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow - 2 * DAY_MS).toISOString(),
  },
  {
    id: "best-002",
    productId: "p2",
    productName: "NexPhone Enterprise Edge",
    productSubtitle: "Leading corporate bulk deployment hardware pack",
    productPrice: 4299,
    productImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    series: "Enterprise",
    rank: 2,
    unitsSold: 24190,
    badge: "Top Corporate Volume",
    satisfactionRate: 98.8,
    monthlyGrowth: 14.2,
    status: "active",
    createdAt: new Date(contentNow - 80 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow - 1 * DAY_MS).toISOString(),
  },
  {
    id: "best-003",
    productId: "p3",
    productName: "NexPhone Lite",
    productSubtitle: "Universal commercial & education favorite",
    productPrice: 699,
    productImage: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80",
    series: "Lite",
    rank: 3,
    unitsSold: 19300,
    badge: "Value Leader",
    satisfactionRate: 97.4,
    monthlyGrowth: 9.8,
    status: "active",
    createdAt: new Date(contentNow - 70 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow - 3 * DAY_MS).toISOString(),
  },
  {
    id: "best-004",
    productId: "p4",
    productName: "NexPhone Fold Ultra",
    productSubtitle: "Breakthrough foldable productivity powerhouse",
    productPrice: 1799,
    productImage: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80",
    series: "Foldable",
    rank: 4,
    unitsSold: 12850,
    badge: "Fastest Growing",
    satisfactionRate: 98.1,
    monthlyGrowth: 26.4,
    status: "active",
    createdAt: new Date(contentNow - 40 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow - 1 * DAY_MS).toISOString(),
  },
];

const FALLBACK_PROMO_SECTIONS: PromotionalSection[] = [
  {
    id: "sec-001",
    sectionKey: "trade_in_bar",
    title: "Trade In & Upgrade Your Fleet",
    subtitle: "Get up to $650 instant credit when exchanging qualified previous-generation hardware devices.",
    type: "split_banner",
    ctaLabel: "Estimate Fleet Trade-In Value",
    ctaUrl: "/orders",
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80",
    accentColor: "indigo",
    displayOrder: 1,
    status: "active",
    features: [
      { icon: "shield", title: "Guaranteed Valuation", desc: "Lock in trade-in prices for 30 calendar days." },
      { icon: "refresh", title: "Direct Credit", desc: "Instant checkout offset against new hardware purchases." },
      { icon: "trash", title: "Certified Data Wipe", desc: "DoD 5220.22-M compliant permanent memory sanitization." },
    ],
    createdAt: new Date(contentNow - 30 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow - 1 * DAY_MS).toISOString(),
  },
  {
    id: "sec-002",
    sectionKey: "satellite_voip_grid",
    title: "Unbroken Satellite VoIP Infrastructure",
    subtitle: "NexPhone mesh networks connect directly to low-earth orbit constellations for zero dead zones anywhere on Earth.",
    type: "feature_grid",
    ctaLabel: "View Telemetry Coverage Map",
    ctaUrl: "/telemetry",
    accentColor: "cyan",
    displayOrder: 2,
    status: "active",
    features: [
      { icon: "signal", title: "Zero Signal Blindspots", desc: "Autonomous satellite handoff in remote ocean, desert, or mountain zones." },
      { icon: "lock", title: "Post-Quantum Cryptography", desc: "Kyber-1024 encryption shielding all voice calls and packet telemetry." },
      { icon: "cpu", title: "Sub-20ms VoIP Latency", desc: "Direct packet acceleration routing to nearest satellite gateway." },
    ],
    createdAt: new Date(contentNow - 25 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow - 2 * DAY_MS).toISOString(),
  },
  {
    id: "sec-003",
    sectionKey: "enterprise_fleet_block",
    title: "Enterprise Flexible Fleet Financing",
    subtitle: "Equip your workforce with 0% APR for 24 months, complete with enterprise swap warranty replacement within 24 hours.",
    type: "callout_card",
    ctaLabel: "Speak with Fleet Advisor",
    ctaUrl: "/customers",
    accentColor: "emerald",
    displayOrder: 3,
    status: "active",
    features: [
      { icon: "check", title: "0% Corporate APR", desc: "Predictable monthly hardware expenses with zero hidden leasing fees." },
      { icon: "truck", title: "24-Hour Hot Swap", desc: "Immediate overnight hardware replacements for critical personnel." },
    ],
    createdAt: new Date(contentNow - 20 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow - 3 * DAY_MS).toISOString(),
  },
];

const localBanners = [...FALLBACK_BANNERS];
const localFeatured = [...FALLBACK_FEATURED];
const localNewArrivals = [...FALLBACK_NEW_ARRIVALS];
const localBestSellers = [...FALLBACK_BEST_SELLERS];
const localPromoSections = [...FALLBACK_PROMO_SECTIONS];

export const ContentService = {
  // --- Homepage Banners ---
  async getBanners(): Promise<HomepageBanner[]> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/banners`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      return [...localBanners].sort((a, b) => a.displayOrder - b.displayOrder);
    }
  },

  async createBanner(payload: CreateBannerPayload): Promise<HomepageBanner> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/banners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const created = await res.json();
      localBanners.push(created);
      return created;
    } catch {
      const now = new Date().toISOString();
      const newBanner: HomepageBanner = {
        id: `banner-${Date.now().toString(36)}`,
        title: payload.title.trim(),
        subtitle: payload.subtitle.trim(),
        badge: payload.badge || "Featured",
        primaryCta: payload.primaryCta,
        secondaryCta: payload.secondaryCta,
        imageUrl: payload.imageUrl,
        gradientOverlay: payload.gradientOverlay || "from-indigo-950/95 via-slate-900/80 to-transparent",
        alignment: payload.alignment || "left",
        displayOrder: payload.displayOrder || localBanners.length + 1,
        status: payload.status || "active",
        startDate: payload.startDate || now,
        endDate: payload.endDate || null,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        createdAt: now,
        updatedAt: now,
      };
      localBanners.push(newBanner);
      return newBanner;
    }
  },

  async updateBanner(id: string, updates: Partial<CreateBannerPayload>): Promise<HomepageBanner> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/banners/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const updated = await res.json();
      const idx = localBanners.findIndex((b) => b.id === id);
      if (idx !== -1) localBanners[idx] = updated;
      return updated;
    } catch {
      const idx = localBanners.findIndex((b) => b.id === id);
      if (idx === -1) throw new Error("Banner not found");
      const current = localBanners[idx]!;
      const updated: HomepageBanner = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localBanners[idx] = updated;
      return updated;
    }
  },

  async deleteBanner(id: string): Promise<HomepageBanner> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/banners/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const idx = localBanners.findIndex((b) => b.id === id);
      if (idx !== -1) localBanners.splice(idx, 1);
      return data.banner;
    } catch {
      const idx = localBanners.findIndex((b) => b.id === id);
      if (idx === -1) throw new Error("Banner not found");
      const [deleted] = localBanners.splice(idx, 1);
      return deleted!;
    }
  },

  // --- Featured Phones ---
  async getFeaturedPhones(): Promise<FeaturedPhone[]> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/featured`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      return [...localFeatured].sort((a, b) => a.displayOrder - b.displayOrder);
    }
  },

  async addFeaturedPhone(payload: CreateFeaturedPhonePayload): Promise<FeaturedPhone> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/featured`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const created = await res.json();
      localFeatured.push(created);
      return created;
    } catch {
      const now = new Date().toISOString();
      const newFeat: FeaturedPhone = {
        id: `feat-${Date.now().toString(36)}`,
        productId: payload.productId,
        productName: payload.productName,
        productSubtitle: payload.productSubtitle,
        productPrice: payload.productPrice,
        productImage: payload.productImage,
        series: payload.series,
        badge: payload.badge,
        headline: payload.headline,
        displayOrder: payload.displayOrder || localFeatured.length + 1,
        status: payload.status || "active",
        rating: payload.rating || 4.8,
        highlightSpecs: payload.highlightSpecs || ["Satellite VoIP", "Titanium Frame"],
        createdAt: now,
        updatedAt: now,
      };
      localFeatured.push(newFeat);
      return newFeat;
    }
  },

  async createFeaturedPhone(payload: CreateFeaturedPhonePayload): Promise<FeaturedPhone> {
    return this.addFeaturedPhone(payload);
  },

  async updateFeaturedPhone(id: string, updates: Partial<CreateFeaturedPhonePayload>): Promise<FeaturedPhone> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/featured/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const updated = await res.json();
      const idx = localFeatured.findIndex((f) => f.id === id);
      if (idx !== -1) localFeatured[idx] = updated;
      return updated;
    } catch {
      const idx = localFeatured.findIndex((f) => f.id === id);
      if (idx === -1) throw new Error("Featured phone entry not found");
      const current = localFeatured[idx]!;
      const updated: FeaturedPhone = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localFeatured[idx] = updated;
      return updated;
    }
  },

  async deleteFeaturedPhone(id: string): Promise<FeaturedPhone> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/featured/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const idx = localFeatured.findIndex((f) => f.id === id);
      if (idx !== -1) localFeatured.splice(idx, 1);
      return data.item;
    } catch {
      const idx = localFeatured.findIndex((f) => f.id === id);
      if (idx === -1) throw new Error("Featured phone not found");
      const [deleted] = localFeatured.splice(idx, 1);
      return deleted!;
    }
  },

  // --- New Arrivals ---
  async getNewArrivals(): Promise<NewArrival[]> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/new-arrivals`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      return [...localNewArrivals].sort((a, b) => a.displayOrder - b.displayOrder);
    }
  },

  async addNewArrival(payload: CreateNewArrivalPayload): Promise<NewArrival> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/new-arrivals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const created = await res.json();
      localNewArrivals.push(created);
      return created;
    } catch {
      const now = new Date().toISOString();
      const newItem: NewArrival = {
        id: `new-${Date.now().toString(36)}`,
        productId: payload.productId,
        productName: payload.productName,
        productSubtitle: payload.productSubtitle,
        productPrice: payload.productPrice,
        productImage: payload.productImage,
        series: payload.series,
        releaseDate: payload.releaseDate || now,
        tag: payload.tag,
        isPreOrder: Boolean(payload.isPreOrder),
        displayOrder: payload.displayOrder || localNewArrivals.length + 1,
        status: payload.status || "active",
        initialStock: payload.initialStock || 500,
        createdAt: now,
        updatedAt: now,
      };
      localNewArrivals.push(newItem);
      return newItem;
    }
  },

  async createNewArrival(payload: CreateNewArrivalPayload): Promise<NewArrival> {
    return this.addNewArrival(payload);
  },

  async updateNewArrival(id: string, updates: Partial<CreateNewArrivalPayload>): Promise<NewArrival> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/new-arrivals/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const updated = await res.json();
      const idx = localNewArrivals.findIndex((n) => n.id === id);
      if (idx !== -1) localNewArrivals[idx] = updated;
      return updated;
    } catch {
      const idx = localNewArrivals.findIndex((n) => n.id === id);
      if (idx === -1) throw new Error("New arrival entry not found");
      const current = localNewArrivals[idx]!;
      const updated: NewArrival = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localNewArrivals[idx] = updated;
      return updated;
    }
  },

  async deleteNewArrival(id: string): Promise<NewArrival> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/new-arrivals/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const idx = localNewArrivals.findIndex((n) => n.id === id);
      if (idx !== -1) localNewArrivals.splice(idx, 1);
      return data.item;
    } catch {
      const idx = localNewArrivals.findIndex((n) => n.id === id);
      if (idx === -1) throw new Error("New arrival entry not found");
      const [deleted] = localNewArrivals.splice(idx, 1);
      return deleted!;
    }
  },

  // --- Best Sellers ---
  async getBestSellers(): Promise<BestSeller[]> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/best-sellers`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      return [...localBestSellers].sort((a, b) => a.rank - b.rank);
    }
  },

  async addBestSeller(payload: CreateBestSellerPayload): Promise<BestSeller> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/best-sellers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const created = await res.json();
      localBestSellers.push(created);
      return created;
    } catch {
      const now = new Date().toISOString();
      const newItem: BestSeller = {
        id: `best-${Date.now().toString(36)}`,
        productId: payload.productId,
        productName: payload.productName,
        productSubtitle: payload.productSubtitle,
        productPrice: payload.productPrice,
        productImage: payload.productImage,
        series: payload.series,
        rank: payload.rank || localBestSellers.length + 1,
        unitsSold: payload.unitsSold || 5000,
        badge: payload.badge,
        satisfactionRate: payload.satisfactionRate || 98.0,
        monthlyGrowth: payload.monthlyGrowth || 10.0,
        status: payload.status || "active",
        createdAt: now,
        updatedAt: now,
      };
      localBestSellers.push(newItem);
      return newItem;
    }
  },

  async createBestSeller(payload: CreateBestSellerPayload): Promise<BestSeller> {
    return this.addBestSeller(payload);
  },

  async updateBestSeller(id: string, updates: Partial<CreateBestSellerPayload>): Promise<BestSeller> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/best-sellers/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const updated = await res.json();
      const idx = localBestSellers.findIndex((b) => b.id === id);
      if (idx !== -1) localBestSellers[idx] = updated;
      return updated;
    } catch {
      const idx = localBestSellers.findIndex((b) => b.id === id);
      if (idx === -1) throw new Error("Best seller entry not found");
      const current = localBestSellers[idx]!;
      const updated: BestSeller = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localBestSellers[idx] = updated;
      return updated;
    }
  },

  async deleteBestSeller(id: string): Promise<BestSeller> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/best-sellers/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const idx = localBestSellers.findIndex((b) => b.id === id);
      if (idx !== -1) localBestSellers.splice(idx, 1);
      return data.item;
    } catch {
      const idx = localBestSellers.findIndex((b) => b.id === id);
      if (idx === -1) throw new Error("Best seller entry not found");
      const [deleted] = localBestSellers.splice(idx, 1);
      return deleted!;
    }
  },

  // --- Promotional Sections ---
  async getPromoSections(): Promise<PromotionalSection[]> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/promo-sections`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      return [...localPromoSections].sort((a, b) => a.displayOrder - b.displayOrder);
    }
  },

  async createPromoSection(payload: CreatePromotionalSectionPayload): Promise<PromotionalSection> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/promo-sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const created = await res.json();
      localPromoSections.push(created);
      return created;
    } catch {
      const now = new Date().toISOString();
      const newSec: PromotionalSection = {
        id: `sec-${Date.now().toString(36)}`,
        sectionKey: payload.sectionKey,
        title: payload.title,
        subtitle: payload.subtitle,
        type: payload.type,
        ctaLabel: payload.ctaLabel,
        ctaUrl: payload.ctaUrl,
        imageUrl: payload.imageUrl,
        accentColor: payload.accentColor,
        displayOrder: payload.displayOrder || localPromoSections.length + 1,
        status: payload.status || "active",
        features: payload.features || [],
        createdAt: now,
        updatedAt: now,
      };
      localPromoSections.push(newSec);
      return newSec;
    }
  },

  async updatePromoSection(id: string, updates: Partial<CreatePromotionalSectionPayload>): Promise<PromotionalSection> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/promo-sections/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const updated = await res.json();
      const idx = localPromoSections.findIndex((s) => s.id === id);
      if (idx !== -1) localPromoSections[idx] = updated;
      return updated;
    } catch {
      const idx = localPromoSections.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error("Promotional section not found");
      const current = localPromoSections[idx]!;
      const updated: PromotionalSection = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localPromoSections[idx] = updated;
      return updated;
    }
  },

  async deletePromoSection(id: string): Promise<PromotionalSection> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/promo-sections/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const idx = localPromoSections.findIndex((s) => s.id === id);
      if (idx !== -1) localPromoSections.splice(idx, 1);
      return data.item;
    } catch {
      const idx = localPromoSections.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error("Promotional section not found");
      const [deleted] = localPromoSections.splice(idx, 1);
      return deleted!;
    }
  },

  // --- Summary Metrics ---
  async getMetrics(): Promise<ContentSummaryMetrics> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/content/metrics`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      const activeBanners = localBanners.filter((b) => b.status === "active").length;
      const totalBanners = localBanners.length;
      const featuredPhonesCount = localFeatured.filter((f) => f.status === "active").length;
      const newArrivalsCount = localNewArrivals.filter((n) => n.status === "active").length;
      const bestSellersCount = localBestSellers.filter((b) => b.status === "active").length;
      const activePromoSections = localPromoSections.filter((p) => p.status === "active").length;

      const totalBannerImpressions = localBanners.reduce((acc, b) => acc + (b.impressions || 0), 0);
      const totalBannerClicks = localBanners.reduce((acc, b) => acc + (b.clicks || 0), 0);
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
  },
};
