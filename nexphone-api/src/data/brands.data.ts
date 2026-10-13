// Brands Catalog Data & CRUD Endpoints
export interface BrandRecord {
  id: string;
  name: string;
  slug: string;
  code: string;
  logoUrl?: string;
  logoIcon?: "shield" | "sparkles" | "cpu" | "globe" | "zap" | "gem" | "layers";
  accentColor: string;
  description: string;
  country: string;
  headquarters: string;
  foundedYear: number;
  website: string;
  supportEmail: string;
  status: "active" | "inactive" | "pending";
  tier: "Flagship" | "Enterprise" | "OEM Partner" | "Strategic";
  isFeatured: boolean;
  deviceCount: number;
  marketShare: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export const brandsCatalog: BrandRecord[] = [
  {
    id: "brand-001",
    name: "NexPhone Labs",
    slug: "nexphone-labs",
    code: "NX",
    logoIcon: "sparkles",
    accentColor: "#6366f1",
    description: "Pioneering next-generation quantum-accelerated smartphones with native NexOS intelligence, titanium precision architecture, and enterprise VoIP encryption.",
    country: "United States",
    headquarters: "San Francisco, CA",
    foundedYear: 2024,
    website: "https://nexphone.io",
    supportEmail: "engineering@nexphone.io",
    status: "active",
    tier: "Flagship",
    isFeatured: true,
    deviceCount: 4,
    marketShare: "38.4%",
    rating: 4.9,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-10-07T12:00:00.000Z",
  },
  {
    id: "brand-002",
    name: "Titanium Dynamics",
    slug: "titanium-dynamics",
    code: "TTN",
    logoIcon: "shield",
    accentColor: "#0ea5e9",
    description: "Specialized in ultra-rugged aerospace grade titanium alloys, mil-spec drops, extreme environment survival, and secure satellite communications.",
    country: "Germany",
    headquarters: "Munich, Bavaria",
    foundedYear: 2021,
    website: "https://titanium-dynamics.de",
    supportEmail: "partner-support@titanium-dynamics.de",
    status: "active",
    tier: "Flagship",
    isFeatured: true,
    deviceCount: 2,
    marketShare: "22.1%",
    rating: 4.8,
    createdAt: "2026-08-10T14:30:00.000Z",
    updatedAt: "2026-10-06T15:20:00.000Z",
  },
  {
    id: "brand-003",
    name: "Aero Dynamic Tech",
    slug: "aero-dynamic-tech",
    code: "AERO",
    logoIcon: "zap",
    accentColor: "#10b981",
    description: "Engineers of featherweight aeronautical composites, carbon fiber unibody enclosures, and high-efficiency thermal vapor chamber architecture.",
    country: "Japan",
    headquarters: "Tokyo, Chiyoda",
    foundedYear: 2019,
    website: "https://aerotech.co.jp",
    supportEmail: "contact@aerotech.co.jp",
    status: "active",
    tier: "OEM Partner",
    isFeatured: false,
    deviceCount: 1,
    marketShare: "14.8%",
    rating: 4.7,
    createdAt: "2026-08-15T09:15:00.000Z",
    updatedAt: "2026-10-05T11:45:00.000Z",
  },
  {
    id: "brand-004",
    name: "Quantum Devices Inc",
    slug: "quantum-devices",
    code: "QTM",
    logoIcon: "cpu",
    accentColor: "#8b5cf6",
    description: "Enterprise grade communications hardware, zero-trust hardware security modules (HSM), biometric defense clusters, and dedicated private APN modems.",
    country: "United Kingdom",
    headquarters: "London, City",
    foundedYear: 2020,
    website: "https://quantumdevices.co.uk",
    supportEmail: "fleet-sales@quantumdevices.co.uk",
    status: "active",
    tier: "Enterprise",
    isFeatured: true,
    deviceCount: 3,
    marketShare: "11.2%",
    rating: 4.8,
    createdAt: "2026-08-20T16:00:00.000Z",
    updatedAt: "2026-10-04T17:10:00.000Z",
  },
  {
    id: "brand-005",
    name: "Apex Mobile Systems",
    slug: "apex-mobile-systems",
    code: "APX",
    logoIcon: "gem",
    accentColor: "#f59e0b",
    description: "Next-generation foldable displays, zero-gap flex teardrop hinge patents, and ultra-high dynamic range micro-lens array OLED technologies.",
    country: "South Korea",
    headquarters: "Seoul, Gangnam",
    foundedYear: 2023,
    website: "https://apexmobile.kr",
    supportEmail: "bd@apexmobile.kr",
    status: "pending",
    tier: "Strategic",
    isFeatured: false,
    deviceCount: 0,
    marketShare: "8.5%",
    rating: 4.6,
    createdAt: "2026-09-01T11:00:00.000Z",
    updatedAt: "2026-10-02T13:30:00.000Z",
  },
  {
    id: "brand-006",
    name: "Lumina Telecom",
    slug: "lumina-telecom",
    code: "LMN",
    logoIcon: "globe",
    accentColor: "#ec4899",
    description: "Carrier infrastructure grade handsets, optimized for massive low-earth orbit satellite direct-to-cell links and high-bandwidth millimeter wave antennas.",
    country: "Singapore",
    headquarters: "Marina Bay Financial Centre",
    foundedYear: 2022,
    website: "https://luminatelecom.sg",
    supportEmail: "support@luminatelecom.sg",
    status: "inactive",
    tier: "Enterprise",
    isFeatured: false,
    deviceCount: 1,
    marketShare: "5.0%",
    rating: 4.4,
    createdAt: "2026-09-10T08:20:00.000Z",
    updatedAt: "2026-09-28T09:15:00.000Z",
  },
];
