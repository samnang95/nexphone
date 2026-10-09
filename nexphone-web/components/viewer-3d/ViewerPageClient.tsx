"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { PhoneProduct, ColorOption } from "@/types/product";
import { PhoneViewer3D } from "./PhoneViewer3D";
import { useCart } from "@/context/CartContext";
import { ROUTES } from "@/routes";

interface ViewerPageClientProps {
  products: PhoneProduct[];
}

export function ViewerPageClient({ products }: ViewerPageClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<PhoneProduct>(
    products[0] || ({} as PhoneProduct)
  );
  const [activeColor, setActiveColor] = useState<ColorOption>(
    selectedProduct.colors?.[0] || {
      id: "default",
      name: "Titanium Space Gray",
      hex: "#2b2d42",
      inStock: true,
    }
  );

  const { addItem, openCart } = useCart();
  const [addedToast, setAddedToast] = useState(false);

  const handleSelectProduct = (prod: PhoneProduct) => {
    setSelectedProduct(prod);
    if (prod.colors && prod.colors.length > 0) {
      setActiveColor(prod.colors[0]!);
    }
  };

  const handleAddToCart = () => {
    const storage = selectedProduct.storageOptions?.[0];
    if (!storage) return;

    addItem({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productSlug: selectedProduct.slug,
      productImage: activeColor.imageUrl || selectedProduct.imageUrl || "",
      series: String(selectedProduct.series),
      color: activeColor,
      storage,
      unitPrice: storage.price,
      quantity: 1,
      availableColors: selectedProduct.colors,
      availableStorage: selectedProduct.storageOptions,
    });

    openCart();
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 pb-20">
      {/* Studio Header Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href={ROUTES.HOME} className="hover:text-white transition-colors">
              Hardware Enclave
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 font-semibold">3D Interactive Studio</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline-block">
              Web3D / WebGL 2.0 Engine Active
            </span>
            <Link
              href={ROUTES.PRODUCTS.ROOT}
              className="px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Title & Model Selector Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>Full 360° Real-Time Hardware Enclave</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Interactive 3D Handset Studio
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Rotate 360°, inspect optical matrices with zoom, switch aerospace chassis finishes, and explore internal layer architecture in real time.
            </p>
          </div>

          {/* Model Switcher Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {products.map((p) => {
              const isSelected = p.id === selectedProduct.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProduct(p)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20"
                      : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main 3D Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3D Interactive Canvas */}
          <div className="lg:col-span-8">
            <PhoneViewer3D
              key={selectedProduct.id}
              product={selectedProduct}
              initialColor={activeColor}
              onColorChange={setActiveColor}
              className="!h-[620px]"
            />
          </div>

          {/* Right Column: Device Specifications & Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Device Info Card */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                  {selectedProduct.series}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Grade-5 Titanium
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  {selectedProduct.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {selectedProduct.subtitle}
                </p>
              </div>

              {/* Price & Monthly Financing */}
              <div className="pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase">Starting at</div>
                  <div className="text-2xl font-mono font-black text-white">
                    ${selectedProduct.basePrice.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-emerald-400 font-mono font-semibold">0% APR Financing</div>
                  <div className="text-xs font-mono text-slate-300">
                    ${(selectedProduct.basePrice / 24).toFixed(2)}/mo
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 ${
                    addedToast
                      ? "bg-emerald-500 text-slate-950 shadow-emerald-500/25"
                      : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25"
                  }`}
                >
                  {addedToast ? (
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
                      <span>Reserve Unit in Studio</span>
                    </>
                  )}
                </button>

                <Link
                  href={ROUTES.PRODUCTS.DETAIL(selectedProduct.id)}
                  className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <span>Full Technical Specifications</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Quick Specs Matrix */}
            <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800/80 space-y-3 text-xs">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Hardware Matrix Highlights
              </h4>

              <div className="space-y-2.5 divide-y divide-slate-800/80">
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-400">Display</span>
                  <span className="font-mono text-white text-right">
                    {selectedProduct.specifications.display.size} LTPO
                  </span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-400">Processor</span>
                  <span className="font-mono text-white text-right truncate max-w-[180px]">
                    {selectedProduct.specifications.processor.chipset.split("(")[0]}
                  </span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-400">Optical Matrix</span>
                  <span className="font-mono text-white text-right truncate max-w-[180px]">
                    {selectedProduct.specifications.camera.main.split(",")[0]}
                  </span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-400">Energy Cell</span>
                  <span className="font-mono text-white text-right">
                    {selectedProduct.specifications.battery.capacity}
                  </span>
                </div>
              </div>
            </div>

            {/* 3D Viewer Capabilities List */}
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-[11px] text-slate-400 space-y-1.5">
              <div className="text-xs font-bold text-indigo-300">
                Studio Capabilities:
              </div>
              <ul className="space-y-1 list-disc list-inside">
                <li>Rotate 360° with mouse or touch drag</li>
                <li>Zoom with mousewheel or on-screen slider</li>
                <li>Live chassis finish color switching</li>
                <li>Exploded layer view & Cyber wireframe mode</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewerPageClient;
