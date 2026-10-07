import Link from "next/link";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getDashboardMetrics, getDevices } from "@/services/dashboard.service";

export default async function DashboardOverviewPage() {
  const metrics = await getDashboardMetrics();
  const devices = await getDevices();

  return (
    <main className="flex-1 space-y-8 p-6 md:p-8">
      {/* Page Header */}
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            System Overview
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time fleet metrics, infrastructure health, and hardware telemetry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/devices">
            <Button variant="secondary" size="sm">
              View Connected Devices
            </Button>
          </Link>
          <Button variant="primary" size="sm">
            Export Report
          </Button>
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

      {/* Active Fleet Preview */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Active Fleet Telemetry</h2>
            <p className="text-xs text-slate-400">Recent hardware devices registered on the network</p>
          </div>
          <Link
            href="/devices"
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
          >
            See all devices &rarr;
          </Link>
        </div>

        <div className="divide-y divide-slate-800/80">
          {devices.slice(0, 3).map((device) => (
            <div key={device.id} className="flex items-center justify-between py-3 text-sm">
              <div className="flex flex-col">
                <span className="font-medium text-white">{device.model}</span>
                <span className="text-xs text-slate-400">{device.serialNumber} • {device.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={device.status === "online" ? "success" : "warning"}>
                  {device.status}
                </Badge>
                <span className="text-xs text-slate-400">{device.batteryLevel}% battery</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
