"use client";

import { useState, useMemo } from "react";
import type {
  AdminNotification,
  NotificationType,
  NotificationStatus,
} from "@/types/notification";
import { cn } from "@/utils/cn";

interface NotificationTableProps {
  readonly notifications: AdminNotification[];
  readonly onInspect: (item: AdminNotification) => void;
  readonly onEdit: (item: AdminNotification) => void;
  readonly onDelete: (item: AdminNotification) => void;
  readonly onResend: (item: AdminNotification) => void;
  readonly onSendNew: () => void;
}

export function NotificationTable({
  notifications,
  onInspect,
  onEdit,
  onDelete,
  onResend,
  onSendNew,
}: NotificationTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (typeFilter !== "all" && notif.type !== typeFilter) return false;
      if (statusFilter !== "all" && notif.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = notif.title.toLowerCase().includes(q);
        const matchesBody = notif.body.toLowerCase().includes(q);
        const matchesOrder = notif.metadata?.orderId?.toLowerCase().includes(q);
        const matchesCode = notif.metadata?.promoCode?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBody && !matchesOrder && !matchesCode) return false;
      }
      return true;
    });
  }, [notifications, typeFilter, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, currentPage]);

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return "N/A";
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case "order":
        return { label: "Order", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
      case "promotional":
        return { label: "Promotion", bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" };
      case "announcement":
        return { label: "Product Drop", bg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" };
      case "system":
        return { label: "System", bg: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
      default:
        return { label: "Custom", bg: "bg-slate-500/10 text-slate-400 border-slate-500/20" };
    }
  };

  const getStatusBadge = (status: NotificationStatus) => {
    switch (status) {
      case "sent":
        return { label: "Sent", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
      case "scheduled":
        return { label: "Scheduled", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
      case "draft":
        return { label: "Draft", bg: "bg-slate-500/10 text-slate-400 border-slate-500/20" };
      case "failed":
        return { label: "Failed", bg: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
    }
  };

  const getAudienceLabel = (aud: string) => {
    switch (aud) {
      case "all":
        return "All Users";
      case "enterprise_vip":
        return "Enterprise VIPs";
      case "order_customers":
        return "Order Buyers";
      case "active_devices":
        return "Active eSIMs";
      default:
        return "Custom Group";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 max-w-md relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search headline, body, order ID, or code..."
            className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-3.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none backdrop-blur-xl transition-colors hover:border-slate-700"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as NotificationType | "all");
                setCurrentPage(1);
              }}
              className="h-9 appearance-none rounded-lg border border-slate-800 bg-slate-950/80 pl-3 pr-8 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="promotional">Promotions</option>
              <option value="announcement">Product Drops</option>
              <option value="order">Order Updates</option>
              <option value="system">System Updates</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as NotificationStatus | "all");
                setCurrentPage(1);
              }}
              className="h-9 appearance-none rounded-lg border border-slate-800 bg-slate-950/80 pl-3 pr-8 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="sent">Sent</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Drafts</option>
              <option value="failed">Failed</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Notification Content</th>
                <th className="py-3.5 px-4">Audience & Channels</th>
                <th className="py-3.5 px-4">Status & Dispatch Date</th>
                <th className="py-3.5 px-4">Performance (Open / CTR)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-300">No Notifications Found</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or dispatch a new broadcast.</p>
                    <button
                      type="button"
                      onClick={onSendNew}
                      className="mt-3 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                    >
                      + Send Notification
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const typeBadge = getTypeBadge(item.type);
                  const statusBadge = getStatusBadge(item.status);

                  return (
                    <tr
                      key={item.id}
                      className="group transition-colors hover:bg-slate-800/30"
                    >
                      {/* Notification Content */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold", typeBadge.bg)}>
                            {typeBadge.label}
                          </span>
                          {item.metadata?.badge && (
                            <span className="rounded-md bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 text-[9px] font-semibold">
                              {item.metadata.badge}
                            </span>
                          )}
                          {item.metadata?.orderId && (
                            <span className="rounded-md bg-slate-800 text-slate-300 px-1.5 py-0.5 text-[9px] font-mono">
                              {item.metadata.orderId}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-white text-xs truncate group-hover:text-indigo-400 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {item.body}
                        </p>
                      </td>

                      {/* Audience & Channels */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-200">
                          {getAudienceLabel(item.targetAudience)}
                        </span>
                        <p className="text-[10px] text-slate-500">
                          {item.recipientCount.toLocaleString()} recipient{item.recipientCount === 1 ? "" : "s"}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          {item.channels.map((ch) => (
                            <span
                              key={ch}
                              title={ch.toUpperCase()}
                              className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-800 text-[10px] text-slate-300"
                            >
                              {ch === "push" && "📲"}
                              {ch === "email" && "✉️"}
                              {ch === "sms" && "💬"}
                              {ch === "in_app" && "🔔"}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status & Dispatch */}
                      <td className="py-3.5 px-4">
                        <span className={cn("inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold mb-1", statusBadge.bg)}>
                          {statusBadge.label}
                        </span>
                        <p className="text-[11px] text-slate-300">
                          {item.status === "scheduled"
                            ? `Scheduled: ${formatDate(item.scheduledAt)}`
                            : formatDate(item.sentAt || item.createdAt)}
                        </p>
                        {item.status === "sent" && (
                          <p className="text-[10px] text-emerald-400">
                            {item.deliveryRate}% delivered
                          </p>
                        )}
                      </td>

                      {/* Performance Funnel */}
                      <td className="py-3.5 px-4">
                        {item.status === "sent" ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Opens</span>
                              <span className="font-bold text-white">{item.openRate}%</span>
                            </div>
                            <div className="h-1.5 w-24 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-cyan-400 rounded-full"
                                style={{ width: `${Math.min(100, item.openRate)}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>CTR</span>
                              <span className="font-semibold text-slate-300">{item.clickRate}%</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">No engagement yet</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Inspect Details */}
                          <button
                            type="button"
                            onClick={() => onInspect(item)}
                            title="Inspect Notification Details"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* Resend Broadcast */}
                          {item.status === "sent" && (
                            <button
                              type="button"
                              onClick={() => onResend(item)}
                              title="Resend Broadcast"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-indigo-400 transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          )}

                          {/* Edit / Reschedule */}
                          {item.status === "scheduled" && (
                            <button
                              type="button"
                              onClick={() => onEdit(item)}
                              title="Edit Scheduled Dispatch"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-indigo-400 transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => onDelete(item)}
                            title="Delete Notification Record"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

        {/* Numbered Pagination Strip */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/40 px-4 py-3">
            <span className="text-xs text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredNotifications.length)} of{" "}
              {filteredNotifications.length} entries
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-800 disabled:opacity-30"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition-colors",
                    currentPage === page
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-800 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
