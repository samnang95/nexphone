"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import type { Order, OrderFilterStatus, OrderSortOption } from "@/types/order";
import { orderService } from "@/services/order.service";
import { ROUTES } from "@/routes";
import { OrderCard } from "./OrderCard";
import { CancelOrderModal } from "./CancelOrderModal";
import { TrackingQuickModal } from "./TrackingQuickModal";

export function OrderHistoryClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<OrderFilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<OrderSortOption>("newest");

  // Modals state
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  const showToast = useCallback((text: string, type: "success" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (e) {
      console.error("Failed to load orders", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        loadOrders();
      }
    });

    const handleOrdersChanged = () => {
      if (isMounted) {
        loadOrders();
      }
    };

    window.addEventListener("nexphone-orders-changed", handleOrdersChanged);
    return () => {
      isMounted = false;
      window.removeEventListener("nexphone-orders-changed", handleOrdersChanged);
    };
  }, [loadOrders]);

  // Handle successful cancellation
  const handleCancelSuccess = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
    showToast(`Order ${updatedOrder.orderNumber} successfully cancelled. Refund initiated.`);
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const active = orders.filter(
      (o) => o.status === "processing" || o.status === "confirmed" || o.status === "shipped"
    ).length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const totalSpent = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((acc, o) => acc + (o.total || 0), 0);

    return { totalOrders, active, delivered, totalSpent };
  }, [orders]);

  // Filter & sort logic
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Filter status
    if (activeStatus !== "all") {
      result = result.filter((o) => o.status.toLowerCase() === activeStatus.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((o) => {
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.shipping.carrier.toLowerCase().includes(q) ||
          o.shipping.trackingNumber.toLowerCase().includes(q) ||
          o.items.some(
            (item) =>
              item.productName.toLowerCase().includes(q) ||
              item.sku.toLowerCase().includes(q) ||
              item.variantCapacity.toLowerCase().includes(q)
          )
        );
      });
    }

    // Sort option
    result.sort((a, b) => {
      if (sortOption === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortOption === "total_desc") {
        return b.total - a.total;
      }
      if (sortOption === "total_asc") {
        return a.total - b.total;
      }
      // default newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [orders, activeStatus, searchQuery, sortOption]);

  const statusFilters: { id: OrderFilterStatus; label: string }[] = [
    { id: "all", label: "All Orders" },
    { id: "processing", label: "Processing" },
    { id: "confirmed", label: "Confirmed" },
    { id: "shipped", label: "Shipped" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 pb-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 border border-emerald-500/40 text-white shadow-2xl shadow-emerald-950/40 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>{toastMessage.text}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Top Breadcrumb Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href={ROUTES.HOME} className="hover:text-white transition-colors">
              Hardware Enclave
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-white font-semibold">Orders & Allocations</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.PRODUCTS.ROOT}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <span>Explore Flagships</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Page Title & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Real-Time Logistics Escort</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Order History & Tracking
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Monitor active cleanroom hardware reservations, track armored courier dispatches in real-time, review receipts, or manage device cancellations.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => loadOrders()}
              className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh Orders"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <Link
              href={ROUTES.CART}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>View Cart</span>
            </Link>
          </div>
        </div>

        {/* 4-Item Metrics Summary Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Orders */}
          <div className="p-5 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md space-y-1">
            <span className="text-[11px] uppercase font-mono text-slate-400 font-semibold tracking-wider">
              Total Allocations
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {metrics.totalOrders}
            </div>
            <p className="text-[11px] text-slate-500 font-mono">Enclave recorded units</p>
          </div>

          {/* Active Logistics */}
          <div className="p-5 rounded-3xl bg-slate-900/50 border border-cyan-500/20 backdrop-blur-md space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-mono text-cyan-400 font-semibold tracking-wider">
                In-Transit / Active
              </span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
              {metrics.active}
            </div>
            <p className="text-[11px] text-slate-500 font-mono">Under secure courier escort</p>
          </div>

          {/* Completed */}
          <div className="p-5 rounded-3xl bg-slate-900/50 border border-emerald-500/20 backdrop-blur-md space-y-1">
            <span className="text-[11px] uppercase font-mono text-emerald-400 font-semibold tracking-wider">
              Delivered
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              {metrics.delivered}
            </div>
            <p className="text-[11px] text-slate-500 font-mono">Biometrically verified</p>
          </div>

          {/* Total Investment */}
          <div className="p-5 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md space-y-1">
            <span className="text-[11px] uppercase font-mono text-slate-400 font-semibold tracking-wider">
              Hardware Total
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              ${metrics.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 font-mono">Processed transactions</p>
          </div>
        </div>

        {/* Filter & Search Controls Bar */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {statusFilters.map((tab) => {
                const isActive = activeStatus === tab.id;
                const count =
                  tab.id === "all"
                    ? orders.length
                    : orders.filter((o) => o.status.toLowerCase() === tab.id).length;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveStatus(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all duration-150 flex items-center gap-2 ${
                      isActive
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                        : "bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/80"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? "bg-slate-950/30 text-slate-950 font-black" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input & Sort Selector */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <svg
                  className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by order #, phone, tracking..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as OrderSortOption)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="total_desc">Total: High to Low</option>
                  <option value="total_asc">Total: Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(activeStatus !== "all" || searchQuery) && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400 font-mono">
              <span>Filtering by:</span>
              {activeStatus !== "all" && (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center gap-1">
                  Status: {activeStatus}
                  <button type="button" onClick={() => setActiveStatus("all")} className="hover:text-white">
                    ✕
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center gap-1">
                  Query: &quot;{searchQuery}&quot;
                  <button type="button" onClick={() => setSearchQuery("")} className="hover:text-white">
                    ✕
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveStatus("all");
                  setSearchQuery("");
                }}
                className="text-xs text-slate-500 hover:text-slate-300 underline ml-auto"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Orders Listing Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-cyan-400">Querying Cryptographic Ledger...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="p-12 sm:p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">No Orders Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {searchQuery || activeStatus !== "all"
                ? "No hardware allocations match your current search parameters. Try clearing filters or revising your query."
                : "You haven't reserved any hardware units yet. Explore our titanium flagship line to make your first allocation."}
            </p>

            <div className="pt-2 flex items-center justify-center gap-3">
              {searchQuery || activeStatus !== "all" ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveStatus("all");
                    setSearchQuery("");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
                >
                  Clear Filters
                </button>
              ) : null}

              <Link
                href={ROUTES.PRODUCTS.ROOT}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20"
              >
                Explore Flagships
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancelRequest={(o) => setCancellingOrder(o)}
                onTrackRequest={(o) => setTrackingOrder(o)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={Boolean(cancellingOrder)}
        order={cancellingOrder}
        onClose={() => setCancellingOrder(null)}
        onSuccess={handleCancelSuccess}
      />

      {/* Quick Tracking Modal */}
      <TrackingQuickModal
        isOpen={Boolean(trackingOrder)}
        order={trackingOrder}
        onClose={() => setTrackingOrder(null)}
      />
    </div>
  );
}

export default OrderHistoryClient;
