"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { InventoryItem, InventoryMovement } from "@/types/inventory";
import { cn } from "@/utils/cn";

interface StockAuditModalProps {
  readonly isOpen: boolean;
  readonly item: InventoryItem | null;
  readonly movements: readonly InventoryMovement[];
  readonly onClose: () => void;
}

export function StockAuditModal({
  isOpen,
  item,
  movements,
  onClose,
}: StockAuditModalProps) {
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

  if (!isMounted || !isOpen) return null;

  const filteredMovements = item
    ? movements.filter((m) => m.inventoryItemId === item.id)
    : movements;

  const reasonLabels = {
    restock_po: "Purchase Order Restock",
    audit_correction: "Inventory Cycle Count Audit",
    damage_writeoff: "Damaged / Defective Write-off",
    customer_return: "Customer RMA Return",
    warehouse_transfer: "Warehouse Hub Transfer",
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="h-1.5 w-full bg-indigo-500" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-bold shadow">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {item ? `Stock Movements: ${item.sku}` : "Global Inventory Audit Trail"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {item
                    ? `${item.productName} (${item.variantCapacity} • ${item.warehouse})`
                    : "Complete chronological history of inbound restocks, audits, and dispatches."}
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

          {/* Movements Timeline */}
          <div className="mt-4 max-h-[55vh] overflow-y-auto space-y-3 pr-1">
            {filteredMovements.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
                No stock movement events recorded for this item yet.
              </div>
            ) : (
              filteredMovements.map((mov) => {
                const isPositive = mov.changeAmount > 0;
                return (
                  <div
                    key={mov.id}
                    className="flex items-start justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition-colors hover:border-slate-700"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold shadow-sm",
                          isPositive
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        )}
                      >
                        {isPositive ? `+${mov.changeAmount}` : mov.changeAmount}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">
                            {reasonLabels[mov.reason] || mov.reason}
                          </span>
                          {!item && (
                            <span className="font-mono text-[10px] text-indigo-300 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/60">
                              {mov.sku}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                          {mov.notes}
                        </p>

                        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                          <span>Operator: <strong className="text-slate-400">{mov.performedBy}</strong></span>
                          <span>•</span>
                          <span>{new Date(mov.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Stock Change</span>
                      <div className="flex items-center gap-1 font-mono text-xs text-slate-300 mt-0.5">
                        <span>{mov.previousStock}</span>
                        <span>&rarr;</span>
                        <strong className="text-white">{mov.newStock}</strong>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-end border-t border-slate-800 pt-3">
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
            >
              Close Log
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
