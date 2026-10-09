"use client";

import React from "react";
import Link from "next/link";
import type { PhoneProduct, ColorOption } from "@/types/product";
import { PhoneViewer3D } from "./PhoneViewer3D";
import { ROUTES } from "@/routes";

interface PhoneViewerModalProps {
  product: PhoneProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectColor?: (color: ColorOption) => void;
}

export function PhoneViewerModal({
  product,
  isOpen,
  onClose,
  onSelectColor,
}: PhoneViewerModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs font-mono">
              3D
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {product.name} 3D Enclave Studio
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Aerospace Grade-5 Titanium • Rotate 360° • Zoom • Change Finish
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.PRODUCTS.DETAIL(product.id)}
              onClick={onClose}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <span>Configure Handset</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close 3D viewer modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 3D Interactive Canvas Area */}
        <div className="p-3 sm:p-6 bg-[#080c14]">
          <PhoneViewer3D
            product={product}
            onColorChange={onSelectColor}
            className="!h-[520px] sm:!h-[580px]"
          />
        </div>
      </div>
    </div>
  );
}

export default PhoneViewerModal;
