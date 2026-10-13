export interface SerializedBrand {
  id: string;
  name: string;
  slug: string;
  code: string;
  logoUrl?: string;
  logoIcon?: string;
  accentColor: string;
  description: string;
  country: string;
  headquarters: string;
  foundedYear: number;
  website: string;
  supportEmail: string;
  status: string;
  tier: string;
  isFeatured: boolean;
  deviceCount: number;
  marketShare: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export function serializeBrand(brand: any): SerializedBrand {
  const b = typeof brand.toObject === "function" ? brand.toObject() : { ...brand };

  return {
    id: b.id || String(b._id),
    name: b.name,
    slug: b.slug,
    code: b.code,
    logoUrl: b.logoUrl,
    logoIcon: b.logoIcon || "sparkles",
    accentColor: b.accentColor || "#6366f1",
    description: b.description || "",
    country: b.country || "United States",
    headquarters: b.headquarters || "",
    foundedYear: b.foundedYear ?? 2024,
    website: b.website || "",
    supportEmail: b.supportEmail || "",
    status: b.status || "active",
    tier: b.tier || "Strategic",
    isFeatured: Boolean(b.isFeatured),
    deviceCount: b.deviceCount ?? 0,
    marketShare: b.marketShare || "0.0%",
    rating: b.rating ?? 5.0,
    createdAt:
      b.createdAt instanceof Date
        ? b.createdAt.toISOString()
        : String(b.createdAt || new Date().toISOString()),
    updatedAt:
      b.updatedAt instanceof Date
        ? b.updatedAt.toISOString()
        : String(b.updatedAt || new Date().toISOString()),
  };
}

export function serializeBrandList(brands: any[]): SerializedBrand[] {
  return brands.map(serializeBrand);
}

export interface PaginatedBrandsResult {
  data: SerializedBrand[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function serializePaginatedBrands(
  brands: any[],
  total: number,
  page: number | string,
  limit: number | string
): PaginatedBrandsResult {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 20;
  const pages = Math.ceil(total / limitNum) || 1;

  return {
    data: serializeBrandList(brands),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages,
      hasNextPage: pageNum < pages,
      hasPrevPage: pageNum > 1,
    },
  };
}
