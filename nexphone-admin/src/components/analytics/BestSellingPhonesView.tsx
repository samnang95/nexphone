"use client";

import { useState, useMemo } from "react";
import type { BestSellingPhoneItem } from "@/types/analytics";

interface BestSellingPhonesViewProps {
  phones: BestSellingPhoneItem[];
  onExportCsv: () => void;
}

export function BestSellingPhonesView({ phones, onExportCsv }: BestSellingPhonesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"units" | "revenue" | "rating" | "stock">("revenue");

  const filteredPhones = useMemo(() => {
    return phones
      .filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.modelCode.toLowerCase().includes(q) ||
          p.brandName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "units") return b.unitsSold - a.unitsSold;
        if (sortBy === "revenue") return b.revenue - a.revenue;
        if (sortBy === "rating") return b.averageRating - a.averageRating;
        if (sortBy === "stock") return b.stockRemaining - a.stockRemaining;
        return 0;
      });
  }, [phones, searchQuery, sortBy]);

  const maxUnits = Math.max(...phones.map((p) => p.unitsSold), 1);
  const topThree = phones.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top 3 Leaderboard Podium Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {topThree.map((phone, i) => {
          const podiums = [
            {
              badge: "🥇 Rank #1",
              border: "border-amber-500/40 bg-gradient-to-b from-amber-950/30 to-slate-900/60",
              accent: "text-amber-400",
              ring: "ring-amber-500/30",
            },
            {
              badge: "🥈 Rank #2",
              border: "border-slate-400/40 bg-gradient-to-b from-slate-800/30 to-slate-900/60",
              accent: "text-slate-300",
              ring: "ring-slate-400/30",
            },
            {
              badge: "🥉 Rank #3",
              border: "border-amber-700/40 bg-gradient-to-b from-amber-950/20 to-slate-900/60",
              accent: "text-amber-600",
              ring: "ring-amber-700/30",
            },
          ];
          const p = podiums[i]!;
          return (
            <div
              key={phone.id}
              className={`relative overflow-hidden rounded-2xl border p-5 shadow-lg backdrop-blur-xl ${p.border}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-black uppercase tracking-wider ${p.accent}`}>
                  {p.badge}
                </span>
                <span className="rounded-full bg-slate-950/80 px-2 py-0.5 text-[11px] font-mono text-emerald-400">
                  ★ {phone.averageRating}
                </span>
              </div>

              <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                {phone.name}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mb-3">
                {phone.modelCode} • {phone.brandName}
              </p>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Units Sold
                  </span>
                  <span className="font-bold text-white text-sm">
                    {phone.unitsSold.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Revenue
                  </span>
                  <span className="font-bold text-indigo-300 text-sm font-mono">
                    ${(phone.revenue / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search flagship model, SKU, or series..."
            className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-3.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors hover:border-slate-700"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "units" | "revenue" | "rating" | "stock")
              }
              className="h-9 appearance-none rounded-lg border border-slate-800 bg-slate-950/80 pl-3 pr-8 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="revenue">Sort: Highest Revenue</option>
              <option value="units">Sort: Units Sold</option>
              <option value="rating">Sort: Top Rated</option>
              <option value="stock">Sort: Stock Level</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          <button
            type="button"
            onClick={onExportCsv}
            className="h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Export Table</span>
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Flagship Model</th>
                <th className="py-3 px-4">Units Dispatched</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-right">Avg Price (ASP)</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-center">Return Rate</th>
                <th className="py-3 px-4 text-center">Rating</th>
                <th className="py-3 px-4 text-right">Market Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPhones.map((phone, index) => {
                const unitsPercent = Math.round((phone.unitsSold / maxUnits) * 100);
                return (
                  <tr key={phone.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-white block text-xs">{phone.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {phone.modelCode} • {phone.brandName}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 min-w-[140px]">
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono">
                          <span className="font-semibold text-white">
                            {phone.unitsSold.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">{unitsPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${unitsPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      ${phone.revenue.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      ${phone.averagePrice}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          phone.stockRemaining <= 30
                            ? "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30"
                            : phone.stockRemaining <= 100
                            ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                        }`}
                      >
                        {phone.stockRemaining} units
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <span
                        className={
                          phone.returnRatePercent <= 1.0 ? "text-emerald-400" : "text-amber-400"
                        }
                      >
                        {phone.returnRatePercent}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-amber-400 font-bold">
                      ★ {phone.averageRating}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-indigo-300">
                      {phone.marketSharePercent}%
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
