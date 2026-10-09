"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PhoneProduct } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";
import { ROUTES } from "@/routes";

interface CompareTableProps {
  products: PhoneProduct[];
  allProducts: PhoneProduct[];
  onSelectProduct: (index: number, newProductId: string) => void;
  onAddProduct: (productId: string) => void;
  onRemoveProduct: (productId: string) => void;
}

export function CompareTable({
  products,
  allProducts,
  onSelectProduct,
  onAddProduct,
  onRemoveProduct,
}: CompareTableProps) {
  const { addItem, openCart } = useCart();
  const { clearCompare } = useCompare();

  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});

  const handleAddToCart = (product: PhoneProduct) => {
    const storage = product.storageOptions[0]!;
    const color = product.colors[0]!;

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: color.imageUrl || product.imageUrl || "",
      series: String(product.series),
      color,
      storage,
      unitPrice: storage.price,
      quantity: 1,
      availableColors: product.colors,
      availableStorage: product.storageOptions,
    });

    setAddedItemMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
    openCart();
  };

  // Helper to test if a row's values are different among the compared products
  const isRowDifferent = (getValue: (p: PhoneProduct) => string) => {
    if (products.length <= 1) return false;
    const firstVal = getValue(products[0]!).trim().toLowerCase();
    return products.some((p) => getValue(p).trim().toLowerCase() !== firstVal);
  };

  // Remaining available products that can be added (up to 3 max)
  const availableToAdd = allProducts.filter(
    (p) => !products.some((curr) => curr.id === p.id)
  );

  return (
    <div className="space-y-8">
      {/* Top Comparison Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setHighlightDifferences(!highlightDifferences)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border flex items-center gap-2 ${
              highlightDifferences
                ? "bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-md shadow-amber-500/10"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                highlightDifferences ? "bg-amber-400 animate-ping" : "bg-slate-500"
              }`}
            />
            <span>Highlight Differences</span>
          </button>

          <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
            Comparing {products.length} of 3 maximum handsets
          </span>
        </div>

        <div className="flex items-center gap-2">
          {products.length > 0 && (
            <button
              type="button"
              onClick={clearCompare}
              className="px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/20"
            >
              Reset Comparison
            </button>
          )}

          <Link
            href={ROUTES.PRODUCTS.ROOT}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Browse All Flagships
          </Link>
        </div>
      </div>

      {/* Main Side-by-Side Comparison Grid */}
      <div className="overflow-x-auto scrollbar-none pb-4">
        <div className="min-w-[760px] lg:min-w-full">
          {/* Header Row: Phone Cards & Slot Switchers */}
          <div className="grid grid-cols-12 gap-4 pb-6 border-b border-slate-800/80 items-stretch">
            {/* Left Blank Label Column */}
            <div className="col-span-3 flex flex-col justify-end p-4">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-semibold">
                Comparison Matrix
              </span>
              <h2 className="text-xl font-black text-white mt-1">
                Hardware Specs & Enclave
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select or swap any device column to inspect detailed engineering tolerances.
              </p>
            </div>

            {/* Product Columns (up to 3) */}
            {products.map((product, colIdx) => (
              <div
                key={product.id}
                className="col-span-3 p-5 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between relative group hover:border-cyan-500/40 transition-all shadow-xl"
              >
                {/* Remove button */}
                {products.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveProduct(product.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-rose-500/80 transition-colors text-xs"
                    title="Remove from comparison"
                    aria-label={`Remove ${product.name}`}
                  >
                    ✕
                  </button>
                )}

                {/* Device Selector Dropdown */}
                <div className="mb-3 pr-6">
                  <select
                    value={product.id}
                    onChange={(e) => onSelectProduct(colIdx, e.target.value)}
                    className="w-full text-xs font-mono font-semibold bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    {allProducts.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone Image */}
                <div className="relative aspect-square w-full rounded-2xl bg-slate-950/80 p-4 flex items-center justify-center overflow-hidden mb-3 border border-slate-800/80">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={180}
                      height={180}
                      unoptimized
                      className="max-h-36 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xl"
                    />
                  ) : (
                    <span className="text-xs font-mono text-slate-500">NexPhone</span>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-mono font-bold uppercase">
                    {product.series}
                  </span>
                </div>

                {/* Title & Price Details */}
                <div className="space-y-2 mb-4">
                  <h3 className="text-base font-bold text-white leading-snug line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black font-mono text-white">
                      ${product.basePrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      or ${(product.basePrice / 24).toFixed(2)}/mo
                    </span>
                  </div>
                </div>

                {/* Action CTAs */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 ${
                      addedItemMap[product.id]
                        ? "bg-emerald-500 text-slate-950 shadow-emerald-500/20"
                        : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20"
                    }`}
                  >
                    {addedItemMap[product.id] ? (
                      <span>Added!</span>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <Link
                      href={ROUTES.PRODUCTS.DETAIL(product.id)}
                      className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-[10px] text-center transition-colors"
                    >
                      Detail
                    </Link>
                    <Link
                      href={ROUTES.EXPERIENCE_3D}
                      className="py-1.5 px-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-mono text-[10px] text-center border border-indigo-500/20 transition-colors"
                    >
                      3D Studio
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty Slot to Add a 3rd Phone */}
            {products.length < 3 && (
              <div className="col-span-3 p-5 rounded-3xl border-2 border-dashed border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center font-bold text-lg mb-3">
                  +
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Add Handset to Compare
                </h4>
                <p className="text-xs text-slate-500 max-w-[200px] mb-4">
                  Select a complementary handset to evaluate specifications side-by-side.
                </p>

                {availableToAdd.length > 0 ? (
                  <select
                    onChange={(e) => {
                      if (e.target.value) onAddProduct(e.target.value);
                    }}
                    defaultValue=""
                    className="w-full text-xs font-mono font-semibold bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="" disabled>
                      + Choose a model...
                    </option>
                    {availableToAdd.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                        {p.name} (${p.basePrice})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-slate-500 font-mono">
                    All fleet models added
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Section: Specifications Categories */}
          <div className="mt-8 space-y-8">
            {/* Category: Display & Optics */}
            <div className="space-y-2">
              <div className="py-2.5 px-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Display Architecture
                </h3>
              </div>

              <div className="divide-y divide-slate-800/60">
                {[
                  { label: "Screen Diagonal", get: (p: PhoneProduct) => p.specifications.display.size },
                  { label: "Resolution & PPI", get: (p: PhoneProduct) => p.specifications.display.resolution },
                  { label: "Panel Technology", get: (p: PhoneProduct) => p.specifications.display.panelType },
                  { label: "Refresh Rate", get: (p: PhoneProduct) => p.specifications.display.refreshRate },
                  { label: "Peak Luminance", get: (p: PhoneProduct) => p.specifications.display.peakBrightness },
                ].map((row, idx) => {
                  const isDiff = isRowDifferent(row.get);
                  if (highlightDifferences && !isDiff) return null;

                  return (
                    <div
                      key={idx}
                      className={`grid grid-cols-12 gap-4 py-3 px-4 text-xs transition-colors items-center ${
                        isDiff && highlightDifferences
                          ? "bg-amber-500/10 text-amber-200"
                          : "hover:bg-slate-900/40 text-slate-300"
                      }`}
                    >
                      <div className="col-span-3 text-slate-400 font-medium">
                        {row.label}
                      </div>
                      {products.map((p) => (
                        <div key={p.id} className="col-span-3 font-mono text-white font-semibold">
                          {row.get(p)}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category: Performance & AI */}
            <div className="space-y-2">
              <div className="py-2.5 px-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Compute & NexCore AI
                </h3>
              </div>

              <div className="divide-y divide-slate-800/60">
                {[
                  { label: "Core Chipset", get: (p: PhoneProduct) => p.specifications.processor.chipset },
                  { label: "CPU Architecture", get: (p: PhoneProduct) => p.specifications.processor.cpu },
                  { label: "Graphics Engine", get: (p: PhoneProduct) => p.specifications.processor.gpu },
                  { label: "Neural Engine NPU", get: (p: PhoneProduct) => p.specifications.processor.neuralEngine },
                ].map((row, idx) => {
                  const isDiff = isRowDifferent(row.get);
                  if (highlightDifferences && !isDiff) return null;

                  return (
                    <div
                      key={idx}
                      className={`grid grid-cols-12 gap-4 py-3 px-4 text-xs transition-colors items-center ${
                        isDiff && highlightDifferences
                          ? "bg-amber-500/10 text-amber-200"
                          : "hover:bg-slate-900/40 text-slate-300"
                      }`}
                    >
                      <div className="col-span-3 text-slate-400 font-medium">
                        {row.label}
                      </div>
                      {products.map((p) => (
                        <div key={p.id} className="col-span-3 font-mono text-white font-semibold">
                          {row.get(p)}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category: Optical Camera Matrix */}
            <div className="space-y-2">
              <div className="py-2.5 px-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Optical Arrays & Sensors
                </h3>
              </div>

              <div className="divide-y divide-slate-800/60">
                {[
                  { label: "Primary Wide Lens", get: (p: PhoneProduct) => p.specifications.camera.main },
                  { label: "Ultra-Wide Angle", get: (p: PhoneProduct) => p.specifications.camera.ultrawide },
                  { label: "Periscope / Telephoto", get: (p: PhoneProduct) => p.specifications.camera.telephoto },
                  { label: "Front Biometric Cam", get: (p: PhoneProduct) => p.specifications.camera.front },
                ].map((row, idx) => {
                  const isDiff = isRowDifferent(row.get);
                  if (highlightDifferences && !isDiff) return null;

                  return (
                    <div
                      key={idx}
                      className={`grid grid-cols-12 gap-4 py-3 px-4 text-xs transition-colors items-center ${
                        isDiff && highlightDifferences
                          ? "bg-amber-500/10 text-amber-200"
                          : "hover:bg-slate-900/40 text-slate-300"
                      }`}
                    >
                      <div className="col-span-3 text-slate-400 font-medium">
                        {row.label}
                      </div>
                      {products.map((p) => (
                        <div key={p.id} className="col-span-3 font-mono text-white font-semibold">
                          {row.get(p)}
                        </div>
                      ))}
                    </div>
                  );
                })}

                {/* Features Pills Row */}
                <div className="grid grid-cols-12 gap-4 py-4 px-4 text-xs items-start">
                  <div className="col-span-3 text-slate-400 font-medium">
                    Camera Features
                  </div>
                  {products.map((p) => (
                    <div key={p.id} className="col-span-3 flex flex-wrap gap-1.5">
                      {p.specifications.camera.features.map((feat, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category: Power & Battery */}
            <div className="space-y-2">
              <div className="py-2.5 px-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Power & Charging
                </h3>
              </div>

              <div className="divide-y divide-slate-800/60">
                {[
                  { label: "Battery Capacity", get: (p: PhoneProduct) => p.specifications.battery.capacity },
                  { label: "Wired Charging Speed", get: (p: PhoneProduct) => p.specifications.battery.wiredCharging },
                  { label: "Wireless Charging", get: (p: PhoneProduct) => p.specifications.battery.wirelessCharging },
                ].map((row, idx) => {
                  const isDiff = isRowDifferent(row.get);
                  if (highlightDifferences && !isDiff) return null;

                  return (
                    <div
                      key={idx}
                      className={`grid grid-cols-12 gap-4 py-3 px-4 text-xs transition-colors items-center ${
                        isDiff && highlightDifferences
                          ? "bg-amber-500/10 text-amber-200"
                          : "hover:bg-slate-900/40 text-slate-300"
                      }`}
                    >
                      <div className="col-span-3 text-slate-400 font-medium">
                        {row.label}
                      </div>
                      {products.map((p) => (
                        <div key={p.id} className="col-span-3 font-mono text-white font-semibold">
                          {row.get(p)}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category: Enclave & Connectivity */}
            <div className="space-y-2">
              <div className="py-2.5 px-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Connectivity & Build Dimensions
                </h3>
              </div>

              <div className="divide-y divide-slate-800/60">
                {[
                  { label: "Cellular Protocol", get: (p: PhoneProduct) => p.specifications.connectivity.cellular },
                  { label: "Wi-Fi Protocol", get: (p: PhoneProduct) => p.specifications.connectivity.wifi },
                  { label: "Bluetooth", get: (p: PhoneProduct) => p.specifications.connectivity.bluetooth },
                  { label: "Bus & DisplayPort", get: (p: PhoneProduct) => p.specifications.connectivity.ports },
                  { label: "SIM Standby", get: (p: PhoneProduct) => p.specifications.connectivity.sim },
                  { label: "Dimensions", get: (p: PhoneProduct) => `${p.specifications.dimensions.height} x ${p.specifications.dimensions.width} x ${p.specifications.dimensions.thickness}` },
                  { label: "Mass / Weight", get: (p: PhoneProduct) => p.specifications.dimensions.weight },
                  { label: "Water & Dust Armor", get: (p: PhoneProduct) => p.specifications.dimensions.waterResistance },
                ].map((row, idx) => {
                  const isDiff = isRowDifferent(row.get);
                  if (highlightDifferences && !isDiff) return null;

                  return (
                    <div
                      key={idx}
                      className={`grid grid-cols-12 gap-4 py-3 px-4 text-xs transition-colors items-center ${
                        isDiff && highlightDifferences
                          ? "bg-amber-500/10 text-amber-200"
                          : "hover:bg-slate-900/40 text-slate-300"
                      }`}
                    >
                      <div className="col-span-3 text-slate-400 font-medium">
                        {row.label}
                      </div>
                      {products.map((p) => (
                        <div key={p.id} className="col-span-3 font-mono text-white font-semibold">
                          {row.get(p)}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompareTable;
