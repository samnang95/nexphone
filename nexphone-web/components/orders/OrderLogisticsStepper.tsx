"use client";

import React, { useState } from "react";
import type { Order } from "@/types/order";

interface OrderLogisticsStepperProps {
  order: Order;
  compact?: boolean;
}

export function OrderLogisticsStepper({ order, compact = false }: OrderLogisticsStepperProps) {
  const [copied, setCopied] = useState(false);
  const [showTimelineLog, setShowTimelineLog] = useState(!compact);

  const handleCopyTracking = () => {
    if (order.shipping.trackingNumber) {
      navigator.clipboard.writeText(order.shipping.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isCancelled = order.status === "cancelled";

  // Step indexes: 0 = pending, 1 = confirmed, 2 = processing, 3 = shipped, 4 = delivered
  const statusToStepIndex: Record<string, number> = {
    pending: 0,
    confirmed: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
    cancelled: -1,
  };

  const currentStep = statusToStepIndex[order.status] ?? 2;

  const steps = [
    {
      index: 0,
      title: "Order Authorized",
      subtitle: "Payment captured in enclave",
      code: "AUTH-01",
    },
    {
      index: 1,
      title: "Confirmed & Locked",
      subtitle: "Serial number reserved",
      code: "CONF-02",
    },
    {
      index: 2,
      title: "Cleanroom Packaging",
      subtitle: "QA integrity tested",
      code: "PACK-03",
    },
    {
      index: 3,
      title: "Armored Transit",
      subtitle: "Dispatched with courier",
      code: "DISP-04",
    },
    {
      index: 4,
      title: "Secure Delivery",
      subtitle: "Direct signature receipt",
      code: "DLVR-05",
    },
  ];

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-7 backdrop-blur-md space-y-6">
      {/* Header Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
              Logistics & Courier Escort
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
            <span>
              Carrier: <strong className="text-slate-200">{order.shipping.carrier}</strong>
            </span>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span>Tracking:</span>
              <strong className="text-cyan-400 font-mono select-all">
                {order.shipping.trackingNumber}
              </strong>
              <button
                type="button"
                onClick={handleCopyTracking}
                title="Copy tracking code"
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                {copied ? (
                  <span className="text-[10px] text-emerald-400 font-mono">Copied!</span>
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
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
            ETA: <span className="text-emerald-400 font-semibold">{order.shipping.estimatedDelivery}</span>
          </div>

          {order.shipping.trackingUrl && (
            <a
              href={order.shipping.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <span>Track Live</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Cancelled State Warning Banner */}
      {isCancelled ? (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h4 className="text-sm font-bold text-rose-300">Order Allocation Cancelled</h4>
          </div>
          <p className="text-xs text-rose-200/80 pl-7 leading-relaxed">
            {order.cancelReason || "This order was cancelled by customer request. Hardware allocation has been released back to stock."}
          </p>
          <div className="pl-7 pt-1 flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Full refund of ${order.total.toLocaleString()} processed to original payment method.</span>
          </div>
        </div>
      ) : (
        /* Progress Stepper */
        <div className="space-y-4">
          {/* Visual Bar on desktop */}
          <div className="hidden md:grid grid-cols-5 gap-3 relative">
            {steps.map((st) => {
              const isPast = currentStep > st.index;
              const isCurrent = currentStep === st.index;

              return (
                <div
                  key={st.code}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isPast
                      ? "bg-emerald-500/10 border-emerald-500/30 text-slate-200"
                      : isCurrent
                      ? "bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10 text-white"
                      : "bg-slate-950/40 border-slate-800/80 text-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                    <span
                      className={`font-bold uppercase ${
                        isPast
                          ? "text-emerald-400"
                          : isCurrent
                          ? "text-cyan-400"
                          : "text-slate-600"
                      }`}
                    >
                      {st.code}
                    </span>
                    {isPast && (
                      <span className="text-emerald-400">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold truncate">{st.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{st.subtitle}</p>
                </div>
              );
            })}
          </div>

          {/* Mobile view - Vertical step list */}
          <div className="md:hidden space-y-2.5">
            {steps.map((st) => {
              const isPast = currentStep > st.index;
              const isCurrent = currentStep === st.index;

              return (
                <div
                  key={st.code}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    isPast
                      ? "bg-emerald-500/10 border-emerald-500/30 text-slate-200"
                      : isCurrent
                      ? "bg-cyan-500/10 border-cyan-500/40 text-white"
                      : "bg-slate-950/40 border-slate-800 text-slate-500"
                  }`}
                >
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                      {st.code}
                    </span>
                    <h5 className="font-bold">{st.title}</h5>
                    <p className="text-[11px] text-slate-400">{st.subtitle}</p>
                  </div>
                  <div>
                    {isPast ? (
                      <span className="text-emerald-400 text-xs font-mono font-bold">Done</span>
                    ) : isCurrent ? (
                      <span className="text-cyan-400 text-xs font-mono font-bold animate-pulse">Active</span>
                    ) : (
                      <span className="text-slate-600 text-xs font-mono">Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expandable Detailed Timeline History */}
      <div className="pt-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => setShowTimelineLog((prev) => !prev)}
          className="w-full flex items-center justify-between py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Cryptographic Timeline Audit Log ({order.timeline.length} events)</span>
          </div>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${showTimelineLog ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showTimelineLog && (
          <div className="mt-4 space-y-3.5 pl-2 relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-slate-800">
            {order.timeline.map((evt) => (
              <div key={evt.id} className="relative pl-7 group">
                {/* Node icon */}
                <span className="absolute left-1.5 top-1 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-cyan-400 group-hover:scale-125 transition-transform" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <span className="font-bold text-white tracking-tight">{evt.label}</span>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 text-cyan-300">
                      {evt.actor}
                    </span>
                    <span>
                      {new Date(evt.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{evt.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderLogisticsStepper;
