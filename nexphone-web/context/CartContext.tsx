"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { CartItem, CartContextType, PromoCodeDiscount, CartItemColor, CartItemStorage } from "@/types/cart";
import { FALLBACK_PRODUCTS } from "@/services/product.service";

const CART_STORAGE_KEY = "nexphone_cart_items_v1";
const PROMO_STORAGE_KEY = "nexphone_cart_promo_v1";

const VALID_PROMO_CODES: Record<string, PromoCodeDiscount> = {
  NEX10: {
    code: "NEX10",
    type: "percentage",
    amount: 10,
    label: "10% Cyber Enclave Savings",
  },
  TITANIUM100: {
    code: "TITANIUM100",
    type: "fixed",
    amount: 100,
    label: "$100 Titanium Member Voucher",
  },
  CYBERVIP: {
    code: "CYBERVIP",
    type: "percentage",
    amount: 15,
    label: "15% VIP Fleet Privilege",
  },
  FREESHIP: {
    code: "FREESHIP",
    type: "shipping",
    amount: 35,
    label: "Complimentary Armored Courier",
  },
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCodeDiscount | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper to ensure item has available variants for in-cart customization
  const enrichItemWithVariants = (item: Omit<CartItem, "id">): Omit<CartItem, "id"> => {
    if (item.availableColors && item.availableStorage && item.availableColors.length > 0) {
      return item;
    }
    const matchedProduct = FALLBACK_PRODUCTS.find(
      (p) => p.id === item.productId || p.slug === item.productSlug
    );
    if (!matchedProduct) return item;

    return {
      ...item,
      availableColors: item.availableColors || matchedProduct.colors.map((c) => ({
        id: c.id,
        name: c.name,
        hex: c.hex,
        inStock: c.inStock,
        imageUrl: c.imageUrl,
      })),
      availableStorage: item.availableStorage || matchedProduct.storageOptions.map((s) => ({
        id: s.id,
        capacity: s.capacity,
        ram: s.ram,
        sku: s.sku,
        price: s.price,
        stock: s.stock,
      })),
    };
  };

  // Load from localStorage on client mount
  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(() => {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored && isMounted) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Ensure each loaded item has available colors & storage attached
            const enriched = parsed.map((item) => {
              const matched = FALLBACK_PRODUCTS.find(
                (p) => p.id === item.productId || p.slug === item.productSlug
              );
              return {
                ...item,
                availableColors: item.availableColors || matched?.colors || [],
                availableStorage: item.availableStorage || matched?.storageOptions || [],
              };
            });
            setItems(enriched);
          }
        }

        const storedPromo = localStorage.getItem(PROMO_STORAGE_KEY);
        if (storedPromo && isMounted) {
          setAppliedPromo(JSON.parse(storedPromo));
        }
      } catch (e) {
        console.error("Failed to load cart from localStorage", e);
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items, isInitialized]);

  // Save promo code to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (appliedPromo) {
        localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(appliedPromo));
      } else {
        localStorage.removeItem(PROMO_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to save promo code to localStorage", e);
    }
  }, [appliedPromo, isInitialized]);

  const addItem = (rawItem: Omit<CartItem, "id">) => {
    const enriched = enrichItemWithVariants(rawItem);
    const id = `${enriched.productId}-${enriched.color.id}-${enriched.storage.id}`;

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const current = updated[existingIndex]!;
        updated[existingIndex] = {
          ...current,
          quantity: current.quantity + enriched.quantity,
          availableColors: current.availableColors || enriched.availableColors,
          availableStorage: current.availableStorage || enriched.availableStorage,
        };
        return updated;
      }
      return [{ ...enriched, id }, ...prev];
    });
    setIsOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const updateItemVariant = (
    itemId: string,
    updates: {
      color?: CartItemColor;
      storage?: CartItemStorage;
      unitPrice?: number;
    }
  ) => {
    setItems((prev) => {
      const itemIndex = prev.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) return prev;

      const current = prev[itemIndex]!;
      const newColor = updates.color || current.color;
      const newStorage = updates.storage || current.storage;
      const newUnitPrice =
        updates.unitPrice !== undefined
          ? updates.unitPrice
          : updates.storage?.price !== undefined
          ? updates.storage.price
          : current.unitPrice;

      const newId = `${current.productId}-${newColor.id}-${newStorage.id}`;

      // If ID didn't change (e.g. only color image or price tweaked)
      if (newId === current.id) {
        const updated = [...prev];
        updated[itemIndex] = {
          ...current,
          color: newColor,
          storage: newStorage,
          unitPrice: newUnitPrice,
          productImage: newColor.imageUrl || current.productImage,
        };
        return updated;
      }

      // Check if an item with the new variant already exists
      const existingTargetIndex = prev.findIndex((item) => item.id === newId);
      if (existingTargetIndex > -1 && existingTargetIndex !== itemIndex) {
        // Merge quantity with existing item and remove old item
        const updated = prev.filter((_, idx) => idx !== itemIndex);
        const targetUpdatedIndex = updated.findIndex((item) => item.id === newId);
        if (targetUpdatedIndex > -1) {
          const target = updated[targetUpdatedIndex]!;
          updated[targetUpdatedIndex] = {
            ...target,
            quantity: target.quantity + current.quantity,
          };
        }
        return updated;
      }

      // Otherwise mutate item in-place with new ID
      const updated = [...prev];
      updated[itemIndex] = {
        ...current,
        id: newId,
        color: newColor,
        storage: newStorage,
        unitPrice: newUnitPrice,
        productImage: newColor.imageUrl || current.productImage,
      };
      return updated;
    });
  };

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    const promo = VALID_PROMO_CODES[clean];
    if (promo) {
      setAppliedPromo(promo);
      return { success: true, message: `Code ${promo.code} applied: ${promo.label}` };
    }
    return { success: false, message: `Invalid promo code. Try "NEX10" or "TITANIUM100".` };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  const clearCart = () => {
    setItems([]);
    setAppliedPromo(null);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  // Totals calculations
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  // Armored courier is free for orders over $1,000, or $35 base
  const baseShipping = subtotal >= 1000 || subtotal === 0 ? 0 : 35;
  const isFreeShippingPromo = appliedPromo?.type === "shipping";
  const shipping = isFreeShippingPromo ? 0 : baseShipping;

  // Calculate discount
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === "percentage") {
      discount = Math.round((subtotal * appliedPromo.amount) / 100);
    } else if (appliedPromo.type === "fixed") {
      discount = Math.min(subtotal, appliedPromo.amount);
    } else if (appliedPromo.type === "shipping") {
      discount = baseShipping;
    }
  }

  const total = Math.max(0, subtotal - (appliedPromo?.type === "shipping" ? 0 : discount)) + shipping;

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        totalItems,
        subtotal,
        shipping,
        discount,
        appliedPromo,
        total,
        addItem,
        removeItem,
        updateQuantity,
        updateItemVariant,
        applyPromoCode,
        removePromoCode,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export default CartContext;
