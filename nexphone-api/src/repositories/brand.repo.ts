import { Brand, type BrandDocument } from "../models/brand.model";
import { BrandRecord, brandsCatalog } from "../data/brands.data";
import { isDatabaseConnected } from "../config/database";

export interface BrandQueryFilters {
  status?: string;
  tier?: string;
  country?: string;
  isFeatured?: boolean;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

let seeded = false;

export async function ensureBrandsSeeded(): Promise<void> {
  if (seeded || !isDatabaseConnected()) return;
  try {
    const count = await Brand.countDocuments();
    if (count === 0) {
      await Brand.insertMany(brandsCatalog);
      console.log(`🏷️  [Brands Repo] Auto-seeded ${brandsCatalog.length} brands to MongoDB.`);
    }
    seeded = true;
  } catch (error) {
    console.warn("⚠️  [Brands Repo] Could not auto-seed brands to MongoDB:", (error as Error).message);
  }
}

export const brandRepository = {
  async find(
    filters: BrandQueryFilters = {},
    sortField: string = "featured",
    pagination?: PaginationOptions
  ): Promise<{ brands: any[]; total: number }> {
    await ensureBrandsSeeded();

    if (isDatabaseConnected()) {
      return this.findMongo(filters, sortField, pagination);
    }
    return this.findInMemory(filters, sortField, pagination);
  },

  async findMongo(
    filters: BrandQueryFilters,
    sortField: string,
    pagination?: PaginationOptions
  ): Promise<{ brands: BrandDocument[]; total: number }> {
    const query: any = {};

    if (filters.status && filters.status !== "all") {
      query.status = filters.status;
    }
    if (filters.tier && filters.tier !== "all") {
      query.tier = new RegExp(`^${filters.tier}$`, "i");
    }
    if (filters.country) {
      query.country = new RegExp(`^${filters.country}$`, "i");
    }
    if (filters.isFeatured !== undefined) {
      query.isFeatured = filters.isFeatured;
    }
    if (filters.search) {
      const q = filters.search.trim();
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      query.$or = [
        { name: regex },
        { code: regex },
        { country: regex },
        { description: regex },
        { headquarters: regex },
      ];
    }

    const sortObj: Record<string, 1 | -1> = {};
    switch (sortField) {
      case "name-asc":
        sortObj.name = 1;
        break;
      case "name-desc":
        sortObj.name = -1;
        break;
      case "rating-desc":
      case "rating":
        sortObj.rating = -1;
        break;
      case "marketShare-desc":
      case "marketShare":
        sortObj.marketShare = -1;
        break;
      case "deviceCount-desc":
      case "deviceCount":
        sortObj.deviceCount = -1;
        break;
      case "newest":
        sortObj.createdAt = -1;
        break;
      case "featured":
      default:
        sortObj.isFeatured = -1;
        sortObj.rating = -1;
        break;
    }

    const total = await Brand.countDocuments(query);
    let mongoQuery = Brand.find(query).sort(sortObj);

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      mongoQuery = mongoQuery.skip(skip).limit(pagination.limit);
    }

    const brands = await mongoQuery.exec();
    return { brands, total };
  },

  findInMemory(
    filters: BrandQueryFilters,
    sortField: string,
    pagination?: PaginationOptions
  ): { brands: BrandRecord[]; total: number } {
    let list = [...brandsCatalog];

    if (filters.status && filters.status !== "all") {
      list = list.filter((b) => b.status.toLowerCase() === filters.status!.toLowerCase());
    }
    if (filters.tier && filters.tier !== "all") {
      list = list.filter((b) => b.tier.toLowerCase() === filters.tier!.toLowerCase());
    }
    if (filters.country) {
      list = list.filter((b) => b.country.toLowerCase() === filters.country!.toLowerCase());
    }
    if (filters.isFeatured !== undefined) {
      list = list.filter((b) => Boolean(b.isFeatured) === filters.isFeatured);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q) ||
          b.country.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.headquarters.toLowerCase().includes(q)
      );
    }

    switch (sortField) {
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rating-desc":
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "marketShare-desc":
      case "marketShare":
        list.sort((a, b) => parseFloat(b.marketShare) - parseFloat(a.marketShare));
        break;
      case "deviceCount-desc":
      case "deviceCount":
        list.sort((a, b) => b.deviceCount - a.deviceCount);
        break;
      case "newest":
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "featured":
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    const total = list.length;
    if (pagination) {
      const start = (pagination.page - 1) * pagination.limit;
      list = list.slice(start, start + pagination.limit);
    }

    return { brands: list, total };
  },

  async findByIdOrSlug(idOrSlug: string): Promise<any | null> {
    await ensureBrandsSeeded();

    if (isDatabaseConnected()) {
      const brand = await Brand.findOne({
        $or: [{ id: idOrSlug }, { slug: idOrSlug.toLowerCase() }],
      });
      if (brand) return brand;
    }

    const found = brandsCatalog.find(
      (b) => b.id === idOrSlug || b.slug === idOrSlug.toLowerCase()
    );
    return found || null;
  },

  async findByCode(code: string): Promise<any | null> {
    await ensureBrandsSeeded();

    if (isDatabaseConnected()) {
      const brand = await Brand.findOne({ code: code.toUpperCase() });
      if (brand) return brand;
    }

    const found = brandsCatalog.find((b) => b.code.toUpperCase() === code.toUpperCase());
    return found || null;
  },

  async create(data: any): Promise<any> {
    const timestamp = new Date();
    const brandRecord: BrandRecord = {
      ...data,
      id: data.id || `brand-${Date.now().toString(36)}`,
      code: data.code.toUpperCase(),
      deviceCount: data.deviceCount ?? 0,
      marketShare: data.marketShare || "0.0%",
      rating: data.rating ?? 5.0,
      createdAt: data.createdAt || timestamp.toISOString(),
      updatedAt: data.updatedAt || timestamp.toISOString(),
    };

    if (isDatabaseConnected()) {
      const doc = await Brand.create(brandRecord);
      brandsCatalog.unshift(doc.toObject() as any);
      return doc;
    }

    brandsCatalog.unshift(brandRecord);
    return brandRecord;
  },

  async update(idOrSlug: string, updates: any): Promise<any | null> {
    const timestamp = new Date().toISOString();
    const cleanUpdates = { ...updates };
    if (cleanUpdates.code) cleanUpdates.code = cleanUpdates.code.toUpperCase();

    if (isDatabaseConnected()) {
      const updated = await Brand.findOneAndUpdate(
        { $or: [{ id: idOrSlug }, { slug: idOrSlug.toLowerCase() }] },
        { ...cleanUpdates, updatedAt: timestamp },
        { returnDocument: "after", runValidators: true }
      );
      if (updated) {
        const memIdx = brandsCatalog.findIndex((b) => b.id === updated.id);
        if (memIdx !== -1) brandsCatalog[memIdx] = updated.toObject() as any;
        return updated;
      }
    }

    const index = brandsCatalog.findIndex(
      (b) => b.id === idOrSlug || b.slug === idOrSlug.toLowerCase()
    );
    const target = brandsCatalog[index];
    if (!target) return null;

    const updated = {
      ...target,
      ...cleanUpdates,
      id: target.id, // prevent ID mutation
      updatedAt: timestamp,
    };
    brandsCatalog[index] = updated;
    return updated;
  },

  async delete(idOrSlug: string): Promise<{ success: boolean; deletedId: string; name: string } | null> {
    let deletedName = "Brand";

    if (isDatabaseConnected()) {
      const deletedDoc = await Brand.findOneAndDelete({
        $or: [{ id: idOrSlug }, { slug: idOrSlug.toLowerCase() }],
      });
      if (deletedDoc) {
        deletedName = deletedDoc.name;
        const memIdx = brandsCatalog.findIndex((b) => b.id === deletedDoc.id);
        if (memIdx !== -1) brandsCatalog.splice(memIdx, 1);
        return { success: true, deletedId: deletedDoc.id, name: deletedName };
      }
    }

    const index = brandsCatalog.findIndex(
      (b) => b.id === idOrSlug || b.slug === idOrSlug.toLowerCase()
    );
    if (index === -1) return null;

    const deleted = brandsCatalog[index];
    if (!deleted) return null;

    brandsCatalog.splice(index, 1);
    return { success: true, deletedId: deleted.id, name: deleted.name ?? "Brand" };
  },
};
