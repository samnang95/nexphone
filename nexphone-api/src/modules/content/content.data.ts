// ==========================================
// CONTENT MANAGEMENT STORE & ENDPOINTS
// ==========================================

export interface HomepageBannerRecord {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  primaryCta: { label: string; url: string };
  secondaryCta?: { label: string; url: string };
  imageUrl: string;
  gradientOverlay: string;
  alignment: "left" | "center" | "right";
  displayOrder: number;
  status: "active" | "scheduled" | "draft" | "hidden";
  startDate: string;
  endDate?: string | null;
  impressions: number;
  clicks: number;
  ctr: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeaturedPhoneRecord {
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

export interface NewArrivalRecord {
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

export interface BestSellerRecord {
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

export interface PromotionalSectionRecord {
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
  features?: Array<{ icon: string; title: string; desc: string }>;
  createdAt: string;
  updatedAt: string;
}

export const contentNow = Date.now();
export const DAY_MS = 1000 * 60 * 60 * 24;

export const homepageBannersStore: HomepageBannerRecord[] = [
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

export const featuredPhonesStore: FeaturedPhoneRecord[] = [
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

export const newArrivalsStore: NewArrivalRecord[] = [
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

export const bestSellersStore: BestSellerRecord[] = [
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

export const promotionalSectionsStore: PromotionalSectionRecord[] = [
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
