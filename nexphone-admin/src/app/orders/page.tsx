"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  UpdateOrderStatusPayload,
  CancelOrderPayload,
} from "@/types/order";
import { orderService } from "@/services/order.service";
import { OrderKPIs } from "@/components/orders/OrderKPIs";
import { OrderTable } from "@/components/orders/OrderTable";
import { OrderDetailModal } from "@/components/orders/OrderDetailModal";
import { ConfirmOrderModal } from "@/components/orders/ConfirmOrderModal";
import { UpdateStatusModal } from "@/components/orders/UpdateStatusModal";
import { CancelOrderModal } from "@/components/orders/CancelOrderModal";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentStatus>("all");

  // Modals state
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [confirmingOrder, setConfirmingOrder] = useState<Order | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load orders on mount
  useEffect(() => {
    let isSubscribed = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await orderService.fetchOrders();
        if (isSubscribed) {
          setOrders(data);
        }
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orderService.applyLocalFilters(orders, {
      search,
      status: statusFilter,
      paymentStatus: paymentFilter,
    });
  }, [orders, search, statusFilter, paymentFilter]);

  // Aggregated KPIs
  const metrics = useMemo(() => {
    return orderService.calculateMetrics(orders);
  }, [orders]);

  // Handlers
  const handleConfirmOrder = async (orderId: string) => {
    setIsSubmitting(true);
    try {
      const updated = await orderService.confirmOrder(orderId, "Admin Staff");
      startTransition(() => {
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        if (detailOrder?.id === updated.id) setDetailOrder(updated);
        setConfirmingOrder(null);
      });
      showToast(`Order ${updated.orderNumber} confirmed successfully. Inventory reserved.`);
    } catch {
      alert("Failed to confirm order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, payload: UpdateOrderStatusPayload) => {
    setIsSubmitting(true);
    try {
      const updated = await orderService.updateOrderStatus(orderId, payload);
      startTransition(() => {
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        if (detailOrder?.id === updated.id) setDetailOrder(updated);
        setUpdatingOrder(null);
      });
      showToast(
        `Order ${updated.orderNumber} status updated to ${updated.status.toUpperCase()}${
          payload.trackingNumber ? ` (Tracking: ${payload.trackingNumber})` : ""
        }`
      );
    } catch {
      alert("Failed to update status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId: string, payload: CancelOrderPayload) => {
    setIsSubmitting(true);
    try {
      const updated = await orderService.cancelOrder(orderId, payload);
      startTransition(() => {
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        if (detailOrder?.id === updated.id) setDetailOrder(updated);
        setCancellingOrder(null);
      });
      showToast(
        `Order ${updated.orderNumber} has been cancelled.${
          updated.payment.status === "refunded" ? " Refund processed." : ""
        }`
      );
    } catch {
      alert("Failed to cancel order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
  };

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "all" || paymentFilter !== "all";

  return (
    <main className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-6 xl:p-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-slate-900/95 px-4 py-3 text-xs font-semibold text-emerald-300 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5">
          <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Order Management</h1>
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
              {metrics.totalOrders} Orders
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Monitor incoming customer purchases, verify corporate payments, confirm fulfillment, and track dispatches.
          </p>
        </div>

        {/* Header Summary Quick Stat */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-mono text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>{metrics.paidOrdersCount} Paid Transactions</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <OrderKPIs
        metrics={metrics}
        activeStatus={statusFilter}
        onStatusFilter={(status) => setStatusFilter(status)}
      />

      {/* Filter and Search Toolbar */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Search by Order ID, Customer, Email, SKU, or Product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-800 bg-slate-900/80 pl-9 pr-8 text-xs text-white placeholder-slate-500 transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Order Lifecycle Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | OrderStatus)}
              className="h-9 appearance-none rounded-lg border border-slate-800 bg-slate-900/80 pl-3 pr-8 text-xs text-white transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Order Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Payment Status Filter */}
          <div className="relative">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as "all" | PaymentStatus)}
              className="h-9 appearance-none rounded-lg border border-slate-800 bg-slate-900/80 pl-3 pr-8 text-xs text-white transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending Payment</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Results Counter & Reset Filter */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white font-semibold">{filteredOrders.length}</strong> of{" "}
            {orders.length} total orders
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Main Order Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-3 text-xs text-slate-400">Loading orders telemetry...</p>
        </div>
      ) : (
        <OrderTable
          orders={filteredOrders}
          onViewDetails={(order) => setDetailOrder(order)}
          onConfirmOrder={(order) => setConfirmingOrder(order)}
          onUpdateStatus={(order) => setUpdatingOrder(order)}
          onCancelOrder={(order) => setCancellingOrder(order)}
        />
      )}

      {/* Modals */}
      <OrderDetailModal
        order={detailOrder}
        isOpen={Boolean(detailOrder)}
        onClose={() => setDetailOrder(null)}
        onConfirmOrder={(order) => {
          setConfirmingOrder(order);
        }}
        onUpdateStatus={(order) => {
          setUpdatingOrder(order);
        }}
        onCancelOrder={(order) => {
          setCancellingOrder(order);
        }}
      />

      <ConfirmOrderModal
        order={confirmingOrder}
        isOpen={Boolean(confirmingOrder)}
        isSubmitting={isSubmitting}
        onClose={() => setConfirmingOrder(null)}
        onConfirm={handleConfirmOrder}
      />

      <UpdateStatusModal
        order={updatingOrder}
        isOpen={Boolean(updatingOrder)}
        isSubmitting={isSubmitting}
        onClose={() => setUpdatingOrder(null)}
        onUpdate={handleUpdateStatus}
      />

      <CancelOrderModal
        order={cancellingOrder}
        isOpen={Boolean(cancellingOrder)}
        isSubmitting={isSubmitting}
        onClose={() => setCancellingOrder(null)}
        onCancel={handleCancelOrder}
      />
    </main>
  );
}
