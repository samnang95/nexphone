"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { InventoryItem, StockMovementReason, UpdateInventoryPayload } from "@/types/inventory";
import { cn } from "@/utils/cn";

interface UpdateStockModalProps {
  readonly isOpen: boolean;
  readonly item: InventoryItem | null;
  readonly isSaving?: boolean;
  readonly onClose: () => void;
  readonly onSave: (payload: UpdateInventoryPayload) => void;
}

export function UpdateStockModal({
  isOpen,
  item,
  isSaving = false,
  onClose,
  onSave,
}: UpdateStockModalProps) {
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
    <UpdateStockDialogContent
      item={item}
      isSaving={isSaving}
      onClose={onClose}
      onSave={onSave}
    />,
    document.body
  );
}

function UpdateStockDialogContent({
  item,
  isSaving,
  onClose,
  onSave,
}: {
  item: InventoryItem;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (payload: UpdateInventoryPayload) => void;
}) {
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract" | "set">("add");
  const [quantityInput, setQuantityInput] = useState<number>(25);
  const [reason, setReason] = useState<StockMovementReason>("restock_po");
  const [notes, setNotes] = useState("");
  const [operator, setOperator] = useState("System Admin");

  const currentStock = item.stockQuantity;
  const qty = Number(quantityInput) || 0;

  // Calculate projected new stock
  let projectedStock = currentStock;
  if (adjustmentType === "add") projectedStock = currentStock + qty;
  else if (adjustmentType === "subtract") projectedStock = Math.max(0, currentStock - qty);
  else if (adjustmentType === "set") projectedStock = Math.max(0, qty);

  // Projected status
  let projectedStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
  if (projectedStock === 0) projectedStatus = "out_of_stock";
  else if (projectedStock <= item.lowStockThreshold) projectedStatus = "low_stock";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qty < 0) {
      alert("Please enter a positive quantity.");
      return;
    }
    if (adjustmentType === "subtract" && qty > currentStock) {
      if (!confirm(`Warning: Deducting ${qty} units will bring stock below 0. Continue?`)) {
        return;
      }
    }

    onSave({
      inventoryItemId: item.id,
      type: adjustmentType,
      quantity: qty,
      reason,
      notes: notes.trim() || undefined,
      performedBy: operator.trim() || "System Admin",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-bold shadow">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Update Inventory Stock
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-[11px] font-bold text-indigo-300 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/60">
                  {item.sku}
                </span>
                <span className="text-xs text-slate-300 font-medium truncate max-w-[200px]">
                  {item.productName}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Item Context Summary Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Location</span>
              <span className="text-slate-200 font-medium truncate block mt-0.5" title={item.warehouse}>
                {item.warehouse.split(" ")[0]} Hub
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Current Stock</span>
              <span className="text-white font-bold font-mono text-sm block mt-0.5">
                {currentStock.toLocaleString()} units
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Low-Stock Alert</span>
              <span className="text-amber-400 font-bold font-mono text-sm block mt-0.5">
                ≤ {item.lowStockThreshold} units
              </span>
            </div>
          </div>

          {/* Action Mode Toggle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Adjustment Operation
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdjustmentType("add");
                  setReason("restock_po");
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border py-2.5 px-3 text-xs font-semibold transition-all",
                  adjustmentType === "add"
                    ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300 shadow-sm"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white"
                )}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Restock (+)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdjustmentType("subtract");
                  setReason("damage_writeoff");
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border py-2.5 px-3 text-xs font-semibold transition-all",
                  adjustmentType === "subtract"
                    ? "border-rose-500/60 bg-rose-500/15 text-rose-300 shadow-sm"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white"
                )}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                </svg>
                <span>Deduct (-)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdjustmentType("set");
                  setReason("audit_correction");
                  setQuantityInput(currentStock);
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border py-2.5 px-3 text-xs font-semibold transition-all",
                  adjustmentType === "set"
                    ? "border-indigo-500/60 bg-indigo-500/15 text-indigo-300 shadow-sm"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white"
                )}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Audit Exact (=)</span>
              </button>
            </div>
          </div>

          {/* Quantity Input + Live Projection */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {adjustmentType === "set" ? "New Verified Total" : "Units to Change"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  required
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full font-mono text-base font-bold rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-500 font-medium">
                  units
                </span>
              </div>
            </div>

            {/* Projected Result Box */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-2.5 flex flex-col justify-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Projected New Balance
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono text-lg font-bold text-white">
                  {projectedStock.toLocaleString()}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded",
                    projectedStatus === "in_stock" && "bg-emerald-500/20 text-emerald-300",
                    projectedStatus === "low_stock" && "bg-amber-500/20 text-amber-300",
                    projectedStatus === "out_of_stock" && "bg-rose-500/20 text-rose-300"
                  )}
                >
                  {projectedStatus.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Reason Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Reason for Adjustment <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as StockMovementReason)}
                className="w-full appearance-none rounded-lg border border-slate-800 bg-slate-950 pl-3 pr-8 py-2 text-xs text-white transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="restock_po">Purchase Order Shipment Received (PO Restock)</option>
                <option value="audit_correction">Warehouse Physical Cycle Count Audit Correction</option>
                <option value="damage_writeoff">Damaged / Defective Stock Written Off</option>
                <option value="customer_return">Customer RMA / Return Restocked into Fleet</option>
                <option value="warehouse_transfer">Inter-warehouse Hub Transfer Dispatch</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Notes & Tracking */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Reference Notes & Logistics PO / Tracking
            </label>
            <input
              type="text"
              placeholder="e.g. PO-8492 from TSMC Fremont, Box damaged during courier transit"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Operator */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Authorized Operator / Manager
            </label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Actions */}
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
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-500 shadow-md shadow-indigo-600/30 disabled:opacity-60"
            >
              {isSaving && (
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              <span>Confirm Stock Update</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
