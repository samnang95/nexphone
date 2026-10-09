"use client";

import type { BestSeller } from "@/types/content";
import { cn } from "@/utils/cn";

interface BestSellersManagerProps {
  readonly bestSellers: BestSeller[];
  readonly onEdit: (item: BestSeller) => void;
  readonly onDelete: (item: BestSeller) => void;
  readonly onToggleStatus: (item: BestSeller) => void;
  readonly onMoveRank: (item: BestSeller, direction: "up" | "down") => void;
  readonly onAddBestSeller: () => void;
}

export function BestSellersManager({
  bestSellers,
  onEdit,
  onDelete,
  onToggleStatus,
  onMoveRank,
  onAddBestSeller,
}: BestSellersManagerProps) {
  const sorted = [...bestSellers].sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Best Sellers Leaderboard
          </h2>
          <p className="text-xs text-slate-400">
            Ranked commercial phones with highest volume adoption, client satisfaction, and monthly order momentum.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddBestSeller}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm"
        >
          <span>+ Add Best Seller</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="w-full">
          <table className="w-full text-left text-xs table-auto">
            <thead className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-3 sm:px-4">Rank & Phone Model</th>
                <th className="py-3 px-3">Units Sold</th>
                <th className="py-3 px-3">Satisfaction</th>
                <th className="py-3 px-3">Monthly Growth</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sorted.map((item, index) => {
                const isFirst = index === 0;
                const isLast = index === sorted.length - 1;

                return (
                  <tr key={item.id} className="group hover:bg-slate-800/40 transition-colors">
                    {/* Rank & Model */}
                    <td className="py-3.5 px-3 sm:px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ring-1",
                            item.rank === 1 && "bg-amber-500/20 text-amber-300 ring-amber-500/40",
                            item.rank === 2 && "bg-slate-300/20 text-slate-200 ring-slate-400/40",
                            item.rank === 3 && "bg-orange-500/20 text-orange-300 ring-orange-500/40",
                            item.rank > 3 && "bg-slate-800 text-slate-400 ring-slate-700"
                          )}
                        >
                          #{item.rank}
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="h-10 w-10 shrink-0 rounded-lg object-cover bg-slate-950 border border-slate-800"
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                              {item.productName}
                            </span>
                            <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-300 shrink-0">
                              {item.badge}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 truncate">
                            {item.productSubtitle} &bull; ${item.productPrice.toLocaleString()} USD
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Units Sold */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-xs">
                          {item.unitsSold.toLocaleString()} units
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Total commercial purchases
                        </span>
                      </div>
                    </td>

                    {/* Satisfaction */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                        <span>★ {item.satisfactionRate}%</span>
                        <span className="text-[10px] text-slate-400 font-normal">positive</span>
                      </div>
                    </td>

                    {/* Monthly Growth */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                        +{item.monthlyGrowth}%
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(item)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border transition-colors cursor-pointer",
                          item.status === "active"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", item.status === "active" ? "bg-emerald-400" : "bg-slate-400")} />
                        <span>{item.status === "active" ? "Active" : "Hidden"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 sm:px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Move Rank */}
                        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
                          <button
                            type="button"
                            onClick={() => onMoveRank(item, "up")}
                            disabled={isFirst}
                            title="Promote rank"
                            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveRank(item, "down")}
                            disabled={isLast}
                            title="Demote rank"
                            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
