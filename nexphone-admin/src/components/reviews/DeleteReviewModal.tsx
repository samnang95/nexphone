"use client";

import { useState, useEffect, useRef } from "react";
import type { Review } from "@/types/review";

interface DeleteReviewModalProps {
  readonly review: Review | null;
  readonly isOpen: boolean;
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (reason: string, note: string) => Promise<void>;
}

const DELETION_REASONS = [
  "Offensive Language, Slurs or Harassment",
  "Commercial Spam or Phishing / Promotion URLs",
  "Fake / Fabricated Review (Competitor defamation)",
  "Personally Identifiable Information (PII) / Doxxing",
  "Off-topic content unrelated to device hardware",
  "Violation of NexPhone Community Guidelines",
] as const;

export function DeleteReviewModal({
  review,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteReviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedReason, setSelectedReason] = useState<string>(DELETION_REASONS[0]);
  const [note, setNote] = useState<string>("");
  const [prevReviewId, setPrevReviewId] = useState<string | null>(null);

  if (review && review.id !== prevReviewId) {
    setPrevReviewId(review.id);
    setSelectedReason(DELETION_REASONS[0]);
    setNote("");
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !review) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(selectedReason, note);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => !isSubmitting && onClose()}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-delete-review-title"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-rose-500/40 bg-slate-900 shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>
            <div>
              <h3 id="modal-delete-review-title" className="text-base font-semibold text-white">
                Delete Inappropriate Review
              </h3>
              <p className="text-xs text-rose-400/90 mt-0.5">
                Moderation action for {review.reviewNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 text-xs">
            {/* Warning Message */}
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-slate-300 space-y-1">
              <p className="font-semibold text-rose-300">Action: Permanent Removal from Catalog</p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                This review will be immediately hidden from public product listings. The moderation reason will be logged for administrative compliance.
              </p>
            </div>

            {/* Target Review Snippet */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Review by <strong className="text-white">{review.customerName}</strong></span>
                <span className="text-amber-400">{"★".repeat(review.rating)}</span>
              </div>
              <p className="font-semibold text-white truncate">&ldquo;{review.title}&rdquo;</p>
              <p className="text-slate-400 line-clamp-2 italic text-[11px]">
                {review.comment}
              </p>
            </div>

            {/* Reason Selector */}
            <div className="space-y-1.5">
              <label htmlFor="delete-reason" className="block text-xs font-semibold text-slate-300">
                Reason for Removal <span className="text-rose-400">*</span>
              </label>
              <select
                id="delete-reason"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
              >
                {DELETION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Internal Audit Note */}
            <div className="space-y-1.5">
              <label htmlFor="moderation-note" className="block text-xs font-semibold text-slate-300">
                Internal Moderation Note <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <textarea
                id="moderation-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isSubmitting}
                placeholder="Add audit documentation (e.g. verified bot account, external phishing link confirmed)..."
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 bg-slate-950/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-950/40 hover:bg-rose-500 transition-all active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Removing...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  <span>Confirm Delete Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
