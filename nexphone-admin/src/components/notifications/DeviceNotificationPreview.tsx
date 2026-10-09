"use client";

import { useState } from "react";
import type { AdminNotification } from "@/types/notification";
import { cn } from "@/utils/cn";

interface DeviceNotificationPreviewProps {
  readonly notifications: AdminNotification[];
  readonly onSendTestNotification?: (title: string, body: string, type: "order" | "promotional" | "announcement") => void;
}

export function DeviceNotificationPreview({
  notifications,
  onSendTestNotification,
}: DeviceNotificationPreviewProps) {
  const [selectedNotif, setSelectedNotif] = useState<AdminNotification | null>(
    notifications[0] ?? null
  );

  const [activeTab, setActiveTab] = useState<"lockscreen" | "banner">("lockscreen");

  const sentNotifications = notifications
    .filter((n) => n.status === "sent")
    .slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Controller & Description Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                Live Smartphone Notification Simulator
              </h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Real-Time Rendering
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive mobile simulator showing push alerts as customers receive them on lock screens.
            </p>
          </div>
        </div>

        {/* Simulator View Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("lockscreen")}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-semibold transition-colors",
                activeTab === "lockscreen"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Lock Screen Feed
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("banner")}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-semibold transition-colors",
                activeTab === "banner"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              In-Use Banner Pop
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Phone Canvas (5 cols) */}
        <div className="lg:col-span-5 flex justify-center rounded-3xl border border-slate-800 bg-slate-950 p-4 sm:p-6 overflow-hidden">
          {/* Smartphone Frame */}
          <div className="relative w-[340px] sm:w-[370px] min-h-[660px] rounded-[52px] border-[8px] border-slate-800 ring-1 ring-slate-700/60 bg-gradient-to-b from-slate-900 via-indigo-950/70 to-slate-950 flex flex-col justify-between overflow-hidden shadow-2xl p-4 text-white select-none">
            {/* Dynamic Island & Status Bar */}
            <div className="relative pt-2 pb-1 flex items-center justify-between px-3 text-[11px] font-semibold text-slate-300">
              <span>9:41</span>
              {/* Dynamic Island pill */}
              <div className="absolute left-1/2 top-2 -translate-x-1/2 h-5 w-24 rounded-full bg-black ring-1 ring-slate-800 flex items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-slate-950 mr-2" />
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500/50" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.28 19.64 10.59 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9z" />
                </svg>
                <span>5G</span>
                <span className="text-[10px]">100%</span>
              </div>
            </div>

            {/* Lock Screen Header: Clock & Date */}
            <div className="text-center pt-8 pb-4">
              <p className="text-xs font-semibold text-indigo-200 uppercase tracking-widest">
                Friday, October 9
              </p>
              <h1 className="text-6xl font-thin tracking-tighter text-white mt-1 drop-shadow-md">
                09:41
              </h1>
            </div>

            {/* Notification Cards Stack */}
            <div className="flex-1 space-y-2.5 py-2 overflow-y-auto max-h-[380px] scrollbar-none">
              {sentNotifications.map((notif) => {
                const isSelected = selectedNotif?.id === notif.id;
                return (
                  <div
                    key={notif.id}
                    onClick={() => setSelectedNotif(notif)}
                    className={cn(
                      "cursor-pointer rounded-2xl p-3 backdrop-blur-xl border transition-all duration-200 transform",
                      isSelected
                        ? "bg-slate-900/90 border-indigo-400/60 ring-2 ring-indigo-500/30 shadow-lg scale-[1.02]"
                        : "bg-slate-900/65 border-white/10 hover:bg-slate-900/80 shadow-md"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-black text-xs shrink-0 shadow-sm">
                        N
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                            NexPhone Store
                          </span>
                          <span className="text-[10px] text-slate-400">now</span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-0.5 truncate">
                          {notif.title}
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.body}
                        </p>
                        {notif.actionUrl && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-indigo-400">
                            <span>Open in app</span>
                            <span>→</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lock Screen Bottom Quick Actions: Flashlight & Camera */}
            <div className="pt-4 pb-2 px-6 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 text-xs backdrop-blur-md">
                🔦
              </div>
              <div className="h-1 w-28 rounded-full bg-white/40" />
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 text-xs backdrop-blur-md">
                📷
              </div>
            </div>
          </div>
        </div>

        {/* Right: Notification Details & Dispatch Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedNotif ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl shadow-xl space-y-5">
              <div>
                <span className="rounded-full bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Inspected Notification Payload
                </span>
                <h3 className="text-lg font-bold text-white mt-2">
                  {selectedNotif.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedNotif.body}
                </p>
              </div>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 text-center">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Recipients
                  </span>
                  <p className="text-lg font-bold text-white mt-0.5">
                    {selectedNotif.recipientCount.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 text-center">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Delivery
                  </span>
                  <p className="text-lg font-bold text-emerald-400 mt-0.5">
                    {selectedNotif.deliveryRate}%
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 text-center">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Open Rate
                  </span>
                  <p className="text-lg font-bold text-cyan-400 mt-0.5">
                    {selectedNotif.openRate}%
                  </p>
                </div>
              </div>

              {/* Channels & Deep Links */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Segment:</span>
                  <span className="font-semibold text-white capitalize">
                    {selectedNotif.targetAudience.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Channels Dispatched:</span>
                  <span className="font-semibold text-indigo-400 uppercase">
                    {selectedNotif.channels.join(", ")}
                  </span>
                </div>
                {selectedNotif.actionUrl && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Deep Link Action:</span>
                    <span className="font-mono text-cyan-400">
                      {selectedNotif.actionUrl}
                    </span>
                  </div>
                )}
                {selectedNotif.metadata?.orderId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Referenced Order:</span>
                    <span className="font-mono text-emerald-400">
                      {selectedNotif.metadata.orderId}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Trigger Simulation Actions */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-400 mb-2 block">
                  Quick Simulation Triggers:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onSendTestNotification?.(
                        "📦 Order #NX-ORD-9088 Dispatched",
                        "Your shipment is now in transit via DHL Express with signature required.",
                        "order"
                      )
                    }
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-emerald-500 hover:text-white transition-colors"
                  >
                    + Trigger Order Shipped
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onSendTestNotification?.(
                        "⚡ 48-Hour VIP Flash Sale",
                        "Take 15% off all dual-SIM satellite smartphones this weekend.",
                        "promotional"
                      )
                    }
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-indigo-500 hover:text-white transition-colors"
                  >
                    + Trigger Flash Sale
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onSendTestNotification?.(
                        "🚀 NexPhone Fold Ultra Released",
                        "The world's thinnest satellite foldable is now taking reservation deposits.",
                        "announcement"
                      )
                    }
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-500 hover:text-white transition-colors"
                  >
                    + Trigger Hardware Drop
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
              <p className="text-sm font-semibold text-slate-300">Select a Notification</p>
              <p className="text-xs text-slate-500 mt-1">Click any notification card on the smartphone to view payload details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
