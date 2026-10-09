"use client";

import type { PromotionalSection } from "@/types/content";
import { cn } from "@/utils/cn";

interface PromotionalSectionsManagerProps {
  readonly sections: PromotionalSection[];
  readonly onEdit: (section: PromotionalSection) => void;
  readonly onDelete: (section: PromotionalSection) => void;
  readonly onToggleStatus: (section: PromotionalSection) => void;
  readonly onMoveOrder: (section: PromotionalSection, direction: "up" | "down") => void;
  readonly onAddSection: () => void;
}

export function PromotionalSectionsManager({
  sections,
  onEdit,
  onDelete,
  onToggleStatus,
  onMoveOrder,
  onAddSection,
}: PromotionalSectionsManagerProps) {
  const sorted = [...sections].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Promotional Sections & Content Blocks
          </h2>
          <p className="text-xs text-slate-400">
            Configure dynamic homepage marketing modules, technology feature grids, trade-in blocks, and corporate financing callouts.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddSection}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm"
        >
          <span>+ Add Promo Section</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sorted.map((sec, index) => {
          const isFirst = index === 0;
          const isLast = index === sorted.length - 1;

          return (
            <div
              key={sec.id}
              className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-xl shadow-xl transition-all hover:border-slate-700"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                      #{sec.displayOrder}
                    </span>
                    <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300 ring-1 ring-indigo-500/40">
                      {sec.type.replace(/_/g, " ")}
                    </span>
                    <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                      key: {sec.sectionKey}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(sec)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border transition-colors",
                        sec.status === "active"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", sec.status === "active" ? "bg-emerald-400" : "bg-slate-400")} />
                      <span>{sec.status === "active" ? "Active" : "Hidden"}</span>
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">
                    {sec.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-300 max-w-2xl">
                    {sec.subtitle}
                  </p>

                  {/* Features list if present */}
                  {sec.features && sec.features.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                      {sec.features.map((feat, fIdx) => (
                        <div key={`feat-${fIdx}`} className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-2.5">
                          <span className="text-xs font-semibold text-slate-200 block truncate">
                            {feat.title}
                          </span>
                          <span className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                            {feat.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 text-[11px] text-indigo-400 font-medium">
                    CTA Action: &ldquo;{sec.ctaLabel}&rdquo; → {sec.ctaUrl}
                  </div>
                </div>

                {/* Actions & Reordering */}
                <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                  <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
                    <button
                      type="button"
                      onClick={() => onMoveOrder(sec, "up")}
                      disabled={isFirst}
                      title="Move up"
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveOrder(sec, "down")}
                      disabled={isLast}
                      title="Move down"
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onEdit(sec)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(sec)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:border-rose-500 hover:bg-rose-600 hover:text-white transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
