"use client";

import { useState } from "react";
import type { Promotion } from "@/types/promotion";
import { cn } from "@/utils/cn";

interface PromotionDetailModalProps {
  readonly promotion: Promotion | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onEdit: (promotion: Promotion) => void;
  readonly onDelete: (promotion: Promotion) => void;
  readonly onToggleStatus: (promotion: Promotion) => void;
}

export function PromotionDetailModal({
  promotion,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
}: PromotionDetailModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen || !promotion) return null;

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return "Open-ended / No expiry";
    try {
      const d = new Date(isoStr);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(d);
    } catch {
      return isoStr;
    }
  };

  const promoLink = promotion.code
    ? `https://nexphone.io/shop?promo=${encodeURIComponent(promotion.code)}`
    : `https://nexphone.io/campaigns/${encodeURIComponent(promotion.id)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(promoLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyCode = async () => {
    if (!promotion.code) return;
    try {
      await navigator.clipboard.writeText(promotion.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // fallback
    }
  };

  const avgOrderValue =
    promotion.ordersCount > 0
      ? Math.round(promotion.revenueGenerated / promotion.ordersCount)
      : 0;

  const usagePercent = promotion.usageLimit
    ? Math.min(100, Math.round((promotion.usedCount / promotion.usageLimit) * 100))
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl z-10 my-8 overflow-hidden">
        {/* Hero Banner Header */}
        <div className="relative bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-5 sm:p-6 border-b border-slate-800">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600/25 text-indigo-400 ring-1 ring-indigo-500/40">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                </svg>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300 ring-1 ring-indigo-500/40">
                    {promotion.type.replace("_", " ")}
                  </span>
                  {promotion.campaignTag && (
                    <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                      {promotion.campaignTag}
                    </span>
                  )}
                  {promotion.status === "active" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                  )}
                  {promotion.status === "scheduled" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      Scheduled
                    </span>
                  )}
                  {promotion.status === "expired" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                      Expired
                    </span>
                  )}
                  {promotion.status === "disabled" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                      Disabled
                    </span>
                  )}
                </div>
                <h2 className="mt-1 text-lg font-bold text-white tracking-tight">
                  {promotion.title}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-300 max-w-xl">
            {promotion.description}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Coupon Code / URL Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {promotion.code ? "Redemption Code" : "Campaign Link"}
                </span>
                <div className="mt-1 flex items-center gap-2">
                  {promotion.code ? (
                    <span className="font-mono text-base font-bold text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-500/30 tracking-wider">
                      {promotion.code}
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-slate-300 truncate max-w-xs sm:max-w-md">
                      {promoLink}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {promotion.code && (
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    {copiedCode ? (
                      <>
                        <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <span className="text-emerald-400 font-semibold">Copied Code</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124" />
                        </svg>
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      <span className="text-emerald-400 font-semibold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                      </svg>
                      <span>Share URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Total Revenue</span>
              <p className="mt-1 text-base font-bold text-emerald-400">
                ${promotion.revenueGenerated.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500">Attributed GMV</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Redemptions</span>
              <p className="mt-1 text-base font-bold text-white">
                {promotion.usedCount.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500">
                {promotion.usageLimit ? `of ${promotion.usageLimit} limit` : "unlimited"}
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Avg Order Value</span>
              <p className="mt-1 text-base font-bold text-indigo-300">
                ${avgOrderValue.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500">Per promo order</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Customer Limit</span>
              <p className="mt-1 text-base font-bold text-amber-400">
                {promotion.customerLimit || 1} use
              </p>
              <span className="text-[10px] text-slate-500">Per verified account</span>
            </div>
          </div>

          {/* Configuration & Rules */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Promotion Rules & Eligibility
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                <span className="text-slate-400">Discount Benefit:</span>
                <span className="font-bold text-white">
                  {promotion.discountType === "percentage" && `${promotion.discountValue}% OFF`}
                  {promotion.discountType === "fixed_amount" && `$${promotion.discountValue}.00 Instant Cash`}
                  {promotion.discountType === "free_shipping" && "Free Worldwide Express Courier"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                <span className="text-slate-400">Cart Minimum:</span>
                <span className="font-semibold text-slate-200">
                  {promotion.minOrderValue ? `$${promotion.minOrderValue} USD` : "None"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                <span className="text-slate-400">Max Discount Cap:</span>
                <span className="font-semibold text-slate-200">
                  {promotion.maxDiscountAmount ? `$${promotion.maxDiscountAmount} USD` : "No limit"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                <span className="text-slate-400">Target Fleet Scope:</span>
                <span className="font-semibold text-indigo-300">
                  {promotion.scope.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Targeted items list */}
            {promotion.targetItems && promotion.targetItems.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1.5">Applicable Items:</span>
                <div className="flex flex-wrap gap-1.5">
                  {promotion.targetItems.map((item, idx) => (
                    <span
                      key={`item-${idx}`}
                      className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Schedule & Duration */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Validity Timeline
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-500">Starts Active:</span>
                <p className="font-medium text-slate-200 mt-0.5">{formatDate(promotion.startDate)}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Expires:</span>
                <p className="font-medium text-slate-200 mt-0.5">{formatDate(promotion.endDate)}</p>
              </div>
            </div>
            {usagePercent !== null && (
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Redemption Quota Progress:</span>
                  <span className="font-bold text-white">{usagePercent}% ({promotion.usedCount}/{promotion.usageLimit})</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      usagePercent >= 90 ? "bg-rose-500" : usagePercent >= 60 ? "bg-amber-500" : "bg-indigo-500"
                    )}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleStatus(promotion)}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
                promotion.status === "active"
                  ? "border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
                  : "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20"
              )}
            >
              {promotion.status === "active" ? "Pause Discount" : "Activate Discount"}
            </button>
            <button
              type="button"
              onClick={() => onDelete(promotion)}
              className="rounded-xl border border-rose-500/30 text-rose-400 px-3 py-1.5 text-xs font-medium hover:bg-rose-500/20 transition-colors"
            >
              Delete
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(promotion);
              }}
              className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
            >
              Edit Discount
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
