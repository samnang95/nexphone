import Link from "next/link";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import {
  getDashboardMetrics,
  getRevenueOverview,
  getRecentOrders,
  getDevices,
} from "@/services/dashboard.service";
import { ROUTES } from "@/routes";

export default async function DashboardOverviewPage() {
  const [metrics, revenueData, recentOrders, devices] = await Promise.all([
    getDashboardMetrics(),
    getRevenueOverview(),
    getRecentOrders(),
    getDevices(),
  ]);

  return (
    <main className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 md:p-8">
      {/* Page Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Executive Dashboard
            </h1>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
              Live Cluster
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Real-time commercial velocity, revenue streams, and enterprise fleet telemetry.
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

      {/* Feature 1 to 4: Commercial KPI Cards Grid */}
      <section
        aria-label="Commercial Key Performance Indicators"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* 1. Total Sales */}
        <StatCard
          title="Total Sales"
          value={metrics.totalSales.value}
          changePercentage={metrics.totalSales.changePercentage}
          trend={metrics.totalSales.trend}
          caption={`${metrics.totalSales.periodLabel} (${metrics.totalSales.secondaryLabel})`}
          icon={
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        {/* 2. Total Orders */}
        <StatCard
          title="Total Orders"
          value={metrics.totalOrders.value}
          changePercentage={metrics.totalOrders.changePercentage}
          trend={metrics.totalOrders.trend}
          caption={`${metrics.totalOrders.periodLabel} • ${metrics.totalOrders.secondaryLabel}`}
          icon={
            <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          }
        />

        {/* 3. Total Customers */}
        <StatCard
          title="Total Customers"
          value={metrics.totalCustomers.value}
          changePercentage={metrics.totalCustomers.changePercentage}
          trend={metrics.totalCustomers.trend}
          caption={`${metrics.totalCustomers.periodLabel} • ${metrics.totalCustomers.secondaryLabel}`}
          icon={
            <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />

        {/* 4. Total Products */}
        <StatCard
          title="Total Products"
          value={metrics.totalProducts.value}
          changePercentage={metrics.totalProducts.changePercentage}
          trend={metrics.totalProducts.trend}
          caption={`${metrics.totalProducts.periodLabel} • ${metrics.totalProducts.secondaryLabel}`}
          icon={
            <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          }
        />
      </section>

      {/* Feature 5: Revenue Overview (Interactive Visualization) */}
      <section aria-label="Revenue Overview Section">
        <RevenueChart data={revenueData} />
      </section>

      {/* Feature 6: Recent Orders (Status Filtering & Inspection Drawer) */}
      <section aria-label="Recent Orders Section">
        <RecentOrdersTable orders={recentOrders} />
      </section>

      {/* Connected Hardware Fleet & Operations Hub */}
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
