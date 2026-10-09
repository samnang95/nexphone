"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface QuickViewPhone {
  name: string;
  subtitle: string;
  price: number;
  image: string;
  specs: string[];
  badge: string;
  series?: string;
}

interface PhoneQuickViewModalProps {
  phone: QuickViewPhone | null;
  onClose: () => void;
}

export function PhoneQuickViewModal({ phone, onClose }: PhoneQuickViewModalProps) {
  const [selectedStorage, setSelectedStorage] = useState<string>("512GB");
  const [selectedColor, setSelectedColor] = useState<string>("Titanium Natural");
  const [isReserved, setIsReserved] = useState<boolean>(false);

  if (!phone) return null;

  const storageOptions = [
    { label: "256GB", addPrice: 0 },
    { label: "512GB", addPrice: 150 },
    { label: "1TB", addPrice: 350 },
  ];

  const colors = [
    { name: "Titanium Natural", hex: "#94a3b8" },
    { name: "Space Black", hex: "#1e293b" },
    { name: "Deep Cobalt", hex: "#1e3a8a" },
    { name: "Polar Ceramic", hex: "#f8fafc" },
  ];

  const currentAdd = storageOptions.find((s) => s.label === selectedStorage)?.addPrice || 0;
  const totalPrice = phone.price + currentAdd;

  const handleReserve = () => {
    setIsReserved(true);
    setTimeout(() => {
      setIsReserved(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl z-10 overflow-hidden animate-in zoom-in-95">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/15 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Device Image Preview */}
          <div className="relative h-72 sm:h-80 w-full rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-950/80 p-6 flex flex-col items-center justify-center border border-slate-800/80">
            <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase">
              {phone.badge}
            </span>
            <Image
              src={phone.image}
              alt={phone.name}
              width={300}
              height={300}
              unoptimized
              className="max-h-56 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
            <div className="mt-3 text-[11px] font-mono text-slate-400">
              Finish: <span className="text-white font-semibold">{selectedColor}</span>
            </div>
          </div>

          {/* Right: Customization & CTAs */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
                {phone.series || "NexPhone Hardware"}
              </div>
              <h3 className="text-2xl font-black text-white leading-tight">
                {phone.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {phone.subtitle}
              </p>

              {/* Color Finish Picker */}
              <div className="mt-5">
                <label className="text-[11px] font-semibold text-slate-300 block mb-2 uppercase tracking-wider">
                  Chassis Finish: <span className="text-cyan-400">{selectedColor}</span>
                </label>
                <div className="flex items-center gap-3">
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        selectedColor === c.name
                          ? "border-cyan-400 scale-110 shadow-lg shadow-cyan-400/30"
                          : "border-slate-700 hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Storage Capacity Selector */}
              <div className="mt-5">
                <label className="text-[11px] font-semibold text-slate-300 block mb-2 uppercase tracking-wider">
                  Quantum NVMe Storage
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {storageOptions.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSelectedStorage(opt.label)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedStorage === opt.label
                          ? "border-cyan-500 bg-cyan-500/10 text-white font-bold"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      <div className="text-xs font-mono">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {opt.addPrice === 0 ? "Standard" : `+$${opt.addPrice}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Specs */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {phone.specs.map((spec, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Price & Action */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Total Configuration</span>
                <span className="text-2xl font-black text-white">
                  ${totalPrice.toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={handleReserve}
                disabled={isReserved}
                className={`flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  isReserved
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30"
                    : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-xl shadow-cyan-500/25 active:scale-95"
                }`}
              >
                {isReserved ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Slot Reserved!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Reserve Hardware</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhoneQuickViewModal;
