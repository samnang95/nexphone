import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ROUTES } from "@/routes";

export const metadata: Metadata = {
  title: "Telemetry & Logs",
  description: "Live cluster diagnostics, VoIP connection latency, and fleet telemetry events.",
};

interface TelemetryEvent {
  readonly id: string;
  readonly timestamp: string;
  readonly level: "info" | "warning" | "error" | "debug";
  readonly source: string;
  readonly event: string;
  readonly message: string;
  readonly deviceId?: string;
}

const MOCK_EVENTS: readonly TelemetryEvent[] = [
  {
    id: "evt-901",
    timestamp: "16:42:04",
    level: "info",
    source: "voip-gateway-cluster-us",
    event: "SIP_CHANNEL_ALLOCATED",
    message: "SIP Trunk #14 allocated for encrypted TLS voice tunnel",
    deviceId: "dev-001",
  },
  {
    id: "evt-902",
    timestamp: "16:41:52",
    level: "warning",
    source: "baseband-telemetry-ingest",
    event: "LATENCY_SPIKE",
    message: "RTT exceeded 120ms during tower handoff (Tokyo Sector 4)",
    deviceId: "dev-002",
  },
  {
    id: "evt-903",
    timestamp: "16:40:11",
    level: "info",
    source: "ota-distribution-worker",
    event: "PAYLOAD_VERIFIED",
    message: "Firmware delta sha256 checksum confirmed valid for v2.4.12",
  },
  {
    id: "evt-904",
    timestamp: "16:38:29",
    level: "error",
    source: "edge-auth-proxy",
    event: "HANDSHAKE_TIMEOUT",
    message: "Device certificate renewal handshake aborted: TLS 1.3 socket reset",
    deviceId: "dev-003",
  },
  {
    id: "evt-905",
    timestamp: "16:35:00",
    level: "debug",
    source: "fleet-telemetry-daemon",
    event: "HEARTBEAT_ACK",
    message: "Periodic ping broadcast received from 4,120 active mobile nodes",
  },
  {
    id: "evt-906",
    timestamp: "16:31:18",
    level: "info",
    source: "cluster-controller",
    event: "AUTOSCALE_REBALANCE",
    message: "VoIP media proxies scaled: 12 nodes running smoothly across 3 availability zones",
  },
];

export default function TelemetryPage() {
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Telemetry & Logs
            </h1>
            <Badge variant="success">STREAM ACTIVE</Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time packet telemetry, SIP audio latency, and cluster audit event streams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link href={ROUTES.DEVICES.ROOT}>
            <Button variant="secondary" size="sm">
              View Fleet
            </Button>
          </Link>
          <Button variant="primary" size="sm">
            Export Stream (.jsonl)
          </Button>
        </div>
      </div>

      {/* Real-time KPI Cards */}
      <section
        aria-label="Real-time Telemetry Metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="VoIP Latency (p95)"
          value="18.4 ms"
          changePercentage={-8.2}
          trend="up"
          caption="Target: < 45 ms"
        />
        <StatCard
          title="Packet Loss"
          value="0.004%"
          changePercentage={-0.001}
          trend="up"
          caption="Jitter: 0.8 ms"
        />
        <StatCard
          title="SIP Throughput"
          value="14.2k req/s"
          changePercentage={12.4}
          trend="up"
          caption="TLS 1.3 voice channels"
        />
        <StatCard
          title="Fleet Error Rate"
          value="0.012%"
          changePercentage={0}
          trend="neutral"
          caption="Within SLA threshold"
        />
      </section>

      {/* Live Streams Monitor */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Stream Channel Health */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <h2 className="text-base font-semibold text-white">Stream Pipeline Status</h2>
          <p className="text-xs text-slate-400 mb-4">Ingestion clusters & broker health</p>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Kafka Ingestion Queue</span>
                <span className="text-emerald-400 font-mono text-[11px]">42,800 msg/s • Healthy</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "24%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">WebRTC Media Gateway</span>
                <span className="text-emerald-400 font-mono text-[11px]">100% Online</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: "88%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">ClickHouse Telemetry Lake</span>
                <span className="text-indigo-400 font-mono text-[11px]">Syncing • 2.4 TB</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Telemetry Buffer Lag</span>
              <span className="font-mono text-slate-200">1.4 ms</span>
            </div>
          </div>
        </div>

        {/* Live Audio Quality Breakdown */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-white">Mean Opinion Score (MOS) Distribution</h2>
              <p className="text-xs text-slate-400">Audio call quality telemetry across global nodes</p>
            </div>
            <span className="rounded-lg bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-1 text-xs font-semibold text-emerald-300">
              MOS 4.42 (Excellent)
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
              <span className="text-xs text-slate-400 block mb-1">Excellent (4.3 - 5.0)</span>
              <span className="text-xl font-bold text-white">96.8%</span>
              <span className="text-[10px] text-emerald-400 block mt-1">+0.4% this week</span>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
              <span className="text-xs text-slate-400 block mb-1">Acceptable (3.6 - 4.2)</span>
              <span className="text-xl font-bold text-white">3.1%</span>
              <span className="text-[10px] text-slate-400 block mt-1">Roaming cell towers</span>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
              <span className="text-xs text-slate-400 block mb-1">Degraded (&lt; 3.6)</span>
              <span className="text-xl font-bold text-amber-400">0.1%</span>
              <span className="text-[10px] text-amber-400 block mt-1">High packet drop</span>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Event Stream Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/40 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Live Event Log Feed</h2>
            <p className="text-xs text-slate-400">Streaming live audit logs and node heartbeats</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-mono text-slate-300">Listening on wss://gateway:4000/telemetry</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-3.5">Time</th>
                <th scope="col" className="px-6 py-3.5">Level</th>
                <th scope="col" className="px-6 py-3.5">Event</th>
                <th scope="col" className="px-6 py-3.5">Source Component</th>
                <th scope="col" className="px-6 py-3.5">Message</th>
                <th scope="col" className="px-6 py-3.5 text-right">Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {MOCK_EVENTS.map((evt) => (
                <tr key={evt.id} className="transition-colors hover:bg-slate-800/40">
                  <td className="px-6 py-3.5 text-slate-400">{evt.timestamp}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        evt.level === "error"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : evt.level === "warning"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : evt.level === "debug"
                          ? "bg-slate-700 text-slate-300"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {evt.level}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-white">{evt.event}</td>
                  <td className="px-6 py-3.5 text-slate-400">{evt.source}</td>
                  <td className="px-6 py-3.5 text-slate-300 max-w-md truncate">{evt.message}</td>
                  <td className="px-6 py-3.5 text-right">
                    {evt.deviceId ? (
                      <Link
                        href={ROUTES.DEVICES.DETAIL(evt.deviceId)}
                        className="text-indigo-400 hover:text-indigo-300 hover:underline"
                      >
                        {evt.deviceId}
                      </Link>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
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
