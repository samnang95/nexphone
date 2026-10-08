import Link from "next/link";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getDashboardMetrics, getDevices } from "@/services/dashboard.service";
import { ROUTES } from "@/routes";

export default async function DashboardOverviewPage() {
  const metrics = await getDashboardMetrics();
  const devices = await getDevices();

  return (
    <main className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 md:p-8">
      {/* Page Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
            System Overview
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time fleet metrics, infrastructure health, and hardware telemetry.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href={ROUTES.TELEMETRY}>
            <Button variant="secondary" size="sm">
              Live Telemetry
            </Button>
          </Link>
          <Link href={ROUTES.DEVICES.ROOT}>
            <Button variant="primary" size="sm">
              View Fleet ({devices.length})
            </Button>
          </Link>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section
        aria-label="Key Performance Indicators"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Total MRR"
          value={metrics.totalRevenue.value}
          changePercentage={metrics.totalRevenue.changePercentage}
          trend={metrics.totalRevenue.trend}
          caption={metrics.totalRevenue.periodLabel}
        />
        <StatCard
          title="Active Hardware"
          value={metrics.activeDevices.value}
          changePercentage={metrics.activeDevices.changePercentage}
          trend={metrics.activeDevices.trend}
          caption={metrics.activeDevices.periodLabel}
        />
        <StatCard
          title="VoIP Uptime"
          value={metrics.systemHealth.value}
          changePercentage={metrics.systemHealth.changePercentage}
          trend={metrics.systemHealth.trend}
          caption={metrics.systemHealth.periodLabel}
        />
        <StatCard
          title="Support Tickets"
          value={metrics.supportTickets.value}
          changePercentage={metrics.supportTickets.changePercentage}
          trend={metrics.supportTickets.trend}
          caption={metrics.supportTickets.periodLabel}
        />
      </section>

      {/* Operations Quick-Nav & Active Fleet Preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Fleet Preview */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Active Fleet Telemetry</h2>
              <p className="text-xs text-slate-400">Recent hardware devices registered on the network</p>
            </div>
            <Link
              href={ROUTES.DEVICES.ROOT}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              See all devices &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {devices.slice(0, 4).map((device) => (
              <div key={device.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2 text-sm">
                <div className="flex flex-col">
                  <Link
                    href={ROUTES.DEVICES.DETAIL(device.id)}
                    className="font-medium text-white transition-colors hover:text-indigo-400"
                  >
                    {device.model}
                  </Link>
                  <span className="text-xs text-slate-400 font-mono">
                    {device.serialNumber} • {device.location}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <Badge variant={device.status === "online" ? "success" : "warning"}>
                    {device.status}
                  </Badge>
                  <span className="text-xs text-slate-400">{device.batteryLevel}% battery</span>
                  <Link
                    href={ROUTES.DEVICES.DETAIL(device.id)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 ml-auto sm:ml-0"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Admin Quick Launch */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <h2 className="text-base font-semibold text-white">Operations Hub</h2>
          <p className="text-xs text-slate-400 mb-4">Jump directly into console subsystems</p>

          <div className="space-y-2.5">
            <Link
              href={ROUTES.TELEMETRY}
              className="group block rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 transition-colors hover:border-indigo-500/40 hover:bg-slate-900/80"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white group-hover:text-indigo-300">
                  Telemetry & Live Logs
                </span>
                <span className="text-[10px] text-emerald-400">Stream OK</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Monitor real-time SIP latency and server-side socket events.
              </p>
            </Link>

            <Link
              href={ROUTES.FIRMWARE}
              className="group block rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 transition-colors hover:border-indigo-500/40 hover:bg-slate-900/80"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white group-hover:text-indigo-300">
                  Firmware OTA Deployment
                </span>
                <span className="text-[10px] text-indigo-400">v2.4.12 Live</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Stage gradual binary rollout across hardware channels.
              </p>
            </Link>

            <Link
              href={ROUTES.ANALYTICS}
              className="group block rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 transition-colors hover:border-indigo-500/40 hover:bg-slate-900/80"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white group-hover:text-indigo-300">
                  Fleet Call Analytics
                </span>
                <span className="text-[10px] text-slate-400">1.4M min</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Analyze call setup times, packet health, and hardware battery drain.
              </p>
            </Link>

            <Link
              href={ROUTES.SETTINGS}
              className="group block rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 transition-colors hover:border-indigo-500/40 hover:bg-slate-900/80"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white group-hover:text-indigo-300">
                  Cluster & Flavor Settings
                </span>
                <span className="text-[10px] text-amber-400">Dev Mode</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Manage backend endpoints, webhooks, and security enclaves.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
