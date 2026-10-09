"use client";

import React from "react";
import Image from "next/image";
import type { BestSeller } from "@/types/content";

interface BestSellersSectionProps {
  bestSellers: BestSeller[];
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

export function BestSellersSection({ bestSellers, onOpenQuickView }: BestSellersSectionProps) {
  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-400/20";
      case 2:
        return "bg-slate-300/20 text-slate-200 border-slate-400/40 ring-1 ring-slate-300/20";
      case 3:
        return "bg-amber-700/20 text-amber-400 border-amber-600/40 ring-1 ring-amber-600/20";
      default:
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
    }
  };

  return (
    <section id="best-sellers" className="mb-24 scroll-mt-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Verified Fleet Telemetry</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Best Sellers Leaderboard
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            The most adopted quantum-secure communication devices trusted by Fortune 500 fleets and defense leaders.
          </p>
        </div>
      </div>

      {/* Leaderboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {bestSellers.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-3xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1"
          >
            {/* Top Image Preview & Rank Tag */}
            <div className="relative h-60 w-full bg-gradient-to-b from-slate-800/30 to-transparent p-6 flex items-center justify-center overflow-hidden">
              {/* Rank Position */}
              <div
                className={`absolute top-4 left-4 z-10 w-9 h-9 rounded-2xl border flex items-center justify-center font-black text-sm backdrop-blur-md ${getRankBadgeStyle(
                  item.rank
                )}`}
              >
                #{item.rank}
              </div>

              {/* Verified Badge */}
              <span className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
                {item.badge}
              </span>

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
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">
                  {item.series}
                </span>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                  {item.productName}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.productSubtitle}
                </p>

                {/* Performance KPI Metrics */}
                <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase">Units Deployed</span>
                    <span className="text-xs font-bold text-white font-mono">
                      {item.unitsSold.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase">Satisfaction</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        {item.satisfactionRate}%
                      </span>
                      <span className="text-[10px] text-slate-400">★★★★★</span>
                    </div>
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
                      specs: [
                        `${item.unitsSold.toLocaleString()} Fleet Units Sold`,
                        `${item.satisfactionRate}% Customer Rating`,
                        "Zero-Touch Automated Enrollment",
                      ],
                      badge: `#${item.rank} Bestseller`,
                      series: item.series,
                    })
                  }
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 active:scale-95 flex items-center gap-1.5"
                >
                  <span>Quick View</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BestSellersSection;
