"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { PhoneProduct } from "@/types/product";
import { Phone3DViewer } from "./Phone3DViewer";

interface View3DModalProps {
  readonly product: PhoneProduct | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onOpenEdit: (product: PhoneProduct) => void;
}

export function View3DModal({
  product,
  isOpen,
  onClose,
  onOpenEdit,
}: View3DModalProps) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Background scroll lock and blur
  useEffect(() => {
    if (!isOpen || !product) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove("modal-open");
    };
  }, [isOpen, product]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isMounted || !isOpen || !product) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-3d-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col w-full max-w-2xl max-h-[88vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between p-5 border-b border-slate-800 bg-slate-900">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 id="view-3d-title" className="text-lg font-bold text-white">
                3D Asset Studio: {product.name}
              </h3>
              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[11px] font-medium text-indigo-400">
                Interactive Model
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Orbit inspection, material shader testing, and wireframe verification
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Close modal (Esc)"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
          <Phone3DViewer
            model3D={product.model3D}
            colors={product.colors}
            activeColor={product.model3D.defaultColor}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Asset Metadata
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Asset Format</span>
                <span className="font-mono text-slate-200 uppercase">{product.model3D.fileFormat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Geometry Complexity</span>
                <span className="font-mono text-slate-200">{product.model3D.polygonCount.toLocaleString()} Triangles</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Compressed Payload</span>
                <span className="font-mono text-slate-200">{product.model3D.fileSize}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Hardware Target
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Display Size</span>
                <span className="text-slate-200">{product.specifications.display.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chassis Dimensions</span>
                <span className="text-slate-200">{product.specifications.dimensions.height} x {product.specifications.dimensions.width}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Weight</span>
                <span className="text-slate-200">{product.specifications.dimensions.weight}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between p-4 border-t border-slate-800 bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Close Viewer
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenEdit(product);
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            Configure 3D Settings &rarr;
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
