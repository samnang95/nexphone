"use client";

import { useRef, useEffect, useState } from "react";
import type { Review, ReviewStatus } from "@/types/review";
import { cn } from "@/utils/cn";

interface ReviewTableProps {
  readonly reviews: Review[];
  readonly isLoading: boolean;
  readonly searchQuery: string;
  readonly onSearchChange: (q: string) => void;
  readonly statusFilter: ReviewStatus | "all";
  readonly onStatusFilterChange: (status: ReviewStatus | "all") => void;
  readonly ratingFilter: number | "all";
  readonly onRatingFilterChange: (rating: number | "all") => void;
  readonly sortBy: "recent" | "rating_desc" | "rating_asc" | "reports_desc" | "helpful_desc";
  readonly onSortChange: (sort: "recent" | "rating_desc" | "rating_asc" | "reports_desc" | "helpful_desc") => void;
  readonly onViewDetails: (review: Review) => void;
  readonly onDeleteReview: (review: Review) => void;
  readonly onDismissReport: (review: Review) => void;
  readonly onResetFilters: () => void;
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

/**
 * Returns an array of page numbers and ellipsis tokens for numbered pagination.
 * E.g., [1, 2, 3, 4, 5, "...", 10] or [1, "...", 4, 5, 6, "...", 10]
 */
function getPaginationRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
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

export function ReviewTable({
  reviews,
  isLoading,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  ratingFilter,
  onRatingFilterChange,
  sortBy,
  onSortChange,
  onViewDetails,
  onDeleteReview,
  onDismissReport,
  onResetFilters,
}: ReviewTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const filterKey = `${searchQuery}-${statusFilter}-${ratingFilter}-${sortBy}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setCurrentPage(1);
  }

  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = 0;
    }
  }, [reviews, currentPage]);

  const totalItems = reviews.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const displayedReviews = reviews.slice(startIndex, endIndex);

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(d);
    } catch {
      return isoStr;
    }
  };

  const isFiltered = searchQuery.trim() !== "" || statusFilter !== "all" || ratingFilter !== "all";

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Table Toolbar Controls */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 bg-slate-900/90">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by review, product, reviewer, or SKU..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-9 text-xs text-white placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Dropdowns and Sorters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950/60 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onStatusFilterChange("all")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === "all" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onStatusFilterChange("flagged")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === "flagged"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-amber-400 hover:bg-slate-800/60"
              }`}
            >
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <span>Flagged</span>
            </button>
            <button
              type="button"
              onClick={() => onStatusFilterChange("published")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === "published" ? "bg-emerald-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              Published
            </button>
            <button
              type="button"
              onClick={() => onStatusFilterChange("rejected")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === "rejected" ? "bg-rose-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              Removed
            </button>
          </div>

          {/* Star Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => onRatingFilterChange(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="h-8 appearance-none rounded-lg border border-slate-800 bg-slate-950/80 pl-2.5 pr-8 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="all">All Stars</option>
            <option value={5}>5 Stars (★★★★★)</option>
            <option value={4}>4 Stars (★★★★☆)</option>
            <option value={3}>3 Stars (★★★☆☆)</option>
            <option value={2}>2 Stars (★★☆☆☆)</option>
            <option value={1}>1 Star (★☆☆☆☆)</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange(
                e.target.value as "recent" | "rating_desc" | "rating_asc" | "reports_desc" | "helpful_desc"
              )
            }
            className="h-8 appearance-none rounded-lg border border-slate-800 bg-slate-950/80 pl-2.5 pr-8 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="recent">Sort: Most Recent</option>
            <option value="reports_desc">Sort: Most Reported</option>
            <option value="rating_desc">Sort: Highest Rating</option>
            <option value="rating_asc">Sort: Lowest Rating</option>
            <option value="helpful_desc">Sort: Most Helpful</option>
          </select>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="h-8 rounded-lg border border-slate-800 bg-slate-800/40 px-2.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Table Responsive Container */}
      <div ref={tableContainerRef} className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 select-none">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 whitespace-nowrap">Product</th>
              <th scope="col" className="px-3 py-3.5 whitespace-nowrap">Reviewer</th>
              <th scope="col" className="px-3 py-3.5">Rating & Feedback</th>
              <th scope="col" className="px-3 py-3.5 whitespace-nowrap">Status</th>
              <th scope="col" className="px-3 py-3.5 whitespace-nowrap">Submitted</th>
              <th scope="col" className="py-3.5 pl-3 pr-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-transparent">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`loading-skel-${idx}`} className="animate-pulse">
                  <td className="py-4 pl-4 pr-3">
                    <div className="h-4 w-36 rounded bg-slate-800" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 w-28 rounded bg-slate-800" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 w-52 rounded bg-slate-800" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-5 w-20 rounded bg-slate-800" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 w-16 rounded bg-slate-800" />
                  </td>
                  <td className="py-4 pl-3 pr-4 text-right">
                    <div className="ml-auto h-7 w-20 rounded bg-slate-800" />
                  </td>
                </tr>
              ))
            ) : displayedReviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-500 mb-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white">No reviews found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {isFiltered
                      ? "No reviews match your active search and filter parameters. Try clearing your filters."
                      : "There are currently no reviews in the catalog."}
                  </p>
                  {isFiltered && (
                    <button
                      type="button"
                      onClick={onResetFilters}
                      className="mt-4 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                    >
                      Clear Filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              displayedReviews.map((review) => {
                const isReported = review.isReported && review.status !== "rejected";
                const latestReport = review.reports?.[0];

                return (
                  <tr
                    key={review.id}
                    className={cn(
                      "transition-colors hover:bg-slate-800/40",
                      isReported && "bg-amber-500/5 hover:bg-amber-500/10"
                    )}
                  >
                    {/* Column 1: Product */}
                    <td className="py-3.5 pl-4 pr-3 max-w-[200px]">
                      <div className="flex items-center gap-2.5">
                        {review.productImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={review.productImage}
                            alt={review.productName}
                            className="h-9 w-9 shrink-0 rounded-lg object-cover border border-slate-800 bg-slate-950"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 font-mono text-[10px] text-slate-500">
                            NX
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate text-xs">
                            {review.productName}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span>{review.productBrand}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-500">{review.productSku}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Reviewer */}
                    <td className="px-3 py-3.5 max-w-[170px]">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarGradient(
                            review.customerName
                          )} font-semibold text-[11px] text-white shadow-sm ring-1 ring-white/10`}
                        >
                          {getInitials(review.customerName)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-200 truncate text-xs">{review.customerName}</p>
                          <div className="flex items-center gap-1 mt-1.5">
                            {review.isVerifiedPurchase ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 whitespace-nowrap">
                                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 truncate">{review.customerEmail}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 3: Rating & Feedback */}
                    <td className="px-3 py-3.5 max-w-[240px]">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center text-amber-400 text-xs shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                            ))}
                          </div>
                          <span className="font-mono font-bold text-slate-300 text-[11px]">{review.rating}.0</span>
                          {review.helpfulVotes > 0 && (
                            <span className="text-[10px] text-slate-400 ml-1 whitespace-nowrap">
                              👍 {review.helpfulVotes}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-white text-xs truncate">{review.title}</p>
                        <p className="text-slate-400 text-[11px] truncate leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </td>

                    {/* Column 4: Status */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {review.status === "published" && !isReported && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Published
                        </span>
                      )}

                      {isReported && (
                        <span
                          className="inline-flex flex-nowrap items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 shadow-sm animate-pulse whitespace-nowrap cursor-default"
                          title={latestReport ? `Allegation: ${getReportReasonLabel(latestReport.reason)}` : undefined}
                        >
                          <svg className="h-3.5 w-3.5 shrink-0 inline-block text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                          </svg>
                          <span className="whitespace-nowrap shrink-0">Reported</span>
                          <span className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-amber-600/40 px-1.5 text-[10px] tabular-nums font-bold">
                            {review.reportsCount}
                          </span>
                        </span>
                      )}

                      {review.status === "rejected" && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300 whitespace-nowrap">
                          <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                          Removed
                        </span>
                      )}
                    </td>

                    {/* Column 5: Submitted Date */}
                    <td className="px-3 py-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {formatDate(review.createdAt)}
                    </td>

                    {/* Column 6: Moderation Action Buttons */}
                    <td className="py-3.5 pl-3 pr-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => onViewDetails(review)}
                          className="flex h-8 items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2 text-slate-300 hover:border-slate-600 hover:bg-slate-700 hover:text-white transition-all text-xs font-semibold"
                          title="View review inspection details"
                        >
                          <svg className="h-3.5 w-3.5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
                          </svg>
                          <span>Inspect</span>
                        </button>

                        {/* Quick Dismiss Report button when flagged */}
                        {isReported && (
                          <button
                            type="button"
                            onClick={() => onDismissReport(review)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-all"
                            title="Dismiss report and keep review published"
                          >
                            <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          </button>
                        )}

                        {/* Delete Inappropriate Review */}
                        {review.status !== "rejected" ? (
                          <button
                            type="button"
                            onClick={() => onDeleteReview(review)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/50 transition-all"
                            title="Delete inappropriate review"
                          >
                            <svg className="h-3.5 w-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic pr-2">Removed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Numbered Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-800 px-4 py-3 bg-slate-950/60 text-xs text-slate-400">
        {/* Left: Entries Counter */}
        <div className="flex items-center gap-2">
          <span>
            {totalItems === 0 ? (
              "0 reviews"
            ) : (
              <>
                Showing <strong className="text-white font-mono">{startIndex + 1}</strong>–<strong className="text-white font-mono">{endIndex}</strong> of <strong className="text-white font-mono">{totalItems}</strong> reviews
              </>
            )}
          </span>
        </div>

        {/* Center: Numbered Pagination (1 - 2 - 3 ... 10) */}
        {totalPages > 1 && (
          <nav
            role="navigation"
            aria-label="Table pagination"
            className="flex items-center gap-1 sm:gap-1.5 self-center sm:self-auto select-none"
          >
            {/* Previous Arrow Button */}
            <button
              type="button"
              onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
              disabled={validPage <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:opacity-25 disabled:pointer-events-none"
              aria-label="Previous page"
              title="Previous page"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {getPaginationRange(validPage, totalPages).map((pageNum, idx) => {
                if (pageNum === "...") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="flex h-8 w-7 items-center justify-center font-mono text-xs text-slate-500 select-none tracking-widest"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  );
                }

                const isSelected = pageNum === validPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum as number)}
                    aria-current={isSelected ? "page" : undefined}
                    className={cn(
                      "flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-mono font-medium",
                      isSelected
                        ? "bg-indigo-600 text-white font-semibold border border-indigo-500"
                        : "border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                    )}
                    aria-label={`Go to page ${pageNum}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Arrow Button */}
            <button
              type="button"
              onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
              disabled={validPage >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:opacity-25 disabled:pointer-events-none"
              aria-label="Next page"
              title="Next page"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </nav>
        )}

        {/* Right: Page Size Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] text-slate-500">Rows:</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 appearance-none rounded-lg border border-slate-800 bg-slate-900 pl-2.5 pr-7 text-[11px] font-mono text-slate-300 hover:border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-500">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
