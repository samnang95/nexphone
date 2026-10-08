import type { DashboardMetricsSummary, Device } from "@/types/dashboard";
import { appConfig } from "@/config/env";

/**
 * Service boundary for Dashboard data fetching.
 * Connects to active flavor API endpoint with graceful fallback to mock data.
 */
export async function getDashboardMetrics(): Promise<DashboardMetricsSummary> {
  "use cache";
  try {
    const res = await fetch(`${appConfig.apiUrl}/dashboard/metrics`);
    if (res.ok) {
      return (await res.json()) as DashboardMetricsSummary;
    }
  } catch {
    // Offline or network fallback
  }

  return {
    totalRevenue: {
      value: "$142,850",
      changePercentage: 14.8,
      trend: "up",
      periodLabel: "vs prior 30 days",
    },
    activeDevices: {
      value: "8,420",
      changePercentage: 5.2,
      trend: "up",
      periodLabel: "98.2% fleet online",
    },
    systemHealth: {
      value: "99.98%",
      changePercentage: -0.01,
      trend: "down",
      periodLabel: "VoIP gateway uptime",
    },
    supportTickets: {
      value: "14",
      changePercentage: 0,
      trend: "neutral",
      periodLabel: "pending tier-2 triage",
    },
  };
}

export async function getDevices(): Promise<readonly Device[]> {
  "use cache";
  try {
    const res = await fetch(`${appConfig.apiUrl}/devices`);
    if (res.ok) {
      return (await res.json()) as readonly Device[];
    }
  } catch {
    // Offline or network fallback
  }

  return [
    {
      id: "dev-001",
      serialNumber: "NX-8821-A",
      model: "NexPhone Pro Max X",
      firmwareVersion: "v2.4.12",
      status: "online",
      batteryLevel: 94,
      lastPingAt: "2026-10-07T15:20:00.000Z",
      location: "San Francisco, US",
    },
    {
      id: "dev-002",
      serialNumber: "NX-8821-B",
      model: "NexPhone Enterprise",
      firmwareVersion: "v2.4.10",
      status: "online",
      batteryLevel: 82,
      lastPingAt: "2026-10-07T15:12:00.000Z",
      location: "Tokyo, JP",
    },
    {
      id: "dev-003",
      serialNumber: "NX-7200-E",
      model: "NexPhone Lite",
      firmwareVersion: "v2.3.9",
      status: "maintenance",
      batteryLevel: 41,
      lastPingAt: "2026-10-07T14:30:00.000Z",
      location: "Berlin, DE",
    },
    {
      id: "dev-004",
      serialNumber: "NX-9000-X",
      model: "NexPhone Pro Max X",
      firmwareVersion: "v2.5.0-rc1",
      status: "provisioning",
      batteryLevel: 100,
      lastPingAt: "2026-10-07T15:25:00.000Z",
      location: "Singapore, SG",
    },
  ];
}

export async function getDeviceById(id: string): Promise<Device | null> {
  const devices = await getDevices();
  const found = devices.find((d) => d.id === id || d.serialNumber === id);
  if (found) return found;

  // Fallback for demo ID if searched directly
  return {
    id,
    serialNumber: `NX-CUSTOM-${id}`,
    model: "NexPhone Enterprise Edge",
    firmwareVersion: "v2.4.12",
    status: "online",
    batteryLevel: 88,
    lastPingAt: new Date().toISOString(),
    location: "Global Fleet (Remote)",
  };
}

