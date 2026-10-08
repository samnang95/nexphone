"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { Brand } from "@/types/brand";

interface DeleteBrandModalProps {
  readonly isOpen: boolean;
  readonly brand: Brand | null;
  readonly isDeleting?: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (brand: Brand) => void;
}

export function DeleteBrandModal({
  isOpen,
  brand,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteBrandModalProps) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  if (!isMounted || !isOpen || !brand) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Red Warning Line */}
        <div className="h-1.5 w-full bg-rose-500" />

        <div className="p-6">
          {/* Header & Icon */}
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>

            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Delete Brand Partner
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Are you sure you want to remove <strong className="text-white font-semibold">{brand.name}</strong> ({brand.code}) from your hardware registry?
              </p>
            </div>
          </div>

          {/* Details & Warning Box */}
          <div className="mt-5 rounded-xl border border-rose-950/50 bg-rose-950/20 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Registered Models:</span>
              <span className="font-semibold text-rose-300 font-mono">
                {brand.deviceCount} {brand.deviceCount === 1 ? "device" : "devices"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Global Market Share:</span>
              <span className="font-semibold text-slate-200 font-mono">{brand.marketShare}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Tier:</span>
              <span className="font-semibold text-slate-200">{brand.tier}</span>
            </div>
            {brand.deviceCount > 0 && (
              <p className="pt-2 text-[11px] text-rose-300 border-t border-rose-900/40 leading-snug">
                ⚠️ Caution: This brand currently has active hardware models in the catalog. Deleting it will unbind these catalog entries.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-lg border border-slate-700/60 bg-slate-800/60 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(brand)}
              disabled={isDeleting}
              className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-rose-500 shadow-md shadow-rose-600/30 disabled:opacity-60"
            >
              {isDeleting && (
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              <span>Delete Brand</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
