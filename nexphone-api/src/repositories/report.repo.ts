import { orderRepository } from "./order.repo";
import { ordersStore, OrderRecord } from "../data/orders.data";
import { customersStore, CustomerRecord } from "../data/customers.data";
import { inventoryCatalog, InventoryItemRecord } from "../data/inventory.data";
import { productsCatalog } from "../data/products.data";

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
  range?: "today" | "7d" | "30d" | "quarter" | "year" | "custom";
}

export class ReportRepository {
  /**
   * Filter orders by date range and statuses
   */
  async getOrdersForReport(filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
    paymentStatus?: string;
    limit?: number;
  } = {}): Promise<OrderRecord[]> {
    const { orders: repoOrders } = await orderRepository.find();
    
    // Combine with in-memory seeded store if repo returned fewer items
    const map = new Map<string, OrderRecord>();
    for (const o of ordersStore) {
      map.set(o.id || o.orderNumber, o);
    }
    for (const o of repoOrders) {
      map.set(o.id || o.orderNumber, o);
    }

    let orders = Array.from(map.values());

    if (filters.status && filters.status !== "all") {
      orders = orders.filter((o) => o.status === filters.status);
    }

    if (filters.paymentStatus && filters.paymentStatus !== "all") {
      orders = orders.filter((o) => o.payment?.status === filters.paymentStatus);
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      orders = orders.filter((o) => new Date(o.createdAt).getTime() >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      orders = orders.filter((o) => new Date(o.createdAt).getTime() <= end);
    }

    // Sort newest first
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filters.limit && filters.limit > 0) {
      orders = orders.slice(0, filters.limit);
    }

    return orders;
  }

  /**
   * Filter inventory records by warehouse and stock status
   */
  async getInventoryForReport(filters: {
    warehouse?: string;
    status?: string;
    brand?: string;
  } = {}): Promise<InventoryItemRecord[]> {
    let items = [...inventoryCatalog];

    if (filters.warehouse && filters.warehouse !== "all") {
      const targetWh = filters.warehouse.toLowerCase();
      items = items.filter((item) => item.warehouse.toLowerCase().includes(targetWh));
    }

    if (filters.status && filters.status !== "all") {
      items = items.filter((item) => item.status === filters.status);
    }

    if (filters.brand && filters.brand !== "all") {
      const targetBrand = filters.brand.toLowerCase();
      items = items.filter((item) => item.brandName.toLowerCase().includes(targetBrand));
    }

    // Sort by stock quantity ascending (highlight low-stock first)
    items.sort((a, b) => a.stockQuantity - b.stockQuantity);

    return items;
  }

  /**
   * Filter customer records by tier and status
   */
  async getCustomersForReport(filters: {
    tier?: string;
    status?: string;
    minSpent?: number;
    limit?: number;
  } = {}): Promise<CustomerRecord[]> {
    let customers = [...customersStore];

    if (filters.tier && filters.tier !== "all") {
      customers = customers.filter((c) => c.tier === filters.tier);
    }

    if (filters.status && filters.status !== "all") {
      customers = customers.filter((c) => c.status === filters.status);
    }

    if (filters.minSpent && filters.minSpent > 0) {
      customers = customers.filter((c) => (c.metrics?.totalSpent || 0) >= filters.minSpent!);
    }

    // Sort by total spent descending (top VIP customers first)
    customers.sort((a, b) => (b.metrics?.totalSpent || 0) - (a.metrics?.totalSpent || 0));

    if (filters.limit && filters.limit > 0) {
      customers = customers.slice(0, filters.limit);
    }

    return customers;
  }

  /**
   * Gather product catalog for product performance insights
   */
  async getProductsCatalog() {
    return [...productsCatalog];
  }
}

export const reportRepository = new ReportRepository();
