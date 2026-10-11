"use client";

import React, { useState } from "react";
import type { Order } from "@/types/order";
import { orderService } from "@/services/order.service";

interface CancelOrderModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onSuccess: (updatedOrder: Order) => void;
}

const CANCEL_REASONS = [
  "Ordered by mistake / wrong handset model or variant",
  "Need to modify delivery address or recipient info",
  "Want to change storage tier or color finish",
  "Found a promotional coupon or enterprise discount",
  "Estimated delivery timeframe is longer than required",
  "Financial / procurement budget adjustment",
  "Other cryptographic or personal reason",
];

export function CancelOrderModal({
  isOpen,
  order,
  onClose,
  onSuccess,
}: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>(CANCEL_REASONS[0]);
  const [customNote, setCustomNote] = useState<string>("");
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setErrorMsg("Please select a cancellation reason");
      return;
    }
    if (!isConfirmed) {
      setErrorMsg("Please confirm that you understand hardware allocation release terms");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const updated = await orderService.cancelOrder(order.id, {
        reason: selectedReason,
        note: customNote.trim() ? customNote.trim() : undefined,
      });
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel order. Please contact support concierge.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0c121e] border border-slate-800 p-6 sm:p-8 shadow-2xl shadow-rose-950/30 text-slate-100 z-10 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              <span>Cancel Hardware Allocation</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Cancel Order {order.orderNumber}
            </h3>
            <p className="text-xs text-slate-400">
              Hardware reservation will be released back to the central assembly line.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Refund Summary Banner */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span>Total Refund Amount:</span>
            <span className="text-base font-black font-mono text-cyan-400">
              ${order.total.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400 font-mono text-[11px]">
            <span>Refund Method:</span>
            <span className="text-white uppercase font-semibold">
              Original {order.payment.method.replace("_", " ")}
              {order.payment.cardLast4 ? ` (•••• ${order.payment.cardLast4})` : ""}
            </span>
          </div>
          <p className="text-[11px] text-emerald-400 font-mono pt-1">
            ✓ Instant refund release dispatched upon confirmation
          </p>
        </div>

        {/* Cancellation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider">
              Reason for Cancellation <span className="text-rose-400">*</span>
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {CANCEL_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === reason
                      ? "bg-rose-500/10 border-rose-500/50 text-white"
                      : "bg-slate-950/40 border-slate-800/70 text-slate-400 hover:bg-slate-900/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancel_reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider">
              Additional Details <span className="text-slate-500">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Provide any feedback for the hardware operations team..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500/60 transition-colors"
            />
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-0.5 accent-rose-500 rounded"
            />
            <span className="text-slate-300 leading-relaxed">
              I understand that cancelling this order will forfeit my reserved serial number and hardware slot. The refund of{" "}
              <strong className="text-white">${order.total.toLocaleString()}</strong> will be processed immediately.
            </span>
          </label>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-mono text-xs font-bold uppercase transition-colors"
            >
              Keep My Order
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !isConfirmed}
              className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm Cancel</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CancelOrderModal;
