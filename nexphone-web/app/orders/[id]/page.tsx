import React, { Suspense } from "react";
import type { Metadata } from "next";
import { OrderDetailContainer } from "@/components/checkout";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return [
    { id: "NX-ORD-9040" },
    { id: "NX-ORD-9041" },
    { id: "NX-ORD-9042" },
  ];
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order ${id} | NexPhone Enclave`,
    description: `Track hardware allocation and cryptographic courier escort status for order ${id}.`,
  };
}

function OrderPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-center items-center p-6">
      <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-4" />
      <p className="text-xs font-mono text-cyan-400">Loading Order Enclave...</p>
    </div>
  );
}

async function OrderPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailContainer orderId={id} />;
}

export default function OrderPage({ params }: OrderPageProps) {
  return (
    <Suspense fallback={<OrderPageSkeleton />}>
      <OrderPageContent params={params} />
    </Suspense>
  );
}
