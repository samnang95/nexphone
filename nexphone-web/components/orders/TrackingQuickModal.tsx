"use client";

import React from "react";
import type { Order } from "@/types/order";
import { OrderLogisticsStepper } from "./OrderLogisticsStepper";
import { OrderStatusBadge } from "./OrderStatusBadge";
import Link from "next/link";
import { ROUTES } from "@/routes";

interface TrackingQuickModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
}

export function TrackingQuickModal({ isOpen, order, onClose }: TrackingQuickModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0c121e] border border-slate-800 p-6 sm:p-8 shadow-2xl text-slate-100 z-10 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Order Tracking</span>
              <OrderStatusBadge status={order.status} size="sm" />
            </div>
            <h3 className="text-xl font-black text-white font-mono">
              {order.orderNumber}
            </h3>
            <p className="text-xs text-slate-400">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Embedded Stepper */}
        <OrderLogisticsStepper order={order} />

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            Close
          </button>

          <Link
            href={ROUTES.ORDERS.DETAIL(order.orderNumber)}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20"
          >
            View Full Order Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TrackingQuickModal;
