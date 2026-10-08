"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { appConfig } from "@/config/env";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_NAV_SECTIONS, ROUTES } from "@/routes";
import { cn } from "@/utils/cn";

function NavIcon({ name, className }: { name?: string; className?: string }) {
  switch (name) {
    case "layout-dashboard":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
      );
    case "smartphone":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
      );
    case "activity":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12h3.75l2.25-6 4.5 12 2.25-6H21.75" />
        </svg>
      );
    case "cloud-upload":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
        </svg>
      );
    case "bar-chart-3":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      );
    case "user":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      );
    case "settings":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      );
  }
}

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileDrawerOpen(false);
        setDropdownOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen]);

  const flavorDotColor = appConfig.isProd
    ? "bg-emerald-400"
    : appConfig.isStaging
    ? "bg-amber-400"
    : "bg-indigo-400";

  const flavorTextColor = appConfig.isProd
    ? "text-emerald-400"
    : appConfig.isStaging
    ? "text-amber-400"
    : "text-indigo-400";

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "AD";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/90 px-3 sm:px-6 backdrop-blur-md">
        {/* Left Side: Hamburger (Mobile) + Title / Brand */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white md:hidden transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Open mobile navigation drawer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Mobile Brand Link */}
          <Link href="/" className="flex items-center gap-2 md:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm ring-1 ring-indigo-400/20">
              NX
            </div>
            <span className="text-sm font-bold tracking-tight text-white truncate">NexPhone</span>
          </Link>

          {/* Desktop Title & Cluster Health */}
          <div className="hidden md:flex items-center gap-3">
            <h2 className="text-sm font-medium text-slate-300">{appConfig.appName}</h2>
            <Badge variant="success">Cluster Healthy</Badge>
          </div>
        </div>

        {/* Right Side: Flavor Pill + Region + User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Flavor indicator badge */}
          <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-2 sm:px-3 py-1 sm:py-1.5 text-xs">
            <span className={cn("h-2 w-2 rounded-full animate-pulse", flavorDotColor)} />
            <span className="hidden sm:inline text-slate-400">Flavor:</span>
            <span className={cn("font-bold uppercase tracking-wider text-[11px] sm:text-xs", flavorTextColor)}>
              {appConfig.flavor}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Region: us-east-1</span>
          </div>

          {/* User Profile Menu Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 sm:gap-2.5 rounded-lg border border-slate-800 bg-slate-900/70 p-1 sm:p-1.5 sm:pr-2.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-700 hover:bg-slate-800/80 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div
                suppressHydrationWarning
                className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white shadow-sm ring-1 ring-indigo-400/30"
              >
                {initials}
              </div>
              <span
                suppressHydrationWarning
                className="hidden sm:inline max-w-[100px] truncate text-slate-300"
              >
                {user?.name || "Admin"}
              </span>
              <svg
                className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", dropdownOpen && "rotate-180")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-800/80 mb-1" suppressHydrationWarning>
                  <p suppressHydrationWarning className="text-xs font-semibold text-white truncate">
                    {user?.name || "System Admin"}
                  </p>
                  <p suppressHydrationWarning className="text-[11px] text-slate-400 font-mono truncate">
                    {user?.email || "admin@nexphone.io"}
                  </p>
                </div>

                <Link
                  href={ROUTES.PROFILE}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <span>Admin Profile</span>
                </Link>

                <Link
                  href={ROUTES.SETTINGS}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  <span>Cluster Settings</span>
                </Link>

                <div className="my-1 border-t border-slate-800/80" />

                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sliding Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content - locked height, non-scrollable */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] h-full bg-slate-950 border-r border-slate-800 p-4 flex flex-col justify-between shadow-2xl z-10 overflow-hidden select-none overscroll-none touch-none animate-in slide-in-from-left duration-200">
            {/* Drawer Brand & Close Button */}
            <div className="flex h-12 items-center justify-between px-2 shrink-0">
              <Link
                href="/"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex items-center gap-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-sm ring-1 ring-indigo-400/20">
                  NX
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight text-white">NexPhone</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Admin Console
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
                aria-label="Close navigation drawer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation items - non-scrollable */}
            <div className="mt-6 flex flex-1 flex-col gap-6 overflow-hidden px-1">
              {ADMIN_NAV_SECTIONS.map((section) => (
                <div key={section.title} className="flex flex-col gap-1">
                  <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {section.title}
                  </span>
                  <nav className="flex flex-col gap-0.5">
                    {section.items.map((item) => {
                      const isActive =
                        item.href === "/"
                          ? pathname === "/"
                          : pathname.startsWith(item.href);

                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => setMobileDrawerOpen(false)}
                          className={cn(
                            "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                            isActive
                              ? "bg-indigo-600/15 text-indigo-300 font-semibold ring-1 ring-indigo-500/30"
                              : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <NavIcon
                              name={item.iconName}
                              className={cn(
                                "h-4 w-4 transition-colors",
                                isActive
                                  ? "text-indigo-400"
                                  : "text-slate-500 group-hover:text-slate-300"
                              )}
                            />
                            <span>{item.title}</span>
                          </div>

                          {item.badge ? (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                                isActive
                                  ? "bg-indigo-500/20 text-indigo-300"
                                  : "bg-slate-800 text-slate-400"
                              )}
                            >
                              {item.badge}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            {/* Mobile Drawer User Footer */}
            <div className="border-t border-slate-800/80 pt-4 px-2">
              <div className="flex items-center justify-between rounded-lg p-1.5 transition-colors hover:bg-slate-900">
                <Link
                  href={ROUTES.PROFILE}
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-2.5 overflow-hidden flex-1 group"
                >
                  <div
                    suppressHydrationWarning
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-200 ring-1 ring-slate-700 group-hover:ring-indigo-500"
                  >
                    {initials}
                  </div>
                  <div className="flex flex-col overflow-hidden" suppressHydrationWarning>
                    <span
                      suppressHydrationWarning
                      className="truncate text-xs font-medium text-white group-hover:text-indigo-300"
                    >
                      {user?.name || "System Admin"}
                    </span>
                    <span
                      suppressHydrationWarning
                      className="truncate text-[10px] text-slate-400 font-mono"
                    >
                      {user?.email || "admin@nexphone.io"}
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    logout();
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-md"
                  aria-label="Logout"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
