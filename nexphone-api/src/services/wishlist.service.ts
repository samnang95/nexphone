import { wishlistRepository } from "../repositories/wishlist.repo";
import { productRepository } from "../repositories/product.repo";
import {
  serializeWishlist,
  type WishlistResponseView,
} from "../views/wishlist.view";
import type { WishlistItemRecord } from "../models/wishlist.model";
import type { AddToWishlistInput, ToggleWishlistInput } from "../validators/wishlist.validator";
import { HttpError } from "../utils/httpError";

export const wishlistService = {
  /**
   * 1. Get Wishlist
   */
  async getWishlist(userId?: string, sessionId?: string): Promise<WishlistResponseView> {
    const wishlist = await wishlistRepository.getOrCreateWishlist(userId, sessionId);
    return serializeWishlist(wishlist);
  },

  /**
   * 2. Add Phone to Wishlist
   */
  async addToWishlist(
    input: AddToWishlistInput,
    userId?: string,
    sessionId?: string
  ): Promise<WishlistResponseView> {
    const wishlist = await wishlistRepository.getOrCreateWishlist(userId, sessionId);

    // Verify phone product exists
    const product = await productRepository.findByIdOrSlug(input.productId);
    if (!product) {
      throw HttpError.notFound(`Product not found: ${input.productId}`);
    }

    const productId = product.id;
    const existingIndex = wishlist.items.findIndex(
      (item: any) => item.productId === productId || item.productSlug === input.productId.toLowerCase()
    );

    if (existingIndex > -1) {
      // Idempotent: update variant selection if specified
      if (input.selectedColor) {
        wishlist.items[existingIndex].selectedColor = input.selectedColor;
      }
      if (input.selectedStorage) {
        wishlist.items[existingIndex].selectedStorage = input.selectedStorage;
      }
    } else {
      const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : undefined;
      const defaultStorage = product.storageOptions && product.storageOptions.length > 0 ? product.storageOptions[0] : undefined;

      const newItem: WishlistItemRecord = {
        productId,
        productName: product.name,
        productSlug: product.slug || productId,
        productImage: product.imageUrl || (product.images && product.images[0]) || "",
        series: product.series || "",
        subtitle: product.subtitle || "",
        basePrice: Number(product.basePrice) || 0,
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
        rating: Number(product.rating) || 5,
        inStock: product.status !== "discontinued",
        selectedColor: input.selectedColor || (defaultColor ? {
          id: defaultColor.id,
          name: defaultColor.name,
          hex: defaultColor.hex,
          imageUrl: defaultColor.imageUrl,
        } : undefined),
        selectedStorage: input.selectedStorage || (defaultStorage ? {
          id: defaultStorage.id,
          capacity: defaultStorage.capacity,
          ram: defaultStorage.ram,
          sku: defaultStorage.sku,
          price: defaultStorage.price,
        } : undefined),
        addedAt: new Date(),
      };

      wishlist.items.unshift(newItem);
    }

    const saved = await wishlistRepository.saveWishlist(wishlist);
    return serializeWishlist(saved);
  },

  /**
   * 3. Remove Phone from Wishlist
   */
  async removeFromWishlist(
    productId: string,
    userId?: string,
    sessionId?: string
  ): Promise<WishlistResponseView> {
    const wishlist = await wishlistRepository.getOrCreateWishlist(userId, sessionId);
    const initialCount = wishlist.items.length;

    wishlist.items = wishlist.items.filter(
      (item: any) => item.productId !== productId && item.productSlug?.toLowerCase() !== productId.toLowerCase()
    );

    if (wishlist.items.length === initialCount) {
      throw HttpError.notFound(`Phone not found in wishlist: ${productId}`);
    }

    const saved = await wishlistRepository.saveWishlist(wishlist);
    return serializeWishlist(saved);
  },

  /**
   * 4. Clear Wishlist
   */
  async clearWishlist(userId?: string, sessionId?: string): Promise<WishlistResponseView> {
    const wishlist = await wishlistRepository.getOrCreateWishlist(userId, sessionId);
    wishlist.items = [];
    const saved = await wishlistRepository.saveWishlist(wishlist);
    return serializeWishlist(saved);
  },

  /**
   * Check if Phone is in Wishlist
   */
  async isInWishlist(
    productId: string,
    userId?: string,
    sessionId?: string
  ): Promise<{ inWishlist: boolean; productId: string }> {
    const wishlist = await wishlistRepository.findWishlist(userId, sessionId);
    if (!wishlist || !wishlist.items) {
      return { inWishlist: false, productId };
    }

    const inList = wishlist.items.some(
      (item: any) => item.productId === productId || item.productSlug?.toLowerCase() === productId.toLowerCase()
    );

    return { inWishlist: inList, productId };
  },

  /**
   * Toggle Phone in Wishlist (Add if missing, remove if present)
   */
  async toggleWishlist(
    input: ToggleWishlistInput,
    userId?: string,
    sessionId?: string
  ): Promise<{ inWishlist: boolean; wishlist: WishlistResponseView }> {
    const check = await this.isInWishlist(input.productId, userId, sessionId);

    if (check.inWishlist) {
      const updatedWishlist = await this.removeFromWishlist(input.productId, userId, sessionId);
      return { inWishlist: false, wishlist: updatedWishlist };
    } else {
      const updatedWishlist = await this.addToWishlist(input, userId, sessionId);
      return { inWishlist: true, wishlist: updatedWishlist };
    }
  },
};
