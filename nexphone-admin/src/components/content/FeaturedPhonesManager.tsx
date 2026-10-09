"use client";

import type { FeaturedPhone } from "@/types/content";
import { cn } from "@/utils/cn";

interface FeaturedPhonesManagerProps {
  readonly featuredPhones: FeaturedPhone[];
  readonly onEdit: (phone: FeaturedPhone) => void;
  readonly onDelete: (phone: FeaturedPhone) => void;
  readonly onToggleStatus: (phone: FeaturedPhone) => void;
  readonly onMoveOrder: (phone: FeaturedPhone, direction: "up" | "down") => void;
  readonly onAddPhone: () => void;
}

export function FeaturedPhonesManager({
  featuredPhones,
  onEdit,
  onDelete,
  onToggleStatus,
  onMoveOrder,
  onAddPhone,
}: FeaturedPhonesManagerProps) {
  const sorted = [...featuredPhones].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Featured Phones Showcase
          </h2>
          <p className="text-xs text-slate-400">
            Pin and sequence flagship phone highlights on the storefront home. These products receive prime homepage real estate.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddPhone}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm"
        >
          <span>+ Add Featured Phone</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === sorted.length - 1;

          return (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 backdrop-blur-xl shadow-xl transition-all hover:border-slate-700 flex flex-col justify-between"
            >
              <div>
                {/* Header Slot & Badges */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600/20 text-xs font-bold text-indigo-300 ring-1 ring-indigo-500/30">
                      #{item.displayOrder}
                    </span>
                    <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300 ring-1 ring-purple-500/40">
                      {item.badge}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.series}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Reorder Buttons */}
                    <button
                      type="button"
                      onClick={() => onMoveOrder(item, "up")}
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
                      onClick={() => onMoveOrder(item, "down")}
                      disabled={isLast}
                      title="Move down"
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover bg-slate-950 border border-slate-800"
                  />
                  <div className="flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {item.productName}
                    </h3>
                    <p className="text-xs text-indigo-300 font-medium">
                      ${item.productPrice.toLocaleString()} USD
                    </p>
                    <p className="mt-1 text-xs text-slate-300 italic line-clamp-2">
                      &ldquo;{item.headline}&rdquo;
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.highlightSpecs.map((spec, sIdx) => (
                        <span
                          key={`spec-${sIdx}`}
                          className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Controls */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => onToggleStatus(item)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border transition-colors",
                    item.status === "active"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", item.status === "active" ? "bg-emerald-400" : "bg-slate-400")} />
                  <span>{item.status === "active" ? "Live on Store" : "Hidden"}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="rounded-lg border border-slate-700 bg-slate-800 p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
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
