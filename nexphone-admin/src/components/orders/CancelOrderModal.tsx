"use client";

import { useEffect, useState } from "react";
import type { Order, CancelOrderPayload } from "@/types/order";

interface CancelOrderModalProps {
  readonly order: Order | null;
  readonly isOpen: boolean;
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onCancel: (orderId: string, payload: CancelOrderPayload) => Promise<void>;
}

interface CancelOrderDialogProps {
  readonly order: Order;
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onCancel: (orderId: string, payload: CancelOrderPayload) => Promise<void>;
}

function CancelOrderDialog({
  order,
  isSubmitting,
  onClose,
  onCancel,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState("Customer requested cancellation");
  const [note, setNote] = useState("");
  const [refundPayment, setRefundPayment] = useState(() => order.payment.status === "paid");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please select or enter a cancellation reason.");
      return;
    }

    try {
      await onCancel(order.id, {
        reason: reason.trim(),
        note: note.trim() || undefined,
        refundPayment,
        performedBy: "Support Admin",
      });
      onClose();
    } catch {
      setError("Failed to cancel order. Please try again.");
    }
  };

  return (
    <div className="relative w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Cancel Order</h3>
          <p className="text-xs text-slate-400 font-mono">{order.orderNumber}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label htmlFor="cancel-reason-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Reason for Cancellation <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <select
              id="cancel-reason-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-10 appearance-none rounded-lg border border-slate-800 bg-slate-950 pl-3.5 pr-10 text-xs font-medium text-white transition-colors hover:border-slate-700 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
            >
              <option value="Customer requested cancellation">Customer requested cancellation</option>
              <option value="Suspected fraudulent activity">Suspected fraudulent activity</option>
              <option value="Hardware out of stock / Backorder delay">Hardware out of stock / Backorder delay</option>
              <option value="Payment verification problem">Payment verification problem</option>
              <option value="Duplicate order submitted">Duplicate order submitted</option>
              <option value="Administrative correction">Administrative correction</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="cancel-note-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Additional Notes (Optional)
          </label>
          <textarea
            id="cancel-note-input"
            rows={2}
            placeholder="e.g. Customer contacted support via ticket #4819..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
          />
        </div>

        {/* Refund checkbox if paid */}
        {order.payment.status === "paid" && (
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950/60 cursor-pointer">
            <input
              type="checkbox"
              checked={refundPayment}
              onChange={(e) => setRefundPayment(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 bg-slate-800 text-rose-500 focus:ring-0"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-slate-200">Initiate Gateway Refund</span>
              <span className="text-[11px] text-slate-400">
                Automatically set payment status to <strong className="text-purple-300">Refunded</strong> and record refund transaction.
              </span>
            </div>
          </label>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 mt-5 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 rounded-lg border border-slate-700/60 bg-slate-800/40 px-4 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            Nevermind
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 flex items-center gap-2 rounded-lg bg-rose-600 px-5 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 transition-all hover:bg-rose-500 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Cancelling...</span>
              </>
            ) : (
              <span>Confirm Cancellation</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export function CancelOrderModal({
  order,
  isOpen,
  isSubmitting,
  onClose,
  onCancel,
}: CancelOrderModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <CancelOrderDialog
        key={order.id}
        order={order}
        isSubmitting={isSubmitting}
        onClose={onClose}
        onCancel={onCancel}
      />
    </div>
  );
}
