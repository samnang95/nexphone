import { brandRepository, type BrandQueryFilters } from "../repositories/brand.repo";
import { productRepository } from "../repositories/product.repo";
import { HttpError } from "../utils/httpError";
import type { CreateBrandInput, UpdateBrandInput, QueryBrandInput } from "../validators/brand.validator";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const brandService = {
  async getBrands(query: QueryBrandInput, currentUser?: any) {
    const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";
    const filters: BrandQueryFilters = {
      tier: query.tier,
      country: query.country,
      isFeatured:
        query.isFeatured !== undefined
          ? query.isFeatured === "true" || query.isFeatured === "1"
          : undefined,
      search: query.search || query.q,
    };

    if (query.status && query.status !== "all") {
      filters.status = query.status;
    } else if (!isAdmin && !query.status) {
      // By default, public visitors only see active partner brands
      filters.status = "active";
    }

    const sortField = query.sortBy || query.sort || "featured";
    const pagination =
      query.paginated === "true" || query.paginated === "1"
        ? { page: query.page, limit: query.limit }
        : undefined;

    const { brands, total } = await brandRepository.find(filters, sortField, pagination);

    return {
      brands,
      total,
      page: query.page,
      limit: query.limit,
      isAdmin,
    };
  },

  async getBrandByIdOrSlug(idOrSlug: string, _currentUser?: any) {
    const brand = await brandRepository.findByIdOrSlug(idOrSlug);
    if (!brand) {
      throw HttpError.notFound(`Brand with ID or slug '${idOrSlug}' not found.`, "BRAND_NOT_FOUND");
    }
    return brand;
  },

  async createBrand(input: CreateBrandInput, _adminUser: any) {
    const code = input.code.toUpperCase().trim();
    const existingCode = await brandRepository.findByCode(code);
    if (existingCode) {
      throw HttpError.conflict(`A brand with code '${code}' already exists.`, "BRAND_CODE_EXISTS");
    }

    const slug = input.slug || slugify(input.name);
    const existingSlug = await brandRepository.findByIdOrSlug(slug);
    const finalSlug = existingSlug ? `${slug}-${Date.now().toString(36).slice(-4)}` : slug;

    const newBrand = await brandRepository.create({
      ...input,
      code,
      slug: finalSlug,
    });

    return newBrand;
  },

  async updateBrand(idOrSlug: string, updates: UpdateBrandInput, _adminUser: any) {
    const existing = await brandRepository.findByIdOrSlug(idOrSlug);
    if (!existing) {
      throw HttpError.notFound(`Brand with ID or slug '${idOrSlug}' not found.`, "BRAND_NOT_FOUND");
    }

    const finalUpdates: any = { ...updates };

    if (updates.code) {
      const code = updates.code.toUpperCase().trim();
      finalUpdates.code = code;
      const existingWithCode = await brandRepository.findByCode(code);
      if (existingWithCode && existingWithCode.id !== existing.id) {
        throw HttpError.conflict(`A brand with code '${code}' already exists.`, "BRAND_CODE_EXISTS");
      }
    }

    if (updates.name && !updates.slug && updates.name !== existing.name) {
      finalUpdates.slug = slugify(updates.name);
    }

    const updated = await brandRepository.update(idOrSlug, finalUpdates);
    if (!updated) {
      throw HttpError.notFound(`Brand with ID or slug '${idOrSlug}' not found.`, "BRAND_NOT_FOUND");
    }

    return updated;
  },

  async deleteBrand(idOrSlug: string, _adminUser: any) {
    const existing = await brandRepository.findByIdOrSlug(idOrSlug);
    if (!existing) {
      throw HttpError.notFound(`Brand with ID or slug '${idOrSlug}' not found.`, "BRAND_NOT_FOUND");
    }

    // Referential integrity check: check if active products reference this brand
    const { products } = await productRepository.find({ brand: existing.name });
    if (products.length > 0) {
      throw HttpError.badRequest(
        `Cannot delete brand '${existing.name}' because ${products.length} device(s) are assigned to it. Reassign or delete the products first.`,
        "BRAND_HAS_ASSOCIATED_PRODUCTS"
      );
    }

    const result = await brandRepository.delete(idOrSlug);
    if (!result) {
      throw HttpError.notFound(`Brand with ID or slug '${idOrSlug}' not found.`, "BRAND_NOT_FOUND");
    }

    return result;
  },
};
