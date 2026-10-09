"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { FeaturedPhone } from "@/types/content";

interface FeaturedPhonesSectionProps {
  phones: FeaturedPhone[];
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

export function FeaturedPhonesSection({ phones, onOpenQuickView }: FeaturedPhonesSectionProps) {
  const [selectedSeries, setSelectedSeries] = useState<string>("All");

  const seriesList = ["All", ...Array.from(new Set(phones.map((p) => p.series)))];

  const filteredPhones =
    selectedSeries === "All"
      ? phones
      : phones.filter((p) => p.series.toLowerCase() === selectedSeries.toLowerCase());

  return (
    <section id="featured-phones" className="mb-24 scroll-mt-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Hardware Enclave Edition</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Featured Flagship Lineup
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Aerospace-grade titanium, custom silicon Secure Enclaves, and multi-layer quantum encrypted storage.
          </p>
        </div>

        {/* Series Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-2xl border border-slate-800/80 backdrop-blur-md overflow-x-auto no-scrollbar">
          {seriesList.map((series) => (
            <button
              key={series}
              type="button"
              onClick={() => setSelectedSeries(series)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSeries === series
                  ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {series}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Featured Phone Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPhones.map((phone) => (
          <div
            key={phone.id}
            className="group relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1"
          >
            {/* Top Image Preview with Glow */}
            <div className="relative h-64 w-full bg-gradient-to-b from-slate-800/20 to-transparent p-6 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Badge */}
              <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
                {phone.badge}
              </span>

              {/* Rating */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-amber-400 text-[11px] font-bold">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{phone.rating}</span>
              </div>

              {/* Phone Image */}
              <Image
                src={phone.productImage}
                alt={phone.productName}
                width={280}
                height={280}
                unoptimized
                className="max-h-48 w-auto object-contain scale-95 group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
              />
            </div>

            {/* Content Details */}
            <div className="p-6 pt-2 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                  {phone.series}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                  {phone.productName}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {phone.headline || phone.productSubtitle}
                </p>

                {/* Specs Pill List */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {phone.highlightSpecs.slice(0, 3).map((spec, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[10px] font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Action Row */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Starting at</div>
                  <div className="text-xl font-extrabold text-white">
                    ${phone.productPrice.toLocaleString()}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onOpenQuickView({
                      name: phone.productName,
                      subtitle: phone.productSubtitle,
                      price: phone.productPrice,
                      image: phone.productImage,
                      specs: phone.highlightSpecs,
                      badge: phone.badge,
                      series: phone.series,
                    })
                  }
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
        ))}
      </div>
    </section>
  );
}

export default FeaturedPhonesSection;
