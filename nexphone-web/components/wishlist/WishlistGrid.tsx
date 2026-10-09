"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { ROUTES } from "@/routes";

export function WishlistGrid() {
  const { items, removeItem, moveToCart, moveAllToCart, clearWishlist, totalWishlist } =
    useWishlist();
  const [movingId, setMovingId] = useState<string | null>(null);

  const handleMoveToCart = (productId: string) => {
    setMovingId(productId);
    moveToCart(productId);
    setTimeout(() => setMovingId(null), 1500);
  };

  if (totalWishlist === 0) {
    return (
      <div className="py-16 px-6 text-center max-w-lg mx-auto flex flex-col items-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 text-rose-500/80 flex items-center justify-center mb-6 shadow-2xl">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-white">Your Wishlist is Empty</h2>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          You haven&apos;t marked any Grade-5 Titanium handsets or cryptographic hardware units as favorites yet.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link
            href={ROUTES.PRODUCTS.ROOT}
            className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-cyan-500/25 active:scale-95"
          >
            Explore Flagships
          </Link>
          <Link
            href={ROUTES.EXPERIENCE_3D}
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            3D Studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Batch Actions Bar */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-mono text-slate-300 font-bold">
            {totalWishlist} {totalWishlist === 1 ? "Handset Saved" : "Handsets Saved"}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={clearWishlist}
            className="px-3.5 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={moveAllToCart}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Move All to Cart</span>
          </button>
        </div>
      </div>

      {/* Wishlist Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.productId}
            className="group relative rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10"
          >
            {/* Top Action Pill: Remove Favorite Heart */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                className="w-8 h-8 rounded-full bg-slate-900/90 border border-rose-500/40 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-lg"
                title="Remove from favorites"
                aria-label={`Remove ${item.productName} from wishlist`}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Image Showcase */}
            <Link
              href={ROUTES.PRODUCTS.DETAIL(item.productId)}
              className="relative aspect-video w-full bg-gradient-to-b from-slate-800/30 to-transparent p-6 flex items-center justify-center overflow-hidden cursor-pointer"
            >
              <span className="absolute top-4 left-4 z-10 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold uppercase">
                {item.series}
              </span>

              {item.productImage ? (
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  width={220}
                  height={160}
                  unoptimized
                  className="max-h-36 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xl"
                />
              ) : (
                <span className="text-xs font-mono text-slate-500">NX Enclave</span>
              )}
            </Link>

            {/* Body Details */}
            <div className="p-6 pt-2 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <span>★</span>
                    <span>{item.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {item.inStock ? "In Stock" : "Pre-order"}
                  </span>
                </div>

                <Link href={ROUTES.PRODUCTS.DETAIL(item.productId)}>
                  <h3 className="text-lg font-bold text-white hover:text-cyan-300 transition-colors leading-snug line-clamp-1">
                    {item.productName}
                  </h3>
                </Link>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {item.subtitle}
                </p>

                {/* Selected Color Finish if exists */}
                {item.selectedColor && (
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="text-[11px] text-slate-500 font-mono">Finish:</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block shadow-sm"
                        style={{ backgroundColor: item.selectedColor.hex }}
                      />
                      <span className="text-[11px] text-slate-300 font-mono">
                        {item.selectedColor.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Price & Actions Row */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black font-mono text-white">
                    ${item.basePrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ${(item.basePrice / 24).toFixed(2)}/mo
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Move to Cart */}
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(item.productId)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    {movingId === item.productId ? (
                      <span>Moved!</span>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>Move to Cart</span>
                      </>
                    )}
                  </button>

                  {/* Configure */}
                  <Link
                    href={ROUTES.PRODUCTS.DETAIL(item.productId)}
                    className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Configure hardware options"
                    aria-label={`Configure ${item.productName}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WishlistGrid;
