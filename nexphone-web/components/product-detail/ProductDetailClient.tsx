"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PhoneProduct, ColorOption, StorageVariant } from "@/types/product";
import { ROUTES } from "@/routes";
import { useCompare } from "@/context/CompareContext";
import { ImageGallery3D } from "./ImageGallery3D";
import { ProductConfigurator } from "./ProductConfigurator";
import { ProductSpecsTable } from "./ProductSpecsTable";

interface ProductDetailClientProps {
  product: PhoneProduct;
  relatedProducts: PhoneProduct[];
}

export function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const { addPhone } = useCompare();
  const [selectedColor, setSelectedColor] = useState<ColorOption>(
    product.colors[0] || {
      id: "default",
      name: "Standard Finish",
      hex: "#2b2d42",
      inStock: true,
    }
  );

  const [selectedStorage, setSelectedStorage] = useState<StorageVariant>(
    product.storageOptions[0] || {
      id: "default",
      capacity: "256GB",
      ram: "12GB",
      price: product.basePrice,
      stock: 50,
      sku: "NX-DEFAULT",
    }
  );

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 pb-24">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-slate-400 font-mono overflow-x-auto scrollbar-none">
          <Link href={ROUTES.HOME} className="hover:text-white transition-colors shrink-0">
            Hardware Enclave
          </Link>
          <span className="text-slate-600">/</span>
          <Link href={ROUTES.PRODUCTS.ROOT} className="hover:text-white transition-colors shrink-0">
            Flagships
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-cyan-400 truncate font-semibold">
            {product.name}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-16">
        {/* Main Product Section: Gallery + Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: 3D Studio & Image Gallery */}
          <div className="lg:col-span-6 xl:col-span-7 sticky top-24">
            <ImageGallery3D
              product={product}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
            />
          </div>

          {/* Right Column: Interactive Configurator */}
          <div className="lg:col-span-6 xl:col-span-5">
            <ProductConfigurator
              product={product}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              selectedStorage={selectedStorage}
              onSelectStorage={setSelectedStorage}
            />
          </div>
        </div>

        {/* Detailed Specifications Section */}
        <div className="pt-8 border-t border-slate-800/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                Comprehensive Blueprint
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Technical Specifications
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={ROUTES.COMPARE}
                onClick={() => addPhone(product.id)}
                className="px-3.5 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Compare Model</span>
              </Link>
              <div className="text-xs font-mono text-slate-400 hidden sm:block">
                Grade-5 Aerospace Titanium Enclave
              </div>
            </div>
          </div>

          <ProductSpecsTable
            specifications={product.specifications}
            productName={product.name}
          />
        </div>

        {/* Related Devices in the NexOS Fleet */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-slate-800/80 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">
                  Fleet Ecosystem
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                  Explore Complementary Flagships
                </h2>
              </div>
              <Link
                href={ROUTES.PRODUCTS.ROOT}
                className="text-xs font-bold font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <span>View All</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={ROUTES.PRODUCTS.DETAIL(rel.id)}
                  className="group p-5 rounded-3xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-cyan-500/10"
                >
                  <div className="relative aspect-video w-full rounded-2xl bg-slate-950/60 p-4 flex items-center justify-center overflow-hidden mb-4 border border-slate-800/60">
                    {rel.imageUrl ? (
                      <Image
                        src={rel.imageUrl}
                        alt={rel.name}
                        width={200}
                        height={140}
                        unoptimized
                        className="max-h-28 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
                      />
                    ) : (
                      <div className="text-xs font-mono text-slate-500">NX</div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">
                      {rel.series}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mt-0.5 truncate">
                      {rel.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                      {rel.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-white">
                      From ${rel.basePrice.toLocaleString()}
                    </span>
                    <span className="font-mono text-cyan-400 text-[11px] group-hover:translate-x-1 transition-transform">
                      Configure →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailClient;
