"use client";

import { useState } from "react";
import type { PhoneProduct } from "@/types/product";

interface ProductCardProps {
  readonly product: PhoneProduct;
  readonly onEdit: (product: PhoneProduct) => void;
  readonly onDelete: (product: PhoneProduct) => void;
  readonly onView3D: (product: PhoneProduct) => void;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onView3D,
}: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0]?.hex || product.model3D.defaultColor || "#2b2d42"
  );

  const totalStock = product.storageOptions.reduce((acc, v) => acc + v.stock, 0);

  const getStatusBadge = (status: PhoneProduct["status"]) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Published
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Draft
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-400">
            Archived
          </span>
        );
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm transition-all duration-200 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-950/20">
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
            {product.series}
          </span>
          {getStatusBadge(product.status)}
        </div>

        {/* Product Visual & 3D Interactive trigger */}
        <div className="relative my-3 flex h-32 w-full items-center justify-center rounded-xl bg-gradient-to-b from-slate-950/80 to-slate-900/40 p-3 border border-slate-800/60 overflow-hidden">
          {/* Subtle phone silhouette with active color tint */}
          <div
            style={{ backgroundColor: selectedColor }}
            className="h-24 w-14 rounded-2xl border border-white/20 shadow-xl transition-all duration-300 transform group-hover:scale-105 flex flex-col items-center justify-between p-1"
          >
            <div className="h-1 w-3.5 rounded-full bg-black/60" />
            <div className="text-[7px] font-mono text-white/70">NX</div>
          </div>

          {/* 3D Launch Badge */}
          {product.model3D.enabled && (
            <button
              type="button"
              onClick={() => onView3D(product)}
              className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md border border-indigo-500/30 bg-indigo-950/80 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300 backdrop-blur-sm transition-colors hover:border-indigo-400 hover:bg-indigo-900"
            >
              <svg className="h-3 w-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              <span>View 3D</span>
            </button>
          )}
        </div>

        {/* Product Title & Subtitle */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.subtitle}
          </p>
        </div>

        {/* Pricing & Stock */}
        <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-800/80">
          <div>
            <span className="text-[10px] text-slate-500 block">Starting from</span>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-lg font-bold text-white">
                ${product.basePrice.toLocaleString()}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-slate-500 line-through">
                  ${product.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block">Warehouse Stock</span>
            <span className={`text-xs font-semibold ${totalStock > 20 ? "text-emerald-400" : "text-amber-400"}`}>
              {totalStock} units
            </span>
          </div>
        </div>

        {/* Finishes & Storage Badges */}
        <div className="mt-3 space-y-2 pt-2 border-t border-slate-800/60">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Colors:</span>
            <div className="flex items-center gap-1.5">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  title={`${c.name} (${c.hex})`}
                  className={`h-4 w-4 rounded-full border border-white/20 transition-transform ${
                    selectedColor.toLowerCase() === c.hex.toLowerCase() ? "scale-125 ring-1 ring-indigo-400" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Storage:</span>
            <div className="flex items-center gap-1">
              {product.storageOptions.map((s) => (
                <span
                  key={s.id}
                  className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-700/60"
                >
                  {s.capacity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
        >
          Edit Phone
        </button>

        <button
          type="button"
          onClick={() => onDelete(product)}
          className="rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-slate-400 hover:border-rose-500/40 hover:bg-rose-950/30 hover:text-rose-400 transition-colors"
          title="Delete Phone"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
