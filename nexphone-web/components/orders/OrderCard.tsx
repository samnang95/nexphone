"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Order } from "@/types/order";
import { ROUTES } from "@/routes";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { useCart } from "@/context/CartContext";

interface OrderCardProps {
  order: Order;
  onCancelRequest: (order: Order) => void;
  onTrackRequest?: (order: Order) => void;
}

export function OrderCard({ order, onCancelRequest, onTrackRequest }: OrderCardProps) {
  const { addItem, openCart } = useCart();
  const [copied, setCopied] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const isCancellable =
    order.status === "processing" ||
    order.status === "confirmed" ||
    order.status === "pending";

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBuyAgain = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 p-5 sm:p-6 backdrop-blur-md transition-all duration-200 group flex flex-col justify-between gap-5">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/70">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-slate-500">ORD</span>
            <Link
              href={ROUTES.ORDERS.DETAIL(order.orderNumber)}
              className="text-sm font-mono font-bold text-white group-hover:text-cyan-400 transition-colors"
            >
              {order.orderNumber}
            </Link>
          </div>

          <button
            type="button"
            onClick={handleCopyId}
            title="Copy Order ID"
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {copied ? (
              <span className="text-[10px] text-emerald-400 font-mono">Copied</span>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>

          <span className="text-slate-700 hidden sm:inline">•</span>
          <span className="text-xs text-slate-400 hidden sm:inline font-mono">
            {formattedDate}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} size="sm" />
        </div>
      </div>

      {/* Handset Items Preview */}
      <div className="space-y-3">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-slate-950/40 border border-slate-800/50 hover:bg-slate-950/70 transition-colors"
          >
            <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden">
              {item.productImage ? (
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  width={50}
                  height={50}
                  unoptimized
                  className="max-h-11 w-auto object-contain transition-transform group-hover:scale-105"
                />
              ) : (
                <span className="text-[10px] font-mono text-cyan-500">NX</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate hover:text-cyan-300 transition-colors">
                <Link href={ROUTES.PRODUCTS.DETAIL(item.productSlug || item.productId)}>
                  {item.productName}
                </Link>
              </h4>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                <div className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: item.colorHex }}
                  />
                  <span className="truncate max-w-[120px]">{item.colorName}</span>
                </div>
                <span>•</span>
                <span className="text-cyan-400">{item.variantCapacity}</span>
                <span>•</span>
                <span>Qty: {item.quantity}</span>
              </div>
            </div>

            <div className="text-right font-mono text-xs shrink-0">
              <div className="font-bold text-white">${item.totalPrice.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">SKU: {item.sku}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Logistics & Tracking Strip */}
      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
          <div>
            <span className="text-slate-400">{order.shipping.carrier}:</span>{" "}
            <span className="text-slate-200 font-mono font-medium">
              {order.shipping.trackingNumber}
            </span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-emerald-400">
          ETA: {order.shipping.estimatedDelivery}
        </div>
      </div>

      {/* Bottom Bar: Total & Actions */}
      <div className="pt-3 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-4">
        {/* Total & Payment Method */}
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">
            Total Paid ({order.payment.method.replace("_", " ")})
          </span>
          <div className="text-lg font-black font-mono text-white">
            ${order.total.toLocaleString()}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Cancel Button (if status eligible) */}
          {isCancellable && (
            <button
              type="button"
              onClick={() => onCancelRequest(order)}
              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-mono transition-colors"
            >
              Cancel Order
            </button>
          )}

          {/* Quick Track Button */}
          {onTrackRequest && (
            <button
              type="button"
              onClick={() => onTrackRequest(order)}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono transition-colors"
            >
              Track Status
            </button>
          )}

          {/* Buy Again */}
          <button
            type="button"
            onClick={handleBuyAgain}
            disabled={isReordering}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/60 text-xs font-mono transition-colors flex items-center gap-1.5"
          >
            {isReordering ? (
              <span className="text-[11px]">Adding...</span>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Buy Again</span>
              </>
            )}
          </button>

          {/* View Details Link */}
          <Link
            href={ROUTES.ORDERS.DETAIL(order.orderNumber)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20 active:scale-95 flex items-center gap-1"
          >
            <span>Details</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderCard;
