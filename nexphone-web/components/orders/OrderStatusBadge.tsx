"use client";

import React from "react";
import type { Order } from "@/types/order";

interface OrderStatusBadgeProps {
  status: Order["status"];
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

export function OrderStatusBadge({
  status,
  size = "md",
  className = "",
  showIcon = true,
}: OrderStatusBadgeProps) {
  const normalized = status.toLowerCase() as Order["status"];

  const config: Record<
    Order["status"],
    {
      label: string;
      bg: string;
      border: string;
      text: string;
      dot: string;
      icon: React.ReactNode;
    }
  > = {
    pending: {
      label: "Pending Verification",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      dot: "bg-amber-400 animate-pulse",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    processing: {
      label: "Processing Allocation",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      text: "text-cyan-400",
      dot: "bg-cyan-400 animate-ping",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    confirmed: {
      label: "Confirmed & Reserved",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-400",
      dot: "bg-blue-400",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    shipped: {
      label: "Shipped & Dispatched",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/30",
      text: "text-indigo-400",
      dot: "bg-indigo-400 animate-pulse",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
    },
    delivered: {
      label: "Delivered",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    cancelled: {
      label: "Cancelled & Refunded",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      text: "text-rose-400",
      dot: "bg-rose-400",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  };

  const item = config[normalized] || config.processing;

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[11px] gap-1.5",
    md: "px-3 py-1 text-xs gap-2",
    lg: "px-4 py-1.5 text-sm gap-2.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-full border transition-all ${item.bg} ${item.border} ${item.text} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.dot}`} />
      {showIcon && <span className="shrink-0">{item.icon}</span>}
      <span className="tracking-tight">{item.label}</span>
    </span>
  );
}

export default OrderStatusBadge;
