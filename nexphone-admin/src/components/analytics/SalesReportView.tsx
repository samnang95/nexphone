"use client";

import { useState } from "react";
import type { SalesReportSummary } from "@/types/analytics";

interface SalesReportViewProps {
  data: SalesReportSummary;
  onExportCsv: () => void;
}

export function SalesReportView({ data, onExportCsv }: SalesReportViewProps) {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const timeline = data.dailyTimeline;
  const maxRevenue = Math.max(...timeline.map((p) => p.revenue), 1);

  const activePoint = hoveredPointIndex !== null ? timeline[hoveredPointIndex] : timeline[timeline.length - 1];

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales Volume */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Sales Volume
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ${data.totalSalesVolume.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-400">
              ↑ +{data.growthPercentage}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {data.completedOrdersCount} orders fulfilled ({data.cancelledOrdersCount} cancelled)
          </p>
        </div>

        {/* Total Orders */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Fleet Orders Count
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400 ring-1 ring-cyan-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-cyan-400">
              {data.ordersCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">dispatches</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            96.0% order dispatch fulfillment rate
          </p>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Average Order Value (AOV)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 ring-1 ring-purple-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ${data.averageOrderValue.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-400">+$124 vs Q2</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Driven by dual-phone bundle & VIP tiers
          </p>
        </div>

        {/* Storefront Conversion Rate */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Checkout Conversion
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-400">
              {data.conversionRate}%
            </span>
            <span className="text-xs font-semibold text-emerald-400">↑ +0.42%</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Industry flagship standard: ~2.6%
          </p>
        </div>
      </div>

      {/* Main Interactive Chart & Channel Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Interactive Sales Timeline */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-lg lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📈</span>
                <span>Sales Velocity & Dispatch Trajectory</span>
              </h3>
              <p className="text-xs text-slate-400">
                Daily sales revenue, units fulfilled, and transaction density
              </p>
            </div>

            {/* Active Point Hover Badge */}
            {activePoint && (
              <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs font-mono">
                <span className="text-slate-400">{activePoint.date}:</span>
                <span className="font-bold text-indigo-400">
                  ${activePoint.revenue.toLocaleString()}
                </span>
                <span className="text-slate-500">({activePoint.orders} orders)</span>
              </div>
            )}
          </div>

          {/* SVG Bar / Area Visualization */}
          <div className="relative pt-4">
            <div className="h-56 w-full flex items-end gap-1.5 sm:gap-3">
              {timeline.map((point, index) => {
                const heightPercent = Math.max(12, Math.round((point.revenue / maxRevenue) * 100));
                const isHovered = hoveredPointIndex === index;
                return (
                  <div
                    key={point.date}
                    onMouseEnter={() => setHoveredPointIndex(index)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    {/* Bar */}
                    <div className="w-full relative flex items-end justify-center h-full">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[28px] rounded-t-lg transition-all duration-200 ${
                          isHovered
                            ? "bg-gradient-to-t from-indigo-600 to-cyan-400 shadow-lg shadow-indigo-500/30"
                            : "bg-gradient-to-t from-indigo-950 to-indigo-600/70 hover:from-indigo-900 hover:to-indigo-500"
                        }`}
                      />
                    </div>
                    {/* Date Label */}
                    <span
                      className={`text-[10px] mt-2 block truncate font-mono ${
                        isHovered ? "text-white font-bold" : "text-slate-500"
                      }`}
                    >
                      {point.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Channel Breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-lg space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🌐</span>
              <span>Sales by Channel</span>
            </h3>
            <p className="text-xs text-slate-400">
              Customer acquisition & dispatch origins
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {data.channels.map((channel, i) => {
              const colors = [
                { bg: "bg-indigo-500", text: "text-indigo-400" },
                { bg: "bg-cyan-500", text: "text-cyan-400" },
                { bg: "bg-purple-500", text: "text-purple-400" },
              ];
              const c = colors[i % colors.length]!;
              return (
                <div key={channel.channel} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{channel.channel}</span>
                    <span className={`font-mono font-bold ${c.text}`}>
                      {channel.percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.bg}`}
                      style={{ width: `${channel.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>${channel.revenue.toLocaleString()}</span>
                    <span>{channel.ordersCount} orders</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-800/80 pt-4">
            <button
              type="button"
              onClick={onExportCsv}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Download Raw Sales Dataset (CSV)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
