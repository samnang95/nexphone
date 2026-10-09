import { appConfig } from "@/app/config/env";
import type {
  HomepageBanner,
  FeaturedPhone,
  NewArrival,
  BestSeller,
  PromotionalSection,
} from "@/types/content";

const API_BASE = appConfig.apiUrl.replace(/\/api\/?$/, "");

const contentNow = Date.now();
const DAY_MS = 1000 * 60 * 60 * 24;

const FALLBACK_BANNERS: HomepageBanner[] = [
  {
    id: "banner-001",
    title: "NexPhone 15 Pro Max",
    subtitle: "Aerospace Titanium frame with uninterrupted dual quantum enclaves and direct satellite uplink anywhere on Earth.",
    badge: "Flagship Premiere",
    primaryCta: { label: "Configure & Reserve", url: "/products/p1" },
    secondaryCta: { label: "Explore Titanium 3D", url: "/products/p1" },
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
    subtitle: "Zero-touch remote eSIM bulk provisioning with guaranteed 99.999% encrypted corporate communications uptime.",
    badge: "Enterprise Edition",
    primaryCta: { label: "Deploy Corporate Fleet", url: "/products/p2" },
    secondaryCta: { label: "Request Volume Quote", url: "/register" },
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
    subtitle: "Exclusive limited-time savings of $150 on flagship handsets, plus complimentary 1-year satellite data roaming.",
    badge: "Active Event",
    primaryCta: { label: "Shop Spring Specials", url: "#deals-section" },
    secondaryCta: { label: "View Coupon Details", url: "#deals-section" },
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
    subtitle: "Breakthrough zero-crease titanium dual display. Unfolds into an 8.1-inch workstation with stylus precision.",
    badge: "Upcoming Drop",
    primaryCta: { label: "Join VIP Waitlist", url: "/register" },
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
    gradientOverlay: "from-amber-950/95 via-slate-900/80 to-transparent",
    alignment: "left",
    displayOrder: 4,
    status: "active",
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
    headline: "The ultimate enterprise flagship with military-spec zero-trust enclave.",
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
    headline: "Pre-configured for zero-touch cloud enrollment with 24/7 SLA.",
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
    headline: "Transforms effortlessly from sleek phone into an 8.1-inch tablet.",
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
    headline: "Flagship performance and security in a featherweight frame.",
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

const FALLBACK_PROMOTIONAL_SECTIONS: PromotionalSection[] = [
  {
    id: "sec-001",
    sectionKey: "trade_in_bar",
    title: "Trade In & Upgrade Your Fleet",
    subtitle: "Get up to $650 instant credit when exchanging qualified previous-generation hardware devices.",
    type: "split_banner",
    ctaLabel: "Estimate Fleet Trade-In Value",
    ctaUrl: "/register",
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
    sectionKey: "satellite_mesh_promo",
    title: "1-Year Complimentary Satellite Uplink",
    subtitle: "Every NexPhone 15 Pro Max and Fold Ultra order includes global satellite VoIP connectivity at zero charge.",
    type: "callout_card",
    ctaLabel: "View Global Coverage Map",
    ctaUrl: "/products/p1",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    accentColor: "cyan",
    displayOrder: 2,
    status: "active",
    createdAt: new Date(contentNow - 20 * DAY_MS).toISOString(),
    updatedAt: new Date(contentNow - 2 * DAY_MS).toISOString(),
  },
];

export const contentService = {
  async getBanners(): Promise<HomepageBanner[]> {
    try {
      const res = await fetch(`${API_BASE}/api/content/banners`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch banners");
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : FALLBACK_BANNERS;
    } catch {
      return FALLBACK_BANNERS;
    }
  },

  async getFeaturedPhones(): Promise<FeaturedPhone[]> {
    try {
      const res = await fetch(`${API_BASE}/api/content/featured`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch featured phones");
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : FALLBACK_FEATURED;
    } catch {
      return FALLBACK_FEATURED;
    }
  },

  async getNewArrivals(): Promise<NewArrival[]> {
    try {
      const res = await fetch(`${API_BASE}/api/content/new-arrivals`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch new arrivals");
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : FALLBACK_NEW_ARRIVALS;
    } catch {
      return FALLBACK_NEW_ARRIVALS;
    }
  },

  async getBestSellers(): Promise<BestSeller[]> {
    try {
      const res = await fetch(`${API_BASE}/api/content/best-sellers`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch best sellers");
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : FALLBACK_BEST_SELLERS;
    } catch {
      return FALLBACK_BEST_SELLERS;
    }
  },

  async getPromotionalSections(): Promise<PromotionalSection[]> {
    try {
      const res = await fetch(`${API_BASE}/api/content/promo-sections`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch promotional sections");
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : FALLBACK_PROMOTIONAL_SECTIONS;
    } catch {
      return FALLBACK_PROMOTIONAL_SECTIONS;
    }
  },
};
