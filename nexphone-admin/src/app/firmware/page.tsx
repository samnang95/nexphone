import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ROUTES } from "@/routes";

export const metadata: Metadata = {
  title: "Firmware OTA",
  description: "Over-the-air firmware deployment, channel releases, and staged hardware rollouts.",
};

interface FirmwareRelease {
  readonly version: string;
  readonly buildNumber: string;
  readonly channel: "Stable" | "Beta" | "Canary";
  readonly releaseDate: string;
  readonly checksum: string;
  readonly sizeMb: number;
  readonly targetModels: readonly string[];
  readonly rolloutPercent: number;
  readonly status: "active" | "staged" | "deprecated";
}

const RELEASES: readonly FirmwareRelease[] = [
  {
    version: "v2.4.12",
    buildNumber: "build-89201",
    channel: "Stable",
    releaseDate: "2026-09-28",
    checksum: "sha256:4f8a2...3b19",
    sizeMb: 684.2,
    targetModels: ["NexPhone Pro Max X", "NexPhone Enterprise"],
    rolloutPercent: 82,
    status: "active",
  },
  {
    version: "v2.5.0-rc1",
    buildNumber: "build-90114",
    channel: "Beta",
    releaseDate: "2026-10-04",
    checksum: "sha256:9c12e...6f44",
    sizeMb: 712.5,
    targetModels: ["NexPhone Pro Max X"],
    rolloutPercent: 15,
    status: "staged",
  },
  {
    version: "v2.3.9",
    buildNumber: "build-77402",
    channel: "Stable",
    releaseDate: "2026-08-15",
    checksum: "sha256:1a82d...99e1",
    sizeMb: 640.8,
    targetModels: ["NexPhone Lite"],
    rolloutPercent: 100,
    status: "active",
  },
  {
    version: "v2.5.1-alpha",
    buildNumber: "build-90420",
    channel: "Canary",
    releaseDate: "2026-10-06",
    checksum: "sha256:7b41a...a302",
    sizeMb: 728.1,
    targetModels: ["Internal Dev Units"],
    rolloutPercent: 2,
    status: "staged",
  },
];

export default function FirmwarePage() {
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Firmware OTA Management
            </h1>
            <Badge variant="default">OTA ENGINE v4.2</Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Over-the-air binary distribution, staged fleet rollouts, and delta patch telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link href={ROUTES.DEVICES.ROOT}>
            <Button variant="secondary" size="sm">
              Device Fleet
            </Button>
          </Link>
          <Button variant="primary" size="sm">
            + Upload Firmware Binary
          </Button>
        </div>
      </div>

      {/* OTA KPIs */}
      <section
        aria-label="Firmware Fleet Metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Fleet on Latest Stable"
          value="82.4%"
          changePercentage={4.6}
          trend="up"
          caption="v2.4.12 adopted"
        />
        <StatCard
          title="OTA Success Rate"
          value="99.88%"
          trend="up"
          caption="0 bricked hardware reports"
        />
        <StatCard
          title="Active Rollouts"
          value="2 channels"
          trend="neutral"
          caption="Stable & Beta RC1"
        />
        <StatCard
          title="CDN Bandwidth"
          value="4.8 TB"
          changePercentage={18.2}
          trend="up"
          caption="Last 7 rolling days"
        />
      </section>

      {/* Active Rollout Spotlight */}
      <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-950/80 p-6 backdrop-blur-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Staged Deployment in Progress
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              NexPhone OS 2.4.12 Maintenance Release
            </h2>
            <p className="text-xs text-slate-400">
              Targeting: Qualcomm Snapdragon X65 VoIP fleet • Safety throttle: 250 devices/hour
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              Pause Rollout
            </Button>
            <Button variant="danger" size="sm">
              Emergency Abort
            </Button>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Rollout Progress: 6,938 / 8,420 Devices Upgraded</span>
            <span className="font-bold text-indigo-400">82% Completed</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: "82%" }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 pt-1">
            <span>Stage 1: Internal Devs (100%)</span>
            <span>Stage 2: Staging Canary (100%)</span>
            <span>Stage 3: General Fleet (82%)</span>
          </div>
        </div>
      </div>

      {/* Firmware Releases Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm">
        <div className="border-b border-slate-800 bg-slate-950/40 px-6 py-4">
          <h2 className="text-sm font-semibold text-white">Registered Firmware Artifacts</h2>
          <p className="text-xs text-slate-400">Cryptographically signed binary bundles</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-4">Version</th>
                <th scope="col" className="px-6 py-4">Channel</th>
                <th scope="col" className="px-6 py-4">Target Models</th>
                <th scope="col" className="px-6 py-4">Binary Size</th>
                <th scope="col" className="px-6 py-4">Checksum</th>
                <th scope="col" className="px-6 py-4">Adoption</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {RELEASES.map((rel) => (
                <tr key={rel.version} className="transition-colors hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-mono font-medium text-white">
                    {rel.version}
                    <span className="block text-[11px] font-sans text-slate-400">{rel.buildNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        rel.channel === "Stable"
                          ? "success"
                          : rel.channel === "Beta"
                          ? "warning"
                          : "default"
                      }
                    >
                      {rel.channel}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-300">
                    {rel.targetModels.join(", ")}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{rel.sizeMb} MB</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{rel.checksum}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${rel.rolloutPercent}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-xs text-slate-200">{rel.rolloutPercent}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline">
                      Deploy Staged
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
