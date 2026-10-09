"use client";

import { useState } from "react";
import type {
  NotificationType,
  NotificationChannel,
  NotificationAudience,
  SendNotificationPayload,
  AdminNotification,
} from "@/types/notification";
import { cn } from "@/utils/cn";

interface SendNotificationModalProps {
  readonly isOpen: boolean;
  readonly initialNotification?: AdminNotification | null;
  readonly onClose: () => void;
  readonly onSubmit: (payload: SendNotificationPayload) => Promise<void>;
  readonly isSubmitting: boolean;
}

const NOTIFICATION_PRESETS = [
  {
    label: "⚡ Flash Sale 20%",
    title: "⚡ Weekend Flash Sale: 20% Off Flagships",
    body: "Use code FLASH20 at checkout for instant savings across the NexPhone 15 Pro Max line. Ends Sunday midnight!",
    type: "promotional" as NotificationType,
    channels: ["push", "email", "in_app"] as NotificationChannel[],
    targetAudience: "all" as NotificationAudience,
    actionUrl: "/promotions",
  },
  {
    label: "🚀 New Flagship Announcement",
    title: "🚀 NexPhone Fold Ultra is Here",
    body: "Dual-OLED aerospace hinge with uninterrupted direct-to-satellite voice mesh. Pre-orders are now officially open.",
    type: "announcement" as NotificationType,
    channels: ["push", "email", "sms", "in_app"] as NotificationChannel[],
    targetAudience: "all" as NotificationAudience,
    actionUrl: "/products/p4",
  },
  {
    label: "📦 Order Shipped Notice",
    title: "📦 Order #NX-ORD-9045 Dispatched",
    body: "Your NexPhone package has been dispatched via DHL Express. Track delivery progress in real-time.",
    type: "order" as NotificationType,
    channels: ["push", "email", "sms"] as NotificationChannel[],
    targetAudience: "order_customers" as NotificationAudience,
    actionUrl: "/orders",
  },
  {
    label: "💼 Enterprise Fleet Incentive",
    title: "💼 Trade-In Boost: Up to $800 Fleet Credit",
    body: "Upgrade your corporate fleet before quarter-end and receive boosted valuation credits on all eligible legacy devices.",
    type: "promotional" as NotificationType,
    channels: ["email", "in_app"] as NotificationChannel[],
    targetAudience: "enterprise_vip" as NotificationAudience,
    actionUrl: "/promotions",
  },
];

export function SendNotificationModal({
  isOpen,
  initialNotification,
  onClose,
  onSubmit,
  isSubmitting,
}: SendNotificationModalProps) {
  if (!isOpen) return null;

  return (
    <SendNotificationModalForm
      key={initialNotification?.id ?? "new_notification"}
      initialNotification={initialNotification}
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

function SendNotificationModalForm({
  initialNotification,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  readonly initialNotification?: AdminNotification | null;
  readonly onClose: () => void;
  readonly onSubmit: (payload: SendNotificationPayload) => Promise<void>;
  readonly isSubmitting: boolean;
}) {
  const isEditing = Boolean(initialNotification);

  const [title, setTitle] = useState(initialNotification?.title ?? "");
  const [body, setBody] = useState(initialNotification?.body ?? "");
  const [type, setType] = useState<NotificationType>(initialNotification?.type ?? "promotional");
  const [channels, setChannels] = useState<NotificationChannel[]>(
    initialNotification?.channels ?? ["push", "in_app"]
  );
  const [targetAudience, setTargetAudience] = useState<NotificationAudience>(
    initialNotification?.targetAudience ?? "all"
  );
  const [actionUrl, setActionUrl] = useState(initialNotification?.actionUrl ?? "/promotions");
  const [isScheduled, setIsScheduled] = useState(Boolean(initialNotification?.scheduledAt));
  const [scheduleDateTime, setScheduleDateTime] = useState(
    initialNotification?.scheduledAt
      ? initialNotification.scheduledAt.slice(0, 16)
      : ""
  );
  const [formError, setFormError] = useState<string | null>(null);

  const toggleChannel = (channel: NotificationChannel) => {
    setChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const applyPreset = (preset: (typeof NOTIFICATION_PRESETS)[0]) => {
    setTitle(preset.title);
    setBody(preset.body);
    setType(preset.type);
    setChannels(preset.channels);
    setTargetAudience(preset.targetAudience);
    setActionUrl(preset.actionUrl);
  };

  const insertVariable = (variableText: string) => {
    setBody((prev) => `${prev} ${variableText}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Notification title is required.");
      return;
    }
    if (!body.trim()) {
      setFormError("Notification message body is required.");
      return;
    }
    if (channels.length === 0) {
      setFormError("Please select at least one delivery channel (Push, Email, SMS, or In-App).");
      return;
    }
    if (isScheduled && !scheduleDateTime) {
      setFormError("Please select a valid scheduled date & time.");
      return;
    }

    try {
      const payload: SendNotificationPayload = {
        title: title.trim(),
        body: body.trim(),
        type,
        channels,
        targetAudience,
        actionUrl: actionUrl.trim() || undefined,
        scheduleTime: isScheduled && scheduleDateTime ? new Date(scheduleDateTime).toISOString() : null,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to dispatch notification");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {isEditing ? "Edit Scheduled Notification" : "Compose & Dispatch Notification"}
              </h2>
              <p className="text-xs text-slate-400">
                Broadcast customer push alerts, order updates, promotions, and hardware drops.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {formError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {formError}
            </div>
          )}

          {/* Quick Presets Strip */}
          <div className="space-y-1.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick Campaign Presets:
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {NOTIFICATION_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-indigo-500 hover:text-white transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Notification Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NotificationType)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="promotional">⚡ Promotional & Sale Campaign</option>
                <option value="announcement">🚀 New Product Announcement</option>
                <option value="order">📦 Order & Shipment Notification</option>
                <option value="system">🛡 System & Security Update</option>
                <option value="custom">🔔 Custom Broadcast</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Target Audience <span className="text-rose-400">*</span>
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as NotificationAudience)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All Verified Users (28,400 recipients)</option>
                <option value="enterprise_vip">Enterprise Fleet VIPs (3,200 recipients)</option>
                <option value="order_customers">Recent Order Customers (4,850 recipients)</option>
                <option value="active_devices">Active Satellite eSIM Devices (12,600 recipients)</option>
                <option value="custom_segment">Custom Segment (850 recipients)</option>
              </select>
            </div>
          </div>

          {/* Delivery Channels Multi-select */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Delivery Channels <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: "push" as NotificationChannel, label: "Mobile Push", icon: "📲" },
                { id: "email" as NotificationChannel, label: "Email Dispatch", icon: "✉️" },
                { id: "sms" as NotificationChannel, label: "SMS Text", icon: "💬" },
                { id: "in_app" as NotificationChannel, label: "In-App Hub", icon: "🔔" },
              ].map((channel) => {
                const isSelected = channels.includes(channel.id);
                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => toggleChannel(channel.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all",
                      isSelected
                        ? "border-indigo-500 bg-indigo-600/15 text-white ring-1 ring-indigo-500/40"
                        : "border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    )}
                  >
                    <span className="text-base">{channel.icon}</span>
                    <span>{channel.label}</span>
                    <span className="ml-auto text-[11px] font-bold">
                      {isSelected ? "✓" : "+"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notification Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Headline / Notification Title <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-1">
                {["🚀", "⚡", "📦", "🔥", "🛰"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setTitle((prev) => `${emoji} ${prev}`)}
                    className="rounded px-1 text-xs hover:bg-slate-800"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ⚡ Flash Sale: 20% Off Titanium Flagships"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Notification Message Body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Message Body <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>Variables:</span>
                <button
                  type="button"
                  onClick={() => insertVariable("{customer_name}")}
                  className="rounded bg-slate-800 px-1.5 py-0.5 hover:text-white"
                >
                  {"{name}"}
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable("{order_id}")}
                  className="rounded bg-slate-800 px-1.5 py-0.5 hover:text-white"
                >
                  {"{order}"}
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable("{promo_code}")}
                  className="rounded bg-slate-800 px-1.5 py-0.5 hover:text-white"
                >
                  {"{code}"}
                </button>
              </div>
            </div>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="e.g. Exclusive 48-hour access for loyalty members! Use promo code FLASH20 at checkout for instant savings across the 15 Pro Max series."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
              required
            />
          </div>

          {/* Action Link & Deep Linking */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Call-to-Action Link URL (optional)
            </label>
            <input
              type="text"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              placeholder="/promotions or /products/p1"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Live Mobile Lockscreen Mini Preview */}
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Live Push Notification Lockscreen Preview
              </span>
              <span className="text-[10px] text-slate-500">iPhone / Android Simulator</span>
            </div>

            <div className="relative rounded-2xl border border-slate-700/60 bg-gradient-to-b from-slate-900/90 to-slate-950/95 p-3.5 shadow-xl backdrop-blur-xl flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-black text-xs shrink-0 shadow-md">
                N
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-200">
                    NEXPHONE STORE
                  </span>
                  <span className="text-[10px] text-slate-500">now</span>
                </div>
                <h4 className="text-xs font-bold text-white mt-0.5 truncate">
                  {title || "Notification Headline"}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                  {body || "Your notification body content will render here for customers."}
                </p>
                {actionUrl && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-indigo-400">
                    <span>Tap to view {actionUrl}</span>
                    <span>→</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Schedule Timing Options */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300">Schedule for Later</span>
                <p className="text-[11px] text-slate-500">
                  Delay dispatch until a specific date and time instead of sending immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduled(!isScheduled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isScheduled ? "bg-indigo-600" : "bg-slate-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isScheduled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {isScheduled && (
              <div className="pt-2">
                <label className="text-[11px] text-slate-400">Select Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduleDateTime}
                  onChange={(e) => setScheduleDateTime(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  required={isScheduled}
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" />
              </svg>
              <span>
                {isSubmitting
                  ? "Dispatching..."
                  : isEditing
                  ? "Save Changes"
                  : isScheduled
                  ? "Schedule Broadcast"
                  : "Send Broadcast Now"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
