"use client";

import { useState } from "react";
import type { Promotion } from "@/types/promotion";

interface DeletePromotionModalProps {
  readonly promotion: Promotion | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (id: string, reason: string) => Promise<void>;
  readonly isSubmitting: boolean;
}

export function DeletePromotionModal({
  promotion,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: DeletePromotionModalProps) {
  const [reason, setReason] = useState("Campaign concluded / No longer active");
  const [confirmUnderstood, setConfirmUnderstood] = useState(false);

  if (!isOpen || !promotion) return null;

  const handleDelete = async () => {
    if (!confirmUnderstood) return;
    await onConfirm(promotion.id, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl border border-rose-500/30 bg-slate-900 p-5 sm:p-6 shadow-2xl z-10 my-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-white">Delete Promotion?</h2>
            <p className="mt-1 text-xs text-slate-300">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white font-semibold">&ldquo;{promotion.title}&rdquo;</strong>?
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Promotion Details Summary Box */}
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-2 text-xs">
          {promotion.code && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Coupon Code:</span>
              <span className="font-mono font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                {promotion.code}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Redemptions:</span>
            <span className="font-semibold text-white">
              {promotion.usedCount} times used
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Attributed Revenue:</span>
            <span className="font-semibold text-emerald-400">
              ${promotion.revenueGenerated.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Current Status:</span>
            <span className="capitalize font-semibold text-amber-400">
              {promotion.status}
            </span>
          </div>
        </div>

        {/* Reason selector */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Reason for Deletion
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none cursor-pointer"
          >
            <option value="Campaign concluded / No longer active">Campaign concluded / No longer active</option>
            <option value="Created by mistake / Duplicate coupon">Created by mistake / Duplicate coupon</option>
            <option value="Abuse detected / Unauthorized leakage">Abuse detected / Unauthorized leakage</option>
            <option value="Replaced by new seasonal discount">Replaced by new seasonal discount</option>
          </select>
        </div>

        {/* Confirmation Checkbox */}
        <div className="mt-4 flex items-start gap-2.5">
          <input
            type="checkbox"
            id="confirm-delete-promo"
            checked={confirmUnderstood}
            onChange={(e) => setConfirmUnderstood(e.target.checked)}
            className="mt-0.5 rounded border-slate-700 bg-slate-950 text-rose-600 focus:ring-0 cursor-pointer"
          />
          <label htmlFor="confirm-delete-promo" className="text-xs text-slate-300 cursor-pointer">
            I understand that deleting this promotion will immediately invalidate the code and remove it from all checkout flows.
          </label>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!confirmUnderstood || isSubmitting}
            onClick={handleDelete}
            className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Deleting..." : "Permanently Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
