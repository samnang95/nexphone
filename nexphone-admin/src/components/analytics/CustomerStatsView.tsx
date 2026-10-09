"use client";

import type { CustomerStatsSummary } from "@/types/analytics";

interface CustomerStatsViewProps {
  data: CustomerStatsSummary;
  onExportCsv: () => void;
}

export function CustomerStatsView({ data, onExportCsv }: CustomerStatsViewProps) {
  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Customers */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Customer Base
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {data.totalCustomers.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-400">+{data.newSignupsThisMonth} new</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {data.activeBuyersCount.toLocaleString()} verified buyers with active devices
          </p>
        </div>

        {/* Returning Customer Rate */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Returning Buyer Rate
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400 ring-1 ring-cyan-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-cyan-400">
              {data.returningCustomerRate}%
            </span>
            <span className="text-xs text-slate-400">Retention</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Repeat device upgrade or fleet add-on cycle
          </p>
        </div>

        {/* Average Customer Lifetime Value (LTV) */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Average Lifetime Value (LTV)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 ring-1 ring-purple-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ${data.averageLTV.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-400">↑ +8.5%</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Average total commercial spend per account
          </p>
        </div>

        {/* Churn Rate */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Account Churn Rate
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-400">
              {data.churnRatePercent}%
            </span>
            <span className="text-xs text-slate-400">Ultra-low</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Industry telecom fleet average: ~4.2%
          </p>
        </div>
      </div>

      {/* Grid: Tier Distribution & Top Spenders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tier Distribution Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-lg space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>👑</span>
              <span>Customer Tier Segmentation</span>
            </h3>
            <p className="text-xs text-slate-400">
              Distribution across enterprise & consumer tiers
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {data.tierDistribution.map((tier, i) => {
              const colors = [
                { bg: "bg-amber-500", text: "text-amber-400" },
                { bg: "bg-indigo-500", text: "text-indigo-400" },
                { bg: "bg-cyan-500", text: "text-cyan-400" },
                { bg: "bg-slate-400", text: "text-slate-300" },
              ];
              const c = colors[i % colors.length]!;
              return (
                <div key={tier.tier} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{tier.tier}</span>
                    <span className={`font-mono font-bold ${c.text}`}>
                      {tier.sharePercent}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.bg}`}
                      style={{ width: `${tier.sharePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>{tier.count.toLocaleString()} members</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Spenders Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg backdrop-blur-xl lg:col-span-2 overflow-hidden flex flex-col">
          <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-3.5 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Top Spending Enterprise & VIP Accounts
              </h3>
              <p className="text-[11px] text-slate-400">
                Highest lifetime commercial contribution
              </p>
            </div>
            <button
              type="button"
              onClick={onExportCsv}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Export Top Spenders →
            </button>
          </div>

          <div className="overflow-x-auto text-xs flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Account / Client</th>
                  <th className="py-3 px-4 text-center">Tier</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4 text-right">Total Spent</th>
                  <th className="py-3 px-4 text-right">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {data.topSpenders.map((spender) => (
                  <tr key={spender.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-semibold text-white block">{spender.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {spender.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          spender.tier === "VIP"
                            ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                            : spender.tier === "Enterprise"
                            ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30"
                            : "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30"
                        }`}
                      >
                        {spender.tier}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-300">
                      {spender.ordersCount}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      ${spender.totalSpent.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                      {spender.location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
