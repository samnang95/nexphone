"use client";

import { useState, useRef, useEffect } from "react";
import type { Promotion, PromotionType, PromotionStatus } from "@/types/promotion";
import { cn } from "@/utils/cn";

interface PromotionTableProps {
  readonly promotions: Promotion[];
  readonly isLoading: boolean;
  readonly searchQuery: string;
  readonly onSearchChange: (q: string) => void;
  readonly typeFilter: PromotionType | "all";
  readonly onTypeFilterChange: (t: PromotionType | "all") => void;
  readonly statusFilter: PromotionStatus | "all";
  readonly onStatusFilterChange: (s: PromotionStatus | "all") => void;
  readonly sortBy: "highest_discount" | "most_used" | "recent" | "ending_soon" | "revenue_desc";
  readonly onSortChange: (sort: "highest_discount" | "most_used" | "recent" | "ending_soon" | "revenue_desc") => void;
  readonly onViewDetails: (promotion: Promotion) => void;
  readonly onEditPromotion: (promotion: Promotion) => void;
  readonly onDeletePromotion: (promotion: Promotion) => void;
  readonly onToggleStatus: (promotion: Promotion) => void;
  readonly onCreateClick: () => void;
  readonly onResetFilters: () => void;
}

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

function getDurationBadge(promo: Promotion, now: number) {
  const start = new Date(promo.startDate).getTime();
  const end = promo.endDate ? new Date(promo.endDate).getTime() : null;

  if (promo.status === "disabled") {
    return <span className="text-[11px] text-slate-500">Paused</span>;
  }

  if (end && end < now) {
    return <span className="text-[11px] text-rose-400/80">Expired</span>;
  }

  if (start > now) {
    const daysUntil = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    return (
      <span className="text-[11px] text-cyan-400 font-medium">
        Starts in {daysUntil}d
      </span>
    );
  }

  if (end) {
    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return (
      <span className={cn(
        "text-[11px] font-medium",
        daysLeft <= 3 ? "text-amber-400 font-bold" : "text-emerald-400"
      )}>
        {daysLeft}d remaining
      </span>
    );
  }

  return <span className="text-[11px] text-slate-400">Ongoing</span>;
}

export function PromotionTable({
  promotions,
  isLoading,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  onViewDetails,
  onEditPromotion,
  onDeletePromotion,
  onToggleStatus,
  onCreateClick,
  onResetFilters,
}: PromotionTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const filterKey = `${searchQuery}-${typeFilter}-${statusFilter}-${sortBy}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [currentTimestamp] = useState(() => Date.now());

  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setCurrentPage(1);
  }

  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = 0;
    }
  }, [promotions, currentPage]);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // fallback
    }
  };

  const totalItems = promotions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const displayedPromotions = promotions.slice(startIndex, endIndex);

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return "Open-ended";
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

  const isFiltered = searchQuery.trim() !== "" || typeFilter !== "all" || statusFilter !== "all";

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
            placeholder="Search by promo code, title, campaign tag..."
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
          {/* Type Tabs */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950/60 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onTypeFilterChange("all")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                typeFilter === "all" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => onTypeFilterChange("promo_code")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
                typeFilter === "promo_code" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🏷 Codes</span>
            </button>
            <button
              type="button"
              onClick={() => onTypeFilterChange("sale_campaign")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
                typeFilter === "sale_campaign" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>⚡ Sales</span>
            </button>
            <button
              type="button"
              onClick={() => onTypeFilterChange("automatic")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
                typeFilter === "automatic" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>⚙ Auto</span>
            </button>
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as PromotionStatus | "all")}
            className="h-8 appearance-none rounded-lg border border-slate-800 bg-slate-950/80 pl-2.5 pr-8 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
            <option value="disabled">Disabled</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange(
                e.target.value as "highest_discount" | "most_used" | "recent" | "ending_soon" | "revenue_desc"
              )
            }
            className="h-8 appearance-none rounded-lg border border-slate-800 bg-slate-950/80 pl-2.5 pr-8 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="recent">Sort: Most Recent</option>
            <option value="highest_discount">Sort: Highest Discount</option>
            <option value="most_used">Sort: Most Redemptions</option>
            <option value="revenue_desc">Sort: Highest Revenue</option>
            <option value="ending_soon">Sort: Ending Soonest</option>
          </select>

          {/* Create Button */}
          <button
            type="button"
            onClick={onCreateClick}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Create Discount</span>
          </button>
        </div>
      </div>

      {/* Active Filter Pills Bar */}
      {isFiltered && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
          <span>Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] text-white">
              Keyword: &quot;{searchQuery}&quot;
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="hover:text-rose-400"
              >
                ×
              </button>
            </span>
          )}
          {typeFilter !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] text-white">
              Type: {typeFilter}
              <button
                type="button"
                onClick={() => onTypeFilterChange("all")}
                className="hover:text-rose-400"
              >
                ×
              </button>
            </span>
          )}
          {statusFilter !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] text-white">
              Status: {statusFilter}
              <button
                type="button"
                onClick={() => onStatusFilterChange("all")}
                className="hover:text-rose-400"
              >
                ×
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Table Content */}
      <div ref={tableContainerRef} className="w-full">
        <table className="w-full text-left text-xs table-auto">
          <thead className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="py-3 px-3 sm:px-4">Promotion & Campaign</th>
              <th className="py-3 px-3">Code / Trigger</th>
              <th className="py-3 px-3">Discount Value</th>
              <th className="py-3 px-3">Redemptions</th>
              <th className="py-3 px-3 hidden lg:table-cell">Duration</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={`promo-skeleton-${i}`} className="animate-pulse">
                  <td className="py-4 px-3 sm:px-4">
                    <div className="h-4 w-44 bg-slate-800 rounded mb-1.5" />
                    <div className="h-3 w-28 bg-slate-800/60 rounded" />
                  </td>
                  <td className="py-4 px-3"><div className="h-6 w-24 bg-slate-800 rounded-md" /></td>
                  <td className="py-4 px-3"><div className="h-4 w-20 bg-slate-800 rounded" /></td>
                  <td className="py-4 px-3"><div className="h-4 w-24 bg-slate-800 rounded" /></td>
                  <td className="py-4 px-3 hidden lg:table-cell"><div className="h-4 w-28 bg-slate-800 rounded" /></td>
                  <td className="py-4 px-3"><div className="h-5 w-16 bg-slate-800 rounded-full" /></td>
                  <td className="py-4 px-3 sm:px-4 text-right"><div className="h-7 w-28 bg-slate-800 rounded ml-auto" /></td>
                </tr>
              ))
            ) : displayedPromotions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/60 text-slate-500 mb-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-300">No promotions found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try changing your search terms, filtering by another status, or click below to launch a new discount campaign.
                  </p>
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/30"
                  >
                    Reset all filters
                  </button>
                </td>
              </tr>
            ) : (
              displayedPromotions.map((promo) => {
                const isPromoCode = promo.type === "promo_code";
                const isSaleCampaign = promo.type === "sale_campaign";
                const isCopied = copiedCode === promo.code;

                // Usage percentage calculation
                const usagePercent = promo.usageLimit
                  ? Math.min(100, Math.round((promo.usedCount / promo.usageLimit) * 100))
                  : null;

                return (
                  <tr
                    key={promo.id}
                    className="group transition-colors hover:bg-slate-800/40"
                  >
                    {/* Promotion & Campaign */}
                    <td className="py-3 px-3 sm:px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                            {promo.title}
                          </span>
                          {promo.campaignTag && (
                            <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300 shrink-0">
                              {promo.campaignTag}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-1 max-w-xs sm:max-w-sm">
                          {promo.description}
                        </p>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          Created {formatDate(promo.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* Code / Trigger */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {isPromoCode && promo.code ? (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-2 py-1">
                          <span className="font-mono text-xs font-bold text-indigo-300">
                            {promo.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(promo.code!)}
                            title="Copy promo code"
                            className={cn(
                              "p-0.5 rounded transition-colors text-slate-400 hover:text-white",
                              isCopied && "text-emerald-400"
                            )}
                          >
                            {isCopied ? (
                              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                            ) : (
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                              </svg>
                            )}
                          </button>
                        </div>
                      ) : isSaleCampaign ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[11px] font-semibold text-purple-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                          Sitewide Sale
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                          Orders &gt; ${promo.minOrderValue || 0}
                        </span>
                      )}
                    </td>

                    {/* Discount Value */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-xs">
                          {promo.discountType === "percentage" && `${promo.discountValue}% OFF`}
                          {promo.discountType === "fixed_amount" && `$${promo.discountValue}.00 OFF`}
                          {promo.discountType === "free_shipping" && "Free Global Courier"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {promo.minOrderValue ? `Min $${promo.minOrderValue}` : "No minimum"}
                        </span>
                      </div>
                    </td>

                    {/* Redemptions */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1 min-w-[90px]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-200">
                            {promo.usedCount.toLocaleString()}
                          </span>
                          <span className="text-slate-500 text-[10px]">
                            {promo.usageLimit ? `/${promo.usageLimit}` : "unlimited"}
                          </span>
                        </div>
                        {usagePercent !== null && (
                          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                usagePercent >= 90
                                  ? "bg-rose-500"
                                  : usagePercent >= 60
                                  ? "bg-amber-500"
                                  : "bg-indigo-500"
                              )}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          {getDurationBadge(promo, currentTimestamp)}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {formatDate(promo.startDate)} → {formatDate(promo.endDate)}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(promo)}
                        title={`Click to ${promo.status === "active" ? "pause" : "activate"}`}
                        className="cursor-pointer transition-transform hover:scale-105"
                      >
                        {promo.status === "active" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/25">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        )}
                        {promo.status === "scheduled" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[11px] font-semibold text-cyan-400 hover:bg-cyan-500/25">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                            Scheduled
                          </span>
                        )}
                        {promo.status === "expired" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-400 hover:bg-slate-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                            Expired
                          </span>
                        )}
                        {promo.status === "disabled" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-semibold text-amber-400 hover:bg-amber-500/25">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            Disabled
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Inspect Details */}
                        <button
                          type="button"
                          onClick={() => onViewDetails(promo)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                        >
                          <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                          <span>Inspect</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => onEditPromotion(promo)}
                          title="Edit discount"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 transition-colors hover:border-indigo-500 hover:bg-indigo-600 hover:text-white"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                          </svg>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => onDeletePromotion(promo)}
                          title="Delete discount"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 transition-colors hover:border-rose-500 hover:bg-rose-600 hover:text-white"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer - Instant Page Switching (No Scaling Animations) */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span>
            Showing <strong className="text-white">{totalItems === 0 ? 0 : startIndex + 1}</strong> to{" "}
            <strong className="text-white">{endIndex}</strong> of{" "}
            <strong className="text-white">{totalItems}</strong> promotions
          </span>
        </div>

        {/* Numbered Pagination Buttons */}
        <div className="flex items-center gap-1 self-center sm:self-auto">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validPage === 1}
            className="flex h-8 items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:pointer-events-none disabled:opacity-40"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Numbered buttons with ellipsis */}
          {getPaginationRange(validPage, totalPages).map((item, index) => {
            if (item === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-8 w-7 items-center justify-center text-xs text-slate-600"
                >
                  …
                </span>
              );
            }

            const pageNum = item as number;
            const isSelected = pageNum === validPage;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold select-none",
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500"
                    : "border border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                )}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validPage === totalPages}
            className="flex h-8 items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:pointer-events-none disabled:opacity-40"
          >
            <span className="hidden sm:inline">Next</span>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
