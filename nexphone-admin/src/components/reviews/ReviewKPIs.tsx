"use client";

import type { ReviewSummaryMetrics } from "@/types/review";

interface ReviewKPIsProps {
  readonly metrics: ReviewSummaryMetrics;
  readonly isLoading: boolean;
  readonly onFilterReported: () => void;
  readonly isReportedFilterActive: boolean;
}

export function ReviewKPIs({
  metrics,
  isLoading,
  onFilterReported,
  isReportedFilterActive,
}: ReviewKPIsProps) {
  const {
    totalReviews = 0,
    averageRating = 0,
    publishedCount = 0,
    reportedCount = 0,
    rejectedCount = 0,
    verifiedPurchaseRate = 0,
  } = metrics || {};

  return (
    <div className="space-y-4">
      {/* Moderation Alert Banner when reports are pending */}
      {reportedCount > 0 && (
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-slate-900/90 p-4 shadow-xl backdrop-blur-xl transition-all">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40 animate-pulse">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">Pending Moderation Queue</h4>
                  <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-300 ring-1 ring-amber-500/30">
                    {reportedCount} Flagged
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Customer reports require inspection for policy violations (Spam, offensive language, or false information).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onFilterReported}
              className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                isReportedFilterActive
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 ring-2 ring-white/30"
                  : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 active:scale-95"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" />
              </svg>
              <span>{isReportedFilterActive ? "Viewing Flagged" : `Review Flagged (${reportedCount})`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary 4 Telemetry KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Reviews */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Customer Reviews</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-white">
              {isLoading ? "—" : totalReviews}
            </span>
            <span className="text-xs text-slate-400">catalog ratings</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center text-emerald-400 font-semibold">
              {isLoading ? "—" : `${publishedCount} published`}
            </span>
            <span>•</span>
            <span className="text-slate-500">{rejectedCount} removed</span>
          </div>
        </div>

        {/* Card 2: Average Rating Score */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Average Rating</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-amber-300">
              {isLoading ? "—" : averageRating.toFixed(1)}
            </span>
            <div className="flex items-center text-amber-400 text-sm">
              {"★".repeat(Math.round(averageRating))}
              {"☆".repeat(Math.max(0, 5 - Math.round(averageRating)))}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-300 font-medium">Customer satisfaction</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Scale of 5.0</span>
          </div>
        </div>

        {/* Card 3: Flagged / Reported */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Flagged & Reported</span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${
              reportedCount > 0
                ? "bg-rose-500/20 text-rose-400 ring-rose-500/30 animate-pulse"
                : "bg-slate-800 text-slate-400 ring-slate-700"
            }`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.209-.682L3 4.5M3 15V4.5" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`font-mono text-3xl font-bold tracking-tight ${
              reportedCount > 0 ? "text-rose-400" : "text-white"
            }`}>
              {isLoading ? "—" : reportedCount}
            </span>
            <span className="text-xs text-slate-400">under investigation</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            {reportedCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
                Moderation required
              </span>
            ) : (
              <span className="inline-flex items-center text-emerald-400 font-medium">
                ✓ All queues clear
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Verified Buyer Rate */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Verified Buyer Ratio</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-cyan-300">
              {isLoading ? "—" : `${verifiedPurchaseRate}%`}
            </span>
            <span className="text-xs text-slate-400">authenticated orders</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-emerald-400 font-medium">High Trust Index</span>
            <span>•</span>
            <span className="text-slate-500">Anti-bot verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
