import type { WishlistDocument, WishlistItemRecord } from "../models/wishlist.model";

export interface WishlistItemView {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  series: string;
  subtitle: string;
  basePrice: number;
  compareAtPrice?: number;
  rating: number;
  inStock: boolean;
  selectedColor?: {
    id?: string;
    name: string;
    hex: string;
    imageUrl?: string;
  };
  selectedStorage?: {
    id?: string;
    capacity: string;
    ram: string;
    sku?: string;
    price?: number;
  };
  addedAt: string;
}

export interface WishlistResponseView {
  id: string;
  userId?: string;
  sessionId?: string;
  totalItems: number;
  items: WishlistItemView[];
  updatedAt: string;
}

export function serializeWishlistItem(item: any): WishlistItemView {
  return {
    productId: item.productId,
    productName: item.productName,
    productSlug: item.productSlug || item.productId,
    productImage: item.productImage || "",
    series: item.series || "",
    subtitle: item.subtitle || "",
    basePrice: Number(item.basePrice) || 0,
    compareAtPrice: item.compareAtPrice !== undefined ? Number(item.compareAtPrice) : undefined,
    rating: Number(item.rating) || 5,
    inStock: item.inStock !== false,
    selectedColor: item.selectedColor
      ? {
          id: item.selectedColor.id,
          name: item.selectedColor.name,
          hex: item.selectedColor.hex,
          imageUrl: item.selectedColor.imageUrl,
        }
      : undefined,
    selectedStorage: item.selectedStorage
      ? {
          id: item.selectedStorage.id,
          capacity: item.selectedStorage.capacity,
          ram: item.selectedStorage.ram,
          sku: item.selectedStorage.sku,
          price: item.selectedStorage.price,
        }
      : undefined,
    addedAt: item.addedAt instanceof Date ? item.addedAt.toISOString() : (item.addedAt || new Date().toISOString()),
  };
}

export function serializeWishlist(doc: WishlistDocument | any): WishlistResponseView {
  const wishlist = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  const rawItems = wishlist?.items || [];
  const items: WishlistItemView[] = rawItems.map(serializeWishlistItem);

  return {
    id: wishlist?.id || String(wishlist?._id || "wishlist-default"),
    userId: wishlist?.userId,
    sessionId: wishlist?.sessionId,
    totalItems: items.length,
    items,
    updatedAt: wishlist?.updatedAt instanceof Date ? wishlist.updatedAt.toISOString() : (wishlist?.updatedAt || new Date().toISOString()),
  };
}