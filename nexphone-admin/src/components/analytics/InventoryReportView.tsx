"use client";

import type { InventoryReportSummary } from "@/types/analytics";

interface InventoryReportViewProps {
  data: InventoryReportSummary;
  onExportCsv: () => void;
}

export function InventoryReportView({ data, onExportCsv }: InventoryReportViewProps) {
  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Stock Valuation */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Stock Valuation
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/30">
              <span className="font-bold text-sm">$</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ${(data.totalValuation / 1000000).toFixed(2)}M
            </span>
            <span className="text-xs text-slate-400">Retail MSRP</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Valuation across 3 continental distribution hubs
          </p>
        </div>

        {/* Total Units in Stock */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Warehouse Inventory Units
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-400">
              {data.totalUnitsInStock.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">devices</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {data.lowStockItemsCount} low stock alerts ({data.outOfStockItemsCount} stockouts)
          </p>
        </div>

        {/* Days of Inventory Remaining (DOI) */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Days of Inventory (DOI)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400 ring-1 ring-cyan-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v7.5" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {data.daysOfInventoryRemaining}
            </span>
            <span className="text-xs text-slate-400">Days of runway</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Target buffer: 21 to 30 days
          </p>
        </div>

        {/* Stock Turnover Rate */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Stock Turnover Velocity
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 ring-1 ring-purple-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-purple-400">
              {data.stockTurnoverRate}x
            </span>
            <span className="text-xs text-slate-400">Annualized</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            High capital efficiency and rapid pipeline clearing
          </p>
        </div>
      </div>

      {/* Grid: Fast Depleting SKUs & Warehouse Hubs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Fast Depleting SKUs (Left 2 Cols) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg backdrop-blur-xl lg:col-span-2 overflow-hidden flex flex-col">
          <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-3.5 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Fast-Depleting Models & Restock Forecast
              </h3>
              <p className="text-[11px] text-slate-400">
                Automated reorder triggers based on weekly burn velocity
              </p>
            </div>
            <button
              type="button"
              onClick={onExportCsv}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Export Inventory SKU Data →
            </button>
          </div>

          <div className="overflow-x-auto text-xs flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Flagship Model SKU</th>
                  <th className="py-3 px-4 text-center">Current Stock</th>
                  <th className="py-3 px-4 text-center">Burn Velocity</th>
                  <th className="py-3 px-4 text-center">Runway</th>
                  <th className="py-3 px-4 text-right">Status Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {data.fastDepletingSkus.map((sku) => (
                  <tr key={sku.phoneId} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-white block">{sku.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {sku.modelCode}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                      {sku.currentStock} units
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                      {sku.burnRatePerWeek} units/wk
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      <span
                        className={
                          sku.daysRemaining <= 5
                            ? "text-rose-400"
                            : sku.daysRemaining <= 14
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }
                      >
                        {sku.daysRemaining} days
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          sku.status === "critical"
                            ? "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30 animate-pulse"
                            : sku.status === "warning"
                            ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                        }`}
                      >
                        {sku.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warehouse Hubs (Right 1 Col) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-lg space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🏭</span>
              <span>Warehouse Distribution Hubs</span>
            </h3>
            <p className="text-xs text-slate-400">
              Capacity utilization & localized device inventory
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {data.warehouses.map((wh) => (
              <div key={wh.warehouseId} className="space-y-1.5 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{wh.name}</span>
                  <span className="font-mono text-indigo-400 font-bold">
                    {wh.utilizationPercent}% Util
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${wh.utilizationPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                  <span>{wh.unitsCount.toLocaleString()} units</span>
                  <span>${(wh.valuation / 1000000).toFixed(2)}M stock</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
