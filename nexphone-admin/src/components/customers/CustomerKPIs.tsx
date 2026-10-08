"use client";

import type { CustomerSummaryMetrics, CustomerStatus } from "@/types/customer";

interface CustomerKPIsProps {
  readonly metrics: CustomerSummaryMetrics;
  readonly activeStatus: CustomerStatus | "all";
  readonly onStatusFilter: (status: CustomerStatus | "all") => void;
}

export function CustomerKPIs({ metrics, activeStatus, onStatusFilter }: CustomerKPIsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {/* 1. Total Customers */}
      <button
        type="button"
        onClick={() => onStatusFilter("all")}
        className={`flex flex-col justify-between rounded-xl border p-4 text-left backdrop-blur-md transition-all cursor-pointer ${
          activeStatus === "all"
            ? "border-indigo-500/60 bg-indigo-500/10 shadow-lg shadow-indigo-950/30"
            : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/80"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-medium text-slate-400">Total Customer Base</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">
            {metrics.totalCustomers.toLocaleString()}
          </span>
          <span className="text-[11px] text-indigo-300">
            {metrics.vipCustomers} VIP/Ent
          </span>
        </div>
      </button>

      {/* 2. Active Accounts */}
      <button
        type="button"
        onClick={() => onStatusFilter(activeStatus === "active" ? "all" : "active")}
        className={`flex flex-col justify-between rounded-xl border p-4 text-left backdrop-blur-md transition-all cursor-pointer ${
          activeStatus === "active"
            ? "border-emerald-500/60 bg-emerald-500/15 shadow-lg shadow-emerald-950/30"
            : "border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 hover:bg-slate-900/80"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-400">Active Accounts</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {metrics.activeCustomers.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400">
            {metrics.totalCustomers > 0 ? Math.round((metrics.activeCustomers / metrics.totalCustomers) * 100) : 0}% fleet
          </span>
        </div>
      </button>

      {/* 3. Disabled / Restricted Accounts */}
      <button
        type="button"
        onClick={() => onStatusFilter(activeStatus === "disabled" ? "all" : "disabled")}
        className={`flex flex-col justify-between rounded-xl border p-4 text-left backdrop-blur-md transition-all cursor-pointer ${
          activeStatus === "disabled"
            ? "border-rose-500/60 bg-rose-500/15 shadow-lg shadow-rose-950/30"
            : "border-slate-800 bg-slate-900/60 hover:border-rose-500/40 hover:bg-slate-900/80"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-400">Disabled / Blocked</span>
            {metrics.disabledCustomers > 0 && (
              <span className="rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-rose-300">
                {metrics.disabledCustomers}
              </span>
            )}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-rose-400">
            {metrics.disabledCustomers.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400">
            Security audit
          </span>
        </div>
      </button>

      {/* 4. Total Lifetime Value (LTV) */}
      <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-left backdrop-blur-md">
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-medium text-slate-400">Total Customer LTV</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-cyan-400">
            {formatCurrency(metrics.totalLtv)}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            ~{formatCurrency(metrics.avgSpendPerCustomer)}/usr
          </span>
        </div>
      </div>
    </div>
  );
}
