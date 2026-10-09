"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Order } from "@/types/order";
import { ROUTES } from "@/routes";

interface OrderConfirmationClientProps {
  order: Order;
}

export function OrderConfirmationClient({ order }: OrderConfirmationClientProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 pb-24">
      {/* Top Breadcrumb */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href={ROUTES.HOME} className="hover:text-white transition-colors">
              Hardware Enclave
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">Orders</span>
            <span className="text-slate-600">/</span>
            <span className="text-emerald-400 font-semibold">{order.orderNumber}</span>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Celebration Header */}
        <div className="text-center space-y-3 py-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/10 animate-in zoom-in-90">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Allocation Secured & Cryptographically Sealed</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Order Confirmed: {order.orderNumber}
          </h1>

          <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Thank you, <strong className="text-white">{order.customer.name}</strong>. An encrypted receipt has been transmitted to <strong className="text-cyan-400 font-mono">{order.customer.email}</strong>.
          </p>
        </div>

        {/* Live Logistics Timeline */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Logistics & Escort Status</h2>
              <p className="text-xs text-slate-400 font-mono">
                Tracking Identifier: <strong className="text-cyan-400">{order.shipping.trackingNumber}</strong>
              </p>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
              Estimated Delivery: {order.shipping.estimatedDelivery}
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Step 01 • Complete</span>
              <h4 className="text-xs font-bold text-white">Encrypted Order Authorized</h4>
              <p className="text-[11px] text-slate-400">Payment captured via HSM enclave</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Step 02 • Active</span>
              <h4 className="text-xs font-bold text-white">Serial Number Reserved</h4>
              <p className="text-[11px] text-slate-400">Titanium hardware allocated at hub</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-1 text-slate-500">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Step 03</span>
              <h4 className="text-xs font-bold text-slate-400">Armored Courier Hand-off</h4>
              <p className="text-[11px]">Biometric tamper seal applied</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-1 text-slate-500">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Step 04</span>
              <h4 className="text-xs font-bold text-slate-400">Final Secure Delivery</h4>
              <p className="text-[11px]">Direct recipient authentication</p>
            </div>
          </div>
        </div>

        {/* 2-Column: Ordered Items & Shipping Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Purchased Handsets Table */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
              <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
                Purchased Handsets & Cryptographic Units
              </h3>

              <div className="space-y-4 divide-y divide-slate-800/80">
                {order.items.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center shrink-0">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={60}
                          height={60}
                          unoptimized
                          className="max-h-12 w-auto object-contain"
                        />
                      ) : (
                        <span className="text-[10px] font-mono text-slate-600">NX</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{item.productName}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                        <div className="flex items-center gap-1">
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
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        SKU: {item.sku}
                      </div>
                    </div>

                    <div className="text-right font-mono font-bold text-white shrink-0">
                      ${item.totalPrice.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary & Customer Receipt Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Financial Breakdown Card */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
                Payment & Total Breakdown
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">${order.subtotal.toLocaleString()}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount {order.promoCode && `(${order.promoCode})`}</span>
                    <span className="font-mono">-${order.discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>Armored Courier</span>
                  <span className="font-mono text-white">
                    {order.shippingFee === 0 ? "FREE" : `$${order.shippingFee}`}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Regulatory Compliance</span>
                  <span className="font-mono text-emerald-400">$0.00</span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between text-base">
                  <span className="font-bold text-white">Total Paid</span>
                  <span className="font-mono font-black text-cyan-400">
                    ${order.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Method Badge */}
              <div className="pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Payment Method:</span>
                  <span className="text-white font-bold uppercase">
                    {order.payment.method.replace("_", " ")}
                  </span>
                </div>
                {order.payment.cardLast4 && (
                  <div className="flex items-center justify-between">
                    <span>Card:</span>
                    <span className="text-slate-300">•••• •••• •••• {order.payment.cardLast4}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Transaction ID:</span>
                  <span className="text-slate-300 truncate max-w-[160px]">
                    {order.payment.transactionId}
                  </span>
                </div>
              </div>
            </div>

            {/* Recipient & Shipping Destination Card */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
                Delivery Address
              </h3>
              <p className="font-bold text-white">{order.customer.name}</p>
              {order.customer.company && (
                <p className="text-slate-400">{order.customer.company}</p>
              )}
              <p className="text-slate-300">{order.customer.shippingAddress.street}</p>
              {order.customer.shippingAddress.apartment && (
                <p className="text-slate-400">{order.customer.shippingAddress.apartment}</p>
              )}
              <p className="text-slate-300">
                {order.customer.shippingAddress.city}, {order.customer.shippingAddress.state}{" "}
                {order.customer.shippingAddress.zipCode}
              </p>
              <p className="text-slate-300">{order.customer.shippingAddress.country}</p>
              <p className="text-slate-400 font-mono pt-1">Tel: {order.customer.phone}</p>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center gap-3 print:hidden">
              <Link
                href={ROUTES.PRODUCTS.ROOT}
                className="flex-1 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider text-center transition-colors shadow-lg shadow-cyan-500/20 active:scale-95"
              >
                Browse Catalog
              </Link>
              <Link
                href={ROUTES.HOME}
                className="py-3.5 px-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-mono text-xs text-center transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationClient;
