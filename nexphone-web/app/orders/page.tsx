import React, { Suspense } from "react";
import type { Metadata } from "next";
import { OrderHistoryClient } from "@/components/orders";

export const metadata: Metadata = {
  title: "Order History & Real-Time Tracking | NexPhone Enclave",
  description:
    "Monitor active cleanroom hardware reservations, track armored courier dispatches in real-time, review receipts, or manage device cancellations.",
};

function OrderHistorySkeleton() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-center items-center p-6">
      <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-4" />
      <p className="text-xs font-mono text-cyan-400">Loading Order Ledger...</p>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrderHistorySkeleton />}>
      <OrderHistoryClient />
    </Suspense>
  );
}
