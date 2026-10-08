"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import type {
  Customer,
  CustomerStatus,
  CustomerTier,
  ToggleCustomerStatusPayload,
  CustomerSummaryMetrics,
} from "@/types/customer";
import { CustomerService } from "@/services/customer.service";
import { CustomerKPIs } from "@/components/customers/CustomerKPIs";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { CustomerDetailModal } from "@/components/customers/CustomerDetailModal";
import { ToggleCustomerStatusModal } from "@/components/customers/ToggleCustomerStatusModal";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "all">("all");
  const [tierFilter, setTierFilter] = useState<CustomerTier | "all">("all");
  const [sortBy, setSortBy] = useState<"recent" | "spent_desc" | "orders_desc" | "name_asc">("recent");

  // Modals
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [togglingCustomer, setTogglingCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Initial load
  useEffect(() => {
    let isSubscribed = true;
    async function loadCustomers() {
      setIsLoading(true);
      try {
        const data = await CustomerService.getCustomers();
        if (isSubscribed) {
          setCustomers(data);
        }
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    loadCustomers();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Filtered & Sorted Customer list
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
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

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (tierFilter !== "all") {
      result = result.filter((c) => c.tier === tierFilter);
    }

    if (sortBy === "spent_desc") {
      result.sort((a, b) => b.metrics.totalSpent - a.metrics.totalSpent);
    } else if (sortBy === "orders_desc") {
      result.sort((a, b) => b.metrics.totalOrders - a.metrics.totalOrders);
    } else if (sortBy === "name_asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [customers, searchQuery, statusFilter, tierFilter, sortBy]);

  // Aggregated Telemetry Metrics
  const metrics: CustomerSummaryMetrics = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => c.status === "active").length;
    const disabledCustomers = customers.filter((c) => c.status === "disabled").length;
    const totalLtv = customers.reduce((acc, c) => acc + c.metrics.totalSpent, 0);
    const avgSpendPerCustomer = totalCustomers > 0 ? totalLtv / totalCustomers : 0;
    const vipCustomers = customers.filter((c) => c.tier === "VIP" || c.tier === "Enterprise").length;

    return {
      totalCustomers,
      activeCustomers,
      disabledCustomers,
      totalLtv,
      avgSpendPerCustomer,
      vipCustomers,
    };
  }, [customers]);

  // Action: Toggle Customer Status
  const handleToggleStatus = async (payload: ToggleCustomerStatusPayload) => {
    setIsSubmitting(true);
    try {
      const updated = await CustomerService.toggleStatus(payload);
      startTransition(() => {
        setCustomers((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        if (detailCustomer && detailCustomer.id === updated.id) {
          setDetailCustomer(updated);
        }
      });
      showToast(
        payload.status === "disabled"
          ? `Account ${updated.customerNumber} (${updated.name}) has been restricted.`
          : `Account ${updated.customerNumber} (${updated.name}) has been reactivated.`
      );
      setTogglingCustomer(null);
    } catch {
      showToast("Error updating customer account status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTierFilter("all");
    setSortBy("recent");
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const data = await CustomerService.getCustomers();
      setCustomers(data);
      showToast("Customer directory synchronized.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-6 xl:p-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-indigo-500/30 bg-slate-900/95 px-4 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-200">
          <div className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Customer Management
            </h1>
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-400 font-mono">
              {customers.length} Accounts
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            View customer profiles, track lifetime orders, review security flags, and control account permissions.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-10 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-4 text-xs font-semibold text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-900 hover:text-white active:scale-95 disabled:opacity-50"
          >
            <svg
              className={`h-4 w-4 ${isLoading ? "animate-spin text-indigo-400" : "text-slate-400"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            <span>Sync Directory</span>
          </button>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <CustomerKPIs
        metrics={metrics}
        activeStatus={statusFilter}
        onStatusFilter={(s) => setStatusFilter(s)}
      />

      {/* Full Customer Table */}
      <CustomerTable
        customers={filteredCustomers}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        tierFilter={tierFilter}
        onTierFilterChange={setTierFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onViewDetails={(c) => setDetailCustomer(c)}
        onToggleStatus={(c) => setTogglingCustomer(c)}
        onResetFilters={handleResetFilters}
      />

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={detailCustomer}
        isOpen={Boolean(detailCustomer)}
        onClose={() => setDetailCustomer(null)}
        onToggleStatus={(c) => {
          setDetailCustomer(null);
          setTogglingCustomer(c);
        }}
      />

      {/* Toggle Customer Status Modal */}
      <ToggleCustomerStatusModal
        customer={togglingCustomer}
        isOpen={Boolean(togglingCustomer)}
        isSubmitting={isSubmitting}
        onClose={() => setTogglingCustomer(null)}
        onConfirmToggle={handleToggleStatus}
      />
    </main>
  );
}
