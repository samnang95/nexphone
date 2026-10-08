import type { Metadata } from "next";
import { appConfig } from "@/config/env";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Cluster Settings",
  description: "Configure NexPhone cluster connection, flavor settings, telemetry webhooks, and security policies.",
};

export default function SettingsPage() {
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Cluster Settings
            </h1>
            <Badge
              variant={
                appConfig.isProd ? "success" : appConfig.isStaging ? "warning" : "default"
              }
            >
              FLAVOR: {appConfig.flavor.toUpperCase()}
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Environment flavor parameters, API gateway coordinates, and security configurations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm">
            Discard Changes
          </Button>
          <Button variant="primary" size="sm">
            Save Cluster Preferences
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Flavor & Runtime Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white">Active Flavor Status</h2>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <div className="mt-4 space-y-3 font-mono text-xs">
            <div>
              <span className="text-slate-400 font-sans block text-[11px]">Flavor Profile</span>
              <span className="font-bold text-indigo-400 uppercase text-sm">
                {appConfig.flavor}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-sans block text-[11px]">API Gateway URL</span>
              <span className="text-slate-200 break-all">{appConfig.apiUrl}</span>
            </div>

            <div>
              <span className="text-slate-400 font-sans block text-[11px]">Application Title</span>
              <span className="text-slate-200">{appConfig.appName}</span>
            </div>

            <div>
              <span className="text-slate-400 font-sans block text-[11px]">Admin Console Port</span>
              <span className="text-slate-200">3001</span>
            </div>

            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-slate-400 font-sans block text-[11px]">Active Node Environment</span>
              <span className="text-emerald-400">
                {process.env.NODE_ENV || "development"}
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry & Gateway Preferences */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-white mb-1">Gateway & Polling Engine</h2>
          <p className="text-xs text-slate-400 mb-6">Manage how the admin console synchronizes with backend nodes</p>

          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Device Heartbeat Timeout (seconds)
                </label>
                <input
                  type="number"
                  defaultValue={30}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  VoIP Media Quality Ingestion Rate
                </label>
                <div className="relative">
                  <select
                    defaultValue="realtime"
                    className="w-full appearance-none rounded-lg border border-slate-800 bg-slate-950 pl-3 pr-8 py-2 text-sm text-white transition-colors hover:border-slate-700 hover:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="realtime">Continuous Real-time (WebSocket)</option>
                    <option value="5s">Every 5 Seconds (Batched)</option>
                    <option value="30s">Every 30 Seconds (Low Bandwidth)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Cluster Incident Alert Webhook (Slack / Discord / PagerDuty)
              </label>
              <input
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                defaultValue="https://hooks.slack.com/services/T00/B00/nexphone-alerts"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white font-mono placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Dispatches urgent notifications for device offline spikes and firmware rollout errors.
              </span>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Security & Enclave Rules
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="text-xs">
                    <span className="font-medium text-slate-200 block">Enforce Mutual TLS (mTLS)</span>
                    <span className="text-slate-400">Require all provisioned hardware to present valid X.509 cert</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="text-xs">
                    <span className="font-medium text-slate-200 block">Enable Automated Delta OTA Updates</span>
                    <span className="text-slate-400">Permit low-bandwidth binary diff patches over cellular</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
