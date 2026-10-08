"use client";

import { useState } from "react";
import type { RevenueOverviewData } from "@/types/dashboard";

interface RevenueChartProps {
  readonly data: RevenueOverviewData;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"30d" | "6m" | "ytd">("ytd");
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Compute maximum amount for relative scaling
  const maxAmount = Math.max(...data.monthlyPoints.map((p) => p.amount), 200000);

  // Slice points based on period
  const displayPoints =
    selectedPeriod === "30d"
      ? data.monthlyPoints.slice(-2)
      : selectedPeriod === "6m"
      ? data.monthlyPoints.slice(-6)
      : data.monthlyPoints;

  const activePoint =
    hoveredPointIndex !== null && displayPoints[hoveredPointIndex]
      ? displayPoints[hoveredPointIndex]
      : displayPoints[displayPoints.length - 1];

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-white">Revenue Overview</h2>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
              +18.4% YoY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Omni-channel hardware transactions & enterprise VoIP subscription streams
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950/80 p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setSelectedPeriod("30d");
              setHoveredPointIndex(null);
            }}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              selectedPeriod === "30d"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            30 Days
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedPeriod("6m");
              setHoveredPointIndex(null);
            }}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              selectedPeriod === "6m"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            6 Months
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedPeriod("ytd");
              setHoveredPointIndex(null);
            }}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              selectedPeriod === "ytd"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Year to Date
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 py-4 border-b border-slate-800/80">
        <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-3">
          <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Total YTD Volume</span>
          <span className="text-xl font-bold tracking-tight text-white">{data.totalYearToDate}</span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">+24.2% vs target</span>
        </div>

        <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-3">
          <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Projected Run Rate (ARR)</span>
          <span className="text-xl font-bold tracking-tight text-indigo-300">{data.projectedArr}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Recurring enterprise tier</span>
        </div>

        <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-3">
          <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Average Order Value (AOV)</span>
          <span className="text-xl font-bold tracking-tight text-slate-100">{data.avgOrderValue}</span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">+4.8% basket size</span>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="pt-6 pb-2">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
              <span>Hardware Sales</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
              <span>VoIP Subscriptions</span>
            </div>
          </div>

          {activePoint && (
            <div className="font-mono text-xs">
              <span className="text-slate-400">{activePoint.label} 2026: </span>
              <span className="font-bold text-white">${activePoint.amount.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Visual Bar Columns */}
        <div className="relative h-44 sm:h-52 w-full flex items-end justify-between gap-2 sm:gap-4 pt-4 px-2">
          {/* Subtle Grid horizontal guide lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-dashed border-slate-700 w-full" />
            <div className="border-b border-dashed border-slate-700 w-full" />
            <div className="border-b border-dashed border-slate-700 w-full" />
            <div className="border-b border-slate-800 w-full" />
          </div>

          {displayPoints.map((point, index) => {
            const heightPercent = Math.max(12, Math.round((point.amount / maxAmount) * 100));
            const hardwarePercent = Math.round((point.hardwareAmount / point.amount) * 100);
            const isHovered = hoveredPointIndex === index;

            return (
              <div
                key={point.label}
                onMouseEnter={() => setHoveredPointIndex(index)}
                onMouseLeave={() => setHoveredPointIndex(null)}
                className="group relative flex-1 h-full flex flex-col justify-end items-center cursor-pointer z-10"
              >
                {/* Hover Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] shadow-xl text-center whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                    <p className="font-semibold text-white">${point.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">
                      HW: ${(point.hardwareAmount / 1000).toFixed(0)}k • Sub: ${(point.serviceAmount / 1000).toFixed(0)}k
                    </p>
                  </div>
                )}

                {/* The Stacked Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[42px] rounded-t-md overflow-hidden flex flex-col justify-end transition-all duration-300 ${
                    isHovered
                      ? "ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/20 brightness-110"
                      : "opacity-90 group-hover:opacity-100"
                  }`}
                >
                  {/* Service layer (emerald) */}
                  <div
                    style={{ height: `${100 - hardwarePercent}%` }}
                    className="w-full bg-emerald-400"
                  />
                  {/* Hardware layer (indigo) */}
                  <div
                    style={{ height: `${hardwarePercent}%` }}
                    className="w-full bg-gradient-to-t from-indigo-700 to-indigo-500"
                  />
                </div>

                {/* X Axis Label */}
                <span
                  className={`mt-2 text-[11px] font-medium transition-colors ${
                    isHovered ? "text-indigo-400 font-bold" : "text-slate-400"
                  }`}
                >
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue Stream Categories Progress Splits */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Revenue Split by Channel
        </h3>

        <div className="space-y-3 text-xs">
          {data.categoryBreakdown.map((cat) => (
            <div key={cat.category} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">{cat.category}</span>
                <span className="font-mono text-slate-200">
                  {cat.amount} <span className="text-slate-500">({cat.percentage}%)</span>
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${cat.color}`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
