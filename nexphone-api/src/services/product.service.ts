import { productRepository, type ProductQueryFilters } from "../repositories/product.repo";
import { HttpError } from "../utils/httpError";
import type { CreateProductInput, UpdateProductInput, QueryProductInput } from "../validators/product.validator";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parsePriceRange(priceRange?: string): { minPrice?: number; maxPrice?: number } {
  switch (priceRange) {
    case "under-700":
      return { maxPrice: 699.99 };
    case "700-1200":
      return { minPrice: 700, maxPrice: 1200 };
    case "1200-1800":
      return { minPrice: 1200, maxPrice: 1800 };
    case "above-1800":
      return { minPrice: 1800.01 };
    default:
      return {};
  }
}

export const productService = {
  async getProducts(query: QueryProductInput, currentUser?: any) {
    const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";
    const { minPrice: rangeMin, maxPrice: rangeMax } = parsePriceRange(query.priceRange);

    const minPrice = query.minPrice !== undefined ? query.minPrice : rangeMin;
    const maxPrice = query.maxPrice !== undefined ? query.maxPrice : rangeMax;

    let inStock: boolean | undefined = undefined;
    if (query.inStock === "true" || query.inStock === "1" || query.inStockOnly === "true" || query.inStockOnly === "1") {
      inStock = true;
    } else if (query.inStock === "false" || query.inStock === "0") {
      inStock = false;
    }

    const filters: ProductQueryFilters = {
      series: query.series,
      brand: query.brand,
      minPrice,
      maxPrice,
      minRating: query.minRating,
      inStock,
      isFeatured: query.isFeatured ? query.isFeatured === "true" || query.isFeatured === "1" : undefined,
      isNewArrival: query.isNewArrival ? query.isNewArrival === "true" || query.isNewArrival === "1" : undefined,
      isBestSeller: query.isBestSeller ? query.isBestSeller === "true" || query.isBestSeller === "1" : undefined,
      search: query.search || query.q,
    };

    // Access control on status: non-admins only see published
    if (!isAdmin) {
      filters.status = "published";
    } else if (query.status && query.status !== "all") {
      filters.status = query.status;
    }

    const sortField = query.sortBy || query.sort || "featured";
    const pagination = query.paginated === "true" || query.paginated === "1"
      ? { page: query.page, limit: query.limit }
      : undefined;

    const { products, total } = await productRepository.find(filters, sortField, pagination);
    return {
      products,
      total,
      page: query.page,
      limit: query.limit,
      isAdmin,
    };
  },

  async getProductByIdOrSlug(idOrSlug: string, currentUser?: any) {
    const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";
    const product = await productRepository.findByIdOrSlug(idOrSlug);

    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }

    if (!isAdmin && product.status !== "published") {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }

    return { product, isAdmin };
  },

  async searchPhones(searchQuery: string, currentUser?: any) {
    return this.getProducts({ search: searchQuery, page: 1, limit: 50 }, currentUser);
  },

  async getFeaturedPhones(currentUser?: any) {
    return this.getProducts({ isFeatured: "true", page: 1, limit: 20 }, currentUser);
  },

  async getNewArrivals(currentUser?: any) {
    const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";
    const filters: ProductQueryFilters = {
      status: isAdmin ? undefined : "published",
    };

    // Try finding products with isNewArrival=true first
    let result = await productRepository.find({ ...filters, isNewArrival: true }, "newest", { page: 1, limit: 10 });
    if (result.products.length === 0) {
      // Fallback to latest phones sorted by creation date
      result = await productRepository.find(filters, "newest", { page: 1, limit: 10 });
    }

    return { products: result.products, total: result.total, isAdmin };
  },

  async getBestSellers(currentUser?: any) {
    const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";
    const filters: ProductQueryFilters = {
      status: isAdmin ? undefined : "published",
    };

    // Try finding products with isBestSeller=true first
    let result = await productRepository.find({ ...filters, isBestSeller: true }, "sales", { page: 1, limit: 10 });
    if (result.products.length === 0) {
      // Fallback to highest rated phones
      result = await productRepository.find(filters, "rating", { page: 1, limit: 10 });
    }

    return { products: result.products, total: result.total, isAdmin };
  },

  async createPhone(input: CreateProductInput, _adminUser: any) {
    const slug = input.slug || slugify(input.name);

    // Verify slug uniqueness
    const existing = await productRepository.findByIdOrSlug(slug);
    const finalSlug = existing ? `${slug}-${Date.now().toString(36).slice(-4)}` : slug;

    const newPhone = await productRepository.create({
      ...input,
      slug: finalSlug,
    });

    return newPhone;
  },

  async updatePhone(idOrSlug: string, updates: UpdateProductInput, _adminUser: any) {
    const existing = await productRepository.findByIdOrSlug(idOrSlug);
    if (!existing) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }

    let finalUpdates = { ...updates };
    if (updates.name && !updates.slug && updates.name !== existing.name) {
      const generatedSlug = slugify(updates.name);
      finalUpdates.slug = generatedSlug;
    }

    const updated = await productRepository.update(idOrSlug, finalUpdates);
    if (!updated) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }

    return updated;
  },

  async deletePhone(idOrSlug: string, _adminUser: any) {
    const result = await productRepository.delete(idOrSlug);
    if (!result) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }
    return result;
  },
};
