"use client";

import type { RevenueReportSummary } from "@/types/analytics";

interface RevenueReportViewProps {
  data: RevenueReportSummary;
  onExportCsv: () => void;
}

export function RevenueReportView({ data, onExportCsv }: RevenueReportViewProps) {
  const maxGross = Math.max(...data.monthlyTimeseries.map((m) => m.gross), 1);

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Gross Commercial Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Gross Revenue (GMV)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/30">
              <span className="font-bold text-sm">$</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ${data.grossRevenue.toLocaleString()}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-400">
              ↑ +{data.momGrowthPercent}% MoM
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Before discount redemptions and returns
          </p>
        </div>

        {/* Net Operating Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Net Operating Revenue
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6H2.25m0 0H3m0 0h1.5m1.5 0h1.5m1.5 0h1.5m1.5 0h1.5m1.5 0h1.5m1.5 0h1.5m1.5 0h1.5m1.5 0h1.5m1.5 0h1.5m1.5 0h1.5m1.5 0h1.5m1.5 0h1.5m1.5 0h1.5m1.5 0h1.5m1.5 0h1.5" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-400">
              ${data.netRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400">Cleared</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Net collected funds deposited in treasury
          </p>
        </div>

        {/* Operating Margin */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Operating Profit Margin
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400 ring-1 ring-cyan-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-cyan-400">
              {data.profitMarginPercent}%
            </span>
            <span className="text-xs font-semibold text-emerald-400">↑ +1.4%</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            COGS, cloud relays & carrier transit accounted
          </p>
        </div>

        {/* Total Deductions */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Discounts & Deductions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-600/20 text-amber-400 ring-1 ring-amber-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h.008v.008H6V6Z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-amber-400">
              ${(data.totalDiscountsApplied + data.refundDeductions).toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            ${data.totalDiscountsApplied.toLocaleString()} promo codes + ${data.refundDeductions.toLocaleString()} refunds
          </p>
        </div>
      </div>

      {/* Monthly Timeseries & Tier Share */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Monthly Historical Revenue Trajectory */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-lg lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📊</span>
                <span>6-Month Revenue & Margin Trajectory</span>
              </h3>
              <p className="text-xs text-slate-400">
                Gross commercial bookings vs Net settled funds (USD)
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Gross
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-indigo-500" /> Net
              </span>
            </div>
          </div>

          <div className="h-56 w-full flex items-end gap-3 sm:gap-6 pt-4">
            {data.monthlyTimeseries.map((item) => {
              const grossPercent = Math.max(14, Math.round((item.gross / maxGross) * 100));
              const netPercent = Math.max(10, Math.round((item.net / maxGross) * 100));
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                    {/* Gross Bar */}
                    <div
                      style={{ height: `${grossPercent}%` }}
                      className="w-full max-w-[18px] sm:max-w-[24px] rounded-t-md bg-gradient-to-t from-emerald-950 to-emerald-500/80 group-hover:to-emerald-400 transition-all"
                    />
                    {/* Net Bar */}
                    <div
                      style={{ height: `${netPercent}%` }}
                      className="w-full max-w-[18px] sm:max-w-[24px] rounded-t-md bg-gradient-to-t from-indigo-950 to-indigo-500/80 group-hover:to-indigo-400 transition-all"
                    />
                  </div>
                  <span className="text-[10px] mt-2 block font-mono text-slate-400 group-hover:text-white truncate">
                    {item.month.split(" ")[0]}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold hidden sm:block">
                    ${(item.net / 1000).toFixed(0)}k
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Revenue by Category Tier */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-lg space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🏷️</span>
              <span>Revenue by Device Tier</span>
            </h3>
            <p className="text-xs text-slate-400">
              Contribution by phone hardware category
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {data.tiers.map((tier, i) => {
              const colors = [
                { bg: "bg-indigo-500", text: "text-indigo-400" },
                { bg: "bg-cyan-500", text: "text-cyan-400" },
                { bg: "bg-emerald-500", text: "text-emerald-400" },
                { bg: "bg-amber-500", text: "text-amber-400" },
              ];
              const c = colors[i % colors.length]!;
              return (
                <div key={tier.tierName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{tier.tierName}</span>
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
                    <span>${tier.revenue.toLocaleString()}</span>
                    <span>{tier.unitsCount.toLocaleString()} units</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Financial P&L Waterfall Summary Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg backdrop-blur-xl overflow-hidden">
        <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-3.5 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Profit & Loss (P&L) Commercial Waterfall Breakdown
          </h3>
          <button
            type="button"
            onClick={onExportCsv}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Export Financial Report →
          </button>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-800/80">
              <tr className="hover:bg-slate-850/40">
                <td className="py-3 px-5 font-semibold text-white">Gross Merchandise Value (GMV)</td>
                <td className="py-3 px-5 text-slate-400">Total list price orders booked</td>
                <td className="py-3 px-5 text-right font-mono font-bold text-white">
                  +${data.grossRevenue.toLocaleString()}
                </td>
              </tr>
              <tr className="hover:bg-slate-850/40 text-rose-300">
                <td className="py-3 px-5 font-medium">Discounts & Promo Redemptions</td>
                <td className="py-3 px-5 text-slate-400">Promotions, VIP coupons & seasonal flash sales</td>
                <td className="py-3 px-5 text-right font-mono font-bold text-rose-400">
                  -${data.totalDiscountsApplied.toLocaleString()}
                </td>
              </tr>
              <tr className="hover:bg-slate-850/40 text-rose-300">
                <td className="py-3 px-5 font-medium">Refund Deductions & Cancellations</td>
                <td className="py-3 px-5 text-slate-400">Order cancellations & RMA returns</td>
                <td className="py-3 px-5 text-right font-mono font-bold text-rose-400">
                  -${data.refundDeductions.toLocaleString()}
                </td>
              </tr>
              <tr className="hover:bg-slate-850/40">
                <td className="py-3 px-5 font-medium text-slate-300">Shipping & Logistics Surcharges</td>
                <td className="py-3 px-5 text-slate-400">Courier express delivery recovery fees</td>
                <td className="py-3 px-5 text-right font-mono font-bold text-emerald-400">
                  +${data.shippingRevenue.toLocaleString()}
                </td>
              </tr>
              <tr className="bg-indigo-950/20 font-bold">
                <td className="py-3.5 px-5 text-indigo-300 text-sm">Final Net Commercial Settlement</td>
                <td className="py-3.5 px-5 text-slate-400 text-xs">Total cleared commercial funds</td>
                <td className="py-3.5 px-5 text-right font-mono text-sm text-indigo-300">
                  ${data.netRevenue.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
