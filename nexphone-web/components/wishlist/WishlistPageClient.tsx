"use client";

import React from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { WishlistGrid } from "./WishlistGrid";
import { ROUTES } from "@/routes";

export function WishlistPageClient() {
  const { totalWishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 selection:bg-rose-500 selection:text-white pb-24">
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
            <span className="text-rose-400 font-semibold">Wishlist</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.COMPARE}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <span>Compare Handsets</span>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              <span>Saved Flagships & Cryptographic Units</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Wishlist & Hardware Favorites
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Keep track of Grade-5 Titanium chassis, quantum-resistant enclaves, and custom finishes. Move favorite builds directly to your cart with a single click.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono flex items-center gap-2 text-slate-300">
              <span className="text-rose-400 font-bold">{totalWishlist}</span>
              <span>Saved</span>
            </div>
            <Link
              href={ROUTES.PRODUCTS.ROOT}
              className="px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 text-xs font-mono font-bold transition-all"
            >
              Browse Catalog
            </Link>
          </div>
        </div>

        {/* Wishlist Grid */}
        <WishlistGrid />
      </div>
    </div>
  );
}

export default WishlistPageClient;
