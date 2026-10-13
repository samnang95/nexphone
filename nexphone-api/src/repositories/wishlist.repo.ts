import { Wishlist, type WishlistDocument } from "../models/wishlist.model";
import { isDatabaseConnected } from "../config/database";

const memoryWishlists = new Map<string, any>();

export const wishlistRepository = {
  async findWishlist(userId?: string, sessionId?: string): Promise<any | null> {
    if (!userId && !sessionId) return null;

    if (isDatabaseConnected()) {
      const query: any = {};
      if (userId) {
        query.userId = userId;
      } else if (sessionId) {
        query.sessionId = sessionId;
      }

      const doc = await Wishlist.findOne(query);
      if (doc) return doc;
    }

    const key = userId ? `user:${userId}` : `session:${sessionId}`;
    return memoryWishlists.get(key) || null;
  },

  async createWishlist(userId?: string, sessionId?: string): Promise<any> {
    const id = `wishlist-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const wishlistData = {
      id,
      userId: userId || undefined,
      sessionId: sessionId || undefined,
      items: [],
      createdAt: now,
      updatedAt: now,
    };

    if (isDatabaseConnected()) {
      try {
        const doc = await Wishlist.create(wishlistData);
        return doc;
      } catch (err) {
        console.warn("⚠️  [Wishlist Repo] Could not create wishlist in DB, using memory fallback:", (err as Error).message);
      }
    }

    const key = userId ? `user:${userId}` : `session:${sessionId}`;
    memoryWishlists.set(key, wishlistData);
    return wishlistData;
  },

  async getOrCreateWishlist(userId?: string, sessionId?: string): Promise<any> {
    const existing = await this.findWishlist(userId, sessionId);
    if (existing) return existing;
    return this.createWishlist(userId, sessionId);
  },

  async saveWishlist(wishlist: any): Promise<any> {
    wishlist.updatedAt = new Date();

    if (isDatabaseConnected()) {
      if (typeof wishlist.save === "function") {
        return wishlist.save();
      }
      const updated = await Wishlist.findOneAndUpdate(
        { id: wishlist.id },
        {
          $set: {
            items: wishlist.items,
            userId: wishlist.userId,
            sessionId: wishlist.sessionId,
            updatedAt: wishlist.updatedAt,
          },
        },
        { new: true, upsert: true }
      );
      return updated;
    }

    const key = wishlist.userId ? `user:${wishlist.userId}` : `session:${wishlist.sessionId}`;
    memoryWishlists.set(key, wishlist);
    return wishlist;
  },

  async deleteWishlist(wishlistId: string): Promise<boolean> {
    if (isDatabaseConnected()) {
      await Wishlist.deleteOne({ id: wishlistId });
    }

    for (const [key, w] of memoryWishlists.entries()) {
      if (w.id === wishlistId) {
        memoryWishlists.delete(key);
        break;
      }
    }
    return true;
  },

  async mergeGuestWishlist(sessionId: string, userId: string): Promise<any> {
    const guestWishlist = await this.findWishlist(undefined, sessionId);
    const userWishlist = await this.getOrCreateWishlist(userId);

    if (!guestWishlist || !guestWishlist.items || guestWishlist.items.length === 0) {
      return userWishlist;
    }

    for (const guestItem of guestWishlist.items) {
      const alreadyInUserList = userWishlist.items.some((item: any) => item.productId === guestItem.productId);
      if (!alreadyInUserList) {
        userWishlist.items.unshift(guestItem);
      }
    }

    await this.deleteWishlist(guestWishlist.id);
    return this.saveWishlist(userWishlist);
  },
};
