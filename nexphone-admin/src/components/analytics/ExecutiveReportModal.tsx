"use client";

import type { ExecutiveReportBundle } from "@/types/analytics";
import { analyticsService } from "@/services/analytics.service";

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundle: ExecutiveReportBundle | null;
}

export function ExecutiveReportModal({ isOpen, onClose, bundle }: ExecutiveReportModalProps) {
  if (!isOpen || !bundle) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    analyticsService.exportToJson(bundle, `nexphone-executive-report-${bundle.dateRange}`);
  };

  const handleDownloadCsv = () => {
    const summaryRows = [
      { Metric: "Total Revenue ($)", Value: bundle.revenue.grossRevenue },
      { Metric: "Net Profit ($)", Value: bundle.revenue.netRevenue },
      { Metric: "Operating Profit Margin (%)", Value: bundle.revenue.profitMarginPercent },
      { Metric: "Total Units Sold", Value: bundle.sales.totalUnitsSold },
      { Metric: "Total Orders", Value: bundle.sales.ordersCount },
      { Metric: "Average Order Value ($)", Value: bundle.sales.averageOrderValue },
      { Metric: "Total Registered Customers", Value: bundle.customers.totalCustomers },
      { Metric: "Active Buyers", Value: bundle.customers.activeBuyersCount },
      { Metric: "Inventory Valuation ($)", Value: bundle.inventory.totalValuation },
      { Metric: "Total Units In Stock", Value: bundle.inventory.totalUnitsInStock },
      { Metric: "Days Of Inventory", Value: bundle.inventory.daysOfInventoryRemaining },
    ];
    analyticsService.exportToCsv(summaryRows, `nexphone-executive-summary-${bundle.dateRange}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-xs ring-1 ring-indigo-500/30">
                NP
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Executive Commercial Intelligence Brief
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Confidential Board-level briefing for window:{" "}
              <span className="font-semibold text-indigo-300 uppercase">{bundle.dateRange}</span>{" "}
              • Generated: {new Date(bundle.generatedAt).toLocaleString()}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.72 13.829c-.24-1.076-.673-2.03-1.27-2.829H4.5A2.25 2.25 0 0 0 2.25 13.25v4.5A2.25 2.25 0 0 0 4.5 20h15a2.25 2.25 0 0 0 2.25-2.25v-4.5a2.25 2.25 0 0 0-2.25-2.25h-.95c-.597.799-1.03 1.753-1.27 2.829m-10.56 0A7.482 7.482 0 0 1 12 12c1.78 0 3.393.62 4.67 1.829m-9.34 0a7.48 7.48 0 0 0-2.41 5.421H19.75a7.48 7.48 0 0 0-2.41-5.421M16.5 6.75A4.5 4.5 0 1 1 7.5 6.75a4.5 4.5 0 0 1 9 0Z" />
              </svg>
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-slate-700 hover:text-indigo-200 transition-colors"
            >
              <span>JSON</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-slate-700 hover:text-emerald-200 transition-colors"
            >
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 5 Pillars High-Level Summary Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
            <span className="text-[11px] font-medium text-slate-400">Gross Revenue</span>
            <div className="mt-1 text-lg font-bold text-white">
              ${(bundle.revenue.grossRevenue).toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400">+{bundle.revenue.momGrowthPercent}% MoM</span>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
            <span className="text-[11px] font-medium text-slate-400">Net Profit</span>
            <div className="mt-1 text-lg font-bold text-emerald-400">
              ${(bundle.revenue.netRevenue).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">{bundle.revenue.profitMarginPercent}% Margin</span>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
            <span className="text-[11px] font-medium text-slate-400">Units Dispatched</span>
            <div className="mt-1 text-lg font-bold text-white">
              {bundle.sales.totalUnitsSold.toLocaleString()}
            </div>
            <span className="text-[10px] text-indigo-400">{bundle.sales.ordersCount} orders</span>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
            <span className="text-[11px] font-medium text-slate-400">Active Buyers</span>
            <div className="mt-1 text-lg font-bold text-white">
              {bundle.customers.activeBuyersCount.toLocaleString()}
            </div>
            <span className="text-[10px] text-amber-400">{bundle.customers.returningCustomerRate}% retention</span>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-medium text-slate-400">Stock Valuation</span>
            <div className="mt-1 text-lg font-bold text-white">
              ${(bundle.inventory.totalValuation).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">{bundle.inventory.daysOfInventoryRemaining} DOI Runway</span>
          </div>
        </div>

        {/* Strategic Analysis Columns */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Best-Sellers & Market Share */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Top Revenue Flagships</span>
              <span className="text-[10px] text-indigo-400">Leaderboard</span>
            </h3>
            <div className="space-y-2.5">
              {bundle.bestSellers.slice(0, 4).map((phone, idx) => (
                <div key={phone.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 w-4">#{idx + 1}</span>
                    <span className="font-medium text-white truncate max-w-[170px]">{phone.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="font-mono text-slate-300">{phone.unitsSold} units</span>
                    <span className="font-mono font-semibold text-emerald-400">${(phone.revenue).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supply Chain & Inventory Risk Alert */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Supply Chain Runway & Depletion</span>
              <span className="text-[10px] text-amber-400">Action Required</span>
            </h3>
            <div className="space-y-2.5">
              {bundle.inventory.fastDepletingSkus.slice(0, 3).map((sku) => (
                <div key={sku.phoneId} className="flex items-center justify-between text-xs border-b border-slate-800/50 pb-2">
                  <div>
                    <div className="font-medium text-white">{sku.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Stock: {sku.currentStock} units • Burn: {sku.burnRatePerWeek}/wk</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        sku.status === "critical"
                          ? "bg-rose-500/20 text-rose-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {sku.daysRemaining} days left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <span>NexPhone Commercial Intelligence • Authorized internal management distribution only.</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Close Briefing
          </button>
        </div>
      </div>
    </div>
  );
}
