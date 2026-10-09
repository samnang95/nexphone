"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { HomepageBanner } from "@/types/content";

interface HeroBannerCarouselProps {
  banners: HomepageBanner[];
  onOpenQuickView?: (phone: {
    name: string;
    subtitle: string;
    price: number;
    image: string;
    specs: string[];
    badge: string;
  }) => void;
}

export function HeroBannerCarousel({ banners, onOpenQuickView }: HeroBannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  if (!banners.length) return null;

  const currentBanner = banners[activeIndex] || banners[0]!;

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl mb-16 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image with Dynamic Gradient & Depth */}
      <div className="relative h-[480px] sm:h-[540px] lg:h-[600px] w-full overflow-hidden">
        <Image
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          fill
          priority
          sizes="100vw"
          unoptimized
          className="object-cover object-center scale-105 transition-transform duration-1000 ease-out group-hover:scale-100 brightness-[0.45] contrast-125"
        />

        {/* Ambient Gradient Overlays */}
        <div className={`absolute inset-0 bg-gradient-to-r ${currentBanner.gradientOverlay || "from-slate-950 via-slate-950/80 to-transparent"}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-transparent to-transparent" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

        {/* Content Container */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center z-10">
          <div className="max-w-2xl">
            {/* Badge & Live Telemetry Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-4 backdrop-blur-md shadow-lg shadow-cyan-500/10">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-semibold uppercase tracking-wider">{currentBanner.badge}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Zero-Trust Certified</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-4">
              {currentBanner.title}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed mb-8 max-w-xl font-normal">
              {currentBanner.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  if (onOpenQuickView) {
                    onOpenQuickView({
                      name: currentBanner.title,
                      subtitle: currentBanner.subtitle,
                      price: 1399,
                      image: currentBanner.imageUrl,
                      specs: ["Satellite VoIP Mesh", "Grade 5 Titanium", "Dual Enclave Security"],
                      badge: currentBanner.badge,
                    });
                  }
                }}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <span>{currentBanner.primaryCta?.label || "Configure & Order"}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              {currentBanner.secondaryCta && (
                <Link
                  href={currentBanner.secondaryCta.url}
                  className="px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-xs tracking-wider border border-slate-700 hover:border-slate-600 backdrop-blur-md transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{currentBanner.secondaryCta.label}</span>
                </Link>
              )}
            </div>

            {/* Quick Specs Highlight Bar */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-slate-300 font-medium">In Stock</span>
                <span>(Dispatches in 24h)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-slate-300 font-medium">Global Mesh</span>
                <span>(Dual eSIM + Satellite)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span className="text-slate-300 font-medium">PCI/HIPAA</span>
                <span>Enclave Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Slide Indicators & Controls */}
        <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex items-center gap-3 bg-slate-950/70 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Previous Slide"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-1.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? "w-7 bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-sm shadow-cyan-400/50"
                    : "w-2 bg-slate-700 hover:bg-slate-600"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % banners.length)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Next Slide"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroBannerCarousel;
