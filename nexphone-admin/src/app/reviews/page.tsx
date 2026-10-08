"use client";

import { useEffect, useState, useMemo } from "react";
import type { Review, ReviewStatus, ReviewSummaryMetrics } from "@/types/review";
import { ReviewService } from "@/services/review.service";
import { ReviewKPIs } from "@/components/reviews/ReviewKPIs";
import { ReviewTable } from "@/components/reviews/ReviewTable";
import { ReviewDetailModal } from "@/components/reviews/ReviewDetailModal";
import { DeleteReviewModal } from "@/components/reviews/DeleteReviewModal";
import { ManageReportModal } from "@/components/reviews/ManageReportModal";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [metrics, setMetrics] = useState<ReviewSummaryMetrics>({
    totalReviews: 0,
    averageRating: 5.0,
    publishedCount: 0,
    reportedCount: 0,
    rejectedCount: 0,
    verifiedPurchaseRate: 100,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("all");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<"recent" | "rating_desc" | "rating_asc" | "reports_desc" | "helpful_desc">("recent");

  // Modals state
  const [inspectingReview, setInspectingReview] = useState<Review | null>(null);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  const [resolvingReportReview, setResolvingReportReview] = useState<Review | null>(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const refreshData = async () => {
    try {
      setIsLoading(true);
      const [revs, mets] = await Promise.all([
        ReviewService.getReviews(),
        ReviewService.getMetrics(),
      ]);
      setReviews(revs);
      setMetrics(mets);
    } catch (err) {
      console.error("Failed to load review management data:", err);
      showToast("Unable to load reviews from server. Using local cache.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    async function initData() {
      try {
        const [revs, mets] = await Promise.all([
          ReviewService.getReviews(),
          ReviewService.getMetrics(),
        ]);
        if (isSubscribed) {
          setReviews(revs);
          setMetrics(mets);
        }
      } catch (err) {
        console.error("Failed to load review management data:", err);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    initData();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Filtered & sorted reviews computed via useMemo
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.reviewNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.customerEmail.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          r.productSku.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (ratingFilter !== "all") {
      result = result.filter((r) => r.rating === ratingFilter);
    }

    if (sortBy === "rating_desc") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "rating_asc") {
      result.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === "reports_desc") {
      result.sort((a, b) => b.reportsCount - a.reportsCount);
    } else if (sortBy === "helpful_desc") {
      result.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [reviews, searchQuery, statusFilter, ratingFilter, sortBy]);

  // Handle Delete Inappropriate Review
  const handleConfirmDelete = async (reason: string, note: string) => {
    if (!deletingReview) return;
    try {
      setIsActionSubmitting(true);
      await ReviewService.deleteReview({
        reviewId: deletingReview.id,
        reason,
        moderationNote: note,
        moderatedBy: "Admin Staff",
      });
      showToast(`Review ${deletingReview.reviewNumber} removed for: ${reason}`);
      setDeletingReview(null);
      await refreshData();
    } catch (err) {
      console.error("Failed to delete review:", err);
      showToast("Error deleting review. Please try again.", "error");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Handle Dismiss Report (keep live)
  const handleConfirmDismissReport = async (note: string) => {
    const target = resolvingReportReview || inspectingReview;
    if (!target) return;
    try {
      setIsActionSubmitting(true);
      await ReviewService.dismissReport({
        reviewId: target.id,
        note,
        moderatedBy: "Admin Staff",
      });
      showToast(`Flag on ${target.reviewNumber} dismissed. Review maintained in catalog.`);
      setResolvingReportReview(null);
      setInspectingReview(null);
      await refreshData();
    } catch (err) {
      console.error("Failed to dismiss report:", err);
      showToast("Error dismissing report.", "error");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Handle Restore Review
  const handleRestoreReview = async (review: Review) => {
    try {
      setIsActionSubmitting(true);
      await ReviewService.updateStatus(review.id, "published", "Restored by moderator", "Review approved for publication");
      showToast(`Review ${review.reviewNumber} restored to published status.`);
      await refreshData();
    } catch (err) {
      console.error("Failed to restore review:", err);
      showToast("Error restoring review.", "error");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setRatingFilter("all");
    setSortBy("recent");
  };

  return (
    <main className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-6 xl:p-8">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-md text-xs font-medium text-white transition-all animate-in slide-in-from-bottom-3">
          {toastMessage.type === "success" && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
          )}
          {toastMessage.type === "error" && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-500 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Page Title */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Review Management
            </h1>
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-indigo-300">
              Live Moderation
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Monitor verified customer ratings, inspect reported content, and delete policy-violating reviews.
          </p>
        </div>

        {/* Quick Refresh Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all active:scale-95 disabled:opacity-50"
            title="Refresh review telemetry"
          >
            <svg
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : "text-slate-400"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* High-level KPI Telemetry Cards */}
      <ReviewKPIs
        metrics={metrics}
        isLoading={isLoading}
        onFilterReported={() => {
          setStatusFilter(statusFilter === "flagged" ? "all" : "flagged");
        }}
        isReportedFilterActive={statusFilter === "flagged"}
      />

      {/* Main Review Directory Table with Numbered Pagination */}
      <ReviewTable
        reviews={filteredReviews}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        ratingFilter={ratingFilter}
        onRatingFilterChange={setRatingFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onViewDetails={setInspectingReview}
        onDeleteReview={setDeletingReview}
        onDismissReport={setResolvingReportReview}
        onResetFilters={handleResetFilters}
      />

      {/* Inspection Modal */}
      <ReviewDetailModal
        review={inspectingReview}
        isOpen={Boolean(inspectingReview)}
        onClose={() => setInspectingReview(null)}
        onDeleteReview={setDeletingReview}
        onDismissReport={(rev) => setResolvingReportReview(rev)}
        onRestoreReview={handleRestoreReview}
      />

      {/* Delete Review Modal */}
      <DeleteReviewModal
        review={deletingReview}
        isOpen={Boolean(deletingReview)}
        isSubmitting={isActionSubmitting}
        onClose={() => setDeletingReview(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Manage / Resolve Report Modal */}
      <ManageReportModal
        review={resolvingReportReview}
        isOpen={Boolean(resolvingReportReview)}
        isSubmitting={isActionSubmitting}
        onClose={() => setResolvingReportReview(null)}
        onDismiss={handleConfirmDismissReport}
        onDelete={async (reason, note) => {
          if (!resolvingReportReview) return;
          try {
            setIsActionSubmitting(true);
            await ReviewService.deleteReview({
              reviewId: resolvingReportReview.id,
              reason,
              moderationNote: note,
              moderatedBy: "Admin Staff",
            });
            showToast(`Report upheld. Review ${resolvingReportReview.reviewNumber} removed for: ${reason}`);
            setResolvingReportReview(null);
            await refreshData();
          } catch (err) {
            console.error("Failed to delete review:", err);
            showToast("Error deleting review.", "error");
          } finally {
            setIsActionSubmitting(false);
          }
        }}
      />
    </main>
  );
}
