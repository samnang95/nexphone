"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/types/order";

interface ConfirmOrderModalProps {
  readonly order: Order | null;
  readonly isOpen: boolean;
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (orderId: string) => Promise<void>;
}

export function ConfirmOrderModal({
  order,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: ConfirmOrderModalProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onConfirm(order.id);
      onClose();
    } catch {
      setError("Failed to confirm order. Please try again.");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Confirm Order</h3>
            <p className="text-xs text-slate-400 font-mono">{order.orderNumber}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Customer</span>
              <span className="font-semibold text-slate-200">{order.customer.name}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Units</span>
              <span className="font-mono text-slate-200">
                {order.items.reduce((acc, it) => acc + it.quantity, 0)} units
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Order Value</span>
              <span className="font-mono font-bold text-emerald-400">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>

          <p className="text-slate-400 leading-relaxed">
            Confirming this order will transition its status to{" "}
            <strong className="text-indigo-300">Confirmed</strong> and notify the fulfillment center to prepare hardware allocation.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 mt-5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-slate-700/60 bg-slate-800/40 px-4 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 flex items-center gap-2 rounded-lg bg-emerald-600 px-5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Confirming...</span>
                </>
              ) : (
                <span>Confirm Order</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
