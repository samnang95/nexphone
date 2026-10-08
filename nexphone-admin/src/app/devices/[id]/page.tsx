import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDeviceById } from "@/services/dashboard.service";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ROUTES } from "@/routes";

interface DevicePageProps {
  readonly params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DevicePageProps): Promise<Metadata> {
  const { id } = await params;
  const device = await getDeviceById(id);
  return {
    title: device ? `${device.model} (${device.serialNumber})` : "Device Diagnostics",
    description: `Real-time hardware diagnostics and telemetry for device ${id}.`,
  };
}

export function generateStaticParams() {
  return [
    { id: "dev-001" },
    { id: "dev-002" },
    { id: "dev-003" },
    { id: "dev-004" },
  ];
}

export default async function DeviceDetailPage({ params }: DevicePageProps) {
  const { id } = await params;
  const device = await getDeviceById(id);

  if (!device) {
    notFound();
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              {device.model}
            </h1>
            <Badge
              variant={
                device.status === "online"
                  ? "success"
                  : device.status === "maintenance"
                  ? "warning"
                  : "default"
              }
            >
              {device.status.toUpperCase()}
            </Badge>
          </div>
          <p className="mt-1 font-mono text-xs text-slate-400">
            Serial: {device.serialNumber} • Location: {device.location} • Last Seen: {new Date(device.lastPingAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href={ROUTES.DEVICES.ROOT}>
            <Button variant="secondary" size="sm">
              &larr; Back to Devices
            </Button>
          </Link>
          <Link href={ROUTES.FIRMWARE}>
            <Button variant="secondary" size="sm">
              OTA Update
            </Button>
          </Link>
          <Button variant="primary" size="sm">
            Ping Diagnostics
          </Button>
        </div>
      </div>

      {/* Diagnostics KPIs */}
      <section
        aria-label="Hardware Diagnostics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Battery Health"
          value={`${device.batteryLevel}%`}
          changePercentage={device.batteryLevel > 50 ? 2.1 : -4.3}
          trend={device.batteryLevel > 50 ? "up" : "down"}
          caption="Li-ion 5,000 mAh"
        />
        <StatCard
          title="Cellular Signal"
          value="-78 dBm"
          trend="up"
          caption="5G NR Standalone (Excellent)"
        />
        <StatCard
          title="VoIP Stream Latency"
          value="24 ms"
          changePercentage={-5.4}
          trend="up"
          caption="SIP Jitter: 1.1ms"
        />
        <StatCard
          title="CPU Core Temp"
          value="38.5 °C"
          trend="neutral"
          caption="Quad-core Cortex-A78"
        />
      </section>

      {/* Grid: Hardware specs & Active VoIP Session */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Device Specifications */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white">Hardware & Telemetry Profile</h2>
            <span className="font-mono text-xs text-indigo-400">Firmware {device.firmwareVersion}</span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 block">Device Identifier</span>
                <span className="font-mono text-slate-200">{device.id}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Hardware Model</span>
                <span className="text-slate-200">{device.model}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Primary Baseband</span>
                <span className="font-mono text-slate-200">Qualcomm Snapdragon X65</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Security Enclave</span>
                <span className="text-emerald-400 font-medium">Secured • FIPS 140-3 Validated</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 block">Assigned IP Address</span>
                <span className="font-mono text-slate-200">10.240.12.84 (WireGuard VPN)</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Audio Codec</span>
                <span className="text-slate-200">Opus 48kHz Full-Band Stereo</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Firmware Channel</span>
                <span className="text-slate-200">Stable Production Channel</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Memory Utilization</span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "42%" }}></div>
                  </div>
                  <span className="text-xs text-slate-400">42% (3.4GB / 8GB)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap gap-2.5">
            <Button variant="secondary" size="sm">
              Restart VoIP Stack
            </Button>
            <Button variant="secondary" size="sm">
              Force Telemetry Sync
            </Button>
            <Button variant="secondary" size="sm">
              Flush DNS Cache
            </Button>
            <Button variant="danger" size="sm">
              Emergency Lock
            </Button>
          </div>
        </div>

        {/* Live Event Log */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <h2 className="text-base font-semibold text-white">Recent Hardware Events</h2>
          <p className="text-xs text-slate-400 mb-4">Latest telemetry packets received</p>

          <div className="space-y-3 font-mono text-xs">
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="text-emerald-400">INFO</span>
                <span>Just now</span>
              </div>
              <p className="text-slate-200">Keepalive ACK received. Latency: 24ms.</p>
            </div>

            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="text-indigo-400">SIP_EVENT</span>
                <span>3m ago</span>
              </div>
              <p className="text-slate-200">Call completed. Duration: 04:12. Codec: Opus.</p>
            </div>

            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="text-amber-400">WARN</span>
                <span>18m ago</span>
              </div>
              <p className="text-slate-200">Handoff 5G NR to LTE Band 7. RSSI -84 dBm.</p>
            </div>

            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="text-emerald-400">SYS_BOOT</span>
                <span>2h ago</span>
              </div>
              <p className="text-slate-200">Secure enclave authentication validated.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
