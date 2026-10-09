"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { CartItem, CartContextType } from "@/types/cart";

const CART_STORAGE_KEY = "nexphone_cart_items_v1";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(() => {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored && isMounted) {
          setItems(JSON.parse(stored));
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

  const addItem = (newItem: Omit<CartItem, "id">) => {
    const id = `${newItem.productId}-${newItem.color.id}-${newItem.storage.id}`;
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const current = updated[existingIndex]!;
        updated[existingIndex] = {
          ...current,
          quantity: current.quantity + newItem.quantity,
        };
        return updated;
      }
      return [{ ...newItem, id }, ...prev];
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

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        totalItems,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
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
