"use client";

import React, { useState } from "react";
import type { PhoneSpecifications } from "@/types/product";

interface ProductSpecsTableProps {
  specifications: PhoneSpecifications;
  productName: string;
}

export function ProductSpecsTable({
  specifications,
  productName,
}: ProductSpecsTableProps) {
  const [activeTab, setActiveTab] = useState<"all" | "display" | "processor" | "camera" | "battery" | "connectivity" | "dimensions">("all");

  const tabs = [
    { id: "all", label: "Overview Matrix" },
    { id: "display", label: "Display & Vision" },
    { id: "processor", label: "NexCore AI" },
    { id: "camera", label: "Optical Arrays" },
    { id: "battery", label: "Power & Energy" },
    { id: "connectivity", label: "Antennas & Ports" },
    { id: "dimensions", label: "Chassis & Build" },
  ];

  return (
    <div className="space-y-6">
      {/* Spec Highlights Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
            Display Engine
          </div>
          <div className="text-base font-bold text-white mt-1">
            {specifications.display.size} {specifications.display.refreshRate}
          </div>
          <div className="text-xs text-slate-400 mt-0.5 truncate">
            {specifications.display.panelType}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider">
            Compute & AI
          </div>
          <div className="text-base font-bold text-white mt-1 truncate">
            {specifications.processor.chipset.split("(")[0]}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {specifications.processor.neuralEngine}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
            Primary Optical
          </div>
          <div className="text-base font-bold text-white mt-1 truncate">
            {specifications.camera.main.split(",")[0]}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {specifications.camera.telephoto.split("(")[0]}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
            Energy Cell
          </div>
          <div className="text-base font-bold text-white mt-1">
            {specifications.battery.capacity.split(" ")[0]} mAh
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {specifications.battery.wiredCharging.split("(")[0]}
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Specification Tables / Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Display */}
        {(activeTab === "all" || activeTab === "display") && (
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Display & Optics
              </h3>
            </div>

            <div className="space-y-3 text-xs divide-y divide-slate-800/60">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Screen Diagonal</span>
                <span className="font-mono text-white font-medium">{specifications.display.size}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Resolution</span>
                <span className="font-mono text-white font-medium">{specifications.display.resolution}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Panel Architecture</span>
                <span className="font-mono text-white font-medium">{specifications.display.panelType}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Dynamic Refresh</span>
                <span className="font-mono text-cyan-400 font-medium">{specifications.display.refreshRate}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Peak Luminance</span>
                <span className="font-mono text-white font-medium">{specifications.display.peakBrightness}</span>
              </div>
            </div>
          </div>
        )}

        {/* Processor */}
        {(activeTab === "all" || activeTab === "processor") && (
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Processor & Neural Engine
              </h3>
            </div>

            <div className="space-y-3 text-xs divide-y divide-slate-800/60">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Core Chipset</span>
                <span className="font-mono text-white font-medium">{specifications.processor.chipset}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">CPU Architecture</span>
                <span className="font-mono text-white font-medium text-right max-w-[240px]">{specifications.processor.cpu}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Graphics Engine</span>
                <span className="font-mono text-white font-medium">{specifications.processor.gpu}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Hardware NPU</span>
                <span className="font-mono text-indigo-400 font-medium">{specifications.processor.neuralEngine}</span>
              </div>
            </div>
          </div>
        )}

        {/* Camera Matrix */}
        {(activeTab === "all" || activeTab === "camera") && (
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Optical Arrays & Sensor Matrix
              </h3>
            </div>

            <div className="space-y-3 text-xs divide-y divide-slate-800/60">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Primary Wide</span>
                <span className="font-mono text-white font-medium text-right max-w-[220px]">{specifications.camera.main}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Ultra-Wide</span>
                <span className="font-mono text-white font-medium">{specifications.camera.ultrawide}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Periscope Optical</span>
                <span className="font-mono text-white font-medium">{specifications.camera.telephoto}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Front Biometric Cam</span>
                <span className="font-mono text-white font-medium">{specifications.camera.front}</span>
              </div>
              <div className="pt-3">
                <span className="text-slate-400 block mb-2">Computational Features</span>
                <div className="flex flex-wrap gap-1.5">
                  {specifications.camera.features.map((feat) => (
                    <span
                      key={feat}
                      className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Battery & Charging */}
        {(activeTab === "all" || activeTab === "battery") && (
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Battery & Charging Technology
              </h3>
            </div>

            <div className="space-y-3 text-xs divide-y divide-slate-800/60">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Cell Capacity</span>
                <span className="font-mono text-white font-medium">{specifications.battery.capacity}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">HyperCharge Wired</span>
                <span className="font-mono text-amber-400 font-medium">{specifications.battery.wiredCharging}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Wireless Inductive</span>
                <span className="font-mono text-white font-medium">{specifications.battery.wirelessCharging}</span>
              </div>
            </div>
          </div>
        )}

        {/* Connectivity */}
        {(activeTab === "all" || activeTab === "connectivity") && (
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Connectivity & Enclave Ports
              </h3>
            </div>

            <div className="space-y-3 text-xs divide-y divide-slate-800/60">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Cellular Protocol</span>
                <span className="font-mono text-white font-medium">{specifications.connectivity.cellular}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Wi-Fi Generation</span>
                <span className="font-mono text-white font-medium">{specifications.connectivity.wifi}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Bluetooth</span>
                <span className="font-mono text-white font-medium">{specifications.connectivity.bluetooth}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Data & Video Bus</span>
                <span className="font-mono text-cyan-400 font-medium">{specifications.connectivity.ports}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">SIM Architecture</span>
                <span className="font-mono text-white font-medium">{specifications.connectivity.sim}</span>
              </div>
            </div>
          </div>
        )}

        {/* Dimensions & Build */}
        {(activeTab === "all" || activeTab === "dimensions") && (
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Dimensions & Ingress Armor
              </h3>
            </div>

            <div className="space-y-3 text-xs divide-y divide-slate-800/60">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Physical Dimensions</span>
                <span className="font-mono text-white font-medium">
                  {specifications.dimensions.height} x {specifications.dimensions.width} x {specifications.dimensions.thickness}
                </span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Mass / Weight</span>
                <span className="font-mono text-white font-medium">{specifications.dimensions.weight}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Ingress Protection</span>
                <span className="font-mono text-rose-400 font-medium">{specifications.dimensions.waterResistance}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 text-center">
        <p className="text-[11px] font-mono text-slate-500">
          Official NexOS Hardware Certification Sheet for {productName}. All specifications verified at ISO 9001 cleanroom facilities.
        </p>
      </div>
    </div>
  );
}

export default ProductSpecsTable;
