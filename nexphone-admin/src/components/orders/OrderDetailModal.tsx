"use client";

import { useEffect } from "react";
import type { Order, OrderStatus, PaymentStatus } from "@/types/order";
import { cn } from "@/utils/cn";

interface OrderDetailModalProps {
  readonly order: Order | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirmOrder: (order: Order) => void;
  readonly onUpdateStatus: (order: Order) => void;
  readonly onCancelOrder: (order: Order) => void;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onConfirmOrder,
  onUpdateStatus,
  onCancelOrder,
}: OrderDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

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
        dateStyle: "medium",
        timeStyle: "short",
      }).format(d);
    } catch {
      return isoStr;
    }
  };

  const getOrderStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending Review",
          style: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          dot: "bg-amber-400 animate-pulse",
        };
      case "confirmed":
        return {
          label: "Order Confirmed",
          style: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
          dot: "bg-indigo-400",
        };
      case "processing":
        return {
          label: "In Processing",
          style: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
          dot: "bg-cyan-400 animate-pulse",
        };
      case "shipped":
        return {
          label: "In Transit",
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
          label: "Paid in Full",
          style: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          dot: "bg-emerald-400",
        };
      case "pending":
        return {
          label: "Payment Pending",
          style: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          dot: "bg-amber-400",
        };
      case "refunded":
        return {
          label: "Refunded",
          style: "bg-purple-500/15 text-purple-400 border-purple-500/30",
          dot: "bg-purple-400",
        };
      case "failed":
        return {
          label: "Payment Failed",
          style: "bg-rose-500/15 text-rose-400 border-rose-500/30",
          dot: "bg-rose-400",
        };
    }
  };

  const orderStatusConfig = getOrderStatusConfig(order.status);
  const paymentStatusConfig = getPaymentStatusConfig(order.payment.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 bg-slate-950/60 p-4 sm:px-6 gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold font-mono text-white tracking-tight">
                {order.orderNumber}
              </h2>
              {/* Order Status Badge */}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
                  orderStatusConfig.style
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", orderStatusConfig.dot)} />
                {orderStatusConfig.label}
              </span>
              {/* Payment Status Badge */}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
                  paymentStatusConfig.style
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", paymentStatusConfig.dot)} />
                {paymentStatusConfig.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Placed on {formatDate(order.createdAt)} • Last updated {formatDate(order.updatedAt)}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {order.status === "pending" && (
              <button
                type="button"
                onClick={() => onConfirmOrder(order)}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/25 hover:text-white"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Confirm Order</span>
              </button>
            )}

            {order.status !== "pending" && order.status !== "delivered" && order.status !== "cancelled" && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order)}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/15 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/25 hover:text-white"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>Update Status</span>
              </button>
            )}

            {order.status !== "cancelled" && order.status !== "delivered" && (
              <button
                type="button"
                onClick={() => onCancelOrder(order)}
                className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/20 hover:text-rose-200"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                </svg>
                <span>Cancel</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-800 p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              title="Close modal"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Cancellation Notice Banner (if cancelled) */}
          {order.status === "cancelled" && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
              <svg className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <div>
                <h4 className="font-semibold text-rose-200 text-sm">Order Cancelled</h4>
                <p className="mt-0.5 text-rose-300/90">{order.cancelReason || "This order was cancelled by an administrator."}</p>
                {order.payment.status === "refunded" && (
                  <p className="mt-1 font-mono text-[11px] text-rose-400">Payment has been refunded to original payment method.</p>
                )}
              </div>
            </div>
          )}

          {/* Grid Layout: Main Details (2 cols) vs Sidebar Info (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Line Items Table */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                <div className="border-b border-slate-800 bg-slate-900/60 px-4 py-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Ordered Hardware Items ({order.items.length})
                  </h3>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 gap-4 text-xs">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-indigo-300 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/60">
                            {item.sku}
                          </span>
                          <span className="font-semibold text-white">{item.productName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          {item.variantCapacity && <span>{item.variantCapacity}</span>}
                          {item.variantRam && (
                            <>
                              <span>•</span>
                              <span>{item.variantRam}</span>
                            </>
                          )}
                          {item.colorName && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                {item.colorHex && (
                                  <span
                                    className="h-2.5 w-2.5 rounded-full border border-slate-600 inline-block"
                                    style={{ backgroundColor: item.colorHex }}
                                  />
                                )}
                                <span>{item.colorName}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0 text-right">
                        <div className="flex flex-col">
                          <span className="text-slate-400 font-mono text-[11px]">
                            {item.quantity} × {formatCurrency(item.unitPrice)}
                          </span>
                          <span className="font-mono font-bold text-white text-xs">
                            {formatCurrency(item.totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown Footer */}
                <div className="border-t border-slate-800 bg-slate-900/40 p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-slate-200">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Tax (VAT/Sales)</span>
                    <span className="font-mono text-slate-200">{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping & Handling</span>
                    <span className="font-mono text-slate-200">
                      {order.shippingFee === 0 ? "FREE" : formatCurrency(order.shippingFee)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Promotional / Enterprise Discount</span>
                      <span className="font-mono">-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-semibold text-sm text-white">
                    <span>Total Amount</span>
                    <span className="font-mono text-emerald-400">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* 2. Order History Timeline */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
                  Lifecycle Event Timeline
                </h3>
                <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {order.timeline.map((event) => (
                    <div key={event.id} className="relative group">
                      <div className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-slate-900 bg-indigo-500" />
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-200">{event.label}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{event.description}</p>
                        <span className="text-[10px] text-slate-500 font-mono">By: {event.actor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Customer, Shipping, & Payment Info */}
            <div className="space-y-6">
              {/* Customer Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-300 font-semibold border-b border-slate-800/80 pb-2">
                  <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <span>Customer Details</span>
                </div>
                <div className="space-y-1.5">
                  <p className="font-semibold text-white text-sm">{order.customer.name}</p>
                  {order.customer.company && (
                    <p className="text-slate-400">{order.customer.company}</p>
                  )}
                  <p className="text-indigo-400 font-mono">{order.customer.email}</p>
                  <p className="text-slate-400 font-mono">{order.customer.phone}</p>
                </div>
              </div>

              {/* Shipping Address & Carrier */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-300 font-semibold border-b border-slate-800/80 pb-2">
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span>Shipping & Fulfillment</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Delivery Address</span>
                    <p className="text-slate-300 mt-0.5">
                      {order.customer.shippingAddress.street}
                      <br />
                      {order.customer.shippingAddress.city}, {order.customer.shippingAddress.state}{" "}
                      {order.customer.shippingAddress.zipCode}
                      <br />
                      {order.customer.shippingAddress.country}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Carrier & Tracking</span>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{order.shipping.carrier}</span>
                      <span className="text-[11px] text-slate-400">{order.shipping.service}</span>
                    </div>

                    {order.shipping.trackingNumber ? (
                      <div className="mt-2 flex items-center justify-between rounded bg-slate-900 border border-slate-800 p-2">
                        <span className="font-mono text-indigo-300 text-[11px]">{order.shipping.trackingNumber}</span>
                        {order.shipping.trackingUrl && (
                          <a
                            href={order.shipping.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Track</span>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="mt-1 text-[11px] text-slate-500 italic">Tracking not yet assigned</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-300 font-semibold border-b border-slate-800/80 pb-2">
                  <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                  </svg>
                  <span>Payment Telemetry</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Method</span>
                    <span className="font-semibold text-slate-200">{order.payment.methodLabel}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Payment Status</span>
                    <span className={cn("px-2 py-0.5 rounded-full border text-[10px] font-semibold", paymentStatusConfig.style)}>
                      {paymentStatusConfig.label}
                    </span>
                  </div>
                  {order.payment.transactionId && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Transaction ID</span>
                      <span className="font-mono text-[10px] text-slate-300">{order.payment.transactionId}</span>
                    </div>
                  )}
                  {order.payment.paidAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Paid At</span>
                      <span className="font-mono text-[10px] text-slate-400">{formatDate(order.payment.paidAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              {order.notes && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Special Instructions</span>
                  <p className="text-slate-300 italic">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
