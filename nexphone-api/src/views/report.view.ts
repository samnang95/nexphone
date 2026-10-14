import { generateCsv } from "../utils/csv";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

// ==========================================
// 1. Sales Report Serialization
// ==========================================
export function serializeSalesReport(data: {
  range: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalOrders: number;
  totalUnitsSold: number;
  averageOrderValue: number;
  totalDiscounts: number;
  netRevenue: number;
  breakdown: Array<{
    period: string;
    revenue: number;
    ordersCount: number;
    unitsSold: number;
    avgOrderValue: number;
  }>;
  topProducts: Array<{
    name: string;
    sku: string;
    unitsSold: number;
    revenue: number;
  }>;
  channels: Array<{
    channel: string;
    revenue: number;
    ordersCount: number;
    percentage: number;
  }>;
}) {
  return {
    reportType: "sales",
    title: "NexPhone Global Commercial Sales Report",
    generatedAt: new Date().toISOString(),
    period: {
      range: data.range,
      startDate: data.startDate,
      endDate: data.endDate,
    },
    summary: {
      totalRevenue: data.totalRevenue,
      formattedTotalRevenue: formatCurrency(data.totalRevenue),
      totalOrders: data.totalOrders,
      totalUnitsSold: data.totalUnitsSold,
      averageOrderValue: data.averageOrderValue,
      formattedAverageOrderValue: formatCurrency(data.averageOrderValue),
      totalDiscounts: data.totalDiscounts,
      formattedTotalDiscounts: formatCurrency(data.totalDiscounts),
      netRevenue: data.netRevenue,
      formattedNetRevenue: formatCurrency(data.netRevenue),
    },
    breakdown: data.breakdown.map((b) => ({
      ...b,
      formattedRevenue: formatCurrency(b.revenue),
      formattedAvgOrderValue: formatCurrency(b.avgOrderValue),
    })),
    topProducts: data.topProducts.map((p) => ({
      ...p,
      formattedRevenue: formatCurrency(p.revenue),
    })),
    channels: data.channels.map((c) => ({
      ...c,
      formattedRevenue: formatCurrency(c.revenue),
    })),
  };
}

export function serializeSalesReportCsv(data: ReturnType<typeof serializeSalesReport>): string {
  const headers = [
    "Period",
    "Revenue (USD)",
    "Orders Count",
    "Units Sold",
    "Average Order Value (USD)",
  ];

  const rows = data.breakdown.map((b) => [
    b.period,
    b.revenue,
    b.ordersCount,
    b.unitsSold,
    b.avgOrderValue,
  ]);

  return generateCsv(headers, rows);
}

// ==========================================
// 2. Order Report Serialization
// ==========================================
export function serializeOrderReport(data: {
  range?: string;
  startDate?: string;
  endDate?: string;
  totalOrders: number;
  fulfilledOrders: number;
  cancelledOrders: number;
  fulfillmentRate: number;
  totalAmount: number;
  averageAmount: number;
  statusBreakdown: Record<string, number>;
  paymentBreakdown: Record<string, number>;
  orders: Array<{
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    totalAmount: number;
    itemsCount: number;
    shippingCarrier?: string;
    trackingNumber?: string;
    createdAt: string;
  }>;
}) {
  return {
    reportType: "orders",
    title: "NexPhone Order Operations & Fulfillment Report",
    generatedAt: new Date().toISOString(),
    filter: {
      range: data.range || "all",
      startDate: data.startDate,
      endDate: data.endDate,
    },
    summary: {
      totalOrders: data.totalOrders,
      fulfilledOrders: data.fulfilledOrders,
      cancelledOrders: data.cancelledOrders,
      fulfillmentRate: data.fulfillmentRate,
      totalAmount: data.totalAmount,
      formattedTotalAmount: formatCurrency(data.totalAmount),
      averageAmount: data.averageAmount,
      formattedAverageAmount: formatCurrency(data.averageAmount),
    },
    statusBreakdown: data.statusBreakdown,
    paymentBreakdown: data.paymentBreakdown,
    orders: data.orders.map((o) => ({
      ...o,
      formattedTotalAmount: formatCurrency(o.totalAmount),
    })),
  };
}

export function serializeOrderReportCsv(data: ReturnType<typeof serializeOrderReport>): string {
  const headers = [
    "Order Number",
    "Customer Name",
    "Customer Email",
    "Order Status",
    "Payment Status",
    "Payment Method",
    "Items Count",
    "Total Amount (USD)",
    "Shipping Carrier",
    "Tracking Number",
    "Created Date",
  ];

  const rows = data.orders.map((o) => [
    o.orderNumber,
    o.customerName,
    o.customerEmail,
    o.status,
    o.paymentStatus,
    o.paymentMethod,
    o.itemsCount,
    o.totalAmount,
    o.shippingCarrier || "N/A",
    o.trackingNumber || "N/A",
    o.createdAt,
  ]);

  return generateCsv(headers, rows);
}

// ==========================================
// 3. Inventory Report Serialization
// ==========================================
export function serializeInventoryReport(data: {
  warehouseFilter: string;
  statusFilter: string;
  totalItems: number;
  totalUnits: number;
  totalValuation: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
  averageUnitCost: number;
  warehouseBreakdown: Array<{
    warehouse: string;
    itemCount: number;
    totalStock: number;
    totalValuation: number;
  }>;
  items: Array<{
    id: string;
    sku: string;
    productName: string;
    brandName: string;
    warehouse: string;
    stockQuantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    lowStockThreshold: number;
    unitCost: number;
    retailPrice: number;
    totalValue: number;
    status: string;
    lastRestocked: string;
  }>;
}) {
  return {
    reportType: "inventory",
    title: "NexPhone Multi-Depot Inventory Valuation Report",
    generatedAt: new Date().toISOString(),
    filter: {
      warehouse: data.warehouseFilter,
      status: data.statusFilter,
    },
    summary: {
      totalItems: data.totalItems,
      totalUnits: data.totalUnits,
      totalValuation: data.totalValuation,
      formattedTotalValuation: formatCurrency(data.totalValuation),
      lowStockCount: data.lowStockCount,
      outOfStockCount: data.outOfStockCount,
      inStockCount: data.inStockCount,
      averageUnitCost: data.averageUnitCost,
      formattedAverageUnitCost: formatCurrency(data.averageUnitCost),
    },
    warehouseBreakdown: data.warehouseBreakdown.map((w) => ({
      ...w,
      formattedTotalValuation: formatCurrency(w.totalValuation),
    })),
    items: data.items.map((it) => ({
      ...it,
      formattedUnitCost: formatCurrency(it.unitCost),
      formattedRetailPrice: formatCurrency(it.retailPrice),
      formattedTotalValue: formatCurrency(it.totalValue),
    })),
  };
}

export function serializeInventoryReportCsv(data: ReturnType<typeof serializeInventoryReport>): string {
  const headers = [
    "SKU",
    "Product Name",
    "Brand",
    "Warehouse",
    "Stock Qty",
    "Available Qty",
    "Reserved Qty",
    "Low Stock Threshold",
    "Unit Cost (USD)",
    "Retail Price (USD)",
    "Total Value (USD)",
    "Status",
    "Last Restocked",
  ];

  const rows = data.items.map((it) => [
    it.sku,
    it.productName,
    it.brandName,
    it.warehouse,
    it.stockQuantity,
    it.availableQuantity,
    it.reservedQuantity,
    it.lowStockThreshold,
    it.unitCost,
    it.retailPrice,
    it.totalValue,
    it.status,
    it.lastRestocked,
  ]);

  return generateCsv(headers, rows);
}

// ==========================================
// 4. Customer Report Serialization
// ==========================================
export function serializeCustomerReport(data: {
  tierFilter: string;
  statusFilter: string;
  totalCustomers: number;
  activeCustomers: number;
  totalLifetimeSpent: number;
  averageCustomerLifetimeValue: number;
  tierCounts: Record<string, number>;
  tierBreakdown: Array<{
    tier: string;
    customerCount: number;
    totalSpent: number;
  }>;
  customers: Array<{
    customerNumber: string;
    name: string;
    email: string;
    company?: string;
    tier: string;
    status: string;
    totalOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    lastOrderDate: string;
    city: string;
    country: string;
  }>;
}) {
  return {
    reportType: "customers",
    title: "NexPhone Customer Cohort & Lifetime Value Report",
    generatedAt: new Date().toISOString(),
    filter: {
      tier: data.tierFilter,
      status: data.statusFilter,
    },
    summary: {
      totalCustomers: data.totalCustomers,
      activeCustomers: data.activeCustomers,
      totalLifetimeSpent: data.totalLifetimeSpent,
      formattedTotalLifetimeSpent: formatCurrency(data.totalLifetimeSpent),
      averageCustomerLifetimeValue: data.averageCustomerLifetimeValue,
      formattedAverageLifetimeValue: formatCurrency(data.averageCustomerLifetimeValue),
      tierCounts: data.tierCounts,
    },
    tierBreakdown: data.tierBreakdown.map((t) => ({
      ...t,
      formattedTotalSpent: formatCurrency(t.totalSpent),
    })),
    customers: data.customers.map((c) => ({
      ...c,
      formattedTotalSpent: formatCurrency(c.totalSpent),
      formattedAvgOrderValue: formatCurrency(c.avgOrderValue),
    })),
  };
}

export function serializeCustomerReportCsv(data: ReturnType<typeof serializeCustomerReport>): string {
  const headers = [
    "Customer Number",
    "Name",
    "Email",
    "Company",
    "Tier",
    "Status",
    "Total Orders",
    "Total Spent (USD)",
    "Avg Order Value (USD)",
    "Last Order Date",
    "City",
    "Country",
  ];

  const rows = data.customers.map((c) => [
    c.customerNumber,
    c.name,
    c.email,
    c.company || "Individual",
    c.tier,
    c.status,
    c.totalOrders,
    c.totalSpent,
    c.avgOrderValue,
    c.lastOrderDate,
    c.city,
    c.country,
  ]);

  return generateCsv(headers, rows);
}
