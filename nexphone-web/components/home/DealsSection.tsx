"use client";

import React, { useState } from "react";
import type { Promotion } from "@/types/promotion";
import type { PromotionalSection } from "@/types/content";

interface DealsSectionProps {
  promotions: Promotion[];
  promoSections?: PromotionalSection[];
  onSelectDeal?: (promoCode: string) => void;
}

export function DealsSection({ promotions, promoSections, onSelectDeal }: DealsSectionProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (onSelectDeal) onSelectDeal(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const getDiscountBadge = (promo: Promotion) => {
    switch (promo.discountType) {
      case "percentage":
        return `${promo.discountValue}% OFF`;
      case "fixed_amount":
        return `$${promo.discountValue} OFF`;
      case "free_shipping":
        return "FREE ARMORED SHIPPING";
      default:
        return "SPECIAL OFFER";
    }
  };

  const tradeInSection = promoSections?.find((s) => s.sectionKey === "trade_in_bar") || promoSections?.[0];

  return (
    <section id="deals-section" className="mb-24 scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Limited Hardware Allocations</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Special Deals & Fleet Incentives
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Redeem verified cryptographic coupon codes and corporate enterprise upgrade credits.
          </p>
        </div>
      </div>

      {/* Deals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className="group relative rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10"
          >
            <div>
              {/* Header row with discount tag & badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-300 font-extrabold text-xs tracking-wider">
                  {getDiscountBadge(promo)}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                  {promo.campaignTag || "Verified Offer"}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                {promo.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {promo.description}
              </p>

              {/* Conditions / Scope */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {promo.minOrderValue ? `Min order: $${promo.minOrderValue.toLocaleString()}` : "No minimum required"}
                </span>
                <span className="text-emerald-400 font-medium">
                  {promo.usedCount} Redeemed
                </span>
              </div>
            </div>

            {/* Coupon Code & Copy Action */}
            {promo.code && (
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex-1 bg-slate-950/80 border border-dashed border-cyan-500/40 rounded-xl px-3 py-2 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider">
                    {promo.code}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">Coupon</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(promo.code)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 ${
                    copiedCode === promo.code
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                      : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20"
                  }`}
                >
                  {copiedCode === promo.code ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Trade-In Promotional Banner Callout */}
      {tradeInSection && (
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-slate-950/90 border border-indigo-500/30 p-8 sm:p-10 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono text-xs uppercase tracking-wider inline-block mb-3">
              Fleet Trade-In Program
            </span>
            <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              {tradeInSection.title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {tradeInSection.subtitle}
            </p>

            {tradeInSection.features && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {tradeInSection.features.map((feat, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <div className="text-cyan-400 font-bold text-xs mb-1">{feat.title}</div>
                    <div className="text-slate-400 text-[11px] leading-relaxed">{feat.desc}</div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => handleCopy("TRADEIN650")}
              className="px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all"
            >
              {tradeInSection.ctaLabel || "Estimate Trade-In Value"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default DealsSection;
