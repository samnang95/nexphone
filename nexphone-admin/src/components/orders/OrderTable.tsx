"use client";

import { useEffect, useRef } from "react";
import type { Order, OrderStatus, PaymentStatus } from "@/types/order";
import { cn } from "@/utils/cn";

interface OrderTableProps {
  readonly orders: readonly Order[];
  readonly onViewDetails: (order: Order) => void;
  readonly onConfirmOrder: (order: Order) => void;
  readonly onUpdateStatus: (order: Order) => void;
  readonly onCancelOrder: (order: Order) => void;
}

export function OrderTable({
  orders,
  onViewDetails,
  onConfirmOrder,
  onUpdateStatus,
  onCancelOrder,
}: OrderTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = 0;
    }
  }, [orders]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(d);
    } catch {
      return isoStr;
    }
  };

  const getOrderStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          style: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          dot: "bg-amber-400 animate-pulse",
        };
      case "confirmed":
        return {
          label: "Confirmed",
          style: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
          dot: "bg-indigo-400",
        };
      case "processing":
        return {
          label: "Processing",
          style: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
          dot: "bg-cyan-400 animate-pulse",
        };
      case "shipped":
        return {
          label: "Shipped",
          style: "bg-blue-500/15 text-blue-400 border-blue-500/30",
          dot: "bg-blue-400",
        };
      case "delivered":
        return {
          label: "Delivered",
          style: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          dot: "bg-emerald-400",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          style: "bg-rose-500/15 text-rose-400 border-rose-500/30",
          dot: "bg-rose-400",
        };
    }
  };

  const getPaymentStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return {
          label: "Paid",
          style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
          dot: "bg-emerald-400",
        };
      case "pending":
        return {
          label: "Pending",
          style: "bg-amber-500/10 text-amber-400 border-amber-500/25",
          dot: "bg-amber-400",
        };
      case "refunded":
        return {
          label: "Refunded",
          style: "bg-purple-500/10 text-purple-400 border-purple-500/25",
          dot: "bg-purple-400",
        };
      case "failed":
        return {
          label: "Failed",
          style: "bg-rose-500/10 text-rose-400 border-rose-500/25",
          dot: "bg-rose-400",
        };
    }
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center backdrop-blur-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-500 mb-3">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-200">No orders match your filter</h3>
        <p className="mt-1 text-xs text-slate-400">Try adjusting your search criteria, order status, or payment filter.</p>
      </div>
    );
  }

  return (
    <div
      ref={tableContainerRef}
      className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50 shadow-xl backdrop-blur-md"
    >
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <th className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">Order ID & Date</th>
            <th className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">Customer</th>
            <th className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">Hardware Items</th>
            <th className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">Amount</th>
            <th className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">Payment</th>
            <th className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">Order Status</th>
            <th className="py-3 px-2.5 xl:px-3.5 text-right whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-normal">
          {orders.map((order) => {
            const orderStatusConfig = getOrderStatusConfig(order.status);
            const paymentStatusConfig = getPaymentStatusConfig(order.payment.status);

            const totalItemUnits = order.items.reduce((acc, it) => acc + it.quantity, 0);
            const firstItem = order.items[0];

            return (
              <tr
                key={order.id}
                className="group transition-colors hover:bg-slate-800/30"
              >
                {/* 1. Order ID & Date */}
                <td className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => onViewDetails(order)}
                      className="font-mono text-xs font-bold text-indigo-300 hover:text-indigo-200 transition-colors text-left flex items-center gap-1.5"
                    >
                      <span>{order.orderNumber}</span>
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </td>

                {/* 2. Customer */}
                <td className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-100 group-hover:text-indigo-200 transition-colors">
                      {order.customer.name}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span className="truncate max-w-[140px] text-slate-400">{order.customer.email}</span>
                      <span>•</span>
                      <span className="text-slate-500 font-medium">{order.customer.shippingAddress.country}</span>
                    </div>
                  </div>
                </td>

                {/* 3. Items Summary */}
                <td className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-slate-200">
                        {totalItemUnits}x
                      </span>
                      <span className="text-slate-200 font-medium truncate max-w-[160px]">
                        {firstItem?.productName || "Hardware Device"}
                      </span>
                      {order.items.length > 1 && (
                        <span className="text-[10px] text-indigo-400 font-mono">
                          +{order.items.length - 1} more
                        </span>
                      )}
                    </div>
                    {firstItem && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {firstItem.sku} {firstItem.variantCapacity ? `• ${firstItem.variantCapacity}` : ""}
                      </span>
                    )}
                  </div>
                </td>

                {/* 4. Total Amount & Method */}
                <td className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono font-bold text-white text-xs">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {order.payment.methodLabel}
                    </span>
                  </div>
                </td>

                {/* 5. Payment Status */}
                <td className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide shadow-sm whitespace-nowrap",
                      paymentStatusConfig.style
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", paymentStatusConfig.dot)} />
                    {paymentStatusConfig.label}
                  </span>
                </td>

                {/* 6. Order Lifecycle Status */}
                <td className="py-3 px-2.5 xl:px-3.5 whitespace-nowrap">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide shadow-sm whitespace-nowrap",
                      orderStatusConfig.style
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", orderStatusConfig.dot)} />
                    {orderStatusConfig.label}
                  </span>
                </td>

                {/* 7. Action Controls */}
                <td className="py-3 px-2.5 xl:px-3.5 text-right whitespace-nowrap">
                  <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                    {/* Quick Confirm button (if pending) */}
                    {order.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => onConfirmOrder(order)}
                        className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20 hover:text-white"
                        title="Confirm Order"
                      >
                        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <span>Confirm</span>
                      </button>
                    )}

                    {/* Quick Advance / Update Status (if active and not cancelled/delivered) */}
                    {order.status !== "pending" && order.status !== "delivered" && order.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(order)}
                        className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/20 hover:text-white"
                        title="Update Status / Tracking"
                      >
                        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        <span>Update</span>
                      </button>
                    )}

                    {/* View Details Drawer / Modal */}
                    <button
                      type="button"
                      onClick={() => onViewDetails(order)}
                      className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-1.5 text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white shrink-0"
                      title="Inspect Order Details"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>

                    {/* Cancel Order (if eligible) */}
                    {order.status !== "cancelled" && order.status !== "delivered" && (
                      <button
                        type="button"
                        onClick={() => onCancelOrder(order)}
                        className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-400 transition-colors hover:border-rose-500/50 hover:bg-rose-500/20 hover:text-rose-200 shrink-0"
                        title="Cancel Order"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
