"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useNotifications } from "@/context/NotificationContext";
import { formatTimeAgo } from "@/services/notification.service";
import { ROUTES } from "@/routes";
import { CATEGORY_META } from "./categoryMeta";

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const latest = notifications.slice(0, 5);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="relative flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 bg-slate-900/60 transition-all focus:outline-none"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-black text-white shadow-md shadow-indigo-500/40">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-xl ring-1 ring-black/40 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80">
            <h2 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {latest.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-slate-500 font-mono">
              You&apos;re all caught up.
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-auto divide-y divide-slate-800/60">
              {latest.map((n) => {
                const meta = CATEGORY_META[n.category];
                const content = (
                  <div className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors">
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${meta.iconWrap}`}
                    >
                      {meta.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-xs truncate ${
                            n.read ? "text-slate-300 font-medium" : "text-white font-bold"
                          }`}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-1">
                        {formatTimeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.href ? (
                      <Link
                        href={n.href}
                        onClick={() => {
                          markRead(n.id);
                          setIsOpen(false);
                        }}
                        className="block"
                      >
                        {content}
                      </Link>
                    ) : (
                      <button type="button" onClick={() => markRead(n.id)} className="block w-full text-left">
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href={ROUTES.ACCOUNT.NOTIFICATIONS}
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-center text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/50 border-t border-slate-800/80 transition-colors"
          >
            View all &amp; manage preferences
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
