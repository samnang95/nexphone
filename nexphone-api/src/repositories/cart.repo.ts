import { Cart, type CartDocument } from "../models/cart.model";
import { isDatabaseConnected } from "../config/database";

const memoryCarts = new Map<string, any>();

export const cartRepository = {
  async findCart(userId?: string, sessionId?: string): Promise<any | null> {
    if (!userId && !sessionId) return null;

    if (isDatabaseConnected()) {
      const query: any = {};
      if (userId) {
        query.userId = userId;
      } else if (sessionId) {
        query.sessionId = sessionId;
      }

      const doc = await Cart.findOne(query);
      if (doc) return doc;
    }

    // In-memory fallback
    const key = userId ? `user:${userId}` : `session:${sessionId}`;
    return memoryCarts.get(key) || null;
  },

  async createCart(userId?: string, sessionId?: string): Promise<any> {
    const id = `cart-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const cartData = {
      id,
      userId: userId || undefined,
      sessionId: sessionId || undefined,
      items: [],
      appliedPromo: null,
      createdAt: now,
      updatedAt: now,
    };

    if (isDatabaseConnected()) {
      try {
        const doc = await Cart.create(cartData);
        return doc;
      } catch (err) {
        console.warn("⚠️  [Cart Repo] Could not create cart in DB, using memory fallback:", (err as Error).message);
      }
    }

    const key = userId ? `user:${userId}` : `session:${sessionId}`;
    memoryCarts.set(key, cartData);
    return cartData;
  },

  async getOrCreateCart(userId?: string, sessionId?: string): Promise<any> {
    const existing = await this.findCart(userId, sessionId);
    if (existing) return existing;
    return this.createCart(userId, sessionId);
  },

  async saveCart(cart: any): Promise<any> {
    cart.updatedAt = new Date();

    if (isDatabaseConnected()) {
      if (typeof cart.save === "function") {
        return cart.save();
      }
      const updated = await Cart.findOneAndUpdate(
        { id: cart.id },
        {
          $set: {
            items: cart.items,
            appliedPromo: cart.appliedPromo,
            userId: cart.userId,
            sessionId: cart.sessionId,
            updatedAt: cart.updatedAt,
          },
        },
        { new: true, upsert: true }
      );
      return updated;
    }

    const key = cart.userId ? `user:${cart.userId}` : `session:${cart.sessionId}`;
    memoryCarts.set(key, cart);
    return cart;
  },

  async deleteCart(cartId: string): Promise<boolean> {
    if (isDatabaseConnected()) {
      await Cart.deleteOne({ id: cartId });
    }

    for (const [key, cart] of memoryCarts.entries()) {
      if (cart.id === cartId) {
        memoryCarts.delete(key);
        break;
      }
    }
    return true;
  },

  async mergeGuestCart(sessionId: string, userId: string): Promise<any> {
    const guestCart = await this.findCart(undefined, sessionId);
    const userCart = await this.getOrCreateCart(userId);

    if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
      return userCart;
    }

    // Merge items
    for (const guestItem of guestCart.items) {
      const existingIdx = userCart.items.findIndex((item: any) => item.id === guestItem.id);
      if (existingIdx > -1) {
        userCart.items[existingIdx].quantity += guestItem.quantity;
      } else {
        userCart.items.push(guestItem);
      }
    }

    if (!userCart.appliedPromo && guestCart.appliedPromo) {
      userCart.appliedPromo = guestCart.appliedPromo;
    }

    await this.deleteCart(guestCart.id);
    return this.saveCart(userCart);
  },
};
