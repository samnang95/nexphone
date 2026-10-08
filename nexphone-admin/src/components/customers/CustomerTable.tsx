"use client";

import { useRef, useEffect, useState } from "react";
import type { Customer, CustomerStatus, CustomerTier } from "@/types/customer";
import { cn } from "@/utils/cn";

interface CustomerTableProps {
  readonly customers: Customer[];
  readonly isLoading: boolean;
  readonly searchQuery: string;
  readonly onSearchChange: (q: string) => void;
  readonly statusFilter: CustomerStatus | "all";
  readonly onStatusFilterChange: (status: CustomerStatus | "all") => void;
  readonly tierFilter: CustomerTier | "all";
  readonly onTierFilterChange: (tier: CustomerTier | "all") => void;
  readonly sortBy: "recent" | "spent_desc" | "orders_desc" | "name_asc";
  readonly onSortChange: (sort: "recent" | "spent_desc" | "orders_desc" | "name_asc") => void;
  readonly onViewDetails: (customer: Customer) => void;
  readonly onToggleStatus: (customer: Customer) => void;
  readonly onResetFilters: () => void;
}

function getTierBadge(tier: CustomerTier) {
  switch (tier) {
    case "VIP":
      return {
        label: "VIP Partner",
        className: "border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-300 shadow-sm shadow-amber-950/20",
        icon: "★",
      };
    case "Enterprise":
      return {
        label: "Enterprise",
        className: "border-indigo-500/40 bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-300 shadow-sm shadow-indigo-950/20",
        icon: "◆",
      };
    case "Pro":
      return {
        label: "Pro Fleet",
        className: "border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-sky-500/10 text-cyan-300 shadow-sm shadow-cyan-950/20",
        icon: "▲",
      };
    case "Regular":
    default:
      return {
        label: "Regular",
        className: "border-slate-700/60 bg-slate-800/40 text-slate-300",
        icon: "●",
      };
  }
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

export function CustomerTable({
  customers,
  isLoading,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  tierFilter,
  onTierFilterChange,
  sortBy,
  onSortChange,
  onViewDetails,
  onToggleStatus,
  onResetFilters,
}: CustomerTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const filterKey = `${searchQuery}-${statusFilter}-${tierFilter}-${sortBy}`;
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
  }, [customers, currentPage]);

  const totalItems = customers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const displayedCustomers = customers.slice(startIndex, endIndex);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

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

  const isFiltered = searchQuery.trim() !== "" || statusFilter !== "all" || tierFilter !== "all";

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Table Toolbar Controls */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 bg-slate-900/90">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by customer name, email, phone, CUST-ID, location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-9 text-xs text-white placeholder-slate-500 transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as CustomerStatus | "all")}
              className="h-10 appearance-none rounded-lg border border-slate-800 bg-slate-950 pl-3 pr-8 text-xs text-slate-300 transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Tier Filter */}
          <div className="relative">
            <select
              value={tierFilter}
              onChange={(e) => onTierFilterChange(e.target.value as CustomerTier | "all")}
              className="h-10 appearance-none rounded-lg border border-slate-800 bg-slate-950 pl-3 pr-8 text-xs text-slate-300 transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Tiers</option>
              <option value="VIP">VIP Partner</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Pro">Pro Fleet</option>
              <option value="Regular">Regular</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as "recent" | "spent_desc" | "orders_desc" | "name_asc")}
              className="h-10 appearance-none rounded-lg border border-slate-800 bg-slate-950 pl-3 pr-8 text-xs text-slate-300 transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="spent_desc">Highest Spend (LTV)</option>
              <option value="orders_desc">Most Orders</option>
              <option value="name_asc">Name (A-Z)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="h-10 rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 text-xs text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div ref={tableContainerRef} className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th scope="col" className="py-3 px-4">Customer</th>
              <th scope="col" className="py-3 px-4">Contact & Location</th>
              <th scope="col" className="py-3 px-4">Account Tier</th>
              <th scope="col" className="py-3 px-4">Orders & LTV</th>
              <th scope="col" className="py-3 px-4">Status</th>
              <th scope="col" className="py-3 px-4">Member Since</th>
              <th scope="col" className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    <span>Synchronizing customer directory...</span>
                  </div>
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-500 border border-slate-700/50 mb-3">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-semibold text-white">No customers found</h4>
                    <p className="mt-1 text-xs text-slate-400">
                      No customer accounts matched your search and filter parameters.
                    </p>
                    {isFiltered && (
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="mt-4 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-500"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              displayedCustomers.map((c) => {
                const tier = getTierBadge(c.tier);
                const initials = getInitials(c.name);
                const avatarBg = getAvatarGradient(c.name);
                const isActive = c.status === "active";

                return (
                  <tr
                    key={c.id}
                    className="group transition-colors hover:bg-slate-800/40"
                  >
                    {/* Customer Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-bold text-white shadow-md text-xs",
                            avatarBg
                          )}
                        >
                          {initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <button
                            type="button"
                            onClick={() => onViewDetails(c)}
                            className="font-semibold text-white hover:text-indigo-400 text-left truncate transition-colors cursor-pointer"
                          >
                            {c.name}
                          </button>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                            <span>{c.customerNumber}</span>
                            {c.company && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400 font-sans truncate max-w-[120px]">{c.company}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact & Location */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-slate-200 truncate">{c.email}</span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span>{c.phone}</span>
                          <span>•</span>
                          <span className="text-slate-400 truncate max-w-[130px]">
                            {c.address.city}, {c.address.country}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Tier Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                          tier.className
                        )}
                      >
                        <span className="text-[9px]">{tier.icon}</span>
                        <span>{tier.label}</span>
                      </span>
                    </td>

                    {/* Orders & LTV */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-emerald-400">
                          {formatCurrency(c.metrics.totalSpent)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {c.metrics.totalOrders} {c.metrics.totalOrders === 1 ? "order" : "orders"}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>Disabled</span>
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {formatDate(c.createdAt)}
                    </td>

                    {/* Actions - Single Line Only */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => onViewDetails(c)}
                          className="h-8 rounded-lg border border-slate-700/60 bg-slate-800/40 px-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                          title="View customer profile and recent orders"
                        >
                          View
                        </button>

                        {/* Enable / Disable Status Toggle */}
                        {isActive ? (
                          <button
                            type="button"
                            onClick={() => onToggleStatus(c)}
                            className="h-8 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 hover:text-rose-200"
                            title="Disable customer account"
                          >
                            Disable
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onToggleStatus(c)}
                            className="h-8 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20 hover:text-emerald-200"
                            title="Reactivate customer account"
                          >
                            Enable
                          </button>
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

      {/* Table Footer with Pill & Dots Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-800 px-4 py-3 bg-slate-950/60 text-xs text-slate-400">
        {/* Left: Entries Counter */}
        <div className="flex items-center gap-2">
          <span>
            {totalItems === 0 ? (
              "0 customers"
            ) : (
              <>
                Showing <strong className="text-white font-mono">{startIndex + 1}</strong>–<strong className="text-white font-mono">{endIndex}</strong> of <strong className="text-white font-mono">{totalItems}</strong> customers
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
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:opacity-25 disabled:pointer-events-none active:scale-95"
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
                      "flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-mono font-medium transition-all active:scale-95",
                      isSelected
                        ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30 border border-indigo-500 ring-1 ring-white/20"
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
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:opacity-25 disabled:pointer-events-none active:scale-95"
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
              className="h-7 appearance-none rounded-md border border-slate-800 bg-slate-900 pl-2 pr-6 text-[11px] font-mono text-slate-300 hover:border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5 text-slate-400">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
