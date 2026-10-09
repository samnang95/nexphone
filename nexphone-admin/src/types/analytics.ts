export type DateRangeOption = "today" | "7d" | "30d" | "quarter" | "year";

export type AnalyticsTab =
  | "sales"
  | "revenue"
  | "best_sellers"
  | "customers"
  | "inventory";

export interface SalesDailyPoint {
  date: string;
  revenue: number;
  orders: number;
  unitsSold: number;
}

export interface SalesChannelShare {
  channel: string;
  percentage: number;
  revenue: number;
  ordersCount: number;
}

export interface SalesReportSummary {
  totalSalesVolume: number;
  totalUnitsSold: number;
  ordersCount: number;
  averageOrderValue: number;
  conversionRate: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;
  growthPercentage: number;
  channels: SalesChannelShare[];
  dailyTimeline: SalesDailyPoint[];
}

export interface RevenueMonthlyPoint {
  month: string;
  gross: number;
  net: number;
  discounts: number;
  marginPercent: number;
}

export interface RevenueTierBreakdown {
  tierName: string;
  revenue: number;
  sharePercent: number;
  unitsCount: number;
}

export interface RevenueReportSummary {
  grossRevenue: number;
  netRevenue: number;
  profitMarginPercent: number;
  totalDiscountsApplied: number;
  shippingRevenue: number;
  refundDeductions: number;
  momGrowthPercent: number;
  tiers: RevenueTierBreakdown[];
  monthlyTimeseries: RevenueMonthlyPoint[];
}

export interface BestSellingPhoneItem {
  id: string;
  name: string;
  modelCode: string;
  brandName: string;
  imageUrl?: string;
  unitsSold: number;
  revenue: number;
  averagePrice: number;
  stockRemaining: number;
  returnRatePercent: number;
  averageRating: number;
  marketSharePercent: number;
  growthTrend: "up" | "down" | "flat";
}

export interface CustomerTopSpender {
  id: string;
  name: string;
  email: string;
  tier: "VIP" | "Enterprise" | "Pro" | "Regular";
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: string;
  location: string;
}

export interface CustomerStatsSummary {
  totalCustomers: number;
  activeBuyersCount: number;
  newSignupsThisMonth: number;
  returningCustomerRate: number;
  averageLTV: number;
  churnRatePercent: number;
  tierDistribution: {
    tier: string;
    count: number;
    sharePercent: number;
  }[];
  topSpenders: CustomerTopSpender[];
}

export interface FastDepletingSku {
  phoneId: string;
  name: string;
  modelCode: string;
  currentStock: number;
  reorderThreshold: number;
  burnRatePerWeek: number;
  daysRemaining: number;
  status: "critical" | "warning" | "optimal";
}

export interface WarehouseDistribution {
  warehouseId: string;
  name: string;
  location: string;
  unitsCount: number;
  utilizationPercent: number;
  valuation: number;
}

export interface InventoryReportSummary {
  totalValuation: number;
  totalUnitsInStock: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  stockTurnoverRate: number;
  daysOfInventoryRemaining: number;
  fastDepletingSkus: FastDepletingSku[];
  warehouses: WarehouseDistribution[];
}

export interface ExecutiveReportBundle {
  generatedAt: string;
  dateRange: DateRangeOption;
  sales: SalesReportSummary;
  revenue: RevenueReportSummary;
  bestSellers: BestSellingPhoneItem[];
  customers: CustomerStatsSummary;
  inventory: InventoryReportSummary;
}
