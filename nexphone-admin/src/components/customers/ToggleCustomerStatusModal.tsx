"use client";

import { useEffect, useState } from "react";
import type { Customer, CustomerStatus, ToggleCustomerStatusPayload } from "@/types/customer";

interface ToggleCustomerStatusModalProps {
  readonly customer: Customer | null;
  readonly isOpen: boolean;
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onConfirmToggle: (payload: ToggleCustomerStatusPayload) => Promise<void>;
}

interface ToggleDialogProps {
  readonly customer: Customer;
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onConfirmToggle: (payload: ToggleCustomerStatusPayload) => Promise<void>;
}

const DISABLE_REASONS = [
  "Suspected fraudulent activity / card testing",
  "Customer requested account freeze",
  "Repeated payment dispute or chargeback",
  "Compliance & identity verification pending",
  "Terms of service policy violation",
  "Administrative security freeze",
];

const ENABLE_REASONS = [
  "Customer identity and billing verified",
  "Customer requested account reactivation",
  "Administrative review cleared",
  "Billing issue resolved",
  "Administrative reactivation",
];

function ToggleDialog({
  customer,
  isSubmitting,
  onClose,
  onConfirmToggle,
}: ToggleDialogProps) {
  const isCurrentlyActive = customer.status === "active";
  const targetStatus: CustomerStatus = isCurrentlyActive ? "disabled" : "active";

  const [reason, setReason] = useState<string>(() =>
    isCurrentlyActive ? DISABLE_REASONS[0]! : ENABLE_REASONS[0]!
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onConfirmToggle({
        customerId: customer.id,
        status: targetStatus,
        reason,
        note: note.trim() || undefined,
        performedBy: "Compliance Officer",
      });
      onClose();
    } catch {
      setError("Failed to update account status. Please try again.");
    }
  };

  return (
    <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border shrink-0 ${
            isCurrentlyActive
              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}
        >
          {isCurrentlyActive ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          )}
        </div>
        <div>
          <h3 className="text-base font-bold text-white leading-tight">
            {isCurrentlyActive ? "Disable Customer Account" : "Reactivate Customer Account"}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            {customer.name} ({customer.customerNumber})
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Explanatory Banner */}
      <div
        className={`mb-5 rounded-xl border p-3 text-xs leading-relaxed ${
          isCurrentlyActive
            ? "border-rose-500/20 bg-rose-500/5 text-slate-300"
            : "border-emerald-500/20 bg-emerald-500/5 text-slate-300"
        }`}
      >
        {isCurrentlyActive ? (
          <p>
            Disabling this account will revoke authentication tokens and prevent new hardware order checkouts. Existing processing orders will remain in fulfillment.
          </p>
        ) : (
          <p>
            Reactivating this account will restore full portal privileges and allow this customer to resume placing enterprise orders.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Reason Select */}
        <div>
          <label
            htmlFor="customer-status-reason"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
          >
            Action Reason <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <select
              id="customer-status-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`w-full h-10 appearance-none rounded-lg border border-slate-800 bg-slate-950 pl-3.5 pr-10 text-xs font-medium text-white transition-colors hover:border-slate-700 focus:outline-none focus:ring-1 cursor-pointer ${
                isCurrentlyActive
                  ? "focus:border-rose-500 focus:ring-rose-500"
                  : "focus:border-emerald-500 focus:ring-emerald-500"
              }`}
            >
              {(isCurrentlyActive ? DISABLE_REASONS : ENABLE_REASONS).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Note / Memo */}
        <div>
          <label
            htmlFor="customer-status-note"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
          >
            Audit Memo / Internal Note (Optional)
          </label>
          <textarea
            id="customer-status-note"
            rows={2}
            placeholder={
              isCurrentlyActive
                ? "e.g. Flagged by automated risk engine; ticket #7192"
                : "e.g. Verified passport identity with customer via video call"
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Footer Actions */}
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
            className={`h-10 flex items-center gap-2 rounded-lg px-5 text-xs font-semibold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
              isCurrentlyActive
                ? "bg-rose-600 shadow-rose-600/30 hover:bg-rose-500"
                : "bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-500"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{isCurrentlyActive ? "Disable Account" : "Reactivate Account"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export function ToggleCustomerStatusModal({
  customer,
  isOpen,
  isSubmitting,
  onClose,
  onConfirmToggle,
}: ToggleCustomerStatusModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <ToggleDialog
        key={customer.id}
        customer={customer}
        isSubmitting={isSubmitting}
        onClose={onClose}
        onConfirmToggle={onConfirmToggle}
      />
    </div>
  );
}
