"use client";

import type { Brand } from "@/types/brand";
import { cn } from "@/utils/cn";

interface BrandTableProps {
  readonly brands: Brand[];
  readonly onEdit: (brand: Brand) => void;
  readonly onDelete: (brand: Brand) => void;
  readonly onView: (brand: Brand) => void;
}

export function BrandTable({ brands, onEdit, onDelete, onView }: BrandTableProps) {
  if (brands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-500 mb-3">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-200">No brands match your filter</h3>
        <p className="mt-1 text-xs text-slate-400">Try adjusting your search criteria or add a new brand partner.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 shadow-xl backdrop-blur-md">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <th className="py-3 px-4">Brand Partner</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Tier</th>
            <th className="py-3 px-4">Headquarters</th>
            <th className="py-3 px-4 text-center">Catalog Models</th>
            <th className="py-3 px-4">Market Share</th>
            <th className="py-3 px-4">Website</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-normal">
          {brands.map((brand) => {
            const statusBadge = {
              active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
              inactive: "bg-slate-700/30 text-slate-400 border-slate-700/50",
              pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
            }[brand.status];

            const tierBadge = {
              Flagship: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
              Enterprise: "bg-purple-500/15 text-purple-300 border-purple-500/30",
              "OEM Partner": "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
              Strategic: "bg-rose-500/15 text-rose-300 border-rose-500/30",
            }[brand.tier];

            return (
              <tr
                key={brand.id}
                className="group transition-colors hover:bg-slate-800/30"
              >
                {/* Brand Name & Code */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-bold text-xs"
                      style={{
                        backgroundColor: `${brand.accentColor}18`,
                        borderColor: `${brand.accentColor}40`,
                        color: brand.accentColor,
                      }}
                    >
                      {brand.code}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                          {brand.name}
                        </span>
                        {brand.isFeatured && (
                          <span className="text-amber-400 text-xs" title="Featured Partner">
                            ★
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Founded {brand.foundedYear}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
                      statusBadge
                    )}
                  >
                    {brand.status}
                  </span>
                </td>

                {/* Tier */}
                <td className="py-3.5 px-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium",
                      tierBadge
                    )}
                  >
                    {brand.tier}
                  </span>
                </td>

                {/* Headquarters */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span className="text-slate-200">{brand.headquarters}</span>
                    <span className="text-[11px] text-slate-500">{brand.country}</span>
                  </div>
                </td>

                {/* Catalog Models */}
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center justify-center rounded-md bg-slate-800/80 px-2 py-0.5 font-mono text-xs font-semibold text-slate-200 border border-slate-700/60">
                    {brand.deviceCount}
                  </span>
                </td>

                {/* Market Share */}
                <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                  {brand.marketShare}
                </td>

                {/* Website */}
                <td className="py-3.5 px-4">
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors truncate max-w-[140px]"
                    title={brand.website}
                  >
                    <span className="truncate">{brand.website.replace(/^https?:\/\//, "")}</span>
                    <svg className="h-3 w-3 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => onView(brand)}
                      className="rounded-md border border-slate-700/60 bg-slate-800/40 p-1.5 text-slate-400 transition-colors hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300"
                      title="View Details"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => onEdit(brand)}
                      className="rounded-md border border-slate-700/60 bg-slate-800/40 p-1.5 text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                      title="Edit Brand"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>

                    <button
                      onClick={() => onDelete(brand)}
                      className="rounded-md border border-slate-700/60 bg-slate-800/40 p-1.5 text-slate-400 transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
                      title="Delete Brand"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
