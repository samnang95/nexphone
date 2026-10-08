import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ROUTES } from "@/routes";

export const metadata: Metadata = {
  title: "Fleet Analytics",
  description: "Aggregated fleet usage patterns, VoIP audio call volume, and hardware telemetry analytics.",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Fleet Analytics
            </h1>
            <Badge variant="default">30-DAY WINDOW</Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Voice traffic volume, cellular handover reliability, and hardware power consumption trends.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm">
            Export CSV
          </Button>
          <Button variant="primary" size="sm">
            Generate Executive Report
          </Button>
        </div>
      </div>

      {/* Analytics KPI Summary */}
      <section
        aria-label="Analytics KPIs"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Total Voice Minutes"
          value="1,420,800"
          changePercentage={12.4}
          trend="up"
          caption="Avg call duration: 6m 14s"
        />
        <StatCard
          title="Call Setup Latency"
          value="142 ms"
          changePercentage={-18.5}
          trend="up"
          caption="SIP INVITE to 200 OK"
        />
        <StatCard
          title="Dropped Call Rate"
          value="0.08%"
          changePercentage={-0.02}
          trend="up"
          caption="Carrier SLA: < 0.25%"
        />
        <StatCard
          title="Fleet Battery Efficiency"
          value="18.2 hrs"
          changePercentage={6.1}
          trend="up"
          caption="Continuous VoIP standby"
        />
      </section>

      {/* Regional Traffic & Model Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Geographic Distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <h2 className="text-base font-semibold text-white">Geographic Traffic</h2>
          <p className="text-xs text-slate-400 mb-4">Traffic routed across regional media relays</p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-200">North America (us-east / us-west)</span>
                <span className="font-mono text-indigo-400">54% (767k min)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: "54%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-200">Europe (eu-central / eu-west)</span>
                <span className="font-mono text-emerald-400">28% (397k min)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "28%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-200">Asia-Pacific (ap-southeast / ap-northeast)</span>
                <span className="font-mono text-amber-400">14% (198k min)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "14%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-200">Other Global Nodes</span>
                <span className="font-mono text-slate-400">4% (58k min)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-slate-600 rounded-full" style={{ width: "4%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Model Performance Comparison Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-white">Hardware Performance Matrix</h2>
              <p className="text-xs text-slate-400">Fleet telemetry aggregated by hardware tier</p>
            </div>
            <Link
              href={ROUTES.DEVICES.ROOT}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              Inspect Fleet &rarr;
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="pb-3">Hardware Model</th>
                  <th className="pb-3">Active Units</th>
                  <th className="pb-3">Avg Battery Drain</th>
                  <th className="pb-3">Drop Call %</th>
                  <th className="pb-3">VoIP MOS</th>
                  <th className="pb-3 text-right">Health Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-3 font-medium text-white">NexPhone Pro Max X</td>
                  <td className="py-3 font-mono">4,120</td>
                  <td className="py-3">3.8% / hr</td>
                  <td className="py-3 text-emerald-400">0.04%</td>
                  <td className="py-3 text-emerald-400">4.62</td>
                  <td className="py-3 text-right font-bold text-emerald-400">99.4%</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">NexPhone Enterprise</td>
                  <td className="py-3 font-mono">3,050</td>
                  <td className="py-3">4.1% / hr</td>
                  <td className="py-3 text-emerald-400">0.07%</td>
                  <td className="py-3 text-emerald-400">4.51</td>
                  <td className="py-3 text-right font-bold text-emerald-400">98.8%</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">NexPhone Lite</td>
                  <td className="py-3 font-mono">1,250</td>
                  <td className="py-3">5.2% / hr</td>
                  <td className="py-3 text-amber-400">0.14%</td>
                  <td className="py-3 text-amber-400">4.18</td>
                  <td className="py-3 text-right font-bold text-amber-400">95.2%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
