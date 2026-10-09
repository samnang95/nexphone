"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { Order } from "@/types/order";
import { orderService } from "@/services/order.service";
import { OrderConfirmationClient } from "./OrderConfirmationClient";
import { ROUTES } from "@/routes";

interface OrderDetailContainerProps {
  orderId: string;
}

export function OrderDetailContainer({ orderId }: OrderDetailContainerProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    orderService.getOrderById(orderId).then((res) => {
      if (isMounted) {
        setOrder(res);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-center items-center p-6">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-4" />
        <p className="text-xs font-mono text-cyan-400">Locating Hardware Allocation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-center items-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-rose-500/80 flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-white">Order Record Not Found</h2>
        <p className="mt-2 text-xs text-slate-400 max-w-sm">
          No hardware allocation record exists for identifier: <strong className="text-cyan-400 font-mono">{orderId}</strong>
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href={ROUTES.PRODUCTS.ROOT}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20"
          >
            Explore Flagships
          </Link>
          <Link
            href={ROUTES.HOME}
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    );
  }

  return <OrderConfirmationClient order={order} />;
}

export default OrderDetailContainer;
