"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ROUTES } from "@/routes";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, totalItems } =
    useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={closeCart}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Your Cart</h2>
                <p className="text-[11px] text-slate-400 font-mono">
                  {totalItems} {totalItems === 1 ? "device" : "devices"} reserved
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close cart"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700/60 text-slate-500 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mb-6">
                  You haven&apos;t added any titanium handsets or accessories to your allocation yet.
                </p>
                <Link
                  href={ROUTES.PRODUCTS.ROOT}
                  onClick={closeCart}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20"
                >
                  Explore Catalog
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-4"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden p-1.5">
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
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {item.productName}
                    </h4>

                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-slate-600 inline-block"
                          style={{ backgroundColor: item.color.hex }}
                        />
                        <span className="truncate max-w-[90px]">{item.color.name}</span>
                      </div>
                      <span>•</span>
                      <span className="font-mono text-cyan-400 font-medium">
                        {item.storage.capacity}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-slate-800 rounded-lg bg-slate-900 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-colors"
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
                        >
                          +
                        </button>
                      </div>

                      {/* Total for item */}
                      <span className="text-xs font-bold text-white font-mono">
                        ${(item.unitPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-950/80 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white font-bold">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Armored VIP Courier</span>
                  <span className="text-emerald-400 font-semibold uppercase text-[10px]">
                    FREE (Included)
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-sm">
                  <span className="font-bold text-white">Estimated Total</span>
                  <span className="font-mono text-lg font-black text-white">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>
              </div>

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
                <span>Encrypted Checkout</span>
              </button>

              <button
                type="button"
                onClick={closeCart}
                className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
