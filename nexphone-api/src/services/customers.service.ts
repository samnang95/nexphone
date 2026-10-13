import { customersRepo } from "../repositories/customers.repo";
import { CustomerRecord, getCustomerRecentOrders } from "../data/customers.data";
import { sanitizeCustomer, serializeCustomerRecord } from "../views/customers.view";

export interface CustomerQueryFilters {
  search?: string;
  status?: string;
  tier?: string;
  sortBy?: string;
}

export interface CustomerStatusInput {
  status: "active" | "disabled";
  reason?: string;
  note?: string;
  performedBy?: string;
}

export const customersService = {
  async getCustomers(query: CustomerQueryFilters = {}): Promise<any[]> {
    const { search, status, tier, sortBy } = query;
    let allCustomers = await customersRepo.getAllCustomers();
    let results = allCustomers;
    if (typeof search === "string" && search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.customerNumber.toLowerCase().includes(q) ||
          c.address.city.toLowerCase().includes(q) ||
          c.address.country.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q))
      );
    }

    if (typeof status === "string" && status !== "all") {
      results = results.filter((c) => c.status === status);
    }

    if (typeof tier === "string" && tier !== "all") {
      results = results.filter((c) => c.tier === tier);
    }

    if (sortBy === "spent_desc") {
      results.sort((a, b) => b.metrics.totalSpent - a.metrics.totalSpent);
    } else if (sortBy === "orders_desc") {
      results.sort((a, b) => b.metrics.totalOrders - a.metrics.totalOrders);
    } else if (sortBy === "name_asc") {
      results.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return results.map((c) => ({
      ...sanitizeCustomer(c),
      recentOrders: getCustomerRecentOrders(c.email),
    }));
  },

  async getCustomerById(id: string): Promise<any | null> {
    const found = await customersRepo.findCustomerById(id);
    if (!found) return null;

    if (found.userDoc) {
      const record = serializeCustomerRecord(found.userDoc);
      return {
        ...record,
        recentOrders: getCustomerRecentOrders(record.email),
      };
    }

    if (found.storeRecord) {
      return {
        ...sanitizeCustomer(found.storeRecord),
        recentOrders: getCustomerRecentOrders(found.storeRecord.email),
      };
    }

    return null;
  },

  async updateCustomerStatus(id: string, input: CustomerStatusInput): Promise<any | null> {
    const { status, reason, note, performedBy = "Admin Staff" } = input;
    const isDisabled = status === "disabled";

    const updatedUser = await customersRepo.updateCustomerStatusInDb(id, {
      status,
      disabledReason: isDisabled ? reason || "Administrative restriction" : undefined,
      disabledAt: isDisabled ? new Date() : undefined,
      disabledBy: isDisabled ? performedBy : undefined,
      notes: note,
      incrementTokenVersion: isDisabled,
    });

    if (updatedUser) {
      const record = serializeCustomerRecord(updatedUser);
      return {
        ...record,
        recentOrders: getCustomerRecentOrders(record.email),
      };
    }

    const updatedStore = customersRepo.updateCustomerStatusInStore(id, {
      status,
      disabledReason: isDisabled ? reason || "Administrative restriction" : undefined,
      disabledAt: isDisabled ? new Date().toISOString() : undefined,
      disabledBy: isDisabled ? performedBy : undefined,
      note,
      performedBy,
    });

    if (updatedStore) {
      return {
        ...sanitizeCustomer(updatedStore),
        recentOrders: getCustomerRecentOrders(updatedStore.email),
      };
    }

    return null;
  },

  async getMetrics(): Promise<any> {
    const counts = await customersRepo.getMetricsCounts();
    if (counts.fromDb) {
      return {
        totalCustomers: counts.total,
        activeCustomers: counts.active,
        disabledCustomers: counts.disabled,
        totalLtv: counts.total * 1250,
        avgSpendPerCustomer: 1250,
        vipCustomers: counts.vip,
      };
    }
    const allCustomers = await customersRepo.getAllCustomers();
    const totalLtv = allCustomers.reduce((acc, c) => acc + c.metrics.totalSpent, 0);
    const avgSpendPerCustomer = counts.total > 0 ? totalLtv / counts.total : 0;
    return {
      totalCustomers: counts.total,
      activeCustomers: counts.active,
      disabledCustomers: counts.disabled,
      totalLtv,
      avgSpendPerCustomer,
      vipCustomers: counts.vip,
    };
  },
};
