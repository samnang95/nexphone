"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Order } from "@/types/order";
import { ROUTES } from "@/routes";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderLogisticsStepper } from "./OrderLogisticsStepper";
import { CancelOrderModal } from "./CancelOrderModal";
import { useCart } from "@/context/CartContext";

interface OrderDetailClientProps {
  initialOrder: Order;
}

export function OrderDetailClient({ initialOrder }: OrderDetailClientProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [copiedId, setCopiedId] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const { addItem, openCart } = useCart();

  const isCancellable =
    order.status === "processing" ||
    order.status === "confirmed" ||
    order.status === "pending";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleBuyAgain = () => {
    setIsReordering(true);
    order.items.forEach((item) => {
      addItem({
        productId: item.productId,
        productName: item.productName,
        productSlug: item.productSlug,
        productImage: item.productImage,
        series: item.series,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        color: {
          id: `c-${item.colorName.toLowerCase().replace(/\s+/g, "-")}`,
          name: item.colorName,
          hex: item.colorHex,
        },
        storage: {
          id: `s-${item.variantCapacity.toLowerCase().replace(/\s+/g, "-")}`,
          capacity: item.variantCapacity,
          ram: item.variantRam,
          price: item.unitPrice,
          sku: item.sku,
        },
      });
    });

    setTimeout(() => {
      setIsReordering(false);
      openCart();
    }, 400);
  };

  const handleCancelSuccess = (updated: Order) => {
    setOrder(updated);
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 pb-28">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href={ROUTES.HOME} className="hover:text-white transition-colors">
              Hardware Enclave
            </Link>
            <span className="text-slate-600">/</span>
            <Link href={ROUTES.ORDERS.ROOT} className="hover:text-white transition-colors">
              Orders
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 font-semibold">{order.orderNumber}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.ORDERS.ROOT}
              className="text-xs font-mono text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>All Orders</span>
            </Link>

            <span className="text-slate-700">|</span>

            <button
              type="button"
              onClick={handlePrint}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              <span>Print Invoice</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Order Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {order.orderNumber}
                </h1>
                <button
                  type="button"
                  onClick={handleCopyId}
                  title="Copy Order ID"
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  {copiedId ? (
                    <span className="text-[10px] text-emerald-400 font-mono">Copied</span>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <OrderStatusBadge status={order.status} size="md" />
            </div>

            <p className="text-xs text-slate-400 font-mono">
              Authorized on <strong className="text-slate-200">{formattedDate}</strong> • Cryptographic Vault TXN:{" "}
              <span className="text-cyan-400">{order.payment.transactionId}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            {isCancellable && (
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-mono font-bold uppercase transition-colors"
              >
                Cancel Order
              </button>
            )}

            <button
              type="button"
              onClick={handleBuyAgain}
              disabled={isReordering}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-mono transition-colors flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isReordering ? "Adding..." : "Buy Again"}</span>
            </button>
          </div>
        </div>

        {/* Cancellation Notice if Cancelled */}
        {order.status === "cancelled" && (
          <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                Hardware Order Cancelled & Payment Refunded
              </h3>
            </div>
            <p className="text-xs text-rose-300/90 pl-5 leading-relaxed">
              {order.cancelReason || "Order was cancelled by customer request. Hardware allocation returned to inventory."}
            </p>
            <div className="pl-5 pt-1 text-xs font-mono text-emerald-400 flex items-center gap-2">
              <span>✓ Refund of ${order.total.toLocaleString()} processed to original payment method.</span>
            </div>
          </div>
        )}

        {/* Logistics & Tracking Stepper */}
        <OrderLogisticsStepper order={order} />

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Handsets & Delivery Info (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Ordered Handsets List */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Reserved Handsets ({order.items.length})
                </h3>
                <span className="text-xs font-mono text-slate-500">Hardware Allocation</span>
              </div>

              <div className="space-y-4 divide-y divide-slate-800/70">
                {order.items.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex items-center gap-4">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border border-slate-800 p-1.5 flex items-center justify-center shrink-0">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={70}
                          height={70}
                          unoptimized
                          className="max-h-16 w-auto object-contain"
                        />
                      ) : (
                        <span className="text-xs font-mono text-slate-600">NX</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                        {item.series}
                      </span>
                      <h4 className="text-sm font-bold text-white truncate hover:text-cyan-300 transition-colors">
                        <Link href={ROUTES.PRODUCTS.DETAIL(item.productSlug || item.productId)}>
                          {item.productName}
                        </Link>
                      </h4>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: item.colorHex }}
                          />
                          <span>{item.colorName}</span>
                        </div>
                        <span>•</span>
                        <span className="text-cyan-400">{item.variantCapacity}</span>
                        <span>•</span>
                        <span>Qty: {item.quantity}</span>
                      </div>

                      <div className="text-[11px] font-mono text-slate-500 mt-1">
                        SKU: {item.sku}
                      </div>
                    </div>

                    <div className="text-right font-mono shrink-0">
                      <div className="text-base font-bold text-white">
                        ${item.totalPrice.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        ${item.unitPrice.toLocaleString()} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Destination Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Delivery Destination & Recipient
                </h3>
                <span className="text-[11px] font-mono text-emerald-400">
                  {order.shipping.carrier}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500">Recipient</span>
                  <p className="font-bold text-white text-sm">{order.customer.name}</p>
                  {order.customer.company && (
                    <p className="text-slate-400">{order.customer.company}</p>
                  )}
                  <p className="text-slate-400 font-mono pt-1">Tel: {order.customer.phone}</p>
                  <p className="text-slate-400 font-mono">Email: {order.customer.email}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500">
                    Shipping Address
                  </span>
                  <p className="text-slate-200">{order.customer.shippingAddress.street}</p>
                  {order.customer.shippingAddress.apartment && (
                    <p className="text-slate-400">{order.customer.shippingAddress.apartment}</p>
                  )}
                  <p className="text-slate-200">
                    {order.customer.shippingAddress.city}, {order.customer.shippingAddress.state}{" "}
                    {order.customer.shippingAddress.zipCode}
                  </p>
                  <p className="text-slate-200 font-semibold">
                    {order.customer.shippingAddress.country}
                  </p>

                  {order.customer.shippingAddress.instructions && (
                    <div className="pt-2 text-[11px] text-cyan-300 font-mono">
                      Note: &quot;{order.customer.shippingAddress.instructions}&quot;
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Financial & Cryptographic Security (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Financial Breakdown Card */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider pb-3 border-b border-slate-800">
                Payment & Total Breakdown
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Hardware Subtotal</span>
                  <span className="font-mono text-white">${order.subtotal.toLocaleString()}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount {order.promoCode && `(${order.promoCode})`}</span>
                    <span className="font-mono">-${order.discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>Armored Courier Courier</span>
                  <span className="font-mono text-white">
                    {order.shippingFee === 0 ? "FREE" : `$${order.shippingFee}`}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Regulatory Tax & Compliance</span>
                  <span className="font-mono text-white">
                    {order.tax > 0 ? `$${order.tax.toFixed(2)}` : "$0.00"}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline text-base">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-mono font-black text-cyan-400 text-xl">
                    ${order.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Payment Method Badge */}
              <div className="pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Payment Gateway:</span>
                  <span className="text-white font-bold uppercase">
                    {order.payment.method.replace("_", " ")}
                  </span>
                </div>
                {order.payment.cardLast4 && (
                  <div className="flex items-center justify-between">
                    <span>Card Identifier:</span>
                    <span className="text-slate-300">•••• •••• •••• {order.payment.cardLast4}</span>
                  </div>
                )}
                {order.payment.cryptoCurrency && (
                  <div className="flex items-center justify-between">
                    <span>Asset:</span>
                    <span className="text-cyan-400 font-bold">{order.payment.cryptoCurrency}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Transaction ID:</span>
                  <span className="text-slate-300 truncate max-w-[150px]">
                    {order.payment.transactionId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment Status:</span>
                  <span
                    className={`font-bold uppercase ${
                      order.payment.status === "refunded"
                        ? "text-rose-400"
                        : order.payment.status === "paid"
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {order.payment.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Seal & Hardware Warranty Card */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="font-bold text-white font-mono uppercase tracking-wider">
                  Hardware Integrity Seal
                </h4>
              </div>

              <p className="text-slate-400 leading-relaxed">
                This handset reservation has been sealed with a cryptographic hardware certificate. Serial keys are locked against the NexPhone zero-trust key server.
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Warranty: 2-Year Titanium Care+</span>
                <span className="text-cyan-400">Active</span>
              </div>
            </div>

            {/* Concierge Help Card */}
            <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
              <h4 className="font-bold text-white">Need Support With This Order?</h4>
              <p className="text-slate-400 leading-relaxed">
                Contact our 24/7 dedicated hardware concierge team for dispatch inquiries or custom enterprise delivery routing.
              </p>
              <div className="pt-2">
                <a
                  href="mailto:support@nexphone.io"
                  className="text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
                >
                  support@nexphone.io →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        order={order}
        onClose={() => setIsCancelModalOpen(false)}
        onSuccess={handleCancelSuccess}
      />
    </div>
  );
}

export default OrderDetailClient;
