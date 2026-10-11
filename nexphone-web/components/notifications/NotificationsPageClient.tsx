"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AccountShell } from "@/components/account/AccountShell";
import { useNotifications } from "@/context/NotificationContext";
import { SAMPLE_NOTIFICATIONS, formatTimeAgo, notificationService } from "@/services/notification.service";
import type { NotificationCategory, NotificationFilter } from "@/types/notification";
import { CATEGORY_META, CATEGORY_ORDER } from "./categoryMeta";

type Tab = "inbox" | "preferences";

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full border transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
        checked ? "bg-cyan-500 border-cyan-400" : "bg-slate-800 border-slate-700"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function InboxPanel() {
  const { notifications, unreadCount, markRead, markAllRead, remove, clearAll } = useNotifications();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [confirmClear, setConfirmClear] = useState(false);

  const counts = useMemo(() => {
    const byCategory: Record<NotificationCategory, number> = { order: 0, promotion: 0, new_phone: 0 };
    notifications.forEach((n) => {
      byCategory[n.category] += 1;
    });
    return { all: notifications.length, unread: unreadCount, ...byCategory };
  }, [notifications, unreadCount]);

  const visible = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.category === filter);
  }, [notifications, filter]);

  const filters: { id: NotificationFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "order", label: "Orders" },
    { id: "promotion", label: "Promotions" },
    { id: "new_phone", label: "New phones" },
  ];

  return (
    <div className="space-y-5">
      <div className="p-3 sm:p-4 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto" role="tablist" aria-label="Filter notifications">
          {filters.map((f) => {
            const isActive = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilter(f.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                    : "bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80"
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`text-[10px] px-1.5 rounded-full ${
                    isActive ? "bg-slate-950/30 text-slate-950 font-black" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {counts[f.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-cyan-400 hover:text-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Mark all read
          </button>
          {confirmClear ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  clearAll();
                  setConfirmClear(false);
                }}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              disabled={notifications.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-400 hover:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">
            {notifications.length === 0 ? "No notifications" : "Nothing here"}
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {notifications.length === 0
              ? "Order updates, promotions and new phone alerts will show up here."
              : "No notifications match this filter."}
          </p>
          {filter !== "all" && notifications.length > 0 && (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
            >
              Show all
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((n) => {
            const meta = CATEGORY_META[n.category];
            return (
              <li
                key={n.id}
                className={`p-4 sm:p-5 rounded-3xl border backdrop-blur-md flex items-start gap-4 transition-colors ${
                  n.read
                    ? "bg-slate-900/40 border-slate-800/70"
                    : "bg-slate-900/70 border-slate-700 shadow-lg shadow-black/20"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${meta.iconWrap}`}
                >
                  {meta.icon}
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <h3
                      className={`text-sm ${n.read ? "text-slate-300 font-semibold" : "text-white font-bold"}`}
                    >
                      {n.title}
                    </h3>
                    {!n.read && (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-cyan-300">
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} animate-pulse`} />
                        New
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[10px] font-mono ${meta.chip}`}
                    >
                      {meta.label}
                    </span>
                    {n.tag && (
                      <span className="text-[10px] font-mono text-slate-500">{n.tag}</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <span className="text-[11px] font-mono text-slate-500">
                      {formatTimeAgo(n.createdAt)}
                    </span>
                    {n.href && (
                      <Link
                        href={n.href}
                        onClick={() => markRead(n.id)}
                        className="text-[11px] font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        {n.ctaLabel ?? "Open"} →
                      </Link>
                    )}
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => markRead(n.id)}
                        className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => remove(n.id)}
                  aria-label={`Dismiss ${n.title}`}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-300 hover:bg-slate-800/70 transition-colors shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function PreferencesPanel() {
  const { preferences, updatePreference } = useNotifications();
  const [testResult, setTestResult] = useState<{ category: NotificationCategory; ok: boolean } | null>(null);

  const sendTest = (category: NotificationCategory) => {
    const created = notificationService.push(SAMPLE_NOTIFICATIONS[category]);
    setTestResult({ category, ok: created !== null });
    setTimeout(() => setTestResult(null), 3500);
  };

  return (
    <div className="space-y-4">
      {CATEGORY_ORDER.map((category) => {
        const meta = CATEGORY_META[category];
        const pref = preferences[category];
        return (
          <section
            key={category}
            aria-labelledby={`pref-${category}`}
            className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${meta.iconWrap}`}
              >
                {meta.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h2 id={`pref-${category}`} className="text-sm font-bold text-white">
                  {meta.label}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{meta.description}</p>
              </div>
              <Switch
                checked={pref.enabled}
                onChange={(next) => updatePreference(category, { enabled: next })}
                label={`${meta.label} notifications`}
              />
            </div>

            <div
              className={`flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-slate-800/80 transition-opacity ${
                pref.enabled ? "opacity-100" : "opacity-40"
              }`}
            >
              <span className="text-[10px] uppercase font-mono text-slate-500">Also deliver via</span>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pref.email}
                  disabled={!pref.enabled}
                  onChange={(e) => updatePreference(category, { email: e.target.checked })}
                  className="accent-cyan-500"
                />
                Email
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pref.push}
                  disabled={!pref.enabled}
                  onChange={(e) => updatePreference(category, { push: e.target.checked })}
                  className="accent-cyan-500"
                />
                Push
              </label>

              <div className="ml-auto flex items-center gap-3">
                {testResult?.category === category && (
                  <span
                    role="status"
                    className={`text-[11px] font-mono ${testResult.ok ? "text-emerald-400" : "text-amber-300"}`}
                  >
                    {testResult.ok ? "✓ Sent to your inbox" : "Turn this category on first"}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => sendTest(category)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
                >
                  Send test
                </button>
              </div>
            </div>
          </section>
        );
      })}

      <p className="text-[11px] font-mono text-slate-500 leading-relaxed px-1">
        In-app notifications are always shown for enabled categories. Email and push choices are saved
        as preferences on this device.
      </p>
    </div>
  );
}

function NotificationsContent() {
  const { isInitialized, unreadCount } = useNotifications();
  const [tab, setTab] = useState<Tab>("inbox");

  if (!isInitialized) {
    return (
      <div className="py-20 flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-cyan-400">Loading notifications...</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "inbox", label: unreadCount > 0 ? `Inbox (${unreadCount})` : "Inbox" },
    { id: "preferences", label: "Preferences" },
  ];

  return (
    <>
      <div className="flex gap-1 p-1 rounded-2xl bg-slate-900/60 border border-slate-800 w-fit" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-xl text-xs font-mono transition-all ${
              tab === t.id
                ? "bg-slate-800 text-white font-bold shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "inbox" ? <InboxPanel /> : <PreferencesPanel />}
    </>
  );
}

export function NotificationsPageClient() {
  return (
    <AccountShell
      title="Notifications"
      subtitle="Stay on top of order updates, promotions and new phone launches — and choose what you hear about."
    >
      <NotificationsContent />
    </AccountShell>
  );
}

export default NotificationsPageClient;
