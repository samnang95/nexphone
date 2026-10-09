"use client";

import React from "react";
import type { CatalogFilterState } from "@/types/product";

interface ProductFilterSidebarProps {
  filters: CatalogFilterState;
  onFilterChange: (newFilters: Partial<CatalogFilterState>) => void;
  onReset: () => void;
  totalMatches: number;
}

export function ProductFilterSidebar({
  filters,
  onFilterChange,
  onReset,
  totalMatches,
}: ProductFilterSidebarProps) {
  const seriesOptions = [
    { label: "All Series", value: "all" },
    { label: "Pro Series", value: "Pro Series" },
    { label: "Enterprise Fleet", value: "Enterprise" },
    { label: "Foldable Dual-Screen", value: "Foldable" },
    { label: "Lite Editions", value: "Lite" },
  ];

  const priceRanges = [
    { label: "All Prices", value: "all" },
    { label: "Under $700", value: "under-700" },
    { label: "$700 – $1,200", value: "700-1200" },
    { label: "$1,200 – $1,800", value: "1200-1800" },
    { label: "Above $1,800", value: "above-1800" },
  ];

  const ratingOptions = [
    { label: "All Ratings", value: 0 },
    { label: "4.5★ and above", value: 4.5 },
    { label: "4.8★ and above", value: 4.8 },
  ];

  const isFiltered =
    filters.series !== "all" ||
    filters.priceRange !== "all" ||
    filters.minRating > 0 ||
    filters.inStockOnly;

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6">
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 backdrop-blur-md">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Filters
            </span>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* 1. Series Filter */}
        <div className="py-5 border-b border-slate-800/80">
          <label className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-3 font-semibold">
            Product Series
          </label>
          <div className="space-y-1.5">
            {seriesOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onFilterChange({ series: opt.value })}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  filters.series === opt.value
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <span>{opt.label}</span>
                {filters.series === opt.value && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Price Range */}
        <div className="py-5 border-b border-slate-800/80">
          <label className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-3 font-semibold">
            Price Range
          </label>
          <div className="space-y-1.5">
            {priceRanges.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() =>
                  onFilterChange({
                    priceRange: range.value as CatalogFilterState["priceRange"],
                  })
                }
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  filters.priceRange === range.value
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <span>{range.label}</span>
                {filters.priceRange === range.value && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Minimum Rating */}
        <div className="py-5 border-b border-slate-800/80">
          <label className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-3 font-semibold">
            Customer Rating
          </label>
          <div className="space-y-1.5">
            {ratingOptions.map((rat) => (
              <button
                key={rat.value}
                type="button"
                onClick={() => onFilterChange({ minRating: rat.value })}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  filters.minRating === rat.value
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <span>{rat.label}</span>
                {filters.minRating === rat.value && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 4. In-Stock Only Toggle */}
        <div className="pt-5">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
              In-Stock Units Only
            </span>
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => onFilterChange({ inStockOnly: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-0 cursor-pointer"
            />
          </label>
        </div>

        {/* Matches Status */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Matching Hardware:</span>
          <span className="font-mono font-bold text-white">{totalMatches} models</span>
        </div>
      </div>
    </aside>
  );
}

export default ProductFilterSidebar;
