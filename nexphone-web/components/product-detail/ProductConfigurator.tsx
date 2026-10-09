"use client";

import React, { useState } from "react";
import type { PhoneProduct, ColorOption, StorageVariant } from "@/types/product";
import { useCart } from "@/context/CartContext";

interface ProductConfiguratorProps {
  product: PhoneProduct;
  selectedColor: ColorOption;
  onSelectColor: (color: ColorOption) => void;
  selectedStorage: StorageVariant;
  onSelectStorage: (storage: StorageVariant) => void;
}

export function ProductConfigurator({
  product,
  selectedColor,
  onSelectColor,
  selectedStorage,
  onSelectStorage,
}: ProductConfiguratorProps) {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  // Dynamic price calculations
  const unitPrice = selectedStorage.price;
  const comparePrice = selectedStorage.comparePrice || (product.compareAtPrice ? product.compareAtPrice + (unitPrice - product.basePrice) : undefined);
  const hasDiscount = comparePrice && comparePrice > unitPrice;
  const discountAmount = hasDiscount ? comparePrice - unitPrice : 0;
  const discountPercentage = hasDiscount ? Math.round((discountAmount / comparePrice) * 100) : 0;

  // Monthly financing calculation (24 months at 0% APR)
  const monthlyRate = (unitPrice / 24).toFixed(2);

  // Stock calculations
  const currentStock = selectedStorage.stock;
  const isOutOfStock = currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock <= 30;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > currentStock) return currentStock;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: selectedColor.imageUrl || product.imageUrl || "",
      series: product.series,
      color: selectedColor,
      storage: selectedStorage,
      unitPrice,
      quantity,
    });

    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 2000);
  };

  const handleInstantBuyout = () => {
    handleAddToCart();
    openCart();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Product Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {product.series}
          </span>
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-slate-500 text-[11px] font-normal">(420+ Enterprise Reviews)</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
          {product.name}
        </h1>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          {product.subtitle}
        </p>
      </div>

      {/* Pricing Header */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-mono font-black text-white">
            ${unitPrice.toLocaleString()}
          </span>

          {hasDiscount && (
            <>
              <span className="text-lg font-mono text-slate-500 line-through">
                ${comparePrice.toLocaleString()}
              </span>
              <span className="px-2 py-0.5 rounded-lg text-xs font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                SAVE ${discountAmount} ({discountPercentage}%)
              </span>
            </>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 font-mono">
          <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Or <strong className="text-white">${monthlyRate}/month</strong> for 24 months with 0% APR NexCredit.
          </span>
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Chassis Finish:</span>
          <span className="font-bold text-white font-mono">{selectedColor.name}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {product.colors.map((color) => {
            const isSelected = color.id === selectedColor.id;
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => onSelectColor(color)}
                className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-500/10 text-white ring-2 ring-cyan-500/30"
                    : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white"
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-white/20 shadow-inner shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <span>{color.name}</span>
                {!color.inStock && (
                  <span className="text-[10px] text-rose-400 font-mono ml-1">
                    (Out of Stock)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Storage & Memory Variants */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Storage & RAM Variant:</span>
          <span className="font-mono text-cyan-400 text-[11px] font-semibold">
            SKU: {selectedStorage.sku}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {product.storageOptions.map((opt) => {
            const isSelected = opt.id === selectedStorage.id;
            const priceDelta = opt.price - product.basePrice;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onSelectStorage(opt);
                  if (quantity > opt.stock) {
                    setQuantity(Math.max(1, opt.stock));
                  }
                }}
                className={`relative p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-cyan-500 bg-gradient-to-b from-cyan-950/30 to-slate-900/90 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-950/40"
                    : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black font-mono text-white">
                      {opt.capacity}
                    </span>
                    {priceDelta === 0 ? (
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        Standard
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">
                        +${priceDelta}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    {opt.ram}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">
                    ${opt.price}
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      opt.stock > 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {opt.stock > 0 ? `${opt.stock} in stock` : "Sold out"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Stock & Availability Meter */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isOutOfStock
                  ? "bg-rose-500"
                  : isLowStock
                  ? "bg-amber-400 animate-pulse"
                  : "bg-emerald-400"
              }`}
            />
            <span className="font-bold text-white">
              {isOutOfStock
                ? "Out of Stock for Selected Variant"
                : isLowStock
                ? `Only ${currentStock} Units Left in Current Batch`
                : "Active Inventory Allocation"}
            </span>
          </div>

          <span className="font-mono text-xs text-slate-400">
            {currentStock} units available
          </span>
        </div>

        {/* Inventory Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOutOfStock
                ? "w-0 bg-rose-500"
                : isLowStock
                ? "w-1/4 bg-amber-400"
                : "w-3/4 bg-gradient-to-r from-cyan-500 to-emerald-400"
            }`}
          />
        </div>
      </div>

      {/* Quantity & CTA Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        {/* Quantity Counter */}
        <div className="flex items-center justify-between sm:justify-start border border-slate-800 rounded-2xl bg-slate-900/80 p-1 shrink-0">
          <button
            type="button"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1 || isOutOfStock}
            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-12 text-center text-sm font-mono font-bold text-white">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= currentStock || isOutOfStock}
            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl active:scale-98 ${
            isAddedFeedback
              ? "bg-emerald-500 text-slate-950 shadow-emerald-500/25"
              : isOutOfStock
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25 hover:shadow-cyan-500/40"
          }`}
        >
          {isAddedFeedback ? (
            <>
              <svg className="w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>Added to Allocation!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>{isOutOfStock ? "Sold Out" : `Add to Cart • $${(unitPrice * quantity).toLocaleString()}`}</span>
            </>
          )}
        </button>

        {/* Express Checkout */}
        <button
          type="button"
          onClick={handleInstantBuyout}
          disabled={isOutOfStock}
          className="sm:w-auto py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 active:scale-98 disabled:opacity-40 disabled:pointer-events-none"
        >
          Express Order
        </button>
      </div>

      {/* Security & Warranty Trust Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Grade-5 Titanium</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span>Armored Delivery</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>30-Day Evaluation</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span>2-Yr NexCare Enclave</span>
        </div>
      </div>
    </div>
  );
}

export default ProductConfigurator;
