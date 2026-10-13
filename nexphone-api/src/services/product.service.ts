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

  // ==========================================
  // Colors Management
  // ==========================================
  async getColors(idOrSlug: string) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }
    return product.colors || [];
  },

  async addColor(idOrSlug: string, colorInput: { id?: string; name: string; hex: string; inStock?: boolean; imageUrl?: string }) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }

    const colors = Array.isArray(product.colors) ? [...product.colors] : [];
    const newColor = {
      id: colorInput.id || `c-${Date.now().toString(36)}`,
      name: colorInput.name,
      hex: colorInput.hex,
      inStock: colorInput.inStock ?? true,
      imageUrl: colorInput.imageUrl,
    };

    colors.push(newColor);
    const updated = await productRepository.update(idOrSlug, { colors });
    return { colors: updated?.colors || colors, newColor };
  },

  async updateColor(idOrSlug: string, colorId: string, updates: Partial<{ name: string; hex: string; inStock: boolean; imageUrl: string }>) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }

    const colors = Array.isArray(product.colors) ? [...product.colors] : [];
    const idx = colors.findIndex((c: any) => c.id === colorId);
    if (idx === -1) {
      throw HttpError.notFound(`Color '${colorId}' not found on phone '${idOrSlug}'.`, "COLOR_NOT_FOUND");
    }

    colors[idx] = { ...colors[idx], ...updates, id: colorId };
    const updated = await productRepository.update(idOrSlug, { colors });
    return { colors: updated?.colors || colors, updatedColor: colors[idx] };
  },

  async deleteColor(idOrSlug: string, colorId: string) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }

    const colors = Array.isArray(product.colors) ? [...product.colors] : [];
    if (colors.length <= 1) {
      throw HttpError.badRequest("A phone must have at least one color option.", "CANNOT_DELETE_LAST_COLOR");
    }

    const filtered = colors.filter((c: any) => c.id !== colorId);
    if (filtered.length === colors.length) {
      throw HttpError.notFound(`Color '${colorId}' not found on phone '${idOrSlug}'.`, "COLOR_NOT_FOUND");
    }

    await productRepository.update(idOrSlug, { colors: filtered });
    return { success: true, deletedColorId: colorId, remainingColors: filtered };
  },

  // ==========================================
  // Storage & RAM Variants Management
  // ==========================================
  async getStorageOptions(idOrSlug: string) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }
    return product.storageOptions || [];
  },

  async addStorageOption(idOrSlug: string, storageInput: { id?: string; capacity: string; ram: string; price: number; comparePrice?: number; stock: number; sku: string }) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }

    const storageOptions = Array.isArray(product.storageOptions) ? [...product.storageOptions] : [];
    const newVariant = {
      id: storageInput.id || `s-${Date.now().toString(36)}`,
      capacity: storageInput.capacity,
      ram: storageInput.ram,
      price: storageInput.price,
      comparePrice: storageInput.comparePrice,
      stock: storageInput.stock ?? 0,
      sku: storageInput.sku,
    };

    storageOptions.push(newVariant);
    const updated = await productRepository.update(idOrSlug, { storageOptions });
    return { storageOptions: updated?.storageOptions || storageOptions, newVariant };
  },

  async updateStorageOption(idOrSlug: string, storageId: string, updates: Partial<{ capacity: string; ram: string; price: number; comparePrice: number; stock: number; sku: string }>) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }

    const storageOptions = Array.isArray(product.storageOptions) ? [...product.storageOptions] : [];
    const idx = storageOptions.findIndex((s: any) => s.id === storageId || s.sku === storageId);
    if (idx === -1) {
      throw HttpError.notFound(`Variant '${storageId}' not found on phone '${idOrSlug}'.`, "VARIANT_NOT_FOUND");
    }

    storageOptions[idx] = { ...storageOptions[idx], ...updates, id: storageOptions[idx].id };
    const updated = await productRepository.update(idOrSlug, { storageOptions });
    return { storageOptions: updated?.storageOptions || storageOptions, updatedVariant: storageOptions[idx] };
  },

  async deleteStorageOption(idOrSlug: string, storageId: string) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }

    const storageOptions = Array.isArray(product.storageOptions) ? [...product.storageOptions] : [];
    if (storageOptions.length <= 1) {
      throw HttpError.badRequest("A phone must have at least one storage option.", "CANNOT_DELETE_LAST_STORAGE");
    }

    const filtered = storageOptions.filter((s: any) => s.id !== storageId && s.sku !== storageId);
    if (filtered.length === storageOptions.length) {
      throw HttpError.notFound(`Variant '${storageId}' not found on phone '${idOrSlug}'.`, "VARIANT_NOT_FOUND");
    }

    await productRepository.update(idOrSlug, { storageOptions: filtered });
    return { success: true, deletedVariantId: storageId, remainingVariants: filtered };
  },

  // ==========================================
  // Pricing Management
  // ==========================================
  async getPricing(idOrSlug: string, currentUser?: any) {
    const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }

    return {
      basePrice: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      costPrice: isAdmin ? product.costPrice : undefined,
      variantPrices: (product.storageOptions || []).map((s: any) => ({
        id: s.id,
        sku: s.sku,
        capacity: s.capacity,
        ram: s.ram,
        price: s.price,
        comparePrice: s.comparePrice,
      })),
    };
  },

  async updatePricing(idOrSlug: string, pricingInput: { basePrice?: number; compareAtPrice?: number | null; costPrice?: number | null; variantPrices?: { id: string; price: number; comparePrice?: number | null }[] }, currentUser?: any) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }

    const productObj = typeof product.toObject === "function" ? product.toObject() : product;
    const updates: any = {};
    if (pricingInput.basePrice !== undefined) updates.basePrice = pricingInput.basePrice;
    if (pricingInput.compareAtPrice !== undefined) updates.compareAtPrice = pricingInput.compareAtPrice;
    if (pricingInput.costPrice !== undefined) updates.costPrice = pricingInput.costPrice;

    if (pricingInput.variantPrices && Array.isArray(productObj.storageOptions)) {
      const storageOptions = JSON.parse(JSON.stringify(productObj.storageOptions));
      for (const vp of pricingInput.variantPrices) {
        const vIdx = storageOptions.findIndex((s: any) => s.id === vp.id || s.sku === vp.id);
        if (vIdx !== -1) {
          storageOptions[vIdx].price = vp.price;
          if (vp.comparePrice !== undefined) storageOptions[vIdx].comparePrice = vp.comparePrice;
        }
      }
      updates.storageOptions = storageOptions;
    }

    await productRepository.update(idOrSlug, updates);
    return this.getPricing(idOrSlug, currentUser);
  },

  // ==========================================
  // Specifications Management
  // ==========================================
  async getSpecifications(idOrSlug: string) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }
    const productObj = typeof product.toObject === "function" ? product.toObject() : product;
    return productObj.specifications || {};
  },

  async updateSpecifications(idOrSlug: string, specsInput: Record<string, any>) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }

    const productObj = typeof product.toObject === "function" ? product.toObject() : product;
    const currentSpecs = JSON.parse(JSON.stringify(productObj.specifications || {}));
    const mergedSpecs: any = { ...currentSpecs };

    for (const [section, value] of Object.entries(specsInput)) {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        mergedSpecs[section] = { ...(mergedSpecs[section] || {}), ...value };
      } else {
        mergedSpecs[section] = value;
      }
    }

    const updated = await productRepository.update(idOrSlug, { specifications: mergedSpecs });
    const finalObj = typeof updated?.toObject === "function" ? updated.toObject() : updated;
    return finalObj?.specifications || mergedSpecs;
  },

  // ==========================================
  // Product Images Management
  // ==========================================
  async getImages(idOrSlug: string) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }
    const productObj = typeof product.toObject === "function" ? product.toObject() : product;
    return {
      imageUrl: productObj.imageUrl,
      images: Array.isArray(productObj.images) ? productObj.images : [],
    };
  },

  async addImages(idOrSlug: string, imagesInput: { imageUrl?: string; images?: string[] }) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }

    const productObj = typeof product.toObject === "function" ? product.toObject() : product;
    let images = Array.isArray(productObj.images) ? [...productObj.images] : [];
    if (imagesInput.imageUrl && !images.includes(imagesInput.imageUrl)) {
      images.push(imagesInput.imageUrl);
    }
    if (Array.isArray(imagesInput.images)) {
      for (const img of imagesInput.images) {
        if (!images.includes(img)) images.push(img);
      }
    }

    const primaryUrl = productObj.imageUrl || images[0] || "";
    const updated = await productRepository.update(idOrSlug, { images, imageUrl: primaryUrl });
    const finalObj = typeof updated?.toObject === "function" ? updated.toObject() : updated;
    return { imageUrl: finalObj?.imageUrl || primaryUrl, images: finalObj?.images || images };
  },

  async deleteImage(idOrSlug: string, targetImageUrl: string) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }

    const productObj = typeof product.toObject === "function" ? product.toObject() : product;
    let images = Array.isArray(productObj.images) ? [...productObj.images] : [];
    images = images.filter((img) => img !== targetImageUrl);

    let primaryUrl = productObj.imageUrl;
    if (primaryUrl === targetImageUrl) {
      primaryUrl = images[0] || "";
    }

    const updated = await productRepository.update(idOrSlug, { images, imageUrl: primaryUrl });
    const finalObj = typeof updated?.toObject === "function" ? updated.toObject() : updated;
    return { success: true, deletedImageUrl: targetImageUrl, remainingImages: finalObj?.images || images };
  },

  async setPrimaryImage(idOrSlug: string, primaryImageUrl: string) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }

    const productObj = typeof product.toObject === "function" ? product.toObject() : product;
    let images = Array.isArray(productObj.images) ? [...productObj.images] : [];
    if (!images.includes(primaryImageUrl)) {
      images.unshift(primaryImageUrl);
    }

    const updated = await productRepository.update(idOrSlug, { imageUrl: primaryImageUrl, images });
    const finalObj = typeof updated?.toObject === "function" ? updated.toObject() : updated;
    return { success: true, primaryImageUrl: finalObj?.imageUrl || primaryImageUrl, images: finalObj?.images || images };
  },

  // ==========================================
  // 3D Model Management
  // ==========================================
  async getModel3D(idOrSlug: string) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }
    const productObj = typeof product.toObject === "function" ? product.toObject() : product;
    return productObj.model3D || { enabled: false, modelUrl: "", fileFormat: "glb" };
  },

  async updateModel3D(idOrSlug: string, model3DInput: Partial<{ enabled: boolean; modelUrl: string; fileFormat: "glb" | "gltf" | "obj" | "usdz"; fileSize: string; polygonCount: number; autoRotate: boolean; defaultColor: string; wireframeSupported: boolean }>) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw HttpError.notFound(`Phone with ID or slug '${idOrSlug}' not found.`, "PRODUCT_NOT_FOUND");
    }

    const productObj = typeof product.toObject === "function" ? product.toObject() : product;
    const currentModel = JSON.parse(JSON.stringify(productObj.model3D || {}));
    const merged = { ...currentModel, ...model3DInput };

    const updated = await productRepository.update(idOrSlug, { model3D: merged });
    const finalObj = typeof updated?.toObject === "function" ? updated.toObject() : updated;
    return finalObj?.model3D || merged;
  },
};
