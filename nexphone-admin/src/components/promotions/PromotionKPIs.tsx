"use client";

import type { PromotionSummaryMetrics, Promotion } from "@/types/promotion";

interface PromotionKPIsProps {
  readonly metrics: PromotionSummaryMetrics;
  readonly activeCampaigns: Promotion[];
  readonly onSelectCampaign: (campaign: Promotion) => void;
  readonly onCreateClick: () => void;
}

export function PromotionKPIs({
  metrics,
  activeCampaigns,
  onSelectCampaign,
  onCreateClick,
}: PromotionKPIsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat("en-US").format(val);
  };

  const topActiveCampaign = activeCampaigns.find((c) => c.type === "sale_campaign" && c.status === "active") || activeCampaigns[0];

  return (
    <div className="flex flex-col gap-4">
      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Promotions */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl shadow-lg transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Promotions
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {metrics.activePromotions}
            </span>
            <span className="text-xs text-slate-400">
              / {metrics.totalPromotions} total
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{metrics.scheduledCampaigns} upcoming scheduled</span>
          </div>
        </div>

        {/* Promo Codes Redeemed */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl shadow-lg transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Redemptions
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 ring-1 ring-purple-500/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {formatNumber(metrics.totalRedemptions)}
            </span>
            <span className="text-xs text-purple-300 font-medium">
              coupons applied
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span>{metrics.activePromoCodesCount} live coupon codes in checkout</span>
          </div>
        </div>

        {/* Customer Discount Given */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl shadow-lg transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Discounts Granted
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600/20 text-amber-400 ring-1 ring-amber-500/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-400">
              {formatCurrency(metrics.totalDiscountGiven)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Customer savings passed on fleet purchases</span>
          </div>
        </div>

        {/* Attributed Fleet Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl shadow-lg transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Influenced Revenue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-400">
              {formatCurrency(metrics.totalRevenueGenerated)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Orders converted with promo incentives</span>
          </div>
        </div>
      </div>

      {/* Featured Sale Campaign Spotlight Banner */}
      {topActiveCampaign && (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-purple-950/60 p-4 sm:p-5 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-400/40">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300 ring-1 ring-indigo-500/40">
                    {topActiveCampaign.campaignTag || "Featured Campaign"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active Sale Event
                  </span>
                </div>
                <h3 className="mt-1 text-base font-bold text-white tracking-tight">
                  {topActiveCampaign.title}
                </h3>
                <p className="mt-0.5 text-xs text-slate-300 line-clamp-1">
                  {topActiveCampaign.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
              <div className="text-right hidden md:block">
                <span className="block text-[11px] text-slate-400">Campaign Discount</span>
                <span className="text-sm font-bold text-indigo-300">
                  {topActiveCampaign.discountType === "percentage"
                    ? `${topActiveCampaign.discountValue}% OFF Entire Order`
                    : `$${topActiveCampaign.discountValue} OFF Instant Voucher`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSelectCampaign(topActiveCampaign)}
                className="rounded-xl border border-indigo-500/40 bg-indigo-600/25 px-3.5 py-2 text-xs font-semibold text-indigo-200 transition-colors hover:bg-indigo-600 hover:text-white"
              >
                Inspect Campaign
              </button>
              <button
                type="button"
                onClick={onCreateClick}
                className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-500"
              >
                + New Promotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
