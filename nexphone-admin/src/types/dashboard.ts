export type TrendDirection = "up" | "down" | "neutral";

export interface MetricItem {
  readonly value: string;
  readonly changePercentage?: number;
  readonly trend?: TrendDirection;
  readonly periodLabel?: string;
  readonly secondaryLabel?: string;
}

export interface DashboardMetricsSummary {
  readonly totalSales: MetricItem;
  readonly totalOrders: MetricItem;
  readonly totalCustomers: MetricItem;
  readonly totalProducts: MetricItem;
  // Legacy / fleet metrics preserved
  readonly totalRevenue: MetricItem;
  readonly activeDevices: MetricItem;
  readonly systemHealth: MetricItem;
  readonly supportTickets: MetricItem;
}

export interface MonthlyRevenuePoint {
  readonly label: string;
  readonly amount: number;
  readonly hardwareAmount: number;
  readonly serviceAmount: number;
  readonly targetAmount: number;
}

export interface RevenueCategoryBreakdown {
  readonly category: string;
  readonly amount: string;
  readonly rawAmount: number;
  readonly percentage: number;
  readonly color: string;
}

export interface RevenueOverviewData {
  readonly totalYearToDate: string;
  readonly projectedArr: string;
  readonly avgOrderValue: string;
  readonly monthlyPoints: readonly MonthlyRevenuePoint[];
  readonly categoryBreakdown: readonly RevenueCategoryBreakdown[];
}

export type OrderStatus = "completed" | "processing" | "shipped" | "pending" | "cancelled";

export interface RecentOrder {
  readonly id: string;
  readonly customerName: string;
  readonly customerEmail: string;
  readonly customerLocation: string;
  readonly productName: string;
  readonly productSku: string;
  readonly quantity: number;
  readonly amount: string;
  readonly status: OrderStatus;
  readonly paymentMethod: string;
  readonly createdAt: string;
  readonly trackingNumber?: string;
  readonly shippingCarrier?: string;
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
