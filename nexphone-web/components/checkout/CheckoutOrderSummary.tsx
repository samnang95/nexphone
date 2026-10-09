"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ROUTES } from "@/routes";

interface CheckoutOrderSummaryProps {
  onPlaceOrder: () => void;
  isSubmitting: boolean;
  submitStageText: string;
}

export function CheckoutOrderSummary({
  onPlaceOrder,
  isSubmitting,
  submitStageText,
}: CheckoutOrderSummaryProps) {
  const {
    items,
    subtotal,
    shipping,
    discount,
    appliedPromo,
    total,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [promoInput, setPromoInput] = useState("");
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setFeedback(res);
    if (res.success) {
      setPromoInput("");
    }
  };

  const monthlyRate = (total / 24).toFixed(2);

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-md space-y-6 shadow-2xl sticky top-24">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white">Order Summary</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {items.length} {items.length === 1 ? "Device Configuration" : "Device Configurations"}
          </p>
        </div>
        <Link
          href={ROUTES.CART}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Edit Cart
        </Link>
      </div>

      {/* Itemized Mini List */}
      <div className="max-h-60 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 text-xs">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center shrink-0">
              {item.productImage ? (
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  width={44}
                  height={44}
                  unoptimized
                  className="max-h-10 w-auto object-contain"
                />
              ) : (
                <span className="text-[9px] font-mono text-slate-600">NX</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-bold text-white truncate">{item.productName}</div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: item.color.hex }}
                />
                <span className="truncate max-w-[80px]">{item.color.name}</span>
                <span>•</span>
                <span className="text-cyan-400">{item.storage.capacity}</span>
                <span>•</span>
                <span>x{item.quantity}</span>
              </div>
            </div>

            <div className="text-right font-mono font-bold text-white shrink-0">
              ${(item.unitPrice * item.quantity).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code Input */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <form onSubmit={handleApplyPromo} className="flex gap-2">
          <input
            type="text"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            placeholder="Voucher code (e.g. NEX10)"
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 transition-colors uppercase"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-colors"
          >
            Apply
          </button>
        </form>

        {appliedPromo && (
          <div className="flex items-center justify-between text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <span>{appliedPromo.label} ({appliedPromo.code})</span>
            <button
              type="button"
              onClick={removePromoCode}
              className="text-slate-400 hover:text-white font-bold p-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {feedback && !appliedPromo && (
          <p className={`text-[11px] font-mono ${feedback.success ? "text-emerald-400" : "text-rose-400"}`}>
            {feedback.message}
          </p>
        )}
      </div>

      {/* Calculations Breakdown */}
      <div className="space-y-2.5 text-xs pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400">
          <span>Allocation Subtotal</span>
          <span className="font-mono text-white font-bold">${subtotal.toLocaleString()}</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-emerald-400">
            <span>Promotional Savings</span>
            <span className="font-mono font-bold">-${discount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-400">
          <span>Armored Logistics</span>
          <span className={`font-mono ${shipping === 0 ? "text-emerald-400 font-bold" : "text-white"}`}>
            {shipping === 0 ? "FREE" : `$${shipping}`}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Cryptographic Regulatory Tax</span>
          <span className="font-mono text-emerald-400 font-medium">$0.00</span>
        </div>

        {/* Grand Total */}
        <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
          <div>
            <span className="text-sm font-bold text-white block">Grand Total</span>
            <span className="text-[10px] text-slate-400 font-mono">
              or <strong className="text-white">${monthlyRate}/mo</strong> (24 mos, 0% APR)
            </span>
          </div>
          <span className="text-2xl font-black font-mono text-white">
            ${total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Place Order CTA Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={items.length === 0 || isSubmitting}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-cyan-500/25 transition-all flex flex-col items-center justify-center gap-1 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>{submitStageText}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Place Order • ${total.toLocaleString()}</span>
            </div>
          )}
        </button>
      </div>

      {/* Security note */}
      <p className="text-[10px] text-slate-500 text-center font-mono leading-relaxed">
        By placing this order, you authorize an encrypted reservation for cryptographic hardware. All shipments include tamper-evident biometric seals.
      </p>
    </div>
  );
}

export default CheckoutOrderSummary;
