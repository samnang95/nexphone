import type { Brand, BrandFilterState, BrandFormData } from "@/types/brand";
import { appConfig } from "@/config/env";

/**
 * Initial memory catalog of Brand Partners with metadata,
 * regional HQ, active hardware count, market presence, and brand accents.
 */
let memoryBrands: Brand[] = [
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

export const brandService = {
  /**
   * Retrieves list of brands with optional client or server filtering.
   */
  async fetchBrands(filters?: Partial<BrandFilterState>): Promise<Brand[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status && filters.status !== "all") {
        queryParams.set("status", filters.status);
      }
      if (filters?.tier && filters.tier !== "all") {
        queryParams.set("tier", filters.tier);
      }
      if (filters?.search && filters.search.trim()) {
        queryParams.set("search", filters.search.trim());
      }

      const queryString = queryParams.toString();
      const endpoint = `${appConfig.apiUrl}/brands${queryString ? `?${queryString}` : ""}`;

      const res = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          memoryBrands = data;
          return this.applyLocalFilters(memoryBrands, filters);
        }
      }
    } catch {
      // Fallback to local memory catalog if API server is offline or unreachable
    }

    return this.applyLocalFilters(memoryBrands, filters);
  },

  /**
   * Filter and sort helper
   */
  applyLocalFilters(brands: Brand[], filters?: Partial<BrandFilterState>): Brand[] {
    let result = [...brands];

    if (filters?.status && filters.status !== "all") {
      result = result.filter((b) => b.status === filters.status);
    }

    if (filters?.tier && filters.tier !== "all") {
      result = result.filter((b) => b.tier === filters.tier);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q) ||
          b.country.toLowerCase().includes(q) ||
          b.headquarters.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
      );
    }

    if (filters?.sortBy) {
      result.sort((a, b) => {
        let valA: string | number = a[filters.sortBy as keyof Brand] as string | number;
        let valB: string | number = b[filters.sortBy as keyof Brand] as string | number;

        if (filters.sortBy === "marketShare") {
          valA = parseFloat(a.marketShare.replace("%", "")) || 0;
          valB = parseFloat(b.marketShare.replace("%", "")) || 0;
        }

        if (valA < valB) return filters.sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return filters.sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  },

  /**
   * Get brand by ID
   */
  async getBrandById(id: string): Promise<Brand | null> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/brands/${encodeURIComponent(id)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Local fallback
    }

    return memoryBrands.find((b) => b.id === id) || null;
  },

  /**
   * Create a new Brand
   */
  async createBrand(data: BrandFormData): Promise<Brand> {
    const newBrand: Brand = {
      ...data,
      id: `brand-${Date.now().toString(36)}`,
      deviceCount: 0,
      marketShare: data.marketShare || "0.0%",
      rating: 5.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${appConfig.apiUrl}/brands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBrand),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const created = await res.json();
        memoryBrands.unshift(created);
        return created;
      }
    } catch {
      // Local fallback
    }

    memoryBrands.unshift(newBrand);
    return newBrand;
  },

  /**
   * Update an existing Brand
   */
  async updateBrand(id: string, data: Partial<BrandFormData>): Promise<Brand> {
    const existingIndex = memoryBrands.findIndex((b) => b.id === id);
    const existing = memoryBrands[existingIndex];

    const updatedBrand: Brand = {
      ...(existing || ({} as Brand)),
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${appConfig.apiUrl}/brands/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedBrand),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const updated = await res.json();
        if (existingIndex !== -1) {
          memoryBrands[existingIndex] = updated;
        }
        return updated;
      }
    } catch {
      // Local fallback
    }

    if (existingIndex !== -1) {
      memoryBrands[existingIndex] = updatedBrand;
    }
    return updatedBrand;
  },

  /**
   * Delete Brand by ID
   */
  async deleteBrand(id: string): Promise<{ success: boolean; deletedId: string; name: string }> {
    const brand = memoryBrands.find((b) => b.id === id);
    const brandName = brand?.name || "Brand";

    try {
      const res = await fetch(`${appConfig.apiUrl}/brands/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const result = await res.json();
        memoryBrands = memoryBrands.filter((b) => b.id !== id);
        return result;
      }
    } catch {
      // Local fallback
    }

    memoryBrands = memoryBrands.filter((b) => b.id !== id);
    return { success: true, deletedId: id, name: brandName };
  },
};
