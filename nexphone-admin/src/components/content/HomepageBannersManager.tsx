"use client";

import type { HomepageBanner } from "@/types/content";
import { cn } from "@/utils/cn";

interface HomepageBannersManagerProps {
  readonly banners: HomepageBanner[];
  readonly onEdit: (banner: HomepageBanner) => void;
  readonly onDelete: (banner: HomepageBanner) => void;
  readonly onToggleStatus: (banner: HomepageBanner) => void;
  readonly onMoveOrder: (banner: HomepageBanner, direction: "up" | "down") => void;
  readonly onNewBanner: () => void;
}

export function HomepageBannersManager({
  banners,
  onEdit,
  onDelete,
  onToggleStatus,
  onMoveOrder,
  onNewBanner,
}: HomepageBannersManagerProps) {
  const sorted = [...banners].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Homepage Hero Banners & Slider
          </h2>
          <p className="text-xs text-slate-400">
            Control visual slides, promotional taglines, call-to-action buttons, and order sequencing on the store home page.
          </p>
        </div>
        <button
          type="button"
          onClick={onNewBanner}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm"
        >
          <span>+ Add Hero Slide</span>
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <p className="text-sm font-semibold text-slate-300">No Homepage Banners Configured</p>
          <p className="text-xs text-slate-500 mt-1">Create your first homepage slide banner to welcome customers.</p>
          <button
            type="button"
            onClick={onNewBanner}
            className="mt-3 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white"
          >
            Create Slide Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sorted.map((banner, index) => {
            const isFirst = index === 0;
            const isLast = index === sorted.length - 1;

            return (
              <div
                key={banner.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 backdrop-blur-xl shadow-xl transition-all hover:border-slate-700"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Banner Preview Thumbnail & Info */}
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    {/* Visual Slide Mockup Box */}
                    <div className="relative h-24 w-36 sm:h-28 sm:w-48 shrink-0 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950 shadow-md">
                      {/* Background Image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Gradient Tint */}
                      <div className={cn("absolute inset-0 bg-gradient-to-r", banner.gradientOverlay)} />
                      {/* Micro content preview */}
                      <div className="absolute inset-0 p-2 flex flex-col justify-between text-white">
                        <span className="self-start rounded bg-indigo-600/80 px-1 py-0.2 text-[8px] font-bold uppercase tracking-wider">
                          {banner.badge}
                        </span>
                        <div className="truncate">
                          <p className="text-[10px] font-bold truncate leading-tight">{banner.title}</p>
                          <p className="text-[8px] text-slate-300 truncate">{banner.subtitle}</p>
                        </div>
                      </div>
                    </div>

                    {/* Details Text */}
                    <div className="flex flex-col space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                          #{banner.displayOrder}
                        </span>
                        <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {banner.title}
                        </h3>
                        <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 ring-1 ring-indigo-500/40">
                          {banner.badge}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            banner.status === "active" && "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
                            banner.status === "scheduled" && "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
                            banner.status === "draft" && "bg-amber-500/15 text-amber-400 border border-amber-500/30",
                            banner.status === "hidden" && "bg-slate-800 text-slate-400 border border-slate-700"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              banner.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-slate-400"
                            )}
                          />
                          <span className="capitalize">{banner.status}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 max-w-xl line-clamp-2">
                        {banner.subtitle}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span>
                          CTA: <strong className="text-white font-medium">&ldquo;{banner.primaryCta.label}&rdquo;</strong> → {banner.primaryCta.url}
                        </span>
                        <span className="text-slate-600">&bull;</span>
                        <span>Impressions: <strong className="text-slate-200">{banner.impressions.toLocaleString()}</strong></span>
                        <span className="text-slate-600">&bull;</span>
                        <span>Clicks: <strong className="text-slate-200">{banner.clicks.toLocaleString()}</strong></span>
                        <span className="text-slate-600">&bull;</span>
                        <span>CTR: <strong className="text-indigo-400">{banner.ctr}%</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Reordering */}
                  <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                    {/* Reorder Up / Down */}
                    <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
                      <button
                        type="button"
                        onClick={() => onMoveOrder(banner, "up")}
                        disabled={isFirst}
                        title="Move slide earlier"
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveOrder(banner, "down")}
                        disabled={isLast}
                        title="Move slide later"
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                    </div>

                    {/* Toggle Status */}
                    <button
                      type="button"
                      onClick={() => onToggleStatus(banner)}
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                        banner.status === "active"
                          ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                          : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                      )}
                    >
                      {banner.status === "active" ? "Pause" : "Activate"}
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => onEdit(banner)}
                      title="Edit banner parameters"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:border-indigo-500 hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                      </svg>
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => onDelete(banner)}
                      title="Delete banner slide"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:border-rose-500 hover:bg-rose-600 hover:text-white transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
