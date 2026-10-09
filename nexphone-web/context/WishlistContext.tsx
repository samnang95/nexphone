"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { WishlistItem, WishlistContextType } from "@/types/wishlist";
import { useCart } from "./CartContext";

const WISHLIST_STORAGE_KEY = "nexphone_wishlist_items_v1";

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { addItem: addCartItem, openCart } = useCart();

  // Load from localStorage asynchronously on client mount
  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(() => {
      try {
        const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (stored && isMounted) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        }
      } catch (e) {
        console.error("Failed to load wishlist from localStorage", e);
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
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage", e);
    }
  }, [items, isInitialized]);

  const addItem = (newItem: WishlistItem) => {
    const itemWithDefaults: WishlistItem = {
      ...newItem,
      productSlug: newItem.productSlug || newItem.productId,
      addedAt: newItem.addedAt || new Date().toISOString(),
    };

    setItems((prev) => {
      if (prev.some((item) => item.productId === newItem.productId)) {
        return prev;
      }
      return [itemWithDefaults, ...prev];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const toggleWishlist = (productItem: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((item) => item.productId === productItem.productId);
      if (exists) {
        return prev.filter((item) => item.productId !== productItem.productId);
      }
      const itemWithDefaults: WishlistItem = {
        ...productItem,
        productSlug: productItem.productSlug || productItem.productId,
        addedAt: productItem.addedAt || new Date().toISOString(),
      };
      return [itemWithDefaults, ...prev];
    });
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.productId === productId);
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const moveToCart = (productId: string) => {
    const target = items.find((item) => item.productId === productId);
    if (!target) return;

    addCartItem({
      productId: target.productId,
      productName: target.productName,
      productSlug: target.productSlug || target.productId,
      productImage: target.selectedColor?.imageUrl || target.productImage || "",
      series: target.series,
      color: {
        id: target.selectedColor?.id || "default-finish",
        name: target.selectedColor?.name || "Standard Titanium",
        hex: target.selectedColor?.hex || "#94a3b8",
      },
      storage: {
        id: target.selectedStorage?.id || "default-storage",
        capacity: target.selectedStorage?.capacity || "256GB",
        ram: target.selectedStorage?.ram || "12GB",
        sku: target.selectedStorage?.sku || "NX-BASE-256",
      },
      unitPrice: target.selectedStorage?.price || target.basePrice,
      quantity: 1,
    });

    // Remove from wishlist after moving to cart
    removeItem(productId);
    openCart();
  };

  const moveAllToCart = () => {
    if (items.length === 0) return;

    items.forEach((item) => {
      addCartItem({
        productId: item.productId,
        productName: item.productName,
        productSlug: item.productSlug || item.productId,
        productImage: item.selectedColor?.imageUrl || item.productImage || "",
        series: item.series,
        color: {
          id: item.selectedColor?.id || "default-finish",
          name: item.selectedColor?.name || "Standard Titanium",
          hex: item.selectedColor?.hex || "#94a3b8",
        },
        storage: {
          id: item.selectedStorage?.id || "default-storage",
          capacity: item.selectedStorage?.capacity || "256GB",
          ram: item.selectedStorage?.ram || "12GB",
          sku: item.selectedStorage?.sku || "NX-BASE-256",
        },
        unitPrice: item.selectedStorage?.price || item.basePrice,
        quantity: 1,
      });
    });

    clearWishlist();
    openCart();
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        totalWishlist: items.length,
        addItem,
        removeItem,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        moveToCart,
        moveAllToCart,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

export default WishlistContext;
