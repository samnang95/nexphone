"use client";

import { useEffect, useRef } from "react";
import type { Review } from "@/types/review";

interface ReviewDetailModalProps {
  readonly review: Review | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onDeleteReview: (review: Review) => void;
  readonly onDismissReport: (review: Review) => void;
  readonly onRestoreReview: (review: Review) => void;
}

function getAvatarGradient(name: string) {
  const gradients = [
    "from-indigo-600 to-purple-600",
    "from-cyan-600 to-blue-600",
    "from-emerald-600 to-teal-600",
    "from-amber-600 to-orange-600",
    "from-rose-600 to-pink-600",
    "from-violet-600 to-fuchsia-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
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

export function ReviewDetailModal({
  review,
  isOpen,
  onClose,
  onDeleteReview,
  onDismissReport,
  onRestoreReview,
}: ReviewDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !review) return null;

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(d);
    } catch {
      return isoStr;
    }
  };

  const isReported = review.isReported && review.status !== "rejected";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-review-title"
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl transition-all"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="modal-review-title" className="text-base font-semibold text-white">
                  Review Inspection
                </h3>
                <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {review.reviewNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Submitted on {formatDate(review.createdAt)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {/* Flagged Alert Banner if reported */}
          {isReported && (
            <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-transparent p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Reported for Content Violation ({review.reportsCount} Reports)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Customers have flagged this review. Review allegations below to determine if this content should be deleted or kept online.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Product & Customer 2-Column Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Product Reviewed
              </span>
              <div className="flex items-center gap-3">
                {review.productImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.productImage}
                    alt={review.productName}
                    className="h-12 w-12 rounded-lg object-cover border border-slate-800"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 font-mono text-xs text-slate-400">
                    NX
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{review.productName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{review.productBrand}</p>
                  <p className="font-mono text-[10px] text-slate-500 mt-0.5">SKU: {review.productSku}</p>
                </div>
              </div>
            </div>

            {/* Reviewer Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Customer Profile
              </span>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarGradient(
                    review.customerName
                  )} font-bold text-sm text-white shadow-md ring-1 ring-white/10`}
                >
                  {getInitials(review.customerName)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{review.customerName}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{review.customerEmail}</p>
                  <div className="mt-1">
                    {review.isVerifiedPurchase ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        Verified Purchaser
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                        Unverified Account
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Review Content */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-400 text-sm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                  ))}
                </div>
                <span className="font-mono text-sm font-bold text-white">{review.rating}.0 out of 5</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  👍 <strong className="text-slate-200">{review.helpfulVotes}</strong> helpful
                </span>
                {review.unhelpfulVotes > 0 && (
                  <span className="flex items-center gap-1">
                    👎 <strong className="text-slate-400">{review.unhelpfulVotes}</strong>
                  </span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">{review.title}</h4>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                {review.comment}
              </p>
            </div>
          </div>

          {/* Reports History Section */}
          {review.reports && review.reports.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Customer Reports ({review.reports.length})
                </h4>
              </div>

              <div className="space-y-3">
                {review.reports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-4 text-xs space-y-2.5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="rounded-md bg-rose-500/20 px-2.5 py-1 text-[11px] font-bold text-rose-300 ring-1 ring-rose-500/30">
                          {getReportReasonLabel(report.reason)}
                        </span>
                        <span className="text-slate-300 font-medium">Reported by {report.reporterName}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">{formatDate(report.reportedAt)}</span>
                    </div>
                    {report.comment && (
                      <p className="text-slate-300 text-xs italic bg-slate-900/60 px-3.5 py-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                        &ldquo;{report.comment}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Moderation History Section */}
          {review.moderationHistory && review.moderationHistory.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Moderation Audit Trail
              </h4>
              <div className="space-y-3">
                {review.moderationHistory.map((entry, idx) => (
                  <div
                    key={`mod-${idx}`}
                    className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4 text-xs space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-indigo-400 capitalize">{entry.action.replace("_", " ")}</span>
                      <span className="text-[11px] font-mono text-slate-500">{formatDate(entry.moderatedAt)}</span>
                    </div>
                    <p className="text-slate-300 text-xs">
                      By <strong className="text-white">{entry.moderatedBy}</strong>
                      {entry.reason && ` • Reason: ${entry.reason}`}
                    </p>
                    {entry.note && (
                      <p className="text-slate-400 text-xs bg-slate-900/60 px-3.5 py-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                        {entry.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800 px-6 py-4 bg-slate-950/90">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {/* If Flagged: Dismiss report option */}
            {isReported && (
              <button
                type="button"
                onClick={() => {
                  onDismissReport(review);
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-all shadow-md shadow-emerald-950/20"
              >
                <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Dismiss Report (Keep Live)</span>
              </button>
            )}

            {/* If Rejected: Restore Review */}
            {review.status === "rejected" ? (
              <button
                type="button"
                onClick={() => {
                  onRestoreReview(review);
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>Restore to Published</span>
              </button>
            ) : (
              /* Delete Inappropriate Review */
              <button
                type="button"
                onClick={() => {
                  onDeleteReview(review);
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-lg border border-rose-500/50 bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors shadow-lg shadow-rose-950/40"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                <span>Delete Inappropriate Review</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
