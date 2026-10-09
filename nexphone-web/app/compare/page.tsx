import React, { Suspense } from "react";
import type { Metadata } from "next";
import { productService } from "@/services/product.service";
import { ComparePageClient } from "@/components/compare";

export const metadata: Metadata = {
  title: "Compare Flagship Handsets | NexPhone Enclave",
  description:
    "Compare technical specifications, optical matrices, battery life, and Grade-5 titanium finishes across 2–3 NexPhone handsets.",
};

function ComparePageSkeleton() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-center items-center p-6">
      <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-4" />
      <p className="text-xs font-mono text-cyan-400">Loading Comparison Matrix...</p>
    </div>
  );
}

async function CompareDataLoader() {
  const products = await productService.getProducts();

  return <ComparePageClient allProducts={products} />;
}

export default function ComparePage() {
  return (
    <Suspense fallback={<ComparePageSkeleton />}>
      <CompareDataLoader />
    </Suspense>
  );
}
