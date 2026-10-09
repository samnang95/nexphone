"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { PhoneProduct, ColorOption } from "@/types/product";
import { PhoneViewer3D } from "@/components/viewer-3d/PhoneViewer3D";

interface ImageGallery3DProps {
  product: PhoneProduct;
  selectedColor: ColorOption;
  onSelectColor?: (color: ColorOption) => void;
}

export function ImageGallery3D({
  product,
  selectedColor,
  onSelectColor,
}: ImageGallery3DProps) {
  // Gallery images list: primary image + angle variations
  const galleryImages = [
    {
      id: "front",
      label: "Hero Display",
      url: selectedColor.imageUrl || product.imageUrl || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "angle",
      label: "Titanium Profile",
      url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "camera",
      label: "Optical Array",
      url: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "lifestyle",
      label: "Industrial Bevel",
      url: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [is3DMode, setIs3DMode] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const activeImage = galleryImages[activeImageIndex] || galleryImages[0]!;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Showcase Viewport */}
      <div className="relative aspect-square w-full rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-[#0a0f1d] to-[#070b14] overflow-hidden group shadow-2xl flex items-center justify-center">
        {/* Subtle cyber grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Ambient Finish Glow */}
        <div
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-[100px] opacity-25 pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: selectedColor.hex }}
        />

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md text-[10px] font-mono font-semibold text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            {product.series}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-950/60 border border-slate-800 text-[10px] font-mono text-slate-400">
            Finish: {selectedColor.name}
          </span>
        </div>

        {/* 3D Mode / Zoom Toggle Buttons */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {product.model3D?.enabled && (
            <button
              type="button"
              onClick={() => setIs3DMode(!is3DMode)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-lg backdrop-blur-md ${
                is3DMode
                  ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/30"
                  : "bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white hover:border-slate-600"
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
              </svg>
              <span>{is3DMode ? "Photo Mode" : "3D Studio"}</span>
            </button>
          )}

          {!is3DMode && (
            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-400 hover:text-white backdrop-blur-md transition-colors"
              title="Expand View"
              aria-label="Expand image"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3-3H7" />
              </svg>
            </button>
          )}
        </div>

        {/* Content Display: Full Three.js 3D Studio OR High-Res Photo */}
        {is3DMode ? (
          <div className="relative w-full h-full">
            <PhoneViewer3D
              product={product}
              initialColor={selectedColor}
              onColorChange={onSelectColor}
              className="!h-full !rounded-3xl border-0"
              enableFullscreen={true}
            />
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center p-8 transition-transform duration-500 group-hover:scale-105">
            <Image
              src={activeImage.url}
              alt={`${product.name} - ${activeImage.label}`}
              fill
              unoptimized
              priority
              className="object-contain p-6 drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)]"
            />
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      <div className="grid grid-cols-4 gap-3">
        {galleryImages.map((img, idx) => {
          const isSelected = activeImageIndex === idx && !is3DMode;
          return (
            <button
              key={img.id}
              type="button"
              onClick={() => {
                setActiveImageIndex(idx);
                setIs3DMode(false);
              }}
              className={`group relative aspect-square rounded-2xl border p-2 bg-slate-900/60 overflow-hidden transition-all flex flex-col items-center justify-center ${
                isSelected
                  ? "border-cyan-500 ring-2 ring-cyan-500/30 bg-slate-900"
                  : "border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={img.url}
                  alt={img.label}
                  fill
                  unoptimized
                  className="object-contain p-1 opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <span className="absolute bottom-1.5 inset-x-1 text-[9px] font-mono font-medium text-slate-400 truncate text-center bg-slate-950/80 px-1 py-0.5 rounded">
                {img.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl w-full h-[80vh] flex items-center justify-center">
            <Image
              src={activeImage.url}
              alt={activeImage.label}
              fill
              unoptimized
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute top-2 right-2 p-3 rounded-full bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-700 transition-all"
              aria-label="Close zoom"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGallery3D;
