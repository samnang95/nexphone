import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart";

export const metadata: Metadata = {
  title: "Shopping Cart & Hardware Allocation | NexPhone Enclave",
  description:
    "Review reserved NexPhone flagships, configure finishes and storage capacity, and proceed to encrypted checkout.",
};

function CartPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-center items-center p-6">
      <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-4" />
      <p className="text-xs font-mono text-cyan-400">Loading Hardware Allocation...</p>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<CartPageSkeleton />}>
      <CartPageClient />
    </Suspense>
  );
}
