"use client";

import React from "react";
import type { CustomerInfo, DeliveryAddress, PaymentMethodType, ShippingOption } from "@/types/order";

interface CheckoutFormProps {
  customer: CustomerInfo;
  onCustomerChange: (customer: CustomerInfo) => void;
  address: DeliveryAddress;
  onAddressChange: (address: DeliveryAddress) => void;
  shippingOption: ShippingOption;
  onShippingOptionChange: (option: ShippingOption) => void;
  paymentMethod: PaymentMethodType;
  onPaymentMethodChange: (method: PaymentMethodType) => void;
  cardData: {
    number: string;
    holder: string;
    expiry: string;
    cvv: string;
  };
  onCardDataChange: (data: { number: string; holder: string; expiry: string; cvv: string }) => void;
  cryptoCurrency: "USDC" | "BTC" | "ETH";
  onCryptoCurrencyChange: (curr: "USDC" | "BTC" | "ETH") => void;
  errors: Record<string, string>;
  totalAmount: number;
}

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Japan",
  "Singapore",
  "Australia",
  "Switzerland",
  "United Arab Emirates",
  "South Korea",
  "Netherlands",
];

export function CheckoutForm({
  customer,
  onCustomerChange,
  address,
  onAddressChange,
  shippingOption,
  onShippingOptionChange,
  paymentMethod,
  onPaymentMethodChange,
  cardData,
  onCardDataChange,
  cryptoCurrency,
  onCryptoCurrencyChange,
  errors,
  totalAmount,
}: CheckoutFormProps) {
  // Format credit card number with spaces every 4 digits
  const handleCardNumberChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    onCardDataChange({ ...cardData, number: formatted });
  };

  // Format expiry MM/YY
  const handleExpiryChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      onCardDataChange({ ...cardData, expiry: `${digits.slice(0, 2)}/${digits.slice(2)}` });
    } else {
      onCardDataChange({ ...cardData, expiry: digits });
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Customer Information Section */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-xs">
            01
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Customer Information</h2>
            <p className="text-xs text-slate-400 font-mono">
              Individual recipient & contact credentials for courier dispatch
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300 block">
              Full Legal Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={customer.name}
              onChange={(e) => onCustomerChange({ ...customer, name: e.target.value })}
              placeholder="e.g. Alex Vance"
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                errors.name ? "border-rose-500" : "border-slate-800 focus:border-cyan-500"
              }`}
            />
            {errors.name && <p className="text-[11px] font-mono text-rose-400">{errors.name}</p>}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300 block">
              Encrypted Email Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              value={customer.email}
              onChange={(e) => onCustomerChange({ ...customer, email: e.target.value })}
              placeholder="alex@enclave.io"
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                errors.email ? "border-rose-500" : "border-slate-800 focus:border-cyan-500"
              }`}
            />
            {errors.email && <p className="text-[11px] font-mono text-rose-400">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300 block">
              Phone Number (Delivery SMS) <span className="text-rose-400">*</span>
            </label>
            <input
              type="tel"
              value={customer.phone}
              onChange={(e) => onCustomerChange({ ...customer, phone: e.target.value })}
              placeholder="+1 (555) 019-2834"
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                errors.phone ? "border-rose-500" : "border-slate-800 focus:border-cyan-500"
              }`}
            />
            {errors.phone && <p className="text-[11px] font-mono text-rose-400">{errors.phone}</p>}
          </div>

          {/* Company / Fleet ID (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300 block">
              Company / Fleet ID <span className="text-slate-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={customer.company || ""}
              onChange={(e) => onCustomerChange({ ...customer, company: e.target.value })}
              placeholder="e.g. Apex Cybernetics"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>
      </section>

      {/* 2. Delivery Address Section */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-xs">
            02
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Delivery Address</h2>
            <p className="text-xs text-slate-400 font-mono">
              Armored courier dropoff destination
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Street Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300 block">
              Street Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={address.street}
              onChange={(e) => onAddressChange({ ...address, street: e.target.value })}
              placeholder="100 Silicon Boulevard"
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                errors.street ? "border-rose-500" : "border-slate-800 focus:border-cyan-500"
              }`}
            />
            {errors.street && <p className="text-[11px] font-mono text-rose-400">{errors.street}</p>}
          </div>

          {/* Apt / Suite */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300 block">
              Apartment, Suite, Unit, or Floor <span className="text-slate-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={address.apartment || ""}
              onChange={(e) => onAddressChange({ ...address, apartment: e.target.value })}
              placeholder="Suite 4200 (Penthouse)"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* City, State, ZIP, Country Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 block">
                City <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => onAddressChange({ ...address, city: e.target.value })}
                placeholder="San Francisco"
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                  errors.city ? "border-rose-500" : "border-slate-800 focus:border-cyan-500"
                }`}
              />
              {errors.city && <p className="text-[11px] font-mono text-rose-400">{errors.city}</p>}
            </div>

            {/* State / Province */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 block">
                State / Province <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={address.state}
                onChange={(e) => onAddressChange({ ...address, state: e.target.value })}
                placeholder="CA"
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                  errors.state ? "border-rose-500" : "border-slate-800 focus:border-cyan-500"
                }`}
              />
              {errors.state && <p className="text-[11px] font-mono text-rose-400">{errors.state}</p>}
            </div>

            {/* ZIP / Postal Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 block">
                Postal / ZIP Code <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={address.zipCode}
                onChange={(e) => onAddressChange({ ...address, zipCode: e.target.value })}
                placeholder="94107"
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                  errors.zipCode ? "border-rose-500" : "border-slate-800 focus:border-cyan-500"
                }`}
              />
              {errors.zipCode && <p className="text-[11px] font-mono text-rose-400">{errors.zipCode}</p>}
            </div>
          </div>

          {/* Country Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300 block">
              Destination Country <span className="text-rose-400">*</span>
            </label>
            <select
              value={address.country}
              onChange={(e) => onAddressChange({ ...address, country: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Gate Code / Delivery Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300 block">
              Courier Access Instructions <span className="text-slate-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={address.instructions || ""}
              onChange={(e) => onAddressChange({ ...address, instructions: e.target.value })}
              placeholder="e.g. Call at security gate, leave with concierge"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Shipping Method Radio Selection */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <label className="text-xs font-mono text-slate-300 block">
            Select Armored Logistics Speed:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Standard Courier */}
            <button
              type="button"
              onClick={() =>
                onShippingOptionChange({
                  id: "standard",
                  name: "NexExpress Armored Courier",
                  price: 0,
                  estimatedDelivery: "2–3 Business Days",
                  description: "Armored diplomatic pouch with biometric tamper seal",
                })
              }
              className={`p-4 rounded-2xl border text-left transition-all ${
                shippingOption.id === "standard"
                  ? "bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/30"
                  : "bg-slate-950 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">Armored VIP Courier</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">FREE</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                2–3 Business Days • Biometric tamper seal included
              </p>
            </button>

            {/* Priority Escort */}
            <button
              type="button"
              onClick={() =>
                onShippingOptionChange({
                  id: "priority",
                  name: "Priority Cryptographic Escort",
                  price: 45,
                  estimatedDelivery: "Next Business Day (Morning)",
                  description: "Dedicated armed transport with satellite geofencing",
                })
              }
              className={`p-4 rounded-2xl border text-left transition-all ${
                shippingOption.id === "priority"
                  ? "bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/30"
                  : "bg-slate-950 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">Priority Direct Escort</span>
                <span className="text-xs font-mono text-indigo-400 font-bold">+$45</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Next-Day Morning • Satellite GPS tracking & direct hand-off
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Payment Method Section */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-xs">
            03
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Payment Method</h2>
            <p className="text-xs text-slate-400 font-mono">
              Hardware-accelerated AES-256 tokenized transaction
            </p>
          </div>
        </div>

        {/* Payment Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => onPaymentMethodChange("credit_card")}
            className={`py-3 px-3 rounded-2xl border text-xs font-mono font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
              paymentMethod === "credit_card"
                ? "bg-cyan-500/15 border-cyan-500/60 text-white shadow-lg shadow-cyan-500/10"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>Credit Card</span>
          </button>

          <button
            type="button"
            onClick={() => onPaymentMethodChange("nex_credit")}
            className={`py-3 px-3 rounded-2xl border text-xs font-mono font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
              paymentMethod === "nex_credit"
                ? "bg-indigo-500/15 border-indigo-500/60 text-white shadow-lg shadow-indigo-500/10"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>0% NexCredit</span>
          </button>

          <button
            type="button"
            onClick={() => onPaymentMethodChange("crypto")}
            className={`py-3 px-3 rounded-2xl border text-xs font-mono font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
              paymentMethod === "crypto"
                ? "bg-amber-500/15 border-amber-500/60 text-white shadow-lg shadow-amber-500/10"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Crypto / Web3</span>
          </button>

          <button
            type="button"
            onClick={() => onPaymentMethodChange("apple_pay")}
            className={`py-3 px-3 rounded-2xl border text-xs font-mono font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
              paymentMethod === "apple_pay"
                ? "bg-slate-800 border-slate-600 text-white"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <span className="text-base font-black">Pay</span>
            <span>Express</span>
          </button>
        </div>

        {/* Tab 1: Credit Card Form */}
        {paymentMethod === "credit_card" && (
          <div className="space-y-4 pt-2">
            {/* Visual Mini Card */}
            <div className="relative p-5 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/80 border border-slate-700/80 shadow-2xl overflow-hidden max-w-sm mx-auto sm:mx-0">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-4">
                <span>NexPhone Secure Card</span>
                <span className="text-cyan-400 font-bold">AES-256</span>
              </div>
              <div className="w-9 h-7 rounded bg-amber-400/80 mb-3 shadow-inner" />
              <div className="font-mono text-base tracking-widest text-white mb-3">
                {cardData.number || "•••• •••• •••• ••••"}
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="truncate max-w-[160px] uppercase">
                  {cardData.holder || customer.name || "CARDHOLDER"}
                </span>
                <span>{cardData.expiry || "MM/YY"}</span>
              </div>
            </div>

            {/* Card Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-mono text-slate-300 block">
                  Card Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={cardData.number}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  placeholder="4532 •••• •••• 8891"
                  className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 font-mono focus:outline-none transition-colors ${
                    errors.cardNumber ? "border-rose-500" : "border-slate-800 focus:border-cyan-500"
                  }`}
                />
                {errors.cardNumber && (
                  <p className="text-[11px] font-mono text-rose-400">{errors.cardNumber}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 block">
                  Name on Card <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={cardData.holder}
                  onChange={(e) => onCardDataChange({ ...cardData, holder: e.target.value })}
                  placeholder="Alex Vance"
                  className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    errors.cardHolder ? "border-rose-500" : "border-slate-800 focus:border-cyan-500"
                  }`}
                />
                {errors.cardHolder && (
                  <p className="text-[11px] font-mono text-rose-400">{errors.cardHolder}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 block">
                    Expiry <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardData.expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    placeholder="12/28"
                    className={`w-full px-3 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 font-mono text-center focus:outline-none transition-colors ${
                      errors.cardExpiry ? "border-rose-500" : "border-slate-800 focus:border-cyan-500"
                    }`}
                  />
                  {errors.cardExpiry && (
                    <p className="text-[11px] font-mono text-rose-400">{errors.cardExpiry}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 block">
                    CVC / CVV <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardData.cvv}
                    onChange={(e) =>
                      onCardDataChange({
                        ...cardData,
                        cvv: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    placeholder="•••"
                    className={`w-full px-3 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 font-mono text-center focus:outline-none transition-colors ${
                      errors.cardCvv ? "border-rose-500" : "border-slate-800 focus:border-cyan-500"
                    }`}
                  />
                  {errors.cardCvv && (
                    <p className="text-[11px] font-mono text-rose-400">{errors.cardCvv}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: NexCredit 0% Financing */}
        {paymentMethod === "nex_credit" && (
          <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-300 font-bold uppercase tracking-wider">
                NexCredit Enclave Financing
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                Pre-Approved (0% APR)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Spread your investment across <strong className="text-white">24 equal monthly installments</strong> of{" "}
              <strong className="text-cyan-400 font-mono">${(totalAmount / 24).toFixed(2)}/mo</strong> with zero fees and no interest penalty.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 pt-1">
              <span>✓ Instant Cryptographic Identity Verification</span>
            </div>
          </div>
        )}

        {/* Tab 3: Crypto Payment */}
        {paymentMethod === "crypto" && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
                Web3 Hardware Cold-Wallet Settlement
              </span>
              <span className="text-xs font-mono text-slate-400">Zero Slippage</span>
            </div>

            <div className="flex gap-2">
              {(["USDC", "BTC", "ETH"] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => onCryptoCurrencyChange(curr)}
                  className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${
                    cryptoCurrency === curr
                      ? "bg-amber-500 text-slate-950 border-amber-400"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Settlement Address:</div>
              <div className="break-all text-amber-300 text-[11px]">
                0x71C...NexEnclaveHardware92b
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Apple Pay / Google Pay */}
        {paymentMethod === "apple_pay" && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
            <div className="text-2xl">Pay / GPay</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your default biometrically secured device card will be authorized upon clicking Place Order.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default CheckoutForm;
