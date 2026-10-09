"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { PhoneProduct } from "@/types/product";
import { useCompare } from "@/context/CompareContext";
import { CompareTable } from "./CompareTable";
import { ROUTES } from "@/routes";

interface ComparePageClientProps {
  allProducts: PhoneProduct[];
}

export function ComparePageClient({ allProducts }: ComparePageClientProps) {
  const { selectedIds, addPhone, removePhone, clearCompare } = useCompare();

  // Derive default compared products from selectedIds or fallback to top 2 flagships
  const derivedProducts = useMemo(() => {
    if (selectedIds.length >= 2) {
      const matched = selectedIds
        .map((id) => allProducts.find((p) => p.id === id || p.slug === id))
        .filter((p): p is PhoneProduct => p !== undefined);

      if (matched.length > 0) {
        return matched;
      }
    }

    if (selectedIds.length === 1) {
      const first = allProducts.find(
        (p) => p.id === selectedIds[0] || p.slug === selectedIds[0]
      );
      const second = allProducts.find((p) => p.id !== selectedIds[0]);
      return [first, second].filter((p): p is PhoneProduct => p !== undefined);
    }

    // Default: Pro Max X & Enterprise Edge
    const def1 = allProducts[0];
    const def2 = allProducts[1];
    return [def1, def2].filter((p): p is PhoneProduct => p !== undefined);
  }, [allProducts, selectedIds]);

  // Local overrides for interactive modifications
  const [localOverrides, setLocalOverrides] = useState<PhoneProduct[] | null>(null);

  const comparedProducts = localOverrides || derivedProducts;

  // Handle swapping a column's product
  const handleSelectProduct = (index: number, newProductId: string) => {
    const replacement = allProducts.find((p) => p.id === newProductId);
    if (!replacement) return;

    setLocalOverrides((prev) => {
      const base = [...(prev || derivedProducts)];
      base[index] = replacement;
      return base;
    });

    addPhone(newProductId);
  };

  // Handle adding a 3rd product
  const handleAddProduct = (productId: string) => {
    const toAdd = allProducts.find((p) => p.id === productId);
    if (!toAdd || comparedProducts.length >= 3) return;

    setLocalOverrides((prev) => {
      const base = [...(prev || derivedProducts)];
      return [...base, toAdd];
    });

    addPhone(productId);
  };

  // Handle removing a product
  const handleRemoveProduct = (productId: string) => {
    if (comparedProducts.length <= 1) return;

    setLocalOverrides((prev) => {
      const base = [...(prev || derivedProducts)];
      return base.filter((p) => p.id !== productId);
    });

    removePhone(productId);
  };

  // Preset Comparison Handlers
  const applyPreset = (ids: string[]) => {
    clearCompare();
    ids.forEach((id) => addPhone(id));
    const matched = ids
      .map((id) => allProducts.find((p) => p.id === id))
      .filter((p): p is PhoneProduct => p !== undefined);
    setLocalOverrides(matched);
  };

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
            <span className="text-cyan-400 font-semibold">Compare Enclave</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.EXPERIENCE_3D}
              className="text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
            >
              <span>3D Studio</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
              <span>Multi-Handset Engineering Benchmark</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Compare NexPhone Models
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Inspect side-by-side technical blueprints, optical matrices, thermal battery capacity, and titanium chassis finishes across 2–3 handsets.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
            <span className="text-slate-500 text-[11px] uppercase mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset(["prod-001", "prod-002"])}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors whitespace-nowrap"
            >
              Pro vs Enterprise
            </button>
            <button
              type="button"
              onClick={() => applyPreset(["prod-001", "prod-003"])}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors whitespace-nowrap"
            >
              Pro vs Foldable
            </button>
            <button
              type="button"
              onClick={() => applyPreset(["prod-001", "prod-002", "prod-003"])}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:text-white transition-colors whitespace-nowrap"
            >
              Triple Flagship
            </button>
            <button
              type="button"
              onClick={() => applyPreset(["prod-001", "prod-004"])}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors whitespace-nowrap"
            >
              Pro vs Lite
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <CompareTable
          products={comparedProducts}
          allProducts={allProducts}
          onSelectProduct={handleSelectProduct}
          onAddProduct={handleAddProduct}
          onRemoveProduct={handleRemoveProduct}
        />
      </div>
    </div>
  );
}

export default ComparePageClient;
