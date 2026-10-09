import { appConfig } from "@/config/env";
import type {
  DateRangeOption,
  SalesReportSummary,
  RevenueReportSummary,
  BestSellingPhoneItem,
  CustomerStatsSummary,
  InventoryReportSummary,
  ExecutiveReportBundle,
} from "@/types/analytics";

const rawApiUrl = appConfig.apiUrl || "http://localhost:4000/api";
const API_BASE = rawApiUrl.replace(/\/api\/?$/, "");

export function getDynamicSalesReport(range: DateRangeOption): SalesReportSummary {
  switch (range) {
    case "today": {
      const dailyTimeline = [
        { date: "00:00", revenue: 3200, orders: 2, unitsSold: 3 },
        { date: "03:00", revenue: 2100, orders: 1, unitsSold: 2 },
        { date: "06:00", revenue: 4500, orders: 3, unitsSold: 4 },
        { date: "09:00", revenue: 8400, orders: 6, unitsSold: 7 },
        { date: "12:00", revenue: 9800, orders: 7, unitsSold: 9 },
        { date: "15:00", revenue: 7600, orders: 5, unitsSold: 6 },
        { date: "18:00", revenue: 8200, orders: 6, unitsSold: 7 },
        { date: "21:00", revenue: 4450, orders: 4, unitsSold: 4 },
      ];
      return {
        totalSalesVolume: 48250,
        totalUnitsSold: 42,
        ordersCount: 34,
        averageOrderValue: 1419,
        conversionRate: 4.12,
        completedOrdersCount: 32,
        cancelledOrdersCount: 2,
        growthPercentage: 8.4,
        channels: [
          { channel: "Direct Online Storefront", percentage: 58, revenue: 27985, ordersCount: 20 },
          { channel: "Enterprise B2B Fleet", percentage: 31, revenue: 14957, ordersCount: 10 },
          { channel: "Authorized Carrier Partners", percentage: 11, revenue: 5308, ordersCount: 4 },
        ],
        dailyTimeline,
      };
    }
    case "7d": {
      const dailyTimeline = [
        { date: "Oct 3", revenue: 39500, orders: 27, unitsSold: 33 },
        { date: "Oct 4", revenue: 42100, orders: 29, unitsSold: 35 },
        { date: "Oct 5", revenue: 45800, orders: 31, unitsSold: 38 },
        { date: "Oct 6", revenue: 48200, orders: 32, unitsSold: 40 },
        { date: "Oct 7", revenue: 46900, orders: 31, unitsSold: 39 },
        { date: "Oct 8", revenue: 47650, orders: 32, unitsSold: 39 },
        { date: "Oct 9", revenue: 48250, orders: 33, unitsSold: 40 },
      ];
      return {
        totalSalesVolume: 318400,
        totalUnitsSold: 264,
        ordersCount: 215,
        averageOrderValue: 1480,
        conversionRate: 3.96,
        completedOrdersCount: 208,
        cancelledOrdersCount: 7,
        growthPercentage: 11.2,
        channels: [
          { channel: "Direct Online Storefront", percentage: 58, revenue: 184672, ordersCount: 125 },
          { channel: "Enterprise B2B Fleet", percentage: 31, revenue: 98704, ordersCount: 67 },
          { channel: "Authorized Carrier Partners", percentage: 11, revenue: 35024, ordersCount: 23 },
        ],
        dailyTimeline,
      };
    }
    case "quarter": {
      const dailyTimeline = [
        { date: "W1 Jul", revenue: 270000, orders: 182, unitsSold: 185 },
        { date: "W2 Jul", revenue: 285000, orders: 191, unitsSold: 195 },
        { date: "W3 Jul", revenue: 298000, orders: 200, unitsSold: 205 },
        { date: "W4 Jul", revenue: 310000, orders: 208, unitsSold: 212 },
        { date: "W1 Aug", revenue: 318000, orders: 214, unitsSold: 219 },
        { date: "W2 Aug", revenue: 325000, orders: 218, unitsSold: 224 },
        { date: "W3 Aug", revenue: 332000, orders: 223, unitsSold: 228 },
        { date: "W4 Aug", revenue: 345000, orders: 232, unitsSold: 237 },
        { date: "W1 Sep", revenue: 338000, orders: 227, unitsSold: 232 },
        { date: "W2 Sep", revenue: 342000, orders: 230, unitsSold: 235 },
        { date: "W3 Sep", revenue: 348000, orders: 234, unitsSold: 240 },
        { date: "W4 Sep", revenue: 329000, orders: 221, unitsSold: 228 },
      ];
      return {
        totalSalesVolume: 3840000,
        totalUnitsSold: 2640,
        ordersCount: 2580,
        averageOrderValue: 1488,
        conversionRate: 3.78,
        completedOrdersCount: 2490,
        cancelledOrdersCount: 90,
        growthPercentage: 16.5,
        channels: [
          { channel: "Direct Online Storefront", percentage: 58, revenue: 2227200, ordersCount: 1496 },
          { channel: "Enterprise B2B Fleet", percentage: 31, revenue: 1190400, ordersCount: 800 },
          { channel: "Authorized Carrier Partners", percentage: 11, revenue: 422400, ordersCount: 284 },
        ],
        dailyTimeline,
      };
    }
    case "year": {
      const dailyTimeline = [
        { date: "Jan", revenue: 980000, orders: 660, unitsSold: 680 },
        { date: "Feb", revenue: 1050000, orders: 705, unitsSold: 725 },
        { date: "Mar", revenue: 1120000, orders: 750, unitsSold: 770 },
        { date: "Apr", revenue: 1180000, orders: 790, unitsSold: 815 },
        { date: "May", revenue: 1240000, orders: 830, unitsSold: 855 },
        { date: "Jun", revenue: 1290000, orders: 865, unitsSold: 890 },
        { date: "Jul", revenue: 1340000, orders: 900, unitsSold: 925 },
        { date: "Aug", revenue: 1390000, orders: 935, unitsSold: 960 },
        { date: "Sep", revenue: 1440000, orders: 968, unitsSold: 995 },
        { date: "Oct", revenue: 1248900, orders: 842, unitsSold: 846 },
        { date: "Nov", revenue: 1180000, orders: 795, unitsSold: 815 },
        { date: "Dec", revenue: 1361100, orders: 800, unitsSold: 844 },
      ];
      return {
        totalSalesVolume: 14820000,
        totalUnitsSold: 10120,
        ordersCount: 9840,
        averageOrderValue: 1506,
        conversionRate: 3.65,
        completedOrdersCount: 9510,
        cancelledOrdersCount: 330,
        growthPercentage: 22.4,
        channels: [
          { channel: "Direct Online Storefront", percentage: 58, revenue: 8595600, ordersCount: 5707 },
          { channel: "Enterprise B2B Fleet", percentage: 31, revenue: 4594200, ordersCount: 3050 },
          { channel: "Authorized Carrier Partners", percentage: 11, revenue: 1630200, ordersCount: 1083 },
        ],
        dailyTimeline,
      };
    }
    case "30d":
    default:
      return {
        totalSalesVolume: 1248900,
        totalUnitsSold: 846,
        ordersCount: 842,
        averageOrderValue: 1483,
        conversionRate: 3.84,
        completedOrdersCount: 808,
        cancelledOrdersCount: 34,
        growthPercentage: 14.8,
        channels: [
          { channel: "Direct Online Storefront", percentage: 58, revenue: 724362, ordersCount: 488 },
          { channel: "Enterprise B2B Fleet", percentage: 31, revenue: 387159, ordersCount: 261 },
          { channel: "Authorized Carrier Partners", percentage: 11, revenue: 137379, ordersCount: 93 },
        ],
        dailyTimeline: [
          { date: "Sep 26", revenue: 78000, orders: 52, unitsSold: 74 },
          { date: "Sep 27", revenue: 84200, orders: 56, unitsSold: 81 },
          { date: "Sep 28", revenue: 91500, orders: 61, unitsSold: 88 },
          { date: "Sep 29", revenue: 89000, orders: 59, unitsSold: 84 },
          { date: "Sep 30", revenue: 96400, orders: 64, unitsSold: 93 },
          { date: "Oct 1", revenue: 104200, orders: 71, unitsSold: 102 },
          { date: "Oct 2", revenue: 118900, orders: 79, unitsSold: 115 },
          { date: "Oct 3", revenue: 124500, orders: 83, unitsSold: 121 },
          { date: "Oct 4", revenue: 112000, orders: 75, unitsSold: 109 },
          { date: "Oct 5", revenue: 116800, orders: 78, unitsSold: 114 },
          { date: "Oct 6", revenue: 121400, orders: 81, unitsSold: 118 },
          { date: "Oct 7", revenue: 129000, orders: 86, unitsSold: 124 },
          { date: "Oct 8", revenue: 134200, orders: 89, unitsSold: 130 },
          { date: "Oct 9", revenue: 132400, orders: 88, unitsSold: 129 },
        ],
      };
  }
}

export function getDynamicRevenueReport(range: DateRangeOption): RevenueReportSummary {
  switch (range) {
    case "today":
      return {
        grossRevenue: 52400,
        netRevenue: 46800,
        profitMarginPercent: 29.2,
        totalDiscountsApplied: 2100,
        shippingRevenue: 980,
        refundDeductions: 4480,
        momGrowthPercent: 12.4,
        tiers: [
          { tierName: "Satellite Flagship Pro", revenue: 24336, sharePercent: 52, unitsCount: 22 },
          { tierName: "Dual Enclave Foldables", revenue: 12168, sharePercent: 26, unitsCount: 10 },
          { tierName: "Enterprise Fleet", revenue: 7488, sharePercent: 16, unitsCount: 8 },
          { tierName: "Care Warranty & Add-ons", revenue: 2808, sharePercent: 6, unitsCount: 25 },
        ],
        monthlyTimeseries: [
          { month: "00:00 - 04:00", gross: 5300, net: 4800, discounts: 200, marginPercent: 28.5 },
          { month: "04:00 - 08:00", gross: 8900, net: 8100, discounts: 350, marginPercent: 29.0 },
          { month: "08:00 - 12:00", gross: 18200, net: 16300, discounts: 650, marginPercent: 29.5 },
          { month: "12:00 - 16:00", gross: 17400, net: 15400, discounts: 600, marginPercent: 29.2 },
          { month: "16:00 - 20:00", gross: 16600, net: 14800, discounts: 500, marginPercent: 28.8 },
          { month: "20:00 - 24:00", gross: 4450, net: 4000, discounts: 150, marginPercent: 28.4 },
        ],
      };
    case "7d":
      return {
        grossRevenue: 348000,
        netRevenue: 308000,
        profitMarginPercent: 28.9,
        totalDiscountsApplied: 14200,
        shippingRevenue: 6400,
        refundDeductions: 32200,
        momGrowthPercent: 14.8,
        tiers: [
          { tierName: "Satellite Flagship Pro", revenue: 160160, sharePercent: 52, unitsCount: 137 },
          { tierName: "Dual Enclave Foldables", revenue: 80080, sharePercent: 26, unitsCount: 68 },
          { tierName: "Enterprise Fleet", revenue: 49280, sharePercent: 16, unitsCount: 55 },
          { tierName: "Care Warranty & Add-ons", revenue: 18480, sharePercent: 6, unitsCount: 180 },
        ],
        monthlyTimeseries: [
          { month: "Oct 3", gross: 47000, net: 41800, discounts: 1800, marginPercent: 28.6 },
          { month: "Oct 4", gross: 49500, net: 44000, discounts: 1950, marginPercent: 28.8 },
          { month: "Oct 5", gross: 51200, net: 45400, discounts: 2100, marginPercent: 29.0 },
          { month: "Oct 6", gross: 53800, net: 47600, discounts: 2250, marginPercent: 29.1 },
          { month: "Oct 7", gross: 50900, net: 45100, discounts: 2100, marginPercent: 28.9 },
          { month: "Oct 8", gross: 52400, net: 46500, discounts: 2200, marginPercent: 29.0 },
        ],
      };
    case "quarter":
      return {
        grossRevenue: 4210000,
        netRevenue: 3780000,
        profitMarginPercent: 28.7,
        totalDiscountsApplied: 168000,
        shippingRevenue: 84000,
        refundDeductions: 346000,
        momGrowthPercent: 17.5,
        tiers: [
          { tierName: "Satellite Flagship Pro", revenue: 1965600, sharePercent: 52, unitsCount: 1372 },
          { tierName: "Dual Enclave Foldables", revenue: 982800, sharePercent: 26, unitsCount: 686 },
          { tierName: "Enterprise Fleet", revenue: 604800, sharePercent: 16, unitsCount: 672 },
          { tierName: "Care Warranty & Add-ons", revenue: 226800, sharePercent: 6, unitsCount: 1720 },
        ],
        monthlyTimeseries: [
          { month: "Jul 2026", gross: 1320000, net: 1180000, discounts: 51000, marginPercent: 28.2 },
          { month: "Aug 2026", gross: 1410000, net: 1260000, discounts: 56000, marginPercent: 28.5 },
          { month: "Sep 2026", gross: 1480000, net: 1340000, discounts: 61000, marginPercent: 28.9 },
        ],
      };
    case "year":
      return {
        grossRevenue: 16400000,
        netRevenue: 14680000,
        profitMarginPercent: 28.5,
        totalDiscountsApplied: 640000,
        shippingRevenue: 320000,
        refundDeductions: 1400000,
        momGrowthPercent: 21.8,
        tiers: [
          { tierName: "Satellite Flagship Pro", revenue: 7633600, sharePercent: 52, unitsCount: 5262 },
          { tierName: "Dual Enclave Foldables", revenue: 3816800, sharePercent: 26, unitsCount: 2631 },
          { tierName: "Enterprise Fleet", revenue: 2348800, sharePercent: 16, unitsCount: 2611 },
          { tierName: "Care Warranty & Add-ons", revenue: 880800, sharePercent: 6, unitsCount: 6820 },
        ],
        monthlyTimeseries: [
          { month: "Q1 2026", gross: 3650000, net: 3260000, discounts: 142000, marginPercent: 27.8 },
          { month: "Q2 2026", gross: 4020000, net: 3600000, discounts: 158000, marginPercent: 28.2 },
          { month: "Q3 2026", gross: 4520000, net: 4050000, discounts: 178000, marginPercent: 28.6 },
          { month: "Q4 2026 (YTD)", gross: 4210000, net: 3770000, discounts: 162000, marginPercent: 28.8 },
        ],
      };
    case "30d":
    default:
      return {
        grossRevenue: 1380000,
        netRevenue: 1240000,
        profitMarginPercent: 28.6,
        totalDiscountsApplied: 52000,
        shippingRevenue: 28500,
        refundDeductions: 116500,
        momGrowthPercent: 18.2,
        tiers: [
          { tierName: "Satellite Flagship Pro", revenue: 644800, sharePercent: 52, unitsCount: 4290 },
          { tierName: "Dual Enclave Foldables", revenue: 322400, sharePercent: 26, unitsCount: 1840 },
          { tierName: "Enterprise Fleet", revenue: 198400, sharePercent: 16, unitsCount: 2150 },
          { tierName: "Care Warranty & Add-ons", revenue: 74400, sharePercent: 6, unitsCount: 5410 },
        ],
        monthlyTimeseries: [
          { month: "May 2026", gross: 840000, net: 760000, discounts: 28000, marginPercent: 26.2 },
          { month: "Jun 2026", gross: 920000, net: 835000, discounts: 31000, marginPercent: 27.1 },
          { month: "Jul 2026", gross: 985000, net: 890000, discounts: 34000, marginPercent: 27.5 },
          { month: "Aug 2026", gross: 1120000, net: 1010000, discounts: 42000, marginPercent: 28.0 },
          { month: "Sep 2026", gross: 1245000, net: 1125000, discounts: 49000, marginPercent: 28.4 },
          { month: "Oct 2026", gross: 1380000, net: 1240000, discounts: 52000, marginPercent: 28.6 },
        ],
      };
  }
}

export function getDynamicBestSellers(range: DateRangeOption): BestSellingPhoneItem[] {
  let multiplier = 1;
  if (range === "today") multiplier = 0.005;
  else if (range === "7d") multiplier = 0.035;
  else if (range === "quarter") multiplier = 3.0;
  else if (range === "year") multiplier = 10.0;

  return [
    {
      id: "nx-p01",
      name: "NexPhone Ultra Titanium 5G",
      modelCode: "NX-ULTRA-TI",
      brandName: "NexPhone Flagship",
      unitsSold: Math.max(1, Math.round(2840 * multiplier)),
      revenue: Math.max(1299, Math.round(3689160 * multiplier)),
      averagePrice: 1299,
      stockRemaining: 184,
      returnRatePercent: 0.8,
      averageRating: 4.9,
      marketSharePercent: 38.4,
      growthTrend: "up",
    },
    {
      id: "nx-p02",
      name: "NexPhone Fold Zero Dual Enclave",
      modelCode: "NX-FOLD-ZERO",
      brandName: "NexPhone Innovation",
      unitsSold: Math.max(1, Math.round(1920 * multiplier)),
      revenue: Math.max(1799, Math.round(3454080 * multiplier)),
      averagePrice: 1799,
      stockRemaining: 68,
      returnRatePercent: 1.2,
      averageRating: 4.8,
      marketSharePercent: 26.1,
      growthTrend: "up",
    },
    {
      id: "nx-p03",
      name: "NexPhone Pro 16 Satellite VoWiFi",
      modelCode: "NX-PRO-16",
      brandName: "NexPhone Flagship",
      unitsSold: Math.max(1, Math.round(1650 * multiplier)),
      revenue: Math.max(1099, Math.round(1813350 * multiplier)),
      averagePrice: 1099,
      stockRemaining: 210,
      returnRatePercent: 0.9,
      averageRating: 4.7,
      marketSharePercent: 18.5,
      growthTrend: "up",
    },
    {
      id: "nx-p04",
      name: "NexPhone Prime Neo Fleet",
      modelCode: "NX-PRIME-NEO",
      brandName: "Enterprise Fleet",
      unitsSold: Math.max(1, Math.round(1240 * multiplier)),
      revenue: Math.max(899, Math.round(1114760 * multiplier)),
      averagePrice: 899,
      stockRemaining: 340,
      returnRatePercent: 0.5,
      averageRating: 4.6,
      marketSharePercent: 11.2,
      growthTrend: "flat",
    },
    {
      id: "nx-p05",
      name: "NexPhone Cyber Carbon Edition",
      modelCode: "NX-CYBER-CRB",
      brandName: "Special Edition",
      unitsSold: Math.max(1, Math.round(680 * multiplier)),
      revenue: Math.max(1399, Math.round(951320 * multiplier)),
      averagePrice: 1399,
      stockRemaining: 24,
      returnRatePercent: 1.4,
      averageRating: 4.9,
      marketSharePercent: 5.8,
      growthTrend: "down",
    },
  ];
}

const FALLBACK_CUSTOMERS: CustomerStatsSummary = {
  totalCustomers: 18450,
  activeBuyersCount: 12540,
  newSignupsThisMonth: 412,
  returningCustomerRate: 67.8,
  averageLTV: 4850,
  churnRatePercent: 1.6,
  tierDistribution: [
    { tier: "VIP Partner", count: 2214, sharePercent: 12 },
    { tier: "Enterprise Fleet", count: 5166, sharePercent: 28 },
    { tier: "Pro Fleet", count: 6457, sharePercent: 35 },
    { tier: "Regular Consumer", count: 4613, sharePercent: 25 },
  ],
  topSpenders: [
    {
      id: "cust-001",
      name: "Alex Vance",
      email: "a.vance@blackmesa.io",
      tier: "VIP",
      ordersCount: 18,
      totalSpent: 34250,
      lastOrderAt: "2026-10-08T18:30:00Z",
      location: "Seattle, US",
    },
    {
      id: "cust-002",
      name: "Marcus Sterling",
      email: "m.sterling@novacapital.com",
      tier: "Enterprise",
      ordersCount: 14,
      totalSpent: 28900,
      lastOrderAt: "2026-10-07T12:15:00Z",
      location: "London, UK",
    },
    {
      id: "cust-003",
      name: "Elena Rostova",
      email: "elena@quantumfleet.de",
      tier: "Enterprise",
      ordersCount: 11,
      totalSpent: 24600,
      lastOrderAt: "2026-10-06T15:45:00Z",
      location: "Frankfurt, DE",
    },
    {
      id: "cust-004",
      name: "Kenji Sato",
      email: "k.sato@cyberdynelabs.jp",
      tier: "VIP",
      ordersCount: 9,
      totalSpent: 19800,
      lastOrderAt: "2026-10-05T09:20:00Z",
      location: "Tokyo, JP",
    },
  ],
};

const FALLBACK_INVENTORY: InventoryReportSummary = {
  totalValuation: 8420000,
  totalUnitsInStock: 14200,
  lowStockItemsCount: 3,
  outOfStockItemsCount: 1,
  stockTurnoverRate: 4.8,
  daysOfInventoryRemaining: 26,
  fastDepletingSkus: [
    {
      phoneId: "nx-p02",
      name: "NexPhone Fold Zero Dual Enclave (512GB)",
      modelCode: "NX-FOLD-ZERO-512",
      currentStock: 14,
      reorderThreshold: 50,
      burnRatePerWeek: 32,
      daysRemaining: 3,
      status: "critical",
    },
    {
      phoneId: "nx-p05",
      name: "NexPhone Cyber Carbon Edition (1TB)",
      modelCode: "NX-CYBER-1TB",
      currentStock: 24,
      reorderThreshold: 40,
      burnRatePerWeek: 18,
      daysRemaining: 9,
      status: "critical",
    },
    {
      phoneId: "nx-p01",
      name: "NexPhone Ultra Titanium (256GB Midnight)",
      modelCode: "NX-ULTRA-256",
      currentStock: 48,
      reorderThreshold: 100,
      burnRatePerWeek: 45,
      daysRemaining: 7,
      status: "warning",
    },
    {
      phoneId: "nx-p03",
      name: "NexPhone Pro 16 Satellite (256GB Silver)",
      modelCode: "NX-PRO16-256",
      currentStock: 180,
      reorderThreshold: 80,
      burnRatePerWeek: 28,
      daysRemaining: 45,
      status: "optimal",
    },
  ],
  warehouses: [
    {
      warehouseId: "wh-sf",
      name: "San Francisco Logistics Hub",
      location: "California, US",
      unitsCount: 6840,
      utilizationPercent: 82,
      valuation: 4320000,
    },
    {
      warehouseId: "wh-fra",
      name: "Frankfurt Air Cargo Terminal",
      location: "Hessen, Germany",
      unitsCount: 4620,
      utilizationPercent: 68,
      valuation: 2790000,
    },
    {
      warehouseId: "wh-sin",
      name: "Singapore Changi Sat-Depot",
      location: "East Region, Singapore",
      unitsCount: 2740,
      utilizationPercent: 54,
      valuation: 1310000,
    },
  ],
};

export const analyticsService = {
  getDynamicSalesReport,
  getDynamicRevenueReport,
  getDynamicBestSellers,

  async getSalesReport(range: DateRangeOption = "30d"): Promise<SalesReportSummary> {
    try {
      const res = await fetch(`${API_BASE}/api/analytics/sales?range=${range}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.totalSalesVolume && json.dailyTimeline?.length > 0) {
          return json;
        }
      }
    } catch {
      // Fallback
    }
    return getDynamicSalesReport(range);
  },

  async getRevenueReport(range: DateRangeOption = "30d"): Promise<RevenueReportSummary> {
    try {
      const res = await fetch(`${API_BASE}/api/analytics/revenue?range=${range}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.grossRevenue && json.monthlyTimeseries?.length > 0) {
          return json;
        }
      }
    } catch {
      // Fallback
    }
    return getDynamicRevenueReport(range);
  },

  async getBestSellingPhones(range: DateRangeOption = "30d"): Promise<BestSellingPhoneItem[]> {
    try {
      const res = await fetch(`${API_BASE}/api/analytics/best-sellers?range=${range}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          return json;
        }
      }
    } catch {
      // Fallback
    }
    return getDynamicBestSellers(range);
  },

  async getCustomerStats(): Promise<CustomerStatsSummary> {
    try {
      const res = await fetch(`${API_BASE}/api/analytics/customers`, {
        cache: "no-store",
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return FALLBACK_CUSTOMERS;
  },

  async getInventoryReport(): Promise<InventoryReportSummary> {
    try {
      const res = await fetch(`${API_BASE}/api/analytics/inventory`, {
        cache: "no-store",
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return FALLBACK_INVENTORY;
  },

  async getExecutiveOverview(range: DateRangeOption = "30d"): Promise<ExecutiveReportBundle> {
    const [sales, revenue, bestSellers, customers, inventory] = await Promise.all([
      this.getSalesReport(range),
      this.getRevenueReport(range),
      this.getBestSellingPhones(range),
      this.getCustomerStats(),
      this.getInventoryReport(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      dateRange: range,
      sales,
      revenue,
      bestSellers,
      customers,
      inventory,
    };
  },

  exportToCsv(data: Record<string, unknown>[], filename: string) {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]!);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((fieldName) => {
            const val = row[fieldName];
            const escaped = String(val ?? "").replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportToJson(data: unknown, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
