"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCompare } from "@/context/CompareContext";
import { productService } from "@/services/product.service";
import type { PhoneProduct } from "@/types/product";
import { ROUTES } from "@/routes";

export function CompareBar() {
  const pathname = usePathname();
  const { selectedIds, removePhone, clearCompare, totalCompare } = useCompare();
  const [products, setProducts] = useState<PhoneProduct[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  // Load product summaries for selected IDs
  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(async () => {
      if (selectedIds.length === 0) {
        if (isMounted) setProducts([]);
        return;
      }

      const results = await Promise.all(
        selectedIds.map((id) => productService.getProductById(id))
      );
      if (isMounted) {
        setProducts(results.filter((p): p is PhoneProduct => p !== null));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedIds]);

  // Don't show floating bar if on /compare page or if 0 items selected
  if (pathname === ROUTES.COMPARE || totalCompare === 0) {
    return null;
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-3">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/95 border border-cyan-500/40 text-cyan-400 shadow-2xl backdrop-blur-xl hover:bg-slate-800 transition-all font-mono text-xs font-bold"
        >
          <svg className="w-4 h-4 text-cyan-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Compare ({totalCompare}/3)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 inset-x-4 max-w-3xl mx-auto z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-4 ring-1 ring-cyan-500/20">
        {/* Selected Phone Thumbnails */}
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((index) => {
              const prod = products[index];
              return (
                <div
                  key={index}
                  className={`relative w-14 h-14 rounded-2xl border flex items-center justify-center p-1 transition-all ${
                    prod
                      ? "border-cyan-500/40 bg-slate-950/80"
                      : "border-dashed border-slate-800 bg-slate-900/40"
                  }`}
                >
                  {prod ? (
                    <>
                      {prod.imageUrl ? (
                        <Image
                          src={prod.imageUrl}
                          alt={prod.name}
                          width={48}
                          height={48}
                          unoptimized
                          className="max-h-10 w-auto object-contain"
                        />
                      ) : (
                        <span className="text-[10px] font-mono text-cyan-400">NX</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhone(prod.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-rose-500 transition-colors flex items-center justify-center text-[10px]"
                        title={`Remove ${prod.name}`}
                        aria-label={`Remove ${prod.name}`}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-600 font-bold">
                      +{index + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-left hidden md:block">
            <div className="text-xs font-bold text-white leading-tight">
              Compare Enclave
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {totalCompare} of 3 handsets selected
            </div>
          </div>
        </div>

        {/* Actions: Compare CTA, Clear, Minimize */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={clearCompare}
            className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-xl"
            title="Minimize bar"
            aria-label="Minimize compare bar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <Link
            href={ROUTES.COMPARE}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg active:scale-95 ${
              totalCompare >= 2
                ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <span>Compare Now</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CompareBar;
