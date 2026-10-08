"use client";

import { useEffect, useRef } from "react";
import type { InventoryItem } from "@/types/inventory";
import { cn } from "@/utils/cn";

interface InventoryTableProps {
  readonly items: readonly InventoryItem[];
  readonly onAdjustStock: (item: InventoryItem) => void;
  readonly onConfigureThreshold: (item: InventoryItem) => void;
  readonly onViewMovements: (item: InventoryItem) => void;
}

function formatWarehouseName(raw: string): string {
  return raw.replace(/\s+(Central\s+)?Hub/gi, "").trim();
}

export function InventoryTable({
  items,
  onAdjustStock,
  onConfigureThreshold,
  onViewMovements,
}: InventoryTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = 0;
    }
  }, [items]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center backdrop-blur-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-500 mb-3">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-200">No inventory items match your filter</h3>
        <p className="mt-1 text-xs text-slate-400">Try adjusting your search criteria, warehouse hub, or status filter.</p>
      </div>
    );
  }

  return (
    <div
      ref={tableContainerRef}
      className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50 shadow-xl backdrop-blur-md"
    >
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <th className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">Hardware SKU & Model</th>
            <th className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">Warehouse Hub</th>
            <th className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">Stock Quantity</th>
            <th className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">Available / Reserved</th>
            <th className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">Stock Status</th>
            <th className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">Asset Value</th>
            <th className="py-3 px-2.5 xl:px-3.5 text-right whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-normal">
          {items.map((item) => {
            const statusConfig = {
              in_stock: {
                label: "In Stock",
                style: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                barColor: "bg-emerald-500",
                dot: "bg-emerald-400",
              },
              low_stock: {
                label: "Low Stock",
                style: "bg-amber-500/15 text-amber-400 border-amber-500/30",
                barColor: "bg-amber-500",
                dot: "bg-amber-400 animate-pulse",
              },
              out_of_stock: {
                label: "Out of Stock",
                style: "bg-rose-500/15 text-rose-400 border-rose-500/30",
                barColor: "bg-rose-500",
                dot: "bg-rose-400 animate-ping",
              },
              overstocked: {
                label: "Overstocked",
                style: "bg-blue-500/15 text-blue-400 border-blue-500/30",
                barColor: "bg-blue-500",
                dot: "bg-blue-400",
              },
            }[item.status];

            // Progress bar ratio relative to a baseline of reorderPoint * 2
            const maxRef = Math.max(item.stockQuantity, item.reorderPoint * 2, 50);
            const stockPct = Math.min(100, Math.round((item.stockQuantity / maxRef) * 100));

            return (
              <tr
                key={item.id}
                className="group transition-colors hover:bg-slate-800/30"
              >
                {/* SKU & Hardware Model */}
                <td className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold text-indigo-300 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/60 shrink-0 whitespace-nowrap">
                        {item.sku}
                      </span>
                      <span className="font-semibold text-slate-100 group-hover:text-indigo-200 transition-colors whitespace-nowrap">
                        {item.productName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 whitespace-nowrap">
                      <span className="text-slate-300 font-medium whitespace-nowrap">{item.variantCapacity}</span>
                      <span>•</span>
                      <span className="whitespace-nowrap">{item.variantRam}</span>
                      <span>•</span>
                      <span className="text-slate-500 whitespace-nowrap">{item.brandName}</span>
                    </div>
                  </div>
                </td>

                {/* Warehouse Location */}
                <td className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">
                  <div
                    className="flex items-center gap-1.5 whitespace-nowrap"
                    title={item.warehouse}
                  >
                    <svg className="h-3.5 w-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    <span className="text-slate-300 font-medium whitespace-nowrap">
                      {formatWarehouseName(item.warehouse)}
                    </span>
                  </div>
                </td>

                {/* Stock Quantity + Health Bar */}
                <td className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">
                  <div className="flex flex-col gap-1 w-24 sm:w-28">
                    <div className="flex items-baseline justify-between whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-white whitespace-nowrap">
                        {item.stockQuantity.toLocaleString()}
                      </span>
                      <span
                        className="text-[10px] text-slate-500 font-mono whitespace-nowrap"
                        title={`Low-stock threshold: ${item.lowStockThreshold} units`}
                      >
                        ≤{item.lowStockThreshold}
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={cn("h-full transition-all duration-500", statusConfig.barColor)}
                        style={{ width: `${item.stockQuantity === 0 ? 0 : Math.max(stockPct, 8)}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Available / Reserved */}
                <td className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">
                  <div className="flex flex-col whitespace-nowrap">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="text-emerald-400 font-mono font-semibold text-xs whitespace-nowrap">
                        {item.availableQuantity}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">avail</span>
                    </div>
                    {item.reservedQuantity > 0 ? (
                      <span
                        className="text-[10px] text-slate-500 font-mono whitespace-nowrap"
                        title={`${item.reservedQuantity} units allocated for pending customer orders`}
                      >
                        {item.reservedQuantity} reserved
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600 font-mono whitespace-nowrap">0 reserved</span>
                    )}
                  </div>
                </td>

                {/* Stock Status Badge */}
                <td className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide shadow-sm whitespace-nowrap",
                      statusConfig.style
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", statusConfig.dot)} />
                    {statusConfig.label}
                  </span>
                </td>

                {/* Asset Value */}
                <td className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">
                  <div className="flex flex-col whitespace-nowrap">
                    <span className="font-mono font-semibold text-xs text-slate-200 whitespace-nowrap">
                      {formatCurrency(item.totalValue)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                      @{formatCurrency(item.unitCost)}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3 px-2.5 xl:px-3.5 text-right whitespace-nowrap">
                  <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                    {/* Primary: Adjust Stock */}
                    <button
                      type="button"
                      onClick={() => onAdjustStock(item)}
                      className="inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/20 hover:text-white"
                      title="Adjust / Restock Inventory"
                    >
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      <span className="whitespace-nowrap">Update Stock</span>
                    </button>

                    {/* Secondary: Configure Alert Threshold */}
                    <button
                      type="button"
                      onClick={() => onConfigureThreshold(item)}
                      className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-1.5 text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white shrink-0"
                      title="Configure Low-Stock Alert Threshold"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                      </svg>
                    </button>

                    {/* Movement History / Audit Log */}
                    <button
                      type="button"
                      onClick={() => onViewMovements(item)}
                      className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-1.5 text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white shrink-0"
                      title="View Stock Movement Audit Trail"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
