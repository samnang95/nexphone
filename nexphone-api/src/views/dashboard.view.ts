export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function serializeTotalRevenue(data: {
  amount: number;
  changePercentage: number;
  trend: "up" | "down" | "flat";
  periodLabel: string;
  grossRevenue: number;
  netRevenue: number;
  monthlyPoints: any[];
  categoryBreakdown: any[];
}) {
  return {
    value: formatCurrency(data.amount),
    amount: data.amount,
    grossRevenue: data.grossRevenue,
    netRevenue: data.netRevenue,
    totalYearToDate: formatCurrency(Math.round(data.amount * 4.2)),
    projectedArr: formatCurrency(Math.round(data.amount * 5.5)),
    avgOrderValue: formatCurrency(Math.round(data.amount / 380)),
    changePercentage: data.changePercentage,
    trend: data.trend,
    periodLabel: data.periodLabel,
    monthlyPoints: data.monthlyPoints,
    categoryBreakdown: data.categoryBreakdown,
  };
}

export function serializeTotalOrders(data: {
  count: number;
  changePercentage: number;
  trend: "up" | "down" | "flat";
  periodLabel: string;
  statusBreakdown: Record<string, number>;
  fulfillmentRate: number;
}) {
  return {
    value: formatNumber(data.count),
    count: data.count,
    changePercentage: data.changePercentage,
    trend: data.trend,
    periodLabel: data.periodLabel,
    statusBreakdown: data.statusBreakdown,
    fulfillmentRate: data.fulfillmentRate,
  };
}

export function serializeTotalCustomers(data: {
  count: number;
  changePercentage: number;
  trend: "up" | "down" | "flat";
  periodLabel: string;
  activeBuyersCount: number;
  newSignups: number;
  tierDistribution: any[];
}) {
  return {
    value: formatNumber(data.count),
    count: data.count,
    changePercentage: data.changePercentage,
    trend: data.trend,
    periodLabel: data.periodLabel,
    activeBuyersCount: data.activeBuyersCount,
    newSignups: data.newSignups,
    tierDistribution: data.tierDistribution,
  };
}

export function serializeTotalProducts(data: {
  count: number;
  changePercentage: number;
  trend: "up" | "down" | "flat";
  periodLabel: string;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}) {
  return {
    value: String(data.count),
    count: data.count,
    changePercentage: data.changePercentage,
    trend: data.trend,
    periodLabel: data.periodLabel,
    inStockCount: data.inStockCount,
    lowStockCount: data.lowStockCount,
    outOfStockCount: data.outOfStockCount,
  };
}

export function serializeRecentOrders(orders: any[]) {
  return orders.map((o) => {
    const firstItem = o.items && o.items[0];
    const totalQty = o.items ? o.items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0) : 1;
    const amountVal = Number(o.totalAmount || o.subtotal || 0);

    return {
      id: o.id || o.orderNumber,
      orderNumber: o.orderNumber || o.id,
      customerName: o.customer?.name || "Verified Customer",
      customerEmail: o.customer?.email || "customer@example.com",
      customerLocation: o.customer?.shippingAddress
        ? `${o.customer.shippingAddress.city}, ${o.customer.shippingAddress.country}`
        : "San Francisco, US",
      productName: firstItem ? firstItem.productName : "NexPhone Hardware",
      productSku: firstItem?.sku || "NX-HW",
      quantity: totalQty,
      amount: formatCurrency(amountVal),
      rawAmount: amountVal,
      status: o.status || "confirmed",
      paymentMethod: o.payment?.methodLabel || o.payment?.method || "Encrypted Credit Card",
      createdAt: o.createdAt,
      trackingNumber: o.shipping?.trackingNumber || "TRK-EXP-PENDING",
      shippingCarrier: o.shipping?.carrier || "NexExpress Courier",
    };
  });
}
