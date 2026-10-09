import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutPageClient } from "@/components/checkout";

export const metadata: Metadata = {
  title: "Encrypted Checkout | NexPhone Enclave",
  description:
    "Secure checkout for NexPhone aerospace titanium handsets, quantum enclaves, and cryptographic hardware.",
};

function CheckoutPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-center items-center p-6">
      <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-4" />
      <p className="text-xs font-mono text-cyan-400">Initializing Encrypted Checkout...</p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutPageSkeleton />}>
      <CheckoutPageClient />
    </Suspense>
  );
}
