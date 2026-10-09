"use client";

import type { AdminNotification } from "@/types/notification";

interface NotificationDetailModalProps {
  readonly isOpen: boolean;
  readonly notification: AdminNotification | null;
  readonly onClose: () => void;
  readonly onResend: (item: AdminNotification) => void;
}

export function NotificationDetailModal({
  isOpen,
  notification,
  onClose,
  onResend,
}: NotificationDetailModalProps) {
  if (!isOpen || !notification) return null;

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return "N/A";
    return new Date(isoStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 font-bold text-xs ring-1 ring-indigo-500/30">
              📨
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Notification Broadcast Telemetry
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">ID: {notification.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Message Content Preview */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-500/10 text-indigo-400 px-2 py-0.5 text-[10px] font-bold uppercase">
              {notification.type}
            </span>
            <span className="rounded-md bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-semibold capitalize">
              {notification.status}
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">{notification.title}</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{notification.body}</p>
          {notification.actionUrl && (
            <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-indigo-400 font-mono">
              Action URL: {notification.actionUrl}
            </div>
          )}
        </div>

        {/* Performance Funnel Metrics */}
        <div>
          <span className="text-xs font-semibold text-slate-300 mb-2 block">
            Engagement Funnel
          </span>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Recipients</span>
              <p className="text-base font-bold text-white mt-0.5">
                {notification.recipientCount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Delivery</span>
              <p className="text-base font-bold text-emerald-400 mt-0.5">
                {notification.deliveryRate}%
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Open Rate</span>
              <p className="text-base font-bold text-cyan-400 mt-0.5">
                {notification.openRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Dispatch Metadata & Timestamps */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1.5 text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Target Audience:</span>
            <span className="font-semibold text-white capitalize">
              {notification.targetAudience.replace("_", " ")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Active Channels:</span>
            <span className="font-semibold text-indigo-400 uppercase">
              {notification.channels.join(", ")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Dispatched At:</span>
            <span className="text-slate-300">
              {formatDate(notification.sentAt || notification.createdAt)}
            </span>
          </div>
          {notification.metadata?.orderId && (
            <div className="flex justify-between">
              <span>Related Order:</span>
              <span className="font-mono text-emerald-400">{notification.metadata.orderId}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onResend(notification);
              onClose();
            }}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
          >
            Resend Broadcast Now
          </button>
        </div>
      </div>
    </div>
  );
}
