"use client";

import { useEffect, useState } from "react";
import type { Order, OrderStatus, UpdateOrderStatusPayload } from "@/types/order";

interface UpdateStatusModalProps {
  readonly order: Order | null;
  readonly isOpen: boolean;
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onUpdate: (orderId: string, payload: UpdateOrderStatusPayload) => Promise<void>;
}

function getNextStatus(status: OrderStatus): OrderStatus {
  if (status === "pending") return "confirmed";
  if (status === "confirmed") return "processing";
  if (status === "processing") return "shipped";
  if (status === "shipped") return "delivered";
  return status;
}

interface UpdateStatusDialogProps {
  readonly order: Order;
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onUpdate: (orderId: string, payload: UpdateOrderStatusPayload) => Promise<void>;
}

function UpdateStatusDialog({
  order,
  isSubmitting,
  onClose,
  onUpdate,
}: UpdateStatusDialogProps) {
  const [targetStatus, setTargetStatus] = useState<OrderStatus>(() => getNextStatus(order.status));
  const [carrier, setCarrier] = useState<string>(() => order.shipping.carrier || "FedEx");
  const [trackingNumber, setTrackingNumber] = useState<string>(() => order.shipping.trackingNumber || "");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetStatus === "shipped" && !trackingNumber.trim()) {
      setError("Please provide a tracking number when marking an order as Shipped.");
      return;
    }

    try {
      await onUpdate(order.id, {
        status: targetStatus,
        carrier: targetStatus === "shipped" ? carrier : undefined,
        trackingNumber: targetStatus === "shipped" ? trackingNumber.trim() : undefined,
        note: note.trim() || undefined,
        performedBy: "Operations Staff",
      });
      onClose();
    } catch {
      setError("Failed to update status. Please try again.");
    }
  };

  return (
    <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold text-white leading-tight">Update Order Lifecycle</h3>
          <p className="text-xs text-slate-400 font-mono mt-1">{order.orderNumber}</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Status selector with clean label spacing and custom chevron */}
        <div>
          <label htmlFor="order-status-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            New Lifecycle Status
          </label>
          <div className="relative">
            <select
              id="order-status-select"
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as OrderStatus)}
              className="w-full h-10 appearance-none rounded-lg border border-slate-800 bg-slate-950 pl-3.5 pr-10 text-xs font-medium text-white transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="confirmed">Confirmed (Stock Allocated)</option>
              <option value="processing">Processing (Packing & Testing)</option>
              <option value="shipped">Shipped (Dispatched with Courier)</option>
              <option value="delivered">Delivered (Completed)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* If shipped, show Carrier and Tracking input with clean separated header */}
        {targetStatus === "shipped" && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                Courier & Dispatch Details
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Fulfillment</span>
            </div>

            <div>
              <label htmlFor="shipping-carrier-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Logistics Carrier
              </label>
              <div className="relative">
                <select
                  id="shipping-carrier-select"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full h-10 appearance-none rounded-lg border border-slate-800 bg-slate-900 pl-3.5 pr-10 text-xs font-medium text-white transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="FedEx">FedEx Express</option>
                  <option value="UPS">UPS Worldwide</option>
                  <option value="DHL">DHL Global Express</option>
                  <option value="Chronopost">Chronopost Express</option>
                  <option value="SingPost">SingPost Courier</option>
                  <option value="Canada Post">Canada Post Xpress</option>
                  <option value="Other">Other Logistics Service</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="tracking-number-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Tracking Number <span className="text-rose-400">*</span>
              </label>
              <input
                id="tracking-number-input"
                type="text"
                placeholder="e.g. TRK-9821-4821"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-800 bg-slate-900 px-3.5 text-xs font-mono text-white placeholder-slate-500 transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
        )}

        {/* Note input */}
        <div>
          <label htmlFor="status-note-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Activity Note (Optional)
          </label>
          <input
            id="status-note-input"
            type="text"
            placeholder="e.g. Dispatched from SFO Central Hub"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-800 bg-slate-950 px-3.5 text-xs text-white placeholder-slate-500 transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Action buttons footer with balanced spacing */}
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
            className="h-10 flex items-center gap-2 rounded-lg bg-indigo-600 px-5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Updating...</span>
              </>
            ) : (
              <span>Update Status</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export function UpdateStatusModal({
  order,
  isOpen,
  isSubmitting,
  onClose,
  onUpdate,
}: UpdateStatusModalProps) {
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

      <UpdateStatusDialog
        key={order.id}
        order={order}
        isSubmitting={isSubmitting}
        onClose={onClose}
        onUpdate={onUpdate}
      />
    </div>
  );
}
