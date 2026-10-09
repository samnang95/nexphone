"use client";

import React, { useState } from "react";
import type { Brand } from "@/types/brand";

interface BrandsSectionProps {
  brands: Brand[];
  onSelectBrand?: (brand: Brand) => void;
}

export function BrandsSection({ brands, onSelectBrand }: BrandsSectionProps) {
  const [selectedTier, setSelectedTier] = useState<string>("All");

  const tiers: string[] = ["All", "Flagship", "Enterprise", "Strategic", "OEM Partner"];

  const filteredBrands =
    selectedTier === "All"
      ? brands
      : brands.filter((b) => b.tier.toLowerCase() === selectedTier.toLowerCase());

  const getBrandIcon = (icon?: string) => {
    switch (icon) {
      case "shield":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case "globe":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        );
      case "cpu":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
      case "zap":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "gem":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
    }
  };

  return (
    <section id="partner-brands" className="mb-24 scroll-mt-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-mono mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span>Hardware Ecosystem</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Flagship Partner Brands
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            World-class aerospace materials, military comms, and biometric neural chip manufacturers.
          </p>
        </div>

        {/* Tier filter tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-2xl border border-slate-800/80 backdrop-blur-md overflow-x-auto no-scrollbar">
          {tiers.map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setSelectedTier(tier)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTier === tier
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            onClick={() => onSelectBrand && onSelectBrand(brand)}
            className="group relative rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-violet-500/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 cursor-pointer"
          >
            <div>
              {/* Brand Icon & Tier */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `${brand.accentColor}25`,
                    borderColor: `${brand.accentColor}50`,
                    borderWidth: 1,
                    color: brand.accentColor,
                  }}
                >
                  {getBrandIcon(brand.logoIcon)}
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold tracking-wider uppercase">
                    {brand.tier}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {brand.code}
                  </span>
                </div>
              </div>

              {/* Title & Desc */}
              <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                {brand.name}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                {brand.description}
              </p>

              {/* Badges / Metrics */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Country</span>
                  <span className="text-xs font-semibold text-slate-300">{brand.country}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Devices</span>
                  <span className="text-xs font-semibold text-cyan-400">{brand.deviceCount} models</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Share</span>
                  <span className="text-xs font-semibold text-emerald-400">{brand.marketShare}</span>
                </div>
              </div>
            </div>

            {/* Footer Row */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-violet-400 font-semibold">
              <span>View Hardware Portfolio</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BrandsSection;
