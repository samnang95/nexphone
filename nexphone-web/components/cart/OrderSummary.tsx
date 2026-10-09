"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ROUTES } from "@/routes";

export function OrderSummary() {
  const router = useRouter();
  const {
    subtotal,
    shipping,
    discount,
    appliedPromo,
    total,
    totalItems,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [promoInput, setPromoInput] = useState("");
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setFeedback(res);
    if (res.success) {
      setPromoInput("");
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    router.push(ROUTES.CHECKOUT);
  };

  const monthlyRate = (total / 24).toFixed(2);

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-md space-y-6 shadow-2xl sticky top-24">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">Order Summary</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {totalItems} {totalItems === 1 ? "Handset Allocated" : "Handsets Allocated"}
          </p>
        </div>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Voucher Input */}
      <div className="space-y-2">
        <form onSubmit={handleApplyPromo} className="flex gap-2">
          <input
            type="text"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            placeholder="Promo code (e.g. NEX10)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 transition-colors uppercase"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-colors active:scale-95"
          >
            Apply
          </button>
        </form>

        {appliedPromo && (
          <div className="flex items-center justify-between text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
            <div className="flex items-center gap-1.5">
              <span>✓</span>
              <span>{appliedPromo.label} ({appliedPromo.code})</span>
            </div>
            <button
              type="button"
              onClick={removePromoCode}
              className="text-slate-400 hover:text-white font-bold p-1"
              title="Remove discount code"
            >
              ✕
            </button>
          </div>
        )}

        {feedback && !appliedPromo && (
          <p className={`text-xs font-mono ${feedback.success ? "text-emerald-400" : "text-rose-400"}`}>
            {feedback.message}
          </p>
        )}
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span>Allocation Subtotal</span>
          <span className="font-mono text-white font-bold">
            ${subtotal.toLocaleString()}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-emerald-400 font-medium">
            <span>Enclave Promotion</span>
            <span className="font-mono font-bold">-${discount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Armored Courier Delivery</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              VIP
            </span>
          </div>
          <span className={`font-mono ${shipping === 0 ? "text-emerald-400 font-bold" : "text-white"}`}>
            {shipping === 0 ? "FREE" : `$${shipping}`}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Cryptographic Regulatory Fee</span>
          <span className="font-mono text-emerald-400 font-semibold">$0.00</span>
        </div>

        {/* Total Row */}
        <div className="pt-4 border-t border-slate-800 flex items-baseline justify-between">
          <div>
            <div className="text-base font-bold text-white">Total Investment</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              or <strong className="text-white">${monthlyRate}/mo</strong> (24 mos, 0% APR)
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            ${total.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Checkout CTA Button */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleCheckout}
          disabled={totalItems === 0 || isCheckingOut}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          {isCheckingOut ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Generating Secure Session...</span>
            </div>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Proceed to Encrypted Checkout</span>
            </>
          )}
        </button>

        <Link
          href={ROUTES.PRODUCTS.ROOT}
          className="w-full py-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-mono text-xs text-center block transition-colors"
        >
          ← Continue Shopping Catalog
        </Link>
      </div>

      {/* Trust & Security Badges */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>256-Bit Hardware Security Enclave</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span>Free Armored VIP Delivery on Orders $1,000+</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>30-Day Zero-Risk Evaluation Window</span>
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;
