"use client";

import { useState } from "react";
import type { Brand } from "@/types/brand";
import { cn } from "@/utils/cn";

interface BrandCardProps {
  readonly brand: Brand;
  readonly onEdit: (brand: Brand) => void;
  readonly onDelete: (brand: Brand) => void;
  readonly onView: (brand: Brand) => void;
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

export function BrandCard({ brand, onEdit, onDelete, onView }: BrandCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const statusColors = {
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    inactive: "bg-slate-700/30 text-slate-400 border-slate-700/50",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  }[brand.status];

  const tierColors = {
    Flagship: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    Enterprise: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    "OEM Partner": "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    Strategic: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  }[brand.tier];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-950/20"
    >
      {/* Top Accent Glow */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl transition-opacity duration-500"
        style={{
          backgroundColor: brand.accentColor,
          opacity: isHovered ? 0.25 : 0.08,
        }}
      />

      {/* Main Content Area */}
      <div>
        {/* Header: Icon / Avatar + Name + Code + Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-bold text-white shadow-md transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundColor: `${brand.accentColor}20`,
                borderColor: `${brand.accentColor}50`,
                color: brand.accentColor,
              }}
            >
              <BrandIconRenderer icon={brand.logoIcon} className="h-6 w-6" />
              {brand.isFeatured && (
                <span
                  title="Featured Flagship Partner"
                  className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] text-slate-950 font-black shadow"
                >
                  ★
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-indigo-200 transition-colors">
                  {brand.name}
                </h3>
                <span className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-300 border border-slate-700/60">
                  {brand.code}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>{brand.headquarters}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 font-medium">{brand.country}</span>
              </p>
            </div>
          </div>

          {/* Status & Tier */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] font-medium capitalize tracking-wide shadow-sm",
                statusColors
              )}
            >
              {brand.status}
            </span>
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide",
                tierColors
              )}
            >
              {brand.tier}
            </span>
          </div>
        </div>

        {/* Bio / Description */}
        <p className="mt-3.5 text-xs leading-relaxed text-slate-400 line-clamp-2">
          {brand.description}
        </p>

        {/* Metrics Grid */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-y border-slate-800/80 py-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Models</span>
            <span className="text-sm font-semibold text-slate-100 mt-0.5">
              {brand.deviceCount} {brand.deviceCount === 1 ? "device" : "devices"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Market Share</span>
            <span className="text-sm font-semibold text-slate-100 mt-0.5">
              {brand.marketShare}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Est. Year</span>
            <span className="text-sm font-semibold text-slate-100 mt-0.5">
              {brand.foundedYear}
            </span>
          </div>
        </div>

        {/* Website & Support Email Info */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors truncate max-w-[190px]"
            title={brand.website}
          >
            <svg className="h-3.5 w-3.5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            <span className="truncate">{brand.website.replace(/^https?:\/\//, "")}</span>
          </a>

          <span className="text-[11px] text-slate-500 font-mono">
            ★ {brand.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
        <button
          onClick={() => onView(brand)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-indigo-500/40 hover:bg-slate-800 hover:text-white"
        >
          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <span>View</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(brand)}
            className="flex items-center gap-1 rounded-lg border border-slate-700/60 bg-slate-800/40 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            title="Edit Brand"
          >
            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            <span>Edit</span>
          </button>

          <button
            onClick={() => onDelete(brand)}
            className="flex items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/40 p-1.5 text-slate-400 transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
            title="Delete Brand"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
