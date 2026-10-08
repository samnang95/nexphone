"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { InventoryItem } from "@/types/inventory";

interface ThresholdSettingsModalProps {
  readonly isOpen: boolean;
  readonly item: InventoryItem | null;
  readonly isSaving?: boolean;
  readonly onClose: () => void;
  readonly onSave: (id: string, lowStockThreshold: number, reorderPoint: number) => void;
}

export function ThresholdSettingsModal({
  isOpen,
  item,
  isSaving = false,
  onClose,
  onSave,
}: ThresholdSettingsModalProps) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  if (!isMounted || !isOpen || !item) return null;

  return createPortal(
    <ThresholdSettingsDialogContent
      item={item}
      isSaving={isSaving}
      onClose={onClose}
      onSave={onSave}
    />,
    document.body
  );
}

function ThresholdSettingsDialogContent({
  item,
  isSaving,
  onClose,
  onSave,
}: {
  item: InventoryItem;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (id: string, lowStockThreshold: number, reorderPoint: number) => void;
}) {
  const [threshold, setThreshold] = useState<number>(item.lowStockThreshold);
  const [reorder, setReorder] = useState<number>(item.reorderPoint);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(item.id, Number(threshold) || 10, Number(reorder) || 20);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="h-1.5 w-full bg-amber-500" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Configure Low-Stock Alerts
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set threshold triggers for SKU <strong className="text-slate-200">{item.sku}</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Current Stock Context */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Current In-Stock Quantity:</span>
              <span className="font-mono font-bold text-sm text-white">
                {item.stockQuantity} units
              </span>
            </div>

            {/* Low-Stock Alert Threshold */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Low-Stock Warning Threshold <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  required
                  value={threshold}
                  onChange={(e) => setThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full font-mono text-sm font-semibold rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-500 font-medium">
                  units or fewer
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                When stock falls to or below this count, a warning badge and alert banner are triggered.
              </p>
            </div>

            {/* Reorder Point */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Suggested Reorder Quantity Point
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  required
                  value={reorder}
                  onChange={(e) => setReorder(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full font-mono text-sm font-semibold rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-500 font-medium">
                  target inventory
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Baseline healthy inventory buffer used for progress metrics and reorder recommendations.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-lg border border-slate-700/60 bg-slate-800/60 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-amber-500 shadow-md shadow-amber-600/30 disabled:opacity-60"
              >
                {isSaving && (
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                <span>Save Alert Threshold</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
