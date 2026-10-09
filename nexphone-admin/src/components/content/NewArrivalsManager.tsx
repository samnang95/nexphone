"use client";

import type { NewArrival } from "@/types/content";
import { cn } from "@/utils/cn";

interface NewArrivalsManagerProps {
  readonly newArrivals: NewArrival[];
  readonly onEdit: (item: NewArrival) => void;
  readonly onDelete: (item: NewArrival) => void;
  readonly onToggleStatus: (item: NewArrival) => void;
  readonly onMoveOrder: (item: NewArrival, direction: "up" | "down") => void;
  readonly onAddNewArrival: () => void;
}

export function NewArrivalsManager({
  newArrivals,
  onEdit,
  onDelete,
  onToggleStatus,
  onMoveOrder,
  onAddNewArrival,
}: NewArrivalsManagerProps) {
  const sorted = [...newArrivals].sort((a, b) => a.displayOrder - b.displayOrder);

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(d);
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            New Arrivals & Releases
          </h2>
          <p className="text-xs text-slate-400">
            Showcase freshly dropped hardware, upcoming pre-orders, and new seasonal colorways.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddNewArrival}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm"
        >
          <span>+ Add New Arrival</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sorted.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === sorted.length - 1;

          return (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-xl shadow-xl transition-all hover:border-slate-700 flex flex-col justify-between"
            >
              <div>
                {/* Image & Tag Overlay */}
                <div className="relative h-40 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="rounded-md bg-indigo-600/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      {item.tag}
                    </span>
                    {item.isPreOrder && (
                      <span className="rounded-md bg-cyan-600/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                        Pre-Order
                      </span>
                    )}
                  </div>
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/75 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                    Slot #{item.displayOrder}
                  </span>
                </div>

                {/* Details */}
                <h3 className="text-sm font-bold text-white line-clamp-1">
                  {item.productName}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {item.productSubtitle}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    ${item.productPrice.toLocaleString()} USD
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Released: {formatDate(item.releaseDate)}
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onToggleStatus(item)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border transition-colors",
                    item.status === "active"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", item.status === "active" ? "bg-emerald-400" : "bg-slate-400")} />
                  <span>{item.status === "active" ? "Active" : "Hidden"}</span>
                </button>

                <div className="flex items-center gap-1">
                  {/* Order control */}
                  <button
                    type="button"
                    onClick={() => onMoveOrder(item, "up")}
                    disabled={isFirst}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveOrder(item, "down")}
                    disabled={isLast}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="rounded p-1 text-slate-400 hover:text-white"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="rounded p-1 text-slate-400 hover:text-rose-400"
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
    </div>
  );
}
