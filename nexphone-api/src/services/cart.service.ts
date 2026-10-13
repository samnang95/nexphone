import { cartRepository } from "../repositories/cart.repo";
import { productRepository } from "../repositories/product.repo";
import { inventoryRepository } from "../repositories/inventory.repo";
import { promotionsStore } from "../data/promotions.data";
import {
  serializeCart,
  calculateCartTotals,
  type CartResponseView,
  type CartTotalsView,
} from "../views/cart.view";
import type { CartItemRecord, AppliedPromoRecord } from "../models/cart.model";
import type {
  AddToCartInput,
  UpdateCartItemQuantityInput,
  CalculateCartInput,
} from "../validators/cart.validator";
import { HttpError } from "../utils/httpError";

const STANDARD_PROMO_CODES: Record<string, AppliedPromoRecord> = {
  NEX10: {
    code: "NEX10",
    type: "percentage",
    amount: 10,
    label: "10% VIP Enclave Discount",
  },
  TITANIUM100: {
    code: "TITANIUM100",
    type: "fixed",
    amount: 100,
    label: "$100 Titanium Hardware Credit",
  },
  FREESHIP: {
    code: "FREESHIP",
    type: "shipping",
    amount: 35,
    label: "Free Armored Courier Delivery",
  },
  SHIPFREE: {
    code: "SHIPFREE",
    type: "shipping",
    amount: 35,
    label: "Free Armored Courier Delivery",
  },
};

export const cartService = {
  /**
   * 1. Get Cart
   */
  async getCart(userId?: string, sessionId?: string): Promise<CartResponseView> {
    const cart = await cartRepository.getOrCreateCart(userId, sessionId);
    return serializeCart(cart);
  },

  /**
   * 2. Add to Cart
   */
  async addToCart(
    input: AddToCartInput,
    userId?: string,
    sessionId?: string
  ): Promise<CartResponseView> {
    const cart = await cartRepository.getOrCreateCart(userId, sessionId);

    // Verify product exists in catalog
    const product = await productRepository.findByIdOrSlug(input.productId);
    if (!product) {
      throw HttpError.notFound(`Product not found: ${input.productId}`);
    }

    const productName = input.productName || product.name;
    const productSlug = input.productSlug || product.slug;
    const productImage = input.productImage || product.imageUrl || (product.images && product.images[0]) || "";
    const series = input.series || product.series || "";

    // Resolve unitPrice if not provided
    let unitPrice = Number(input.unitPrice) || 0;
    if (unitPrice <= 0) {
      const storageOption = product.storageOptions?.find(
        (s: any) => s.id === input.storage.id || s.capacity.toLowerCase() === input.storage.capacity.toLowerCase()
      );
      unitPrice = Number(storageOption?.price) || Number(product.basePrice) || 999;
    }

    const itemId = `${input.productId}-${input.color.id}-${input.storage.id}`;
    const requestedQuantity = Number(input.quantity) || 1;

    // Check inventory availability if SKU provided
    if (input.storage.sku) {
      const inventoryItem = await inventoryRepository.findBySku(input.storage.sku);
      if (inventoryItem) {
        const availableStock = Number(inventoryItem.availableQuantity) || 0;
        const existingItem = cart.items.find((item: any) => item.id === itemId);
        const existingQty = existingItem ? Number(existingItem.quantity) : 0;
        const totalNeeded = existingQty + requestedQuantity;

        if (availableStock <= 0) {
          throw HttpError.badRequest(`${productName} (${input.storage.sku}) is currently out of stock.`);
        }
        if (totalNeeded > availableStock) {
          throw HttpError.badRequest(
            `Insufficient stock for ${productName} (${input.storage.sku}). Requested ${totalNeeded}, but only ${availableStock} available.`
          );
        }
      }
    }

    // Check if line item already exists in cart
    const existingIndex = cart.items.findIndex((item: any) => item.id === itemId);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += requestedQuantity;
      cart.items[existingIndex].unitPrice = unitPrice;
    } else {
      const newItem: CartItemRecord = {
        id: itemId,
        productId: input.productId,
        productName,
        productSlug,
        productImage,
        series,
        color: {
          id: input.color.id,
          name: input.color.name,
          hex: input.color.hex,
          imageUrl: input.color.imageUrl,
          inStock: input.color.inStock ?? true,
        },
        storage: {
          id: input.storage.id,
          capacity: input.storage.capacity,
          ram: input.storage.ram,
          sku: input.storage.sku,
          price: input.storage.price || unitPrice,
          stock: input.storage.stock,
        },
        unitPrice,
        quantity: requestedQuantity,
      };
      cart.items.push(newItem);
    }

    const saved = await cartRepository.saveCart(cart);
    return serializeCart(saved);
  },

  /**
   * 3. Update Cart Item Quantity
   */
  async updateItemQuantity(
    itemId: string,
    input: UpdateCartItemQuantityInput,
    userId?: string,
    sessionId?: string
  ): Promise<CartResponseView> {
    const cart = await cartRepository.getOrCreateCart(userId, sessionId);
    const itemIndex = cart.items.findIndex((item: any) => item.id === itemId);

    if (itemIndex === -1) {
      throw HttpError.notFound(`Cart item not found: ${itemId}`);
    }

    const current = cart.items[itemIndex];
    const newQty = Number(input.quantity);

    // If quantity is 0, remove item from cart
    if (newQty <= 0) {
      cart.items.splice(itemIndex, 1);
      const saved = await cartRepository.saveCart(cart);
      return serializeCart(saved);
    }

    // Check inventory stock if SKU exists
    if (current.storage?.sku) {
      const inventoryItem = await inventoryRepository.findBySku(current.storage.sku);
      if (inventoryItem) {
        const availableStock = Number(inventoryItem.availableQuantity) || 0;
        if (newQty > availableStock) {
          throw HttpError.badRequest(
            `Insufficient stock for ${current.productName} (${current.storage.sku}). Requested ${newQty}, but only ${availableStock} available.`
          );
        }
      }
    }

    current.quantity = newQty;

    // Optional variant updates
    if (input.color) {
      current.color = {
        ...current.color,
        ...input.color,
      };
    }
    if (input.storage) {
      current.storage = {
        ...current.storage,
        ...input.storage,
      };
    }
    if (input.unitPrice !== undefined) {
      current.unitPrice = Number(input.unitPrice);
    }

    const saved = await cartRepository.saveCart(cart);
    return serializeCart(saved);
  },

  /**
   * 4. Remove Cart Item
   */
  async removeItem(
    itemId: string,
    userId?: string,
    sessionId?: string
  ): Promise<CartResponseView> {
    const cart = await cartRepository.getOrCreateCart(userId, sessionId);
    const initialCount = cart.items.length;
    cart.items = cart.items.filter((item: any) => item.id !== itemId);

    if (cart.items.length === initialCount) {
      throw HttpError.notFound(`Cart item not found: ${itemId}`);
    }

    const saved = await cartRepository.saveCart(cart);
    return serializeCart(saved);
  },

  /**
   * 5. Clear Cart
   */
  async clearCart(userId?: string, sessionId?: string): Promise<CartResponseView> {
    const cart = await cartRepository.getOrCreateCart(userId, sessionId);
    cart.items = [];
    cart.appliedPromo = null;
    const saved = await cartRepository.saveCart(cart);
    return serializeCart(saved);
  },

  /**
   * 6. Calculate Subtotal and Total
   */
  async calculateTotals(
    input: CalculateCartInput,
    userId?: string,
    sessionId?: string
  ): Promise<CartTotalsView & { appliedPromo: AppliedPromoRecord | null }> {
    let items: CartItemRecord[] = [];
    let promo: AppliedPromoRecord | null = null;

    if (input.items && input.items.length > 0) {
      items = input.items.map((i, index) => ({
        id: `item-${index}`,
        productId: i.productId,
        productName: i.productName || "Phone",
        productSlug: i.productSlug || "phone",
        productImage: i.productImage || "",
        series: i.series || "",
        color: i.color,
        storage: i.storage,
        unitPrice: Number(i.unitPrice) || 999,
        quantity: Number(i.quantity) || 1,
      }));
    } else {
      const cart = await cartRepository.findCart(userId, sessionId);
      if (cart) {
        items = cart.items || [];
        promo = cart.appliedPromo || null;
      }
    }

    if (input.promoCode?.trim()) {
      promo = this.resolvePromoCode(input.promoCode.trim());
    }

    const totals = calculateCartTotals(items, promo, input.taxRate || 0);
    return {
      ...totals,
      appliedPromo: promo,
    };
  },

  /**
   * Apply Promo Code to Cart
   */
  async applyPromoCode(
    code: string,
    userId?: string,
    sessionId?: string
  ): Promise<CartResponseView> {
    const cart = await cartRepository.getOrCreateCart(userId, sessionId);
    const promo = this.resolvePromoCode(code);

    if (!promo) {
      throw HttpError.badRequest(`Invalid or expired promo code: "${code}". Try "NEX10" or "TITANIUM100".`);
    }

    // Check min order value if promo comes from promotionsStore
    const dbPromo = promotionsStore.find(
      (p) => p.code?.toUpperCase() === code.trim().toUpperCase() && p.status === "active"
    );
    if (dbPromo?.minOrderValue) {
      const currentSubtotal = cart.items.reduce(
        (sum: number, item: any) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
        0
      );
      if (currentSubtotal < dbPromo.minOrderValue) {
        throw HttpError.badRequest(
          `Promo code ${code.toUpperCase()} requires a minimum order value of $${dbPromo.minOrderValue}. Current subtotal is $${currentSubtotal}.`
        );
      }
    }

    cart.appliedPromo = promo;
    const saved = await cartRepository.saveCart(cart);
    return serializeCart(saved);
  },

  /**
   * Remove Applied Promo Code
   */
  async removePromoCode(userId?: string, sessionId?: string): Promise<CartResponseView> {
    const cart = await cartRepository.getOrCreateCart(userId, sessionId);
    cart.appliedPromo = null;
    const saved = await cartRepository.saveCart(cart);
    return serializeCart(saved);
  },

  /**
   * Helper: Resolve promo code from standard codes or promotions store
   */
  resolvePromoCode(code: string): AppliedPromoRecord | null {
    const clean = code.trim().toUpperCase();

    // 1. Check standard codes
    if (STANDARD_PROMO_CODES[clean]) {
      return STANDARD_PROMO_CODES[clean];
    }

    // 2. Check promotions store
    const storePromo = promotionsStore.find((p) => p.code?.toUpperCase() === clean && p.status === "active");
    if (storePromo) {
      let type: "percentage" | "fixed" | "shipping" = "percentage";
      if (storePromo.discountType === "fixed_amount") type = "fixed";
      else if (storePromo.discountType === "free_shipping") type = "shipping";

      return {
        code: storePromo.code || clean,
        type,
        amount: storePromo.discountValue,
        label: storePromo.title || `Promotional Discount (${clean})`,
      };
    }

    return null;
  },
};
