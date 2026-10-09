"use client";

import { useState } from "react";
import type {
  OrderNotificationTrigger,
  NotificationChannel,
  UpdateTriggerPayload,
} from "@/types/notification";
import { cn } from "@/utils/cn";

interface OrderNotificationRulesProps {
  readonly triggers: OrderNotificationTrigger[];
  readonly onUpdateTrigger: (id: string, updates: UpdateTriggerPayload) => Promise<void>;
}

export function OrderNotificationRules({
  triggers,
  onUpdateTrigger,
}: OrderNotificationRulesProps) {
  const [editingTrigger, setEditingTrigger] = useState<OrderNotificationTrigger | null>(null);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [templateChannels, setTemplateChannels] = useState<NotificationChannel[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEdit = (trigger: OrderNotificationTrigger) => {
    setEditingTrigger(trigger);
    setTemplateTitle(trigger.defaultTemplateTitle);
    setTemplateBody(trigger.defaultTemplateBody);
    setTemplateChannels(trigger.channels);
  };

  const handleToggleChannel = (ch: NotificationChannel) => {
    setTemplateChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrigger) return;
    setIsSaving(true);
    try {
      await onUpdateTrigger(editingTrigger.id, {
        defaultTemplateTitle: templateTitle.trim(),
        defaultTemplateBody: templateBody.trim(),
        channels: templateChannels,
      });
      setEditingTrigger(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (trigger: OrderNotificationTrigger) => {
    await onUpdateTrigger(trigger.id, {
      enabled: !trigger.enabled,
    });
  };

  const formatLastTriggered = (isoStr?: string) => {
    if (!isoStr) return "Never";
    const d = new Date(isoStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Order Lifecycle Automated Notifications
            </h2>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Event Automation Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Zero-touch event triggers configured to automatically notify customers via Push, Email, and SMS as their NexPhone order transitions from payment confirmation to final delivery.
          </p>
        </div>
      </div>

      {/* Grid of Automation Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {triggers.map((trigger) => (
          <div
            key={trigger.id}
            className={cn(
              "rounded-2xl border p-5 transition-all flex flex-col justify-between shadow-lg backdrop-blur-xl",
              trigger.enabled
                ? "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                : "border-slate-800/40 bg-slate-950/40 opacity-75"
            )}
          >
            <div>
              {/* Card Header with Status Switch */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl text-base ring-1",
                      trigger.enabled
                        ? "bg-indigo-600/20 text-indigo-400 ring-indigo-500/30"
                        : "bg-slate-800 text-slate-500 ring-slate-700"
                    )}
                  >
                    📦
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{trigger.title}</h3>
                    <p className="text-[11px] text-slate-400">{trigger.description}</p>
                  </div>
                </div>

                {/* Enable / Disable Switch */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(trigger)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    trigger.enabled ? "bg-indigo-600" : "bg-slate-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      trigger.enabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Template Preview Box */}
              <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 text-xs space-y-1">
                <p className="font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="text-[10px] text-indigo-400 font-mono">SUBJECT:</span>
                  <span className="truncate">{trigger.defaultTemplateTitle}</span>
                </p>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {trigger.defaultTemplateBody}
                </p>
              </div>

              {/* Channels Active Badges */}
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-slate-500">Channels:</span>
                {trigger.channels.map((ch) => (
                  <span
                    key={ch}
                    className="flex items-center gap-1 rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-300"
                  >
                    <span>
                      {ch === "push" && "📲 Push"}
                      {ch === "email" && "✉️ Email"}
                      {ch === "sms" && "💬 SMS"}
                      {ch === "in_app" && "🔔 In-App"}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Telemetry & Edit Template Button */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <div>
                <span className="text-slate-500">Fired: </span>
                <span className="font-bold text-white">{trigger.triggersCount.toLocaleString()} times</span>
                <span className="text-slate-600 mx-1.5">•</span>
                <span className="text-slate-500">Last: {formatLastTriggered(trigger.lastTriggeredAt)}</span>
              </div>

              <button
                type="button"
                onClick={() => handleOpenEdit(trigger)}
                className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <span>Edit Template</span>
                <span>✏️</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Template Edit Modal */}
      {editingTrigger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Customize Order Trigger Template
                </h3>
                <p className="text-xs text-slate-400">{editingTrigger.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTrigger(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
              {/* Channels checkboxes */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Enabled Channels</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "push" as NotificationChannel, label: "Push Notification" },
                    { id: "email" as NotificationChannel, label: "Email" },
                    { id: "sms" as NotificationChannel, label: "SMS Text" },
                    { id: "in_app" as NotificationChannel, label: "In-App Hub" },
                  ].map((ch) => {
                    const isSelected = templateChannels.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => handleToggleChannel(ch.id)}
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all",
                          isSelected
                            ? "border-indigo-500 bg-indigo-600/20 text-indigo-300"
                            : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                        )}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {ch.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Template Subject */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Template Subject / Title</label>
                <input
                  type="text"
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {/* Template Body */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Template Message Body</label>
                <textarea
                  rows={3}
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTrigger(null)}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
