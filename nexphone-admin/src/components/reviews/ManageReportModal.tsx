"use client";

import { useState, useEffect, useRef } from "react";
import type { Review } from "@/types/review";

interface ManageReportModalProps {
  readonly review: Review | null;
  readonly isOpen: boolean;
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onDismiss: (note: string) => Promise<void>;
  readonly onDelete: (reason: string, note: string) => Promise<void>;
}

function getReportReasonLabel(reason?: string) {
  switch (reason) {
    case "offensive_language":
      return "Offensive Language";
    case "hate_speech":
      return "Hate Speech";
    case "spam_promotion":
      return "Spam / Promotion";
    case "fake_review":
      return "Fake Review";
    case "competitor_defamation":
      return "Competitor Attack";
    case "personal_data":
      return "Privacy / PII Leak";
    case "off_topic":
      return "Off-Topic";
    default:
      return "Policy Violation";
  }
}

export function ManageReportModal({
  review,
  isOpen,
  isSubmitting,
  onClose,
  onDismiss,
  onDelete,
}: ManageReportModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [resolutionNote, setResolutionNote] = useState<string>("");
  const [prevReviewId, setPrevReviewId] = useState<string | null>(null);

  if (review && review.id !== prevReviewId) {
    setPrevReviewId(review.id);
    setResolutionNote("");
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
        aria-labelledby="modal-manage-report-title"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-amber-500/40 bg-slate-900 shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.209-.682L3 4.5M3 15V4.5" />
              </svg>
            </div>
            <div>
              <h3 id="modal-manage-report-title" className="text-base font-semibold text-white">
                Resolve Flagged Report
              </h3>
              <p className="text-xs text-amber-400/90 mt-0.5">
                {review.reviewNumber} • {review.reportsCount} Customer Reports
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Flagged Review Excerpt */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">
                By <strong className="text-white">{review.customerName}</strong> on {review.productName}
              </span>
              <span className="text-amber-400 font-bold">{review.rating}.0 ★</span>
            </div>
            <p className="font-semibold text-white">&ldquo;{review.title}&rdquo;</p>
            <p className="text-slate-300 italic text-[11px] leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
              {review.comment}
            </p>
          </div>

          {/* Allegations Summary */}
          {review.reports && review.reports.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Customer Allegations
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {review.reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="flex flex-col gap-2 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 text-xs shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 ring-1 ring-rose-500/30">
                        {getReportReasonLabel(rep.reason)}
                      </span>
                      <span className="text-slate-500 text-[10px] shrink-0 font-mono">From {rep.reporterName}</span>
                    </div>
                    {rep.comment && (
                      <p className="text-slate-300 text-[11px] italic bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800/80 leading-relaxed">
                        &ldquo;{rep.comment}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Moderation Resolution Note */}
          <div className="space-y-1.5">
            <label htmlFor="report-resolution-note" className="block text-xs font-semibold text-slate-300">
              Resolution Note <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              id="report-resolution-note"
              type="text"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. Review verified legitimate; dismiss report, or violation confirmed..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Action Choice Notice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 flex flex-col justify-between">
              <div>
                <p className="font-semibold text-emerald-300 text-xs">Option A: Dismiss Flag</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Keep review live. Clear the report flag as non-violating.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(resolutionNote)}
                disabled={isSubmitting}
                className="mt-3 w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-950/30 hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50"
              >
                Dismiss & Keep Live
              </button>
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 flex flex-col justify-between">
              <div>
                <p className="font-semibold text-rose-300 text-xs">Option B: Remove Review</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Uphold report and delete review for community policy violation.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  onDelete(
                    review.reports?.[0]?.reason
                      ? getReportReasonLabel(review.reports[0].reason)
                      : "Policy Violation",
                    resolutionNote
                  )
                }
                disabled={isSubmitting}
                className="mt-3 w-full rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-rose-950/30 hover:bg-rose-500 transition-all active:scale-95 disabled:opacity-50"
              >
                Delete Inappropriate Review
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-3.5 bg-slate-950/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <span className="text-[11px] text-slate-500">NexPhone Community Moderation Policy</span>
        </div>
      </div>
    </div>
  );
}
