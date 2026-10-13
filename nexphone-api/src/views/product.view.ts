import type { ProductDocument } from "../models/product.model";

export interface SerializedProduct {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  series: string;
  brand: string;
  status: string;
  basePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  rating: number;
  reviewCount: number;
  salesCount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  imageUrl?: string;
  images: string[];
  colors: any[];
  storageOptions: any[];
  specifications: any;
  model3D?: any;
  createdAt: string;
  updatedAt: string;
}

export function serializeProduct(
  product: any,
  options: { isAdmin?: boolean } = {}
): SerializedProduct {
  const p = typeof product.toObject === "function" ? product.toObject() : { ...product };

  const serialized: SerializedProduct = {
    id: p.id || String(p._id),
    name: p.name,
    slug: p.slug,
    subtitle: p.subtitle || "",
    series: p.series,
    brand: p.brand || "NexPhone",
    status: p.status || "published",
    basePrice: p.basePrice,
    compareAtPrice: p.compareAtPrice,
    rating: p.rating ?? 5.0,
    reviewCount: p.reviewCount ?? 0,
    salesCount: p.salesCount ?? 0,
    isFeatured: Boolean(p.isFeatured),
    isNewArrival: Boolean(p.isNewArrival),
    isBestSeller: Boolean(p.isBestSeller),
    imageUrl: p.imageUrl || (Array.isArray(p.images) && p.images[0]) || undefined,
    images: Array.isArray(p.images) ? p.images : [],
    colors: Array.isArray(p.colors) ? p.colors : [],
    storageOptions: Array.isArray(p.storageOptions) ? p.storageOptions : [],
    specifications: p.specifications || {},
    model3D: p.model3D,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt || new Date().toISOString()),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt || new Date().toISOString()),
  };

  // Only expose costPrice to authenticated admins
  if (options.isAdmin && p.costPrice !== undefined) {
    serialized.costPrice = p.costPrice;
  }

  return serialized;
}

export function serializeProductList(
  products: any[],
  options: { isAdmin?: boolean } = {}
): SerializedProduct[] {
  return products.map((p) => serializeProduct(p, options));
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function serializePaginatedProducts(
  products: any[],
  total: number,
  page: number | string,
  limit: number | string,
  options: { isAdmin?: boolean } = {}
): PaginatedResult<SerializedProduct> {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 20;
  const pages = Math.ceil(total / limitNum) || 1;
  return {
    data: serializeProductList(products, options),
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
