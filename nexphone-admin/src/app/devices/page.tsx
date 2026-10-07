import type { Metadata } from "next";
import { getDevices } from "@/services/dashboard.service";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Connected Devices",
  description: "Manage registered hardware fleet and monitor status in real-time.",
};

export default async function DevicesPage() {
  const devices = await getDevices();

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Connected Devices
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time status, diagnostics, and firmware deployment for active hardware.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" size="sm">
            + Provision New Device
          </Button>
        </div>
      </div>

      {/* Devices Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-4">Device Model</th>
                <th scope="col" className="px-6 py-4">Serial Number</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">Firmware</th>
                <th scope="col" className="px-6 py-4">Battery</th>
                <th scope="col" className="px-6 py-4">Location</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {devices.map((device) => (
                <tr key={device.id} className="transition-colors hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-medium text-white">{device.model}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{device.serialNumber}</td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        device.status === "online"
                          ? "success"
                          : device.status === "maintenance"
                          ? "warning"
                          : "default"
                      }
                    >
                      {device.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{device.firmwareVersion}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-200">{device.batteryLevel}%</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">{device.location}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
                      Diagnostics
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
