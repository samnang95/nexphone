"use client";

import { useState } from "react";
import type { InventoryItem } from "@/types/inventory";

interface LowStockAlertBannerProps {
  readonly items: readonly InventoryItem[];
  readonly onFilterAlerts: () => void;
  readonly isFiltered: boolean;
}

export function LowStockAlertBanner({ items, onFilterAlerts, isFiltered }: LowStockAlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const alertItems = items.filter(
    (i) => i.status === "low_stock" || i.status === "out_of_stock"
  );

  if (dismissed || alertItems.length === 0) return null;

  const outOfStockCount = alertItems.filter((i) => i.status === "out_of_stock").length;
  const lowStockCount = alertItems.filter((i) => i.status === "low_stock").length;

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-slate-900/90 p-4 shadow-xl backdrop-blur-md">
      {/* Subtle glowing side accent */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-amber-500/20 blur-2xl" />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Inventory Supply Warning
              </span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 font-mono">
                {alertItems.length} SKUs Impacted
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-300">
              {outOfStockCount > 0 && (
                <strong className="text-rose-400 font-semibold">{outOfStockCount} out of stock </strong>
              )}
              {outOfStockCount > 0 && lowStockCount > 0 && "and "}
              {lowStockCount > 0 && (
                <strong className="text-amber-300 font-semibold">{lowStockCount} below minimum reorder threshold</strong>
              )}
              . Immediate purchase order or warehouse transfer recommended.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={onFilterAlerts}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/25"
          >
            <span>{isFiltered ? "Show All SKUs" : "Review Alert Items"}</span>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Dismiss Alert"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
