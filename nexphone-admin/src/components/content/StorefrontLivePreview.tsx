"use client";

import { useState } from "react";
import type {
  HomepageBanner,
  FeaturedPhone,
  NewArrival,
  BestSeller,
  PromotionalSection,
  ContentTab,
} from "@/types/content";
import { cn } from "@/utils/cn";

interface StorefrontLivePreviewProps {
  readonly banners: HomepageBanner[];
  readonly featuredPhones: FeaturedPhone[];
  readonly newArrivals: NewArrival[];
  readonly bestSellers: BestSeller[];
  readonly promoSections: PromotionalSection[];
  readonly onNavigateToTab: (tab: ContentTab) => void;
}

export function StorefrontLivePreview({
  banners,
  featuredPhones,
  newArrivals,
  bestSellers,
  promoSections,
  onNavigateToTab,
}: StorefrontLivePreviewProps) {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const activeBanners = banners
    .filter((b) => b.status === "active")
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const activeFeatured = featuredPhones
    .filter((f) => f.status === "active")
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const activeNewArrivals = newArrivals
    .filter((n) => n.status === "active")
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const activeBestSellers = bestSellers
    .filter((b) => b.status === "active")
    .sort((a, b) => a.rank - b.rank);

  const activePromoSections = promoSections
    .filter((p) => p.status === "active")
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const currentBanner = activeBanners[activeSlideIndex] ?? activeBanners[0];

  const handlePrevSlide = () => {
    if (activeBanners.length === 0) return;
    setActiveSlideIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    if (activeBanners.length === 0) return;
    setActiveSlideIndex((prev) => (prev === activeBanners.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Top Controller Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                Live Storefront Simulator
              </h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Reactivity
              </span>
            </div>
            <p className="text-xs text-slate-400">
              High-fidelity visual simulation of active homepage banners, flagships, drops, and marketing blocks.
            </p>
          </div>
        </div>

        {/* Viewport switch and Section jumping */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setDeviceMode("desktop")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                deviceMode === "desktop"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode("mobile")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                deviceMode === "mobile"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Mobile (iPhone)
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Viewport Canvas */}
      <div className="flex justify-center rounded-2xl border border-slate-800 bg-slate-950 p-3 sm:p-6 overflow-x-auto min-h-[720px]">
        <div
          className={cn(
            "transition-all duration-300 ease-in-out bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl flex flex-col overflow-hidden",
            deviceMode === "desktop"
              ? "w-full max-w-6xl rounded-2xl"
              : "w-[390px] rounded-[48px] border-[6px] border-slate-800 ring-1 ring-slate-700/50"
          )}
        >
          {/* Simulated Storefront Header */}
          <div
            className={cn(
              "sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 py-3 flex items-center justify-between",
              deviceMode === "desktop" ? "rounded-t-2xl" : "rounded-t-[42px]"
            )}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 font-black text-xs text-white">
                N
              </div>
              <span className="font-extrabold tracking-tight text-white text-sm">
                NexPhone <span className="text-cyan-400 text-xs font-medium">Store</span>
              </span>
            </div>

            {deviceMode === "desktop" ? (
              <div className="flex items-center gap-6 text-xs font-semibold text-slate-300">
                <span className="hover:text-cyan-400 cursor-pointer">Phones</span>
                <span className="hover:text-cyan-400 cursor-pointer">Ecosystem</span>
                <span className="hover:text-cyan-400 cursor-pointer">Satellite VoIP</span>
                <span className="hover:text-cyan-400 cursor-pointer">Enterprise</span>
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-300 flex items-center gap-1.5">
                <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {deviceMode === "desktop" && <span>Search 15 Pro...</span>}
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/30 text-indigo-400 text-xs">
                🛒
              </div>
            </div>
          </div>

          {/* Section 1: Hero Carousel Banner */}
          <div className="relative group">
            {currentBanner ? (
              <div className="relative overflow-hidden min-h-[320px] sm:min-h-[440px] flex items-center justify-center">
                {/* Background image & gradient */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                  style={{ backgroundImage: `url(${currentBanner.imageUrl})` }}
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-r",
                    currentBanner.gradientOverlay || "from-slate-950/95 via-slate-950/80 to-transparent"
                  )}
                />

                {/* Banner Content */}
                <div
                  className={cn(
                    "relative z-10 w-full px-6 py-12 sm:px-12",
                    currentBanner.alignment === "center"
                      ? "text-center max-w-2xl mx-auto"
                      : currentBanner.alignment === "right"
                      ? "text-right max-w-xl ml-auto"
                      : "text-left max-w-xl"
                  )}
                >
                  <span className="inline-block rounded-full bg-indigo-500/20 border border-indigo-400/40 px-3 py-1 text-xs font-bold text-indigo-300 backdrop-blur-md mb-3">
                    {currentBanner.badge}
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                    {currentBanner.title}
                  </h1>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-3">
                    {currentBanner.subtitle}
                  </p>
                  <div
                    className={cn(
                      "mt-5 flex flex-wrap gap-2.5",
                      currentBanner.alignment === "center" ? "justify-center" : ""
                    )}
                  >
                    <button
                      type="button"
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
                    >
                      {currentBanner.primaryCta.label}
                    </button>
                    {currentBanner.secondaryCta ? (
                      <button
                        type="button"
                        className="rounded-xl bg-slate-900/80 border border-slate-700/80 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                      >
                        {currentBanner.secondaryCta.label}
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Left/Right Carousel Nav Arrows */}
                {activeBanners.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevSlide}
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur-md border border-slate-700 hover:bg-slate-800"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={handleNextSlide}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur-md border border-slate-700 hover:bg-slate-800"
                    >
                      ›
                    </button>
                  </>
                )}

                {/* Carousel Dots */}
                {activeBanners.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-800">
                    {activeBanners.map((b, idx) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setActiveSlideIndex(idx)}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          idx === activeSlideIndex ? "w-5 bg-indigo-400" : "w-1.5 bg-slate-600 hover:bg-slate-400"
                        )}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950 text-slate-400 text-xs">
                No active hero banner. Enable a banner in the Banners tab.
              </div>
            )}

            {/* Quick Edit Overlay Tag */}
            <button
              type="button"
              onClick={() => onNavigateToTab("banners")}
              className="absolute top-2 right-2 rounded-lg bg-indigo-600/90 text-white text-[10px] font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-md"
            >
              <span>Edit Banners ↗</span>
            </button>
          </div>

          {/* Section 2: Featured Phones Grid */}
          <div className="p-4 sm:p-6 border-b border-slate-800/80 relative group">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Flagship Selection
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Featured Smartphones
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab("featured")}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Manage Showcase ↗
              </button>
            </div>

            <div
              className={cn(
                "grid gap-4",
                deviceMode === "desktop" ? "grid-cols-3" : "grid-cols-1"
              )}
            >
              {activeFeatured.map((phone) => (
                <div
                  key={phone.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group/card"
                >
                  <div>
                    <div className="relative h-40 w-full overflow-hidden rounded-xl bg-slate-900 mb-3 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={phone.productImage}
                        alt={phone.productName}
                        className="h-full w-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 rounded-full bg-indigo-600/90 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-md">
                        {phone.badge}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {phone.series}
                      </span>
                      <span className="text-xs font-bold text-amber-400">
                        ★ {phone.rating.toFixed(1)}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-0.5">
                      {phone.productName}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {phone.headline}
                    </p>

                    {/* Spec tags */}
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {phone.highlightSpecs.slice(0, 3).map((spec, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500">From</span>
                      <p className="text-sm font-black text-white">
                        ${phone.productPrice.toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Promotional Section Block (Split Banner or Feature Grid) */}
          {activePromoSections.length > 0 && (
            <div className="p-4 sm:p-6 border-b border-slate-800/80 relative group bg-gradient-to-b from-slate-900 to-slate-950">
              <button
                type="button"
                onClick={() => onNavigateToTab("promo_sections")}
                className="absolute top-2 right-4 rounded-lg bg-indigo-600/90 text-white text-[10px] font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-md"
              >
                <span>Edit Promo Sections ↗</span>
              </button>

              {activePromoSections.slice(0, 1).map((sec) => (
                <div
                  key={sec.id}
                  className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-purple-950/40 p-5 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  <div className="space-y-2 max-w-lg">
                    <span className="inline-block rounded-full bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Promotional Highlight
                    </span>
                    <h3 className="text-lg sm:text-2xl font-black text-white">
                      {sec.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300">
                      {sec.subtitle}
                    </p>

                    {sec.features && sec.features.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {sec.features.slice(0, 2).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                            <span>{feat.icon}</span>
                            <span className="font-semibold text-white">{feat.title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="button"
                        className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
                      >
                        {sec.ctaLabel}
                      </button>
                    </div>
                  </div>

                  {sec.imageUrl && (
                    <div className="w-full md:w-64 h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sec.imageUrl}
                        alt={sec.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Section 4: New Arrivals & Drops */}
          <div className="p-4 sm:p-6 border-b border-slate-800/80 relative group">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Catalog Updates
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  New Arrivals & Pre-Orders
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab("new_arrivals")}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Manage Drops ↗
              </button>
            </div>

            <div
              className={cn(
                "grid gap-4",
                deviceMode === "desktop" ? "grid-cols-3" : "grid-cols-1"
              )}
            >
              {activeNewArrivals.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-center gap-3.5 hover:border-slate-700 transition-all"
                >
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 text-[9px] font-bold">
                        {item.tag}
                      </span>
                      {item.isPreOrder && (
                        <span className="rounded-full bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 text-[9px] font-semibold">
                          Pre-Order
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">
                      {item.productName}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-300">
                      ${item.productPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Best Sellers Leaderboard */}
          <div className="p-4 sm:p-6 relative group">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Most Popular
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Best Sellers Leaderboard
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab("best_sellers")}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Manage Leaderboard ↗
              </button>
            </div>

            <div
              className={cn(
                "grid gap-3",
                deviceMode === "desktop" ? "grid-cols-4" : "grid-cols-1"
              )}
            >
              {activeBestSellers.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 text-xs font-black">
                      #{item.rank}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400">
                      +{item.monthlyGrowth}% MoM
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 my-1">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {item.unitsSold.toLocaleString()} units sold
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Satisfaction</span>
                    <span className="font-bold text-white">
                      {item.satisfactionRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Storefront Footer Mock */}
          <div
            className={cn(
              "mt-auto border-t border-slate-800 bg-slate-950 p-6 text-center text-xs text-slate-500 space-y-2",
              deviceMode === "desktop" ? "rounded-b-2xl" : "rounded-b-[42px]"
            )}
          >
            <div className="flex items-center justify-center gap-4 text-slate-400">
              <span>Worldwide Satellite VoIP</span>
              <span>•</span>
              <span>Zero-Touch Enterprise Fleet</span>
              <span>•</span>
              <span>2-Year Global Care</span>
            </div>
            <p className="text-[11px] text-slate-600">
              © 2026 NexPhone Aerospace Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
