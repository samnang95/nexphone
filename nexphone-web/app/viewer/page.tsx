import React, { Suspense } from "react";
import type { Metadata } from "next";
import { productService } from "@/services/product.service";
import { ViewerPageClient } from "@/components/viewer-3d";

export const metadata: Metadata = {
  title: "3D Hardware Enclave Studio | NexPhone",
  description:
    "Interactive 360° 3D hardware studio. Inspect Grade-5 titanium chassis finishes, exploded layer architectures, and optical matrices in real time.",
};

function ViewerPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-center items-center p-6">
      <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-4" />
      <p className="text-xs font-mono text-cyan-400">Loading 3D Hardware Studio...</p>
    </div>
  );
}

async function ViewerDataLoader() {
  const products = await productService.getProducts();

  return <ViewerPageClient products={products} />;
}

export default function ViewerPage() {
  return (
    <Suspense fallback={<ViewerPageSkeleton />}>
      <ViewerDataLoader />
    </Suspense>
  );
}
