export type TrendDirection = "up" | "down" | "neutral";

export interface MetricItem {
  readonly value: string;
  readonly changePercentage?: number;
  readonly trend?: TrendDirection;
  readonly periodLabel?: string;
}

export interface DashboardMetricsSummary {
  readonly totalRevenue: MetricItem;
  readonly activeDevices: MetricItem;
  readonly systemHealth: MetricItem;
  readonly supportTickets: MetricItem;
}

export type DeviceStatus = "online" | "offline" | "maintenance" | "provisioning";

export interface Device {
  readonly id: string;
  readonly serialNumber: string;
  readonly model: string;
  readonly firmwareVersion: string;
  readonly status: DeviceStatus;
  readonly batteryLevel: number;
  readonly lastPingAt: string;
  readonly location: string;
}
