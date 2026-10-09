"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { PhoneProduct } from "@/types/product";

interface ProductCardProps {
  product: PhoneProduct;
  viewMode?: "grid" | "list";
  onQuickView: (product: PhoneProduct) => void;
}

export function ProductCard({
  product,
  viewMode = "grid",
  onQuickView,
}: ProductCardProps) {
  const [activeColor, setActiveColor] = useState(product.colors[0]);

  const discountAmount =
    product.compareAtPrice && product.compareAtPrice > product.basePrice
      ? product.compareAtPrice - product.basePrice
      : 0;

  const totalStock = product.storageOptions.reduce((acc, s) => acc + s.stock, 0);

  if (viewMode === "list") {
    return (
      <div className="group relative rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 p-6 transition-all duration-300 flex flex-col md:flex-row items-center gap-6 hover:shadow-2xl hover:shadow-cyan-500/10">
        {/* Left: Image Container */}
        <div className="relative h-48 w-48 shrink-0 rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-950/80 p-4 flex items-center justify-center border border-slate-800/80 overflow-hidden">
          {product.isFeatured && (
            <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[9px] font-bold uppercase">
              Featured
            </span>
          )}
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={200}
              height={200}
              unoptimized
              className="max-h-36 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono">
              NexPhone
            </div>
          )}
        </div>

        {/* Middle: Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
              {product.series}
            </span>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
              <span>★</span>
              <span>{product.rating}</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.subtitle}
          </p>

          {/* Specs Highlights */}
          <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300">
              {product.specifications.display.size} {product.specifications.display.panelType}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300">
              {product.specifications.processor.chipset}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300">
              {product.specifications.camera.main}
            </span>
          </div>

          {/* Color finishes */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase">Finishes:</span>
            <div className="flex items-center gap-1.5">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveColor(c)}
                  className={`w-4 h-4 rounded-full border transition-transform ${
                    activeColor?.id === c.id
                      ? "border-cyan-400 scale-125"
                      : "border-slate-700 hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
            {activeColor && (
              <span className="text-[10px] text-slate-400 ml-1 truncate max-w-[120px]">
                {activeColor.name}
              </span>
            )}
          </div>
        </div>

        {/* Right: Pricing & Action */}
        <div className="shrink-0 flex flex-col md:items-end justify-between self-stretch pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-800/80 md:pl-6">
          <div className="md:text-right">
            <div className="flex items-baseline md:justify-end gap-2">
              <span className="text-2xl font-black text-white">
                ${product.basePrice.toLocaleString()}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-slate-500 line-through">
                  ${product.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>
            {discountAmount > 0 && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                Save ${discountAmount}
              </span>
            )}
            <div className="text-[10px] text-slate-500 mt-1">
              {totalStock > 0 ? `${totalStock} units available` : "Pre-order only"}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onQuickView(product)}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20 active:scale-95 flex items-center gap-1.5"
            >
              <span>Quick View</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Mode
  return (
    <div className="group relative rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1">
      {/* Top Image Preview */}
      <div className="relative h-64 w-full bg-gradient-to-b from-slate-800/30 to-transparent p-6 flex items-center justify-center overflow-hidden">
        {/* Featured Pill */}
        {product.isFeatured && (
          <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
            Featured
          </span>
        )}

        {/* Rating */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-amber-400 text-[11px] font-bold">
          <span>★</span>
          <span>{product.rating}</span>
        </div>

        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={260}
            height={260}
            unoptimized
            className="max-h-48 w-auto object-contain scale-95 group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
          />
        ) : (
          <div className="w-24 h-24 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono">
            NexPhone
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="p-6 pt-2 flex-1 flex flex-col justify-between">
        <div>
          {/* Series & Name */}
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
            {product.series}
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug truncate">
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.subtitle}
          </p>

          {/* Color finishes */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase">Colors:</span>
            <div className="flex items-center gap-1.5">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveColor(c)}
                  className={`w-4 h-4 rounded-full border transition-transform ${
                    activeColor?.id === c.id
                      ? "border-cyan-400 scale-125"
                      : "border-slate-700 hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Storage Options Pills */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.storageOptions.map((s) => (
              <span
                key={s.id}
                className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[10px] font-mono"
              >
                {s.capacity}
              </span>
            ))}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">From</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-white">
                ${product.basePrice.toLocaleString()}
              </span>
              {product.compareAtPrice && (
                <span className="text-[11px] text-slate-500 line-through">
                  ${product.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20 active:scale-95 flex items-center gap-1.5"
          >
            <span>Quick View</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
