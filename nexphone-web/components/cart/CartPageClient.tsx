"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { CartItemCard } from "./CartItemCard";
import { OrderSummary } from "./OrderSummary";
import { ROUTES } from "@/routes";

export function CartPageClient() {
  const { items, totalItems, clearCart } = useCart();
  const { totalWishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 pb-24">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href={ROUTES.HOME} className="hover:text-white transition-colors">
              Hardware Enclave
            </Link>
            <span className="text-slate-600">/</span>
            <Link href={ROUTES.PRODUCTS.ROOT} className="hover:text-white transition-colors">
              Flagships
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 font-semibold">Shopping Cart</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.WISHLIST}
              className="text-xs font-mono text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5"
            >
              <span>Wishlist ({totalWishlist})</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>Hardware Allocation & Procurement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Your Hardware Cart
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Configure device finishes, storage tiers, and allocation quantities. All items feature aerospace Grade-5 titanium and biometric encryption.
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono flex items-center gap-2 text-slate-300">
                <span className="text-cyan-400 font-bold">{totalItems}</span>
                <span>{totalItems === 1 ? "Unit Reserved" : "Units Reserved"}</span>
              </div>
              <button
                type="button"
                onClick={clearCart}
                className="px-4 py-2 rounded-2xl border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-xs font-mono transition-colors"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>

        {/* Main Body */}
        {items.length === 0 ? (
          <div className="py-20 px-6 text-center max-w-lg mx-auto flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mb-6 shadow-2xl">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white">Your Cart is Empty</h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              No NexPhone flagships, titanium models, or encrypted hardware units have been reserved in your session.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Link
                href={ROUTES.PRODUCTS.ROOT}
                className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-cyan-500/25 active:scale-95"
              >
                Browse Flagship Catalog
              </Link>
              <Link
                href={ROUTES.EXPERIENCE_3D}
                className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                3D Studio
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Items List */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {items.map((item) => (
                <CartItemCard key={item.id} item={item} />
              ))}
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 xl:col-span-4">
              <OrderSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPageClient;
