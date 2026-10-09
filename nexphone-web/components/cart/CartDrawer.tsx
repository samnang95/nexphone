"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ROUTES } from "@/routes";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    updateItemVariant,
    subtotal,
    shipping,
    discount,
    appliedPromo,
    total,
    applyPromoCode,
    removePromoCode,
    totalItems,
  } = useCart();

  const { addItem: addToWishlist } = useWishlist();
  const [promoInput, setPromoInput] = useState("");
  const [promoFeedback, setPromoFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [editingVariantItemId, setEditingVariantItemId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoFeedback(res);
    if (res.success) {
      setPromoInput("");
    }
  };

  const handleMoveToWishlist = (item: (typeof items)[0]) => {
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={closeCart}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Encrypted Cart</h2>
                <p className="text-[11px] text-slate-400 font-mono">
                  {totalItems} {totalItems === 1 ? "device" : "devices"} in allocation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={ROUTES.CART}
                onClick={closeCart}
                className="px-2.5 py-1 rounded-lg border border-slate-800 hover:border-cyan-500/40 bg-slate-900 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Expand View
              </Link>
              <button
                type="button"
                onClick={closeCart}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close cart drawer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700/60 text-slate-500 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Your allocation is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mb-6">
                  You haven&apos;t added any Grade-5 Titanium handsets or cryptographic enclaves to your cart.
                </p>
                <Link
                  href={ROUTES.PRODUCTS.ROOT}
                  onClick={closeCart}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20 active:scale-95"
                >
                  Explore Catalog
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const isEditingVariant = editingVariantItemId === item.id;
                const colors = item.availableColors || [];
                const storages = item.availableStorage || [];

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3 transition-all hover:border-slate-700"
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail */}
                      <Link
                        href={ROUTES.PRODUCTS.DETAIL(item.productId)}
                        onClick={closeCart}
                        className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden p-1.5 hover:border-cyan-500/40 transition-colors"
                      >
                        {item.productImage ? (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            width={60}
                            height={60}
                            unoptimized
                            className="max-h-12 w-auto object-contain"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-600 font-mono">NX</span>
                        )}
                      </Link>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={ROUTES.PRODUCTS.DETAIL(item.productId)}
                            onClick={closeCart}
                            className="text-xs font-bold text-white hover:text-cyan-300 transition-colors line-clamp-1"
                          >
                            {item.productName}
                          </Link>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-0.5"
                            title="Remove device"
                            aria-label={`Remove ${item.productName}`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Current Variant Summary Badge */}
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                          <div className="flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-slate-600 inline-block"
                              style={{ backgroundColor: item.color.hex }}
                            />
                            <span className="truncate max-w-[85px]">{item.color.name}</span>
                          </div>
                          <span>•</span>
                          <span className="font-mono text-cyan-400 font-medium">
                            {item.storage.capacity}
                          </span>
                        </div>

                        {/* Variant Quick Switch Trigger */}
                        {(colors.length > 1 || storages.length > 1) && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingVariantItemId(isEditingVariant ? null : item.id)
                            }
                            className="mt-1.5 text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                          >
                            <span>{isEditingVariant ? "Close Variant Options" : "Switch Finish / Storage"}</span>
                            <svg
                              className={`w-3 h-3 transition-transform ${isEditingVariant ? "rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Variant Selection Tray */}
                    {isEditingVariant && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 animate-in fade-in duration-200">
                        {/* Color Selector */}
                        {colors.length > 0 && (
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 block mb-1">
                              Finish: <strong className="text-white">{item.color.name}</strong>
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {colors.map((c) => {
                                const isSelected = c.id === item.color.id;
                                return (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() =>
                                      updateItemVariant(item.id, {
                                        color: c,
                                      })
                                    }
                                    className={`px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1.5 border transition-all ${
                                      isSelected
                                        ? "bg-cyan-500/20 border-cyan-400 text-white"
                                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                                    }`}
                                  >
                                    <span
                                      className="w-2.5 h-2.5 rounded-full border border-white/20"
                                      style={{ backgroundColor: c.hex }}
                                    />
                                    <span>{c.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Storage Selector */}
                        {storages.length > 0 && (
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 block mb-1">
                              Storage Variant: <strong className="text-white">{item.storage.capacity}</strong>
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {storages.map((s) => {
                                const isSelected = s.id === item.storage.id;
                                return (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() =>
                                      updateItemVariant(item.id, {
                                        storage: s,
                                        unitPrice: s.price,
                                      })
                                    }
                                    className={`px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 border transition-all ${
                                      isSelected
                                        ? "bg-indigo-500/20 border-indigo-400 text-white font-bold"
                                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                                    }`}
                                  >
                                    <span>{s.capacity}</span>
                                    {s.price && (
                                      <span className="text-slate-500 text-[9px]">${s.price}</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quantity & Item Total Row */}
                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-800 rounded-lg bg-slate-900 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-colors"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-7 text-center text-xs font-mono font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-colors"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Save to Wishlist */}
                        <button
                          type="button"
                          onClick={() => handleMoveToWishlist(item)}
                          className="text-[10px] font-mono text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                          title="Move to wishlist"
                        >
                          <svg className="w-3 h-3 fill-none stroke-current" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>Save</span>
                        </button>
                      </div>

                      {/* Total for item */}
                      <div className="text-right">
                        <div className="text-xs font-bold text-white font-mono">
                          ${(item.unitPrice * item.quantity).toLocaleString()}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            ${item.unitPrice.toLocaleString()} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-950/90 space-y-4">
              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Voucher code (e.g. NEX10)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {appliedPromo && (
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <span>{appliedPromo.label} ({appliedPromo.code})</span>
                    <button
                      type="button"
                      onClick={removePromoCode}
                      className="text-slate-400 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {promoFeedback && !appliedPromo && (
                  <p className={`text-[10px] font-mono ${promoFeedback.success ? "text-emerald-400" : "text-rose-400"}`}>
                    {promoFeedback.message}
                  </p>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white font-bold">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>Promotional Savings</span>
                    <span className="font-mono font-bold">-${discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-400">
                  <span>Armored Courier Delivery</span>
                  <span className={`font-mono ${shipping === 0 ? "text-emerald-400 font-bold" : "text-white"}`}>
                    {shipping === 0 ? "FREE" : `$${shipping}`}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-baseline justify-between text-sm">
                  <div>
                    <span className="font-bold text-white">Estimated Total</span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      or ${(total / 24).toFixed(2)}/mo (24 mos, 0% APR)
                    </span>
                  </div>
                  <span className="font-mono text-xl font-black text-white">
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    alert("Encrypted Checkout flow initialized. Proceeding to payment tokenization.");
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Encrypted Checkout • ${total.toLocaleString()}</span>
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    href={ROUTES.CART}
                    onClick={closeCart}
                    className="flex-1 py-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-center text-xs font-mono text-slate-300 hover:text-white transition-colors"
                  >
                    View Full Cart & Items
                  </Link>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="py-2 px-3 rounded-xl text-center text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
