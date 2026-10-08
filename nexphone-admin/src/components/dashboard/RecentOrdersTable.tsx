"use client";

import { useState, useMemo, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { RecentOrder, OrderStatus } from "@/types/dashboard";

interface RecentOrdersTableProps {
  readonly orders: readonly RecentOrder[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [receiptDownloaded, setReceiptDownloaded] = useState<string | null>(null);

  // Lock background scroll and apply background blur when modal is open
  useEffect(() => {
    if (!selectedOrder) {
      return undefined;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove("modal-open");
    };
  }, [selectedOrder]);

  // Keyboard escape listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedOrder(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      // Fallback
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    }
  }, []);

  // Filtered orders based on status & search query
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        selectedStatus === "all" || order.status === selectedStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        order.id.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerEmail.toLowerCase().includes(q) ||
        order.productName.toLowerCase().includes(q) ||
        order.productSku.toLowerCase().includes(q) ||
        order.paymentMethod.toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [orders, selectedStatus, searchQuery]);

  // Counts for each status tab
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: orders.length,
      completed: 0,
      processing: 0,
      shipped: 0,
      pending: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });
    return counts;
  }, [orders]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Completed
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Processing
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Shipped
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
            {status}
          </span>
        );
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm">
      {/* Table Header & Controls */}
      <div className="flex flex-col gap-4 pb-5 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold text-white">Recent Orders</h2>
              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[11px] font-medium text-indigo-400">
                Live Feed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Omni-channel sales transactions, direct fulfillment, and customer invoices
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-4 w-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, customer, SKU..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-1.5 pl-9 pr-8 text-xs text-white placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-white"
                title="Clear search"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {(
            [
              { key: "all", label: "All Orders" },
              { key: "completed", label: "Completed" },
              { key: "processing", label: "Processing" },
              { key: "shipped", label: "Shipped" },
              { key: "pending", label: "Pending" },
            ] as const
          ).map((tab) => {
            const count = statusCounts[tab.key] ?? 0;
            const isActive = selectedStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedStatus(tab.key)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive
                      ? "bg-indigo-700/60 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Count and Toast Feedback */}
      <div className="flex items-center justify-between py-3 text-xs text-slate-400">
        <span>
          Showing <span className="font-semibold text-white">{filteredOrders.length}</span> of{" "}
          <span className="font-semibold text-white">{orders.length}</span> orders
        </span>
        {copiedText && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 animate-in fade-in">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Copied {copiedText}
          </span>
        )}
      </div>

      {/* Desktop Table View (Hidden on Small Screens) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th scope="col" className="pb-3 pr-4">Order ID</th>
              <th scope="col" className="pb-3 px-4">Customer</th>
              <th scope="col" className="pb-3 px-4">Item & SKU</th>
              <th scope="col" className="pb-3 px-4">Amount</th>
              <th scope="col" className="pb-3 px-4">Status</th>
              <th scope="col" className="pb-3 pl-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg
                      className="h-8 w-8 text-slate-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="font-medium text-slate-300">No orders match your filter</p>
                    <p className="text-xs text-slate-500">
                      Try clearing your search query or selecting &quot;All Orders&quot;.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedStatus("all");
                      }}
                      className="mt-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
                    >
                      Reset filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="group cursor-pointer transition-colors hover:bg-slate-800/40"
                >
                  {/* Order ID */}
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-white group-hover:text-indigo-300">
                        {order.id}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(order.id, `Order ${order.id}`);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"
                        title="Copy Order ID"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                          />
                        </svg>
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-500 block">{order.createdAt}</span>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-[10px] font-semibold text-indigo-300">
                        {getInitials(order.customerName)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {order.customerName}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate">
                          {order.customerEmail}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Product */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {order.productName}
                        </span>
                        {order.quantity > 1 && (
                          <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] font-semibold text-slate-300">
                            x{order.quantity}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 truncate">
                        {order.productSku}
                      </span>
                    </div>
                  </td>

                  {/* Amount & Payment */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold text-white block">
                      {order.amount}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {order.paymentMethod}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(order.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pl-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-indigo-500/40 hover:bg-slate-700 hover:text-white"
                    >
                      <span>Details</span>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Shown on screens < md) */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <p className="font-medium text-slate-300">No orders match your filter</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("all");
              }}
              className="mt-3 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 transition-colors hover:border-slate-700 cursor-pointer"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white">{order.id}</span>
                  <span className="text-[10px] text-slate-500">• {order.createdAt}</span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="py-2.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    {order.productName}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400 ml-2">
                    {order.amount}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{order.customerName} ({order.customerLocation})</span>
                  <span>Qty: {order.quantity}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <span className="text-[10px] text-slate-500 font-mono">
                  {order.paymentMethod}
                </span>
                <span className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
                  Inspect &rarr;
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal (Portaled to document.body for full-screen backdrop blur) */}
      {isMounted &&
        selectedOrder &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150"
            style={{
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
            onClick={() => setSelectedOrder(null)}
          >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col w-full max-w-xl max-h-[82vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Pinned Modal Header */}
            <div className="flex shrink-0 items-start justify-between p-5 sm:px-6 sm:py-5 border-b border-slate-800 bg-slate-900">
              <div>
                <div className="flex items-center gap-3">
                  <h3 id="order-details-title" className="text-lg font-bold tracking-tight text-white">
                    Order {selectedOrder.id}
                  </h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                  <span>Placed {selectedOrder.createdAt}</span>
                  <span className="text-slate-600">•</span>
                  <span>Channel: Direct Web Store</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Close modal (Esc)"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Modal Body with Polished Text Spacing */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-4">
              {/* Customer Information Card */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3.5">
                  Customer & Shipping Destination
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">Recipient Name</span>
                    <span className="text-xs font-semibold text-slate-100 block">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">Email Address</span>
                    <span className="text-xs font-semibold text-slate-100 font-mono block">{selectedOrder.customerEmail}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">Delivery Region</span>
                    <span className="text-xs font-semibold text-slate-100 block">{selectedOrder.customerLocation}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">Billing Enclave</span>
                    <span className="text-xs font-semibold text-emerald-400 block">Verified Secure (SLA Gold)</span>
                  </div>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3.5">
                  Purchased Items
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <p className="text-sm font-semibold text-white leading-snug">
                        {selectedOrder.productName}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-300 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                          <span className="text-slate-500">SKU:</span>
                          <span>{selectedOrder.productSku}</span>
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[11px] text-slate-400">
                          Quantity: <span className="font-semibold text-slate-200">{selectedOrder.quantity}</span> {selectedOrder.quantity > 1 ? "units" : "unit"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-base font-bold text-white block">
                        {selectedOrder.amount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logistics & Tracking */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3.5">
                  Logistics & Tracking
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">Shipping Carrier</span>
                    <span className="text-xs font-semibold text-slate-100 block">
                      {selectedOrder.shippingCarrier || "FedEx Priority Dispatch"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">Tracking Identifier</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs font-semibold text-indigo-300">
                        {selectedOrder.trackingNumber || "Pending generation"}
                      </span>
                      {selectedOrder.trackingNumber && (
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(selectedOrder.trackingNumber!, "Tracking Number")
                          }
                          className="text-slate-400 hover:text-white transition-colors"
                          title="Copy tracking"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial & Payment Summary */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3.5">
                  Payment Summary
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-slate-400">Payment Gateway</span>
                    <span className="font-medium text-slate-200">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-slate-400">Fulfillment Handling</span>
                    <span className="font-medium text-emerald-400">Complimentary Tier-1 Priority</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-800 text-sm font-semibold">
                    <span className="text-white">Total Charged</span>
                    <span className="font-mono text-base font-bold text-emerald-400">{selectedOrder.amount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pinned Modal Footer Actions - Always 100% visible and unclipped! */}
            <div className="flex shrink-0 flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-6 sm:py-4 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                Close View
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedOrder.id, `Order ${selectedOrder.id}`)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  {copiedText === `Order ${selectedOrder.id}` ? "Copied!" : "Copy Order ID"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReceiptDownloaded(selectedOrder.id);
                    setTimeout(() => setReceiptDownloaded(null), 3000);
                  }}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition-colors inline-flex items-center gap-1.5"
                >
                  {receiptDownloaded === selectedOrder.id ? (
                    <>
                      <svg className="h-3.5 w-3.5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Downloaded</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download Receipt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
