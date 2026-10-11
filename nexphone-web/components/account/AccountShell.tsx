"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/routes";

interface AccountShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: "Profile", href: ROUTES.ACCOUNT.PROFILE, hint: "Personal details" },
  { label: "Addresses", href: ROUTES.ACCOUNT.ADDRESSES, hint: "Delivery destinations" },
  { label: "Security", href: ROUTES.ACCOUNT.SECURITY, hint: "Password & sessions" },
  { label: "Notifications", href: ROUTES.ACCOUNT.NOTIFICATIONS, hint: "Alerts & preferences" },
  { label: "Orders", href: ROUTES.ORDERS.ROOT, hint: "History & tracking" },
] as const;

const TIER_STYLES: Record<string, string> = {
  VIP: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  Enterprise: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
  Pro: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
  Regular: "bg-slate-500/10 border-slate-500/30 text-slate-300",
};

export function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("") || "NX"
  );
}

export function AccountShell({ title, subtitle, children }: AccountShellProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-cyan-400">Verifying NexID session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-white">Sign in to manage your account</h1>
        <p className="mt-2 text-xs text-slate-400 max-w-sm">
          Your profile, saved addresses and security settings are available after signing in with NexID.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href={ROUTES.AUTH.LOGIN}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20"
          >
            Sign In
          </Link>
          <Link
            href={ROUTES.AUTH.REGISTER}
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors"
          >
            Create NexID
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 pb-28">
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href={ROUTES.HOME} className="hover:text-white transition-colors">
            Hardware Enclave
          </Link>
          <span className="text-slate-600">/</span>
          <span>Account</span>
          <span className="text-slate-600">/</span>
          <span className="text-cyan-400 font-semibold">{title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>NexID · {user.customerNumber}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{title}</h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-6">
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white font-black flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-[11px] font-mono text-slate-400 truncate">{user.email}</p>
                <span
                  className={`mt-1 inline-block px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase ${
                    TIER_STYLES[user.tier] ?? TIER_STYLES.Regular
                  }`}
                >
                  {user.tier}
                </span>
              </div>
            </div>

            <nav
              aria-label="Account sections"
              className="p-2 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex lg:flex-col gap-1 overflow-x-auto"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex-1 lg:flex-none px-4 py-2.5 rounded-2xl text-xs transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="block font-semibold">{item.label}</span>
                    <span
                      className={`hidden lg:block text-[10px] font-mono ${
                        isActive ? "text-slate-900/70" : "text-slate-500"
                      }`}
                    >
                      {item.hint}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => logout()}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-xs font-mono transition-colors"
            >
              Sign out
            </button>
          </aside>

          <main className="lg:col-span-9 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default AccountShell;
