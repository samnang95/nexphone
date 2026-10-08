"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { Brand } from "@/types/brand";
import { cn } from "@/utils/cn";

interface BrandDetailModalProps {
  readonly isOpen: boolean;
  readonly brand: Brand | null;
  readonly onClose: () => void;
  readonly onEdit: (brand: Brand) => void;
}

function BrandIconRenderer({ icon, className }: { icon?: string; className?: string }) {
  switch (icon) {
    case "sparkles":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
        </svg>
      );
    case "shield":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      );
    case "zap":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
        </svg>
      );
    case "cpu":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
        </svg>
      );
    case "gem":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      );
    case "globe":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871a3.375 3.375 0 0 0-3.375-3.375h-.379a3.375 3.375 0 0 0-3.375 3.375h-.871c-.622 0-1.125.504-1.125 1.125V18.75m10.5 0h-9" />
        </svg>
      );
  }
}

export function BrandDetailModal({
  isOpen,
  brand,
  onClose,
  onEdit,
}: BrandDetailModalProps) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  if (!isMounted || !isOpen || !brand) return null;

  const statusBadge = {
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    inactive: "bg-slate-700/30 text-slate-400 border-slate-700/50",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  }[brand.status];

  const tierBadge = {
    Flagship: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    Enterprise: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    "OEM Partner": "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    Strategic: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  }[brand.tier];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Accent Bar */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: brand.accentColor }}
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 p-6 bg-slate-900/90">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 font-bold shadow-lg"
              style={{
                backgroundColor: `${brand.accentColor}25`,
                borderColor: `${brand.accentColor}60`,
                color: brand.accentColor,
              }}
            >
              <BrandIconRenderer icon={brand.logoIcon} className="h-8 w-8" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {brand.name}
                </h2>
                <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {brand.code}
                </span>
                {brand.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/30 px-2 py-0.5 text-[10px] font-semibold">
                    ★ Featured
                  </span>
                )}
              </div>

              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                <span>{brand.headquarters}</span>
                <span>•</span>
                <span className="text-slate-200 font-medium">{brand.country}</span>
                <span>•</span>
                <span>Est. {brand.foundedYear}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize",
                statusBadge
              )}
            >
              {brand.status}
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Models In Fleet</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-white font-mono">{brand.deviceCount}</span>
                <span className="text-xs text-slate-400">phones</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Market Share</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-white font-mono">{brand.marketShare}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tier Level</span>
              <div className="mt-1">
                <span className={cn("inline-block rounded border px-2 py-0.5 text-xs font-semibold", tierBadge)}>
                  {brand.tier}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Partner Rating</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-amber-400 font-mono">★ {brand.rating.toFixed(1)}</span>
                <span className="text-xs text-slate-500">/ 5.0</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Hardware Profile & Capabilities
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {brand.description}
            </p>
          </div>

          {/* Contact & Technical Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 flex items-center justify-between">
              <span className="text-slate-400">Official Website</span>
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>{brand.website.replace(/^https?:\/\//, "")}</span>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 flex items-center justify-between">
              <span className="text-slate-400">Technical Support</span>
              <a
                href={`mailto:${brand.supportEmail}`}
                className="text-indigo-400 hover:underline font-mono"
              >
                {brand.supportEmail}
              </a>
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] text-slate-500">
            <span>Registered: {new Date(brand.createdAt).toLocaleDateString()}</span>
            <span>Last Updated: {new Date(brand.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/90 px-6 py-4">
          <Link
            href={`/products?search=${encodeURIComponent(brand.name.split(" ")[0] || "")}`}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-300 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
            <span>View Catalog Phones ({brand.deviceCount})</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(brand);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/60 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
              <span>Edit Brand</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
