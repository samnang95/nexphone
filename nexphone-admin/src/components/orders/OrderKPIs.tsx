"use client";

import type { OrderMetrics, OrderStatus } from "@/types/order";

interface OrderKPIsProps {
  readonly metrics: OrderMetrics;
  readonly activeStatus: "all" | OrderStatus;
  readonly onStatusFilter: (status: "all" | OrderStatus) => void;
}

export function OrderKPIs({ metrics, activeStatus, onStatusFilter }: OrderKPIsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {/* 1. Total Orders */}
      <button
        type="button"
        onClick={() => onStatusFilter("all")}
        className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-left backdrop-blur-md transition-all hover:border-slate-700 hover:bg-slate-900/80 cursor-pointer"
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-medium text-slate-400">Total Orders</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">
            {metrics.totalOrders.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400">
            {metrics.paidOrdersCount} paid
          </span>
        </div>
      </button>

      {/* 2. Pending Confirmation */}
      <button
        type="button"
        onClick={() => onStatusFilter(activeStatus === "pending" ? "all" : "pending")}
        className={`flex flex-col justify-between rounded-xl border p-4 text-left backdrop-blur-md transition-all cursor-pointer ${
          activeStatus === "pending"
            ? "border-amber-500/60 bg-amber-500/15 shadow-lg shadow-amber-950/30"
            : "border-slate-800 bg-slate-900/60 hover:border-amber-500/40 hover:bg-slate-900/80"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-400">Pending Review</span>
            {metrics.pendingOrders > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-amber-300">
            {metrics.pendingOrders}
          </span>
          <span className="text-[11px] text-amber-400/80">requires confirmation</span>
        </div>
      </button>

      {/* 3. In Transit / Processing */}
      <button
        type="button"
        onClick={() => onStatusFilter(activeStatus === "shipped" ? "all" : "shipped")}
        className={`flex flex-col justify-between rounded-xl border p-4 text-left backdrop-blur-md transition-all cursor-pointer ${
          activeStatus === "shipped"
            ? "border-blue-500/60 bg-blue-500/15 shadow-lg shadow-blue-950/30"
            : "border-slate-800 bg-slate-900/60 hover:border-blue-500/40 hover:bg-slate-900/80"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-medium text-slate-400">In Fulfillment</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.75m0 3.75a2.25 2.25 0 0 1 2.25 2.25v2.25m-2.25-4.5H8.25" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-blue-300">
            {metrics.processingOrders + metrics.shippedOrders}
          </span>
          <span className="text-[11px] text-slate-400">
            {metrics.shippedOrders} dispatched
          </span>
        </div>
      </button>

      {/* 4. Gross Revenue */}
      <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Gross Sales Value</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-emerald-300">
            {formatCurrency(metrics.totalRevenue)}
          </span>
          <span className="text-[11px] text-slate-400">
            ~{formatCurrency(metrics.avgOrderValue)} AOV
          </span>
        </div>
      </div>
    </div>
  );
}
