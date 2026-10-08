"use client";

import type { InventoryMetrics, StockStatus } from "@/types/inventory";

interface InventoryKPIsProps {
  readonly metrics: InventoryMetrics;
  readonly activeStatus: "all" | StockStatus;
  readonly onStatusFilter: (status: "all" | StockStatus) => void;
}

export function InventoryKPIs({ metrics, activeStatus, onStatusFilter }: InventoryKPIsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* 1. Total Physical Units */}
      <button
        type="button"
        onClick={() => onStatusFilter("all")}
        className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-left backdrop-blur-md transition-all hover:border-slate-700 hover:bg-slate-900/80 cursor-pointer"
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-medium text-slate-400">Total Stock Units</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">
            {metrics.totalUnits.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400">across {metrics.totalSkus} SKUs</span>
        </div>
      </button>

      {/* 2. Total Asset Valuation */}
      <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Inventory Valuation</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-emerald-300">
            {formatCurrency(metrics.totalValue)}
          </span>
          <span className="text-[11px] text-slate-400">at unit cost</span>
        </div>
      </div>

      {/* 3. Low-Stock Alerts */}
      <button
        type="button"
        onClick={() => onStatusFilter(activeStatus === "low_stock" ? "all" : "low_stock")}
        className={`flex flex-col justify-between rounded-xl border p-4 text-left backdrop-blur-md transition-all cursor-pointer ${
          activeStatus === "low_stock"
            ? "border-amber-500/60 bg-amber-500/10 shadow-lg shadow-amber-950/30"
            : "border-slate-800 bg-slate-900/60 hover:border-amber-500/40 hover:bg-slate-900/80"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-400">Low-Stock Alerts</span>
            {metrics.lowStockCount > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-amber-400">
            {metrics.lowStockCount}
          </span>
          <span className="text-[11px] text-amber-300/80">below threshold</span>
        </div>
      </button>

      {/* 4. Out of Stock Critical */}
      <button
        type="button"
        onClick={() => onStatusFilter(activeStatus === "out_of_stock" ? "all" : "out_of_stock")}
        className={`flex flex-col justify-between rounded-xl border p-4 text-left backdrop-blur-md transition-all cursor-pointer ${
          activeStatus === "out_of_stock"
            ? "border-rose-500/60 bg-rose-500/10 shadow-lg shadow-rose-950/30"
            : "border-slate-800 bg-slate-900/60 hover:border-rose-500/40 hover:bg-slate-900/80"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-400">Out of Stock</span>
            {metrics.outOfStockCount > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-rose-400">
            {metrics.outOfStockCount}
          </span>
          <span className="text-[11px] text-rose-300/80">critical depletion</span>
        </div>
      </button>
    </div>
  );
}
