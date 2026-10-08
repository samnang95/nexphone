"use client";

import type { PhoneProduct } from "@/types/product";

interface ProductTableProps {
  readonly products: readonly PhoneProduct[];
  readonly onEdit: (product: PhoneProduct) => void;
  readonly onDelete: (product: PhoneProduct) => void;
  readonly onView3D: (product: PhoneProduct) => void;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  onView3D,
}: ProductTableProps) {
  const getStatusBadge = (status: PhoneProduct["status"]) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Published
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Draft
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
            Archived
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <th scope="col" className="pb-3 pr-4">Model & Series</th>
            <th scope="col" className="pb-3 px-4">Status</th>
            <th scope="col" className="pb-3 px-4">Base Price</th>
            <th scope="col" className="pb-3 px-4">Storage Matrix</th>
            <th scope="col" className="pb-3 px-4">Colors</th>
            <th scope="col" className="pb-3 px-4">Total Stock</th>
            <th scope="col" className="pb-3 px-4">3D Asset</th>
            <th scope="col" className="pb-3 pl-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {products.map((p) => {
            const totalStock = p.storageOptions.reduce((acc, v) => acc + v.stock, 0);

            return (
              <tr
                key={p.id}
                className="group transition-colors hover:bg-slate-800/40"
              >
                {/* Model & Series */}
                <td className="py-3.5 pr-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {p.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {p.series} • {p.specifications.display.size}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  {getStatusBadge(p.status)}
                </td>

                {/* Price */}
                <td className="py-3.5 px-4 font-mono">
                  <span className="font-bold text-white">${p.basePrice.toLocaleString()}</span>
                  {p.compareAtPrice && (
                    <span className="text-slate-500 text-[11px] line-through block">
                      ${p.compareAtPrice.toLocaleString()}
                    </span>
                  )}
                </td>

                {/* Storage Matrix */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap items-center gap-1">
                    {p.storageOptions.map((s) => (
                      <span
                        key={s.id}
                        className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-700/60"
                      >
                        {s.capacity}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Colors */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5">
                    {p.colors.map((c) => (
                      <span
                        key={c.id}
                        title={c.name}
                        className="h-3.5 w-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </td>

                {/* Total Stock */}
                <td className="py-3.5 px-4">
                  <span
                    className={`font-semibold text-xs ${
                      totalStock > 20 ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {totalStock} units
                  </span>
                </td>

                {/* 3D Asset */}
                <td className="py-3.5 px-4">
                  {p.model3D.enabled ? (
                    <button
                      type="button"
                      onClick={() => onView3D(p)}
                      className="inline-flex items-center gap-1 rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[11px] font-medium text-indigo-300 hover:bg-indigo-500/20"
                    >
                      <svg className="h-3 w-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                      </svg>
                      <span>3D Ready</span>
                    </button>
                  ) : (
                    <span className="text-slate-500 text-[11px]">No model</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 pl-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p)}
                      className="rounded-lg p-1 text-slate-500 hover:bg-rose-950/40 hover:text-rose-400 transition-colors"
                      title="Delete Phone"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
