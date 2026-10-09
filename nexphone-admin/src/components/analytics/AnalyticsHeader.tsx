"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import type { AnalyticsTab, DateRangeOption } from "@/types/analytics";

interface AnalyticsHeaderProps {
  activeTab: AnalyticsTab;
  onTabChange: (tab: AnalyticsTab) => void;
  dateRange: DateRangeOption;
  onDateRangeChange: (range: DateRangeOption) => void;
  onOpenExecutiveReport: () => void;
  onExportCsv: () => void;
}

export function AnalyticsHeader({
  activeTab,
  onTabChange,
  dateRange,
  onDateRangeChange,
  onOpenExecutiveReport,
  onExportCsv,
}: AnalyticsHeaderProps) {
  const tabs: { id: AnalyticsTab; label: string; icon: string; count?: string }[] = [
    { id: "sales", label: "Sales Reports", icon: "📈", count: "+14.8%" },
    { id: "revenue", label: "Revenue & P&L", icon: "💰", count: "$1.38M" },
    { id: "best_sellers", label: "Best-Selling Phones", icon: "📱", count: "Top 5" },
    { id: "customers", label: "Customer Statistics", icon: "👥", count: "18.4k" },
    { id: "inventory", label: "Inventory Reports", icon: "📦", count: "3 Alerts" },
  ];

  const dateRanges: { id: DateRangeOption; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "7d", label: "Last 7 Days" },
    { id: "30d", label: "Last 30 Days" },
    { id: "quarter", label: "This Quarter" },
    { id: "year", label: "Year to Date" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <Breadcrumbs />

      {/* Main Header Strip */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Reports & Analytics Studio
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 ring-1 ring-indigo-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Live Commercial Telemetry
            </span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-emerald-500/30">
              SLA 99.98%
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time business intelligence across order sales volume, commercial revenue, device leaderboards, customer cohorts, and supply chain inventory.
          </p>
        </div>

        {/* Date Range Selector & Action CTAs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Date Range Buttons */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-1 overflow-x-auto">
            {dateRanges.map((range) => {
              const active = dateRange === range.id;
              return (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => onDateRangeChange(range.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors shrink-0 ${
                    active
                      ? "bg-indigo-600 text-white font-semibold shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {range.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onExportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenExecutiveReport}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 shrink-0"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <span>Executive Report</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800 pb-3">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all shrink-0 ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-500"
                  : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-white"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
