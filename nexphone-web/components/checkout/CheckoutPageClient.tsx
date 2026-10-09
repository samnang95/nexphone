"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/order.service";
import type {
  CustomerInfo,
  DeliveryAddress,
  PaymentMethodType,
  ShippingOption,
  Order,
} from "@/types/order";
import { CheckoutForm } from "./CheckoutForm";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";
import { OrderConfirmationClient } from "./OrderConfirmationClient";
import { ROUTES } from "@/routes";

const DEFAULT_SHIPPING: ShippingOption = {
  id: "standard",
  name: "NexExpress Armored Courier",
  price: 0,
  estimatedDelivery: "2–3 Business Days",
  description: "Armored diplomatic pouch with biometric tamper seal",
};

export function CheckoutPageClient() {
  const router = useRouter();
  const { items, subtotal, discount, appliedPromo, clearCart } = useCart();
  const { user } = useAuth();

  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  const [address, setAddress] = useState<DeliveryAddress>({
    street: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    instructions: "",
  });

  const [shippingOption, setShippingOption] = useState<ShippingOption>(DEFAULT_SHIPPING);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("credit_card");
  const [cardData, setCardData] = useState({
    number: "",
    holder: "",
    expiry: "",
    cvv: "",
  });
  const [cryptoCurrency, setCryptoCurrency] = useState<"USDC" | "BTC" | "ETH">("USDC");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStageText, setSubmitStageText] = useState("Encrypting Payload...");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Autofill customer from authenticated user if available
  useEffect(() => {
    let isMounted = true;
    if (user) {
      Promise.resolve().then(() => {
        if (!isMounted) return;
        setCustomer((prev) => ({
          ...prev,
          name: prev.name || user.name || "",
          email: prev.email || user.email || "",
          phone: prev.phone || user.phone || "",
          company: prev.company || user.company || "",
        }));
      });
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Dynamic calculated total with selected shipping option
  const effectiveShipping = shippingOption.id === "priority" ? 45 : subtotal >= 1000 ? 0 : 35;
  const effectiveTotal = Math.max(0, subtotal - discount) + effectiveShipping;

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!customer.name.trim()) errs.name = "Full legal name is required";
    if (!customer.email.trim() || !customer.email.includes("@"))
      errs.email = "Valid email address is required";
    if (!customer.phone.trim()) errs.phone = "Phone number is required for courier dispatch";

    if (!address.street.trim()) errs.street = "Street address is required";
    if (!address.city.trim()) errs.city = "City is required";
    if (!address.state.trim()) errs.state = "State / Province is required";
    if (!address.zipCode.trim()) errs.zipCode = "Postal / ZIP code is required";

    if (paymentMethod === "credit_card") {
      const rawNumber = cardData.number.replace(/\s+/g, "");
      if (rawNumber.length < 13) errs.cardNumber = "Valid credit card number is required";
      if (!cardData.holder.trim()) errs.cardHolder = "Cardholder name is required";
      if (!cardData.expiry.includes("/") || cardData.expiry.length < 5)
        errs.cardExpiry = "Expiry MM/YY required";
      if (cardData.cvv.length < 3) errs.cardCvv = "CVV required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      window.scrollTo({ top: 200, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setSubmitStageText("AES-256 Payment Authorization...");

    setTimeout(() => {
      setSubmitStageText("Allocating Titanium Hardware Serial...");
    }, 700);

    setTimeout(async () => {
      try {
        const order = await orderService.placeOrder({
          customer,
          deliveryAddress: address,
          shippingOption,
          payment: {
            method: paymentMethod,
            cardNumber: cardData.number,
            cardholderName: cardData.holder || customer.name,
            cardExpiry: cardData.expiry,
            cardCvv: cardData.cvv,
            cryptoCurrency: paymentMethod === "crypto" ? cryptoCurrency : undefined,
          },
          items,
          subtotal,
          discount,
          promoCode: appliedPromo?.code,
          shippingFee: effectiveShipping,
          tax: 0,
          total: effectiveTotal,
        });

        clearCart();
        setPlacedOrder(order);
        setIsSubmitting(false);

        // Update URL to order confirmation
        window.history.pushState(null, "", `/orders/${order.id}`);
      } catch (e) {
        console.error("Order placement failed", e);
        setIsSubmitting(false);
      }
    }, 1500);
  };

  // If order was successfully placed, display confirmation screen
  if (placedOrder) {
    return <OrderConfirmationClient order={placedOrder} />;
  }

  // If cart is empty and no order placed
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-center items-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-white">Your Cart is Empty</h2>
        <p className="mt-2 text-xs text-slate-400 max-w-sm">
          Please select flagship handsets from our catalog to proceed with hardware allocation.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href={ROUTES.PRODUCTS.ROOT}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20"
          >
            Explore Catalog
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 pb-24">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href={ROUTES.HOME} className="hover:text-white transition-colors">
              Hardware Enclave
            </Link>
            <span className="text-slate-600">/</span>
            <Link href={ROUTES.CART} className="hover:text-white transition-colors">
              Cart
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 font-semibold">Encrypted Checkout</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>256-bit HSM Session Active</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Cryptographic Dispatch Protocol</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Encrypted Checkout
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Confirm your recipient information, armored logistics destination, and tokenized payment authorization.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Multi-Step Checkout Form */}
          <div className="lg:col-span-7 xl:col-span-8">
            <CheckoutForm
              customer={customer}
              onCustomerChange={setCustomer}
              address={address}
              onAddressChange={setAddress}
              shippingOption={shippingOption}
              onShippingOptionChange={setShippingOption}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              cardData={cardData}
              onCardDataChange={setCardData}
              cryptoCurrency={cryptoCurrency}
              onCryptoCurrencyChange={setCryptoCurrency}
              errors={errors}
              totalAmount={effectiveTotal}
            />
          </div>

          {/* Right Column: Order Summary & Place Order CTA */}
          <div className="lg:col-span-5 xl:col-span-4">
            <CheckoutOrderSummary
              onPlaceOrder={handlePlaceOrder}
              isSubmitting={isSubmitting}
              submitStageText={submitStageText}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPageClient;
