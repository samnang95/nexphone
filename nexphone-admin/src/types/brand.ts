export type BrandStatus = "active" | "inactive" | "pending";

export type BrandTier = "Flagship" | "Enterprise" | "OEM Partner" | "Strategic";

export interface Brand {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly code: string;
  readonly logoUrl?: string;
  readonly logoIcon?: "shield" | "sparkles" | "cpu" | "globe" | "zap" | "gem" | "layers";
  readonly accentColor: string;
  readonly description: string;
  readonly country: string;
  readonly headquarters: string;
  readonly foundedYear: number;
  readonly website: string;
  readonly supportEmail: string;
  readonly status: BrandStatus;
  readonly tier: BrandTier;
  readonly isFeatured: boolean;
  readonly deviceCount: number;
  readonly marketShare: string;
  readonly rating: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface BrandFilterState {
  readonly search: string;
  readonly status: "all" | BrandStatus;
  readonly tier: "all" | BrandTier;
  readonly sortBy: "name" | "deviceCount" | "foundedYear" | "marketShare";
  readonly sortDirection: "asc" | "desc";
}

export interface BrandFormData {
  readonly name: string;
  readonly slug: string;
  readonly code: string;
  readonly logoUrl?: string;
  readonly logoIcon?: "shield" | "sparkles" | "cpu" | "globe" | "zap" | "gem" | "layers";
  readonly accentColor: string;
  readonly description: string;
  readonly country: string;
  readonly headquarters: string;
  readonly foundedYear: number;
  readonly website: string;
  readonly supportEmail: string;
  readonly status: BrandStatus;
  readonly tier: BrandTier;
  readonly isFeatured: boolean;
  readonly marketShare?: string;
}
