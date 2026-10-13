import { Product, type ProductDocument } from "../models/product.model";
import { productsCatalog } from "../data/products.data";
import { isDatabaseConnected } from "../config/database";

export interface ProductQueryFilters {
  series?: string;
  brand?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

let seeded = false;

export async function ensureSeeded(): Promise<void> {
  if (seeded || !isDatabaseConnected()) return;
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(productsCatalog);
      console.log(`📦 [Products Repo] Auto-seeded ${productsCatalog.length} phones to MongoDB.`);
    }
    seeded = true;
  } catch (error) {
    console.warn("⚠️  [Products Repo] Could not auto-seed products to MongoDB:", (error as Error).message);
  }
}

export const productRepository = {
  async find(
    filters: ProductQueryFilters = {},
    sortField: string = "featured",
    pagination?: PaginationOptions
  ): Promise<{ products: any[]; total: number }> {
    await ensureSeeded();

    if (isDatabaseConnected()) {
      return this.findMongo(filters, sortField, pagination);
    }
    return this.findInMemory(filters, sortField, pagination);
  },

  async findMongo(
    filters: ProductQueryFilters,
    sortField: string,
    pagination?: PaginationOptions
  ): Promise<{ products: ProductDocument[]; total: number }> {
    const query: any = {};

    if (filters.status && filters.status !== "all") {
      query.status = filters.status;
    }
    if (filters.series && filters.series !== "all") {
      query.series = new RegExp(`^${filters.series}$`, "i");
    }
    if (filters.brand && filters.brand !== "all") {
      query.brand = new RegExp(`^${filters.brand}$`, "i");
    }
    if (filters.isFeatured !== undefined) {
      query.isFeatured = filters.isFeatured;
    }
    if (filters.isNewArrival !== undefined) {
      query.isNewArrival = filters.isNewArrival;
    }
    if (filters.isBestSeller !== undefined) {
      query.isBestSeller = filters.isBestSeller;
    }
    if (filters.minRating !== undefined && filters.minRating > 0) {
      query.rating = { $gte: filters.minRating };
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.basePrice = {};
      if (filters.minPrice !== undefined) query.basePrice.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.basePrice.$lte = filters.maxPrice;
    }
    if (filters.inStock) {
      query.$or = [
        { "colors.inStock": true },
        { "storageOptions.stock": { $gt: 0 } },
      ];
    }
    if (filters.search) {
      const q = filters.search.trim();
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      query.$or = [
        { name: regex },
        { subtitle: regex },
        { series: regex },
        { brand: regex },
        { "storageOptions.sku": regex },
      ];
    }

    const sortObj: Record<string, 1 | -1> = {};
    switch (sortField) {
      case "price-asc":
        sortObj.basePrice = 1;
        break;
      case "price-desc":
        sortObj.basePrice = -1;
        break;
      case "rating":
        sortObj.rating = -1;
        sortObj.reviewCount = -1;
        break;
      case "newest":
        sortObj.createdAt = -1;
        break;
      case "sales":
      case "best-selling":
        sortObj.salesCount = -1;
        sortObj.rating = -1;
        break;
      case "name-asc":
        sortObj.name = 1;
        break;
      case "name-desc":
        sortObj.name = -1;
        break;
      case "featured":
      default:
        sortObj.isFeatured = -1;
        sortObj.createdAt = -1;
        break;
    }

    const total = await Product.countDocuments(query);
    let mongoQuery = Product.find(query).sort(sortObj);

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      mongoQuery = mongoQuery.skip(skip).limit(pagination.limit);
    }

    const products = await mongoQuery.exec();
    return { products, total };
  },

  findInMemory(
    filters: ProductQueryFilters,
    sortField: string,
    pagination?: PaginationOptions
  ): { products: any[]; total: number } {
    let list = [...productsCatalog];

    if (filters.status && filters.status !== "all") {
      list = list.filter((p) => p.status.toLowerCase() === filters.status!.toLowerCase());
    }
    if (filters.series && filters.series !== "all") {
      list = list.filter((p) => p.series.toLowerCase() === filters.series!.toLowerCase());
    }
    if (filters.brand && filters.brand !== "all") {
      list = list.filter((p: any) => (p.brand || "NexPhone").toLowerCase() === filters.brand!.toLowerCase());
    }
    if (filters.isFeatured !== undefined) {
      list = list.filter((p) => Boolean(p.isFeatured) === filters.isFeatured);
    }
    if (filters.isNewArrival !== undefined) {
      list = list.filter((p: any) => Boolean(p.isNewArrival) === filters.isNewArrival);
    }
    if (filters.isBestSeller !== undefined) {
      list = list.filter((p: any) => Boolean(p.isBestSeller) === filters.isBestSeller);
    }
    if (filters.minRating !== undefined && filters.minRating > 0) {
      list = list.filter((p) => p.rating >= filters.minRating!);
    }
    if (filters.minPrice !== undefined) {
      list = list.filter((p) => p.basePrice >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      list = list.filter((p) => p.basePrice <= filters.maxPrice!);
    }
    if (filters.inStock) {
      list = list.filter((p) =>
        p.colors.some((c) => c.inStock) || p.storageOptions.some((s) => s.stock > 0)
      );
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p: any) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.series.toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q) ||
          p.storageOptions.some((s: any) => s.sku.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortField) {
      case "price-asc":
        list.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-desc":
        list.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "sales":
      case "best-selling":
        list.sort((a: any, b: any) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        list.sort((a, b) => b.name.localeCompare(a.name));
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

    return { products: list, total };
  },

  async findByIdOrSlug(idOrSlug: string): Promise<any | null> {
    await ensureSeeded();

    if (isDatabaseConnected()) {
      const product = await Product.findOne({
        $or: [{ id: idOrSlug }, { slug: idOrSlug.toLowerCase() }],
      });
      if (product) return product;
    }

    const found = productsCatalog.find(
      (p) => p.id === idOrSlug || p.slug === idOrSlug.toLowerCase()
    );
    return found || null;
  },

  async create(data: any): Promise<any> {
    const timestamp = new Date();
    const productRecord = {
      ...data,
      id: data.id || `prod-${Date.now().toString(36)}`,
      createdAt: data.createdAt || timestamp.toISOString(),
      updatedAt: data.updatedAt || timestamp.toISOString(),
    };

    if (isDatabaseConnected()) {
      const doc = await Product.create(productRecord);
      // Keep in-memory catalog synced
      productsCatalog.unshift(doc.toObject() as any);
      return doc;
    }

    productsCatalog.unshift(productRecord);
    return productRecord;
  },

  async update(idOrSlug: string, updates: any): Promise<any | null> {
    const timestamp = new Date().toISOString();

    if (isDatabaseConnected()) {
      const updated = await Product.findOneAndUpdate(
        { $or: [{ id: idOrSlug }, { slug: idOrSlug.toLowerCase() }] },
        { $set: { ...updates, updatedAt: timestamp } },
        { returnDocument: "after", runValidators: true }
      );
      if (updated) {
        const memIdx = productsCatalog.findIndex((p) => p.id === updated.id);
        if (memIdx !== -1) productsCatalog[memIdx] = updated.toObject() as any;
        return updated;
      }
    }

    const index = productsCatalog.findIndex(
      (p) => p.id === idOrSlug || p.slug === idOrSlug.toLowerCase()
    );
    const target = productsCatalog[index];
    if (!target) return null;

    const updated = {
      ...target,
      ...updates,
      id: target.id, // protect id
      updatedAt: timestamp,
    };
    productsCatalog[index] = updated;
    return updated;
  },

  async delete(idOrSlug: string): Promise<{ success: boolean; deletedId: string; name: string } | null> {
    let deletedName = "Phone";

    if (isDatabaseConnected()) {
      const deletedDoc = await Product.findOneAndDelete({
        $or: [{ id: idOrSlug }, { slug: idOrSlug.toLowerCase() }],
      });
      if (deletedDoc) {
        deletedName = deletedDoc.name;
        const memIdx = productsCatalog.findIndex((p) => p.id === deletedDoc.id);
        if (memIdx !== -1) productsCatalog.splice(memIdx, 1);
        return { success: true, deletedId: deletedDoc.id, name: deletedName };
      }
    }

    const index = productsCatalog.findIndex(
      (p) => p.id === idOrSlug || p.slug === idOrSlug.toLowerCase()
    );
    if (index === -1) return null;

    const deleted = productsCatalog[index];
    if (!deleted) return null;

    productsCatalog.splice(index, 1);
    return { success: true, deletedId: deleted.id, name: deleted.name ?? "Phone" };
  },
};
