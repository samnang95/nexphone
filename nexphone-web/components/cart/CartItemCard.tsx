"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CartItem, CartItemColor, CartItemStorage } from "@/types/cart";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ROUTES } from "@/routes";

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeItem, updateItemVariant } = useCart();
  const { addItem: addToWishlist } = useWishlist();
  const [showVariantPicker, setShowVariantPicker] = useState(false);

  const colors = item.availableColors || [];
  const storages = item.availableStorage || [];

  const handleColorChange = (color: CartItemColor) => {
    updateItemVariant(item.id, { color });
  };

  const handleStorageChange = (storage: CartItemStorage) => {
    updateItemVariant(item.id, {
      storage,
      unitPrice: storage.price || item.unitPrice,
    });
  };

  const handleMoveToWishlist = () => {
    addToWishlist({
      productId: item.productId,
      productName: item.productName,
      productSlug: item.productSlug,
      productImage: item.productImage,
      series: item.series,
      subtitle: `${item.storage.capacity} • ${item.color.name}`,
      basePrice: item.unitPrice,
      rating: 4.9,
      inStock: true,
      selectedColor: {
        id: item.color.id,
        name: item.color.name,
        hex: item.color.hex,
      },
      selectedStorage: {
        id: item.storage.id,
        capacity: item.storage.capacity,
        ram: item.storage.ram,
        sku: item.storage.sku,
        price: item.unitPrice,
      },
    });
    removeItem(item.id);
  };

  return (
    <div className="rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-5 sm:p-6 transition-all duration-200 shadow-xl space-y-4">
      {/* Top Row: Image, Info, Price, Remove */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Thumbnail Preview */}
        <Link
          href={ROUTES.PRODUCTS.DETAIL(item.productId)}
          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-950/80 border border-slate-800 p-3 flex items-center justify-center shrink-0 overflow-hidden group"
        >
          {item.productImage ? (
            <Image
              src={item.productImage}
              alt={item.productName}
              width={100}
              height={100}
              unoptimized
              className="max-h-20 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
            />
          ) : (
            <span className="text-xs font-mono text-slate-600">NexPhone</span>
          )}
        </Link>

        {/* Device Information */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold uppercase">
              {item.series}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] font-mono text-emerald-400">
              Allocated Batch
            </span>
          </div>

          <Link href={ROUTES.PRODUCTS.DETAIL(item.productId)}>
            <h3 className="text-lg font-bold text-white hover:text-cyan-300 transition-colors truncate">
              {item.productName}
            </h3>
          </Link>

          {/* Current Variant Description */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full border border-slate-600 inline-block shadow-sm"
                style={{ backgroundColor: item.color.hex }}
              />
              <span className="text-slate-200">{item.color.name}</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-semibold">{item.storage.capacity}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500 text-[11px]">{item.storage.sku}</span>
          </div>

          {/* Variant Switcher Toggle */}
          {(colors.length > 1 || storages.length > 1) && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowVariantPicker((prev) => !prev)}
                className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <span>{showVariantPicker ? "Close Variant Options" : "Switch Finish or Storage"}</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${showVariantPicker ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Pricing & Remove Action */}
        <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white">
              ${(item.unitPrice * item.quantity).toLocaleString()}
            </div>
            {item.quantity > 1 && (
              <div className="text-xs font-mono text-slate-500">
                ${item.unitPrice.toLocaleString()} each
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={handleMoveToWishlist}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
              title="Save to favorites & remove from cart"
              aria-label="Save to favorites"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
              title="Remove item"
              aria-label={`Remove ${item.productName} from cart`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Variant Selection Tray */}
      {showVariantPicker && (
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 animate-in fade-in duration-200">
          {/* Finish / Color Variants */}
          {colors.length > 0 && (
            <div>
              <div className="text-xs font-mono text-slate-400 mb-2 flex items-center justify-between">
                <span>Select Chassis Finish:</span>
                <span className="text-white font-bold">{item.color.name}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => {
                  const isSelected = c.id === item.color.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleColorChange(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2 border transition-all ${
                        isSelected
                          ? "bg-cyan-500/20 border-cyan-400 text-white ring-1 ring-cyan-500/40"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-inner"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Storage Capacity Variants */}
          {storages.length > 0 && (
            <div>
              <div className="text-xs font-mono text-slate-400 mb-2 flex items-center justify-between">
                <span>Select Storage Variant:</span>
                <span className="text-cyan-400 font-bold">{item.storage.capacity}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {storages.map((s) => {
                  const isSelected = s.id === item.storage.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleStorageChange(s)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-2 border transition-all ${
                        isSelected
                          ? "bg-indigo-500/20 border-indigo-400 text-white font-bold ring-1 ring-indigo-500/40"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      <span>{s.capacity}</span>
                      <span className="text-slate-500 text-[10px]">({s.ram})</span>
                      {s.price && (
                        <span className="ml-1 text-[11px] text-cyan-300 font-bold">
                          ${s.price.toLocaleString()}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Row: Quantity Stepper & Quick Action */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">Quantity:</span>
          <div className="flex items-center border border-slate-800 rounded-xl bg-slate-950 overflow-hidden">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 font-bold transition-colors"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-10 text-center text-xs font-mono font-bold text-white">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 font-bold transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <Link
            href={ROUTES.PRODUCTS.DETAIL(item.productId)}
            className="hover:text-cyan-400 transition-colors"
          >
            Configure Specs
          </Link>
          <span className="text-slate-700">•</span>
          <button
            type="button"
            onClick={handleMoveToWishlist}
            className="hover:text-rose-400 transition-colors"
          >
            Save for Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartItemCard;
