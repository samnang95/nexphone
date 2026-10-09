import React, { Suspense } from "react";
import type { Metadata } from "next";
import { WishlistPageClient } from "@/components/wishlist";

export const metadata: Metadata = {
  title: "Wishlist & Favorites | NexPhone Enclave",
  description:
    "Review saved NexPhone flagship devices, custom finishes, and cryptographic hardware. Move items directly to cart.",
};

function WishlistPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-center items-center p-6">
      <div className="w-12 h-12 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mb-4" />
      <p className="text-xs font-mono text-rose-400">Loading Wishlist Enclave...</p>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <Suspense fallback={<WishlistPageSkeleton />}>
      <WishlistPageClient />
    </Suspense>
  );
}
