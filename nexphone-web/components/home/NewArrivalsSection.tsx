"use client";

import React from "react";
import Image from "next/image";
import type { NewArrival } from "@/types/content";

interface NewArrivalsSectionProps {
  newArrivals: NewArrival[];
  onOpenQuickView: (phone: {
    name: string;
    subtitle: string;
    price: number;
    image: string;
    specs: string[];
    badge: string;
    series?: string;
  }) => void;
}

export function NewArrivalsSection({ newArrivals, onOpenQuickView }: NewArrivalsSectionProps) {
  return (
    <section id="new-arrivals" className="mb-24 scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Latest Releases & Colors</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            New Arrivals & Drops
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Freshly engineered finishes, satellite dual-SIM releases, and cutting-edge inductive charging hubs.
          </p>
        </div>
      </div>

      {/* Grid of New Arrivals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {newArrivals.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1"
          >
            {/* Image Preview Container */}
            <div className="relative h-60 w-full bg-gradient-to-b from-slate-800/30 to-transparent p-6 flex items-center justify-center overflow-hidden">
              <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
                {item.tag}
              </span>

              {item.isPreOrder && (
                <span className="absolute top-4 right-4 z-10 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  Pre-Order
                </span>
              )}

              <Image
                src={item.productImage}
                alt={item.productName}
                width={260}
                height={260}
                unoptimized
                className="max-h-44 w-auto object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-xl"
              />
            </div>

            {/* Content Details */}
            <div className="p-6 pt-2 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                  {item.series}
                </span>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                  {item.productName}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.productSubtitle}
                </p>

                {/* Stock Level Bar */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-slate-400">Launch Batch Stock</span>
                    <span className="text-emerald-400 font-semibold">{item.initialStock} units</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      style={{ width: `${Math.min(100, Math.max(30, (item.initialStock / 800) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Price & Action Row */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Price</span>
                  <span className="text-lg font-bold text-white">
                    ${item.productPrice.toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onOpenQuickView({
                      name: item.productName,
                      subtitle: item.productSubtitle,
                      price: item.productPrice,
                      image: item.productImage,
                      specs: ["Launch Batch Allocation", "Complimentary Titanium Engraving", "Zero-Trust Provisioning"],
                      badge: item.tag,
                      series: item.series,
                    })
                  }
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-semibold text-xs transition-all border border-slate-700 hover:border-emerald-400 active:scale-95"
                >
                  {item.isPreOrder ? "Reserve Slot" : "Explore"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default NewArrivalsSection;
