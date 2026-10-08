"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type {
  PhoneProduct,
  ProductSeries,
  ProductStatus,
  ColorOption,
  StorageVariant,
  PhoneSpecifications,
  Model3DAsset,
} from "@/types/product";
import { Phone3DViewer } from "./Phone3DViewer";

interface PhoneFormModalProps {
  readonly isOpen: boolean;
  readonly mode: "add" | "edit";
  readonly initialProduct?: PhoneProduct | null;
  readonly isSaving?: boolean;
  readonly onClose: () => void;
  readonly onSave: (productData: Omit<PhoneProduct, "id" | "createdAt" | "updatedAt">) => void;
}

type TabKey = "general" | "pricing" | "variants" | "specs" | "model3d";

interface PhoneFormDialogContentProps {
  readonly mode: "add" | "edit";
  readonly initialProduct?: PhoneProduct | null;
  readonly isSaving?: boolean;
  readonly onClose: () => void;
  readonly onSave: (productData: Omit<PhoneProduct, "id" | "createdAt" | "updatedAt">) => void;
}

export function PhoneFormModal({
  isOpen,
  mode,
  initialProduct,
  isSaving = false,
  onClose,
  onSave,
}: PhoneFormModalProps) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Lock background scroll and apply blur
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

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="phone-form-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <PhoneFormDialogContent
        key={initialProduct ? initialProduct.id : "new-product"}
        mode={mode}
        initialProduct={initialProduct}
        isSaving={isSaving}
        onClose={onClose}
        onSave={onSave}
      />
    </div>,
    document.body
  );
}

function PhoneFormDialogContent({
  mode,
  initialProduct,
  isSaving = false,
  onClose,
  onSave,
}: PhoneFormDialogContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("general");

  // Form states initialized directly from initialProduct
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [slug, setSlug] = useState(initialProduct?.slug ?? "");
  const [subtitle, setSubtitle] = useState(initialProduct?.subtitle ?? "");
  const [series, setSeries] = useState<ProductSeries>(initialProduct?.series ?? "Pro Series");
  const [status, setStatus] = useState<ProductStatus>(initialProduct?.status ?? (mode === "edit" ? "published" : "draft"));
  const [rating, setRating] = useState(initialProduct?.rating ?? 4.8);

  // Pricing states
  const [basePrice, setBasePrice] = useState(initialProduct?.basePrice ?? 999);
  const [compareAtPrice, setCompareAtPrice] = useState<number | undefined>(initialProduct?.compareAtPrice ?? 1099);
  const [costPrice, setCostPrice] = useState<number | undefined>(initialProduct?.costPrice ?? 550);

  // Colors & Storage variants
  const [colors, setColors] = useState<ColorOption[]>(() =>
    initialProduct?.colors
      ? [...initialProduct.colors]
      : [
          { id: "c1", name: "Space Black", hex: "#1e1e24", inStock: true },
          { id: "c2", name: "Natural Titanium", hex: "#94a3b8", inStock: true },
        ]
  );
  const [storageOptions, setStorageOptions] = useState<StorageVariant[]>(() =>
    initialProduct?.storageOptions
      ? [...initialProduct.storageOptions]
      : [
          { id: "s1", capacity: "256GB", ram: "12GB", price: 999, comparePrice: 1099, stock: 100, sku: "NX-256" },
          { id: "s2", capacity: "512GB", ram: "16GB", price: 1199, comparePrice: 1299, stock: 50, sku: "NX-512" },
        ]
  );

  // Specifications
  const [specs, setSpecs] = useState<PhoneSpecifications>(() =>
    initialProduct?.specifications
      ? { ...initialProduct.specifications }
      : {
          display: { size: "6.8 inch", resolution: "3120 x 1440 QHD+", panelType: "Dynamic AMOLED 2X", refreshRate: "1-120Hz LTPO", peakBrightness: "2,600 nits" },
          processor: { chipset: "NexCore AI Pro (3nm)", cpu: "Octa-core 3.4GHz", gpu: "NexGraphics Ray-Tracing", neuralEngine: "45 TOPS NPU" },
          camera: { main: "200MP OIS f/1.7", ultrawide: "50MP 122°", telephoto: "50MP 5x Periscope OIS", front: "32MP Dual Pixel", features: ["8K 30fps", "ProRAW", "Night Vision 3.0"] },
          battery: { capacity: "5,400 mAh", wiredCharging: "65W HyperCharge", wirelessCharging: "25W Qi2 MagSafe" },
          connectivity: { cellular: "5G mmWave + Sub-6", wifi: "Wi-Fi 7", bluetooth: "Bluetooth 5.4", ports: "USB-C 3.2 Gen 2", sim: "Dual SIM + eSIM" },
          dimensions: { height: "163.4 mm", width: "78.1 mm", thickness: "8.6 mm", weight: "228 g", waterResistance: "IP68" },
        }
  );

  // 3D Model
  const [model3D, setModel3D] = useState<Model3DAsset>(() =>
    initialProduct?.model3D
      ? { ...initialProduct.model3D }
      : {
          enabled: true,
          modelUrl: "/models/nexphone-pro-max.glb",
          fileFormat: "glb",
          fileSize: "4.8 MB",
          polygonCount: 52400,
          autoRotate: true,
          defaultColor: "#2b2d42",
          wireframeSupported: true,
        }
  );

  // Handlers for dynamic color management
  const addColor = () => {
    const newColor: ColorOption = {
      id: `c_${Date.now()}`,
      name: "New Finish",
      hex: "#4f46e5",
      inStock: true,
    };
    setColors((prev) => [...prev, newColor]);
  };

  const removeColor = (id: string) => {
    setColors((prev) => prev.filter((c) => c.id !== id));
  };

  const updateColor = (id: string, updates: Partial<ColorOption>) => {
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  // Handlers for dynamic storage variant management
  const addStorage = () => {
    const newVariant: StorageVariant = {
      id: `s_${Date.now()}`,
      capacity: "1TB",
      ram: "16GB",
      price: basePrice + 300,
      comparePrice: (compareAtPrice || basePrice) + 300,
      stock: 50,
      sku: `NX-${name.substring(0, 3).toUpperCase() || "PHN"}-1TB`,
    };
    setStorageOptions((prev) => [...prev, newVariant]);
  };

  const removeStorage = (id: string) => {
    setStorageOptions((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStorage = (id: string, updates: Partial<StorageVariant>) => {
    setStorageOptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setActiveTab("general");
      return;
    }

    const computedBasePrice =
      storageOptions.length > 0
        ? Math.min(...storageOptions.map((s) => s.price))
        : basePrice;

    onSave({
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      subtitle: subtitle.trim(),
      series,
      status,
      basePrice: computedBasePrice,
      compareAtPrice,
      costPrice,
      rating,
      colors,
      storageOptions,
      specifications: specs,
      model3D,
    });
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative flex flex-col w-full max-w-4xl max-h-[88vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
    >
      {/* Modal Header */}
        <div className="flex shrink-0 items-start justify-between p-5 sm:px-6 border-b border-slate-800 bg-slate-900">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 id="phone-form-modal-title" className="text-lg font-bold text-white">
                {mode === "add" ? "Add New Phone Model" : `Edit ${name || "Phone"}`}
              </h2>
              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[11px] font-medium text-indigo-400">
                {series}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure pricing, hardware specifications, variants, and interactive 3D assets.
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

        {/* Tab Navigation Controls */}
        <div className="flex shrink-0 items-center gap-1.5 border-b border-slate-800/80 bg-slate-950/60 px-5 sm:px-6 py-2 overflow-x-auto text-xs">
          {(
            [
              { key: "general", label: "1. General Info" },
              { key: "pricing", label: "2. Manage Price" },
              { key: "variants", label: "3. Colors & Storage" },
              { key: "specs", label: "4. Specifications" },
              { key: "model3d", label: "5. 3D Model Asset" },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-5">
            {/* TAB 1: General Info */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Phone Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (!slug || mode === "add") {
                          setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                        }
                      }}
                      placeholder="e.g. NexPhone Pro Max X"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. nexphone-pro-max-x"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Marketing Subtitle
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Titanium frame, 200MP Quad Camera, NexCore AI Gen 3"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Series Category
                    </label>
                    <div className="relative">
                      <select
                        value={series}
                        onChange={(e) => setSeries(e.target.value as ProductSeries)}
                        className="w-full appearance-none rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-3 pr-8 text-xs text-white transition-colors hover:border-slate-700 hover:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="Pro Series">Pro Series (Flagship)</option>
                        <option value="Enterprise">Enterprise (Edge Security)</option>
                        <option value="Foldable">Foldable (Titanium Fold)</option>
                        <option value="Lite">Lite (Essential Everyday)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Catalog Status
                    </label>
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as ProductStatus)}
                        className="w-full appearance-none rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-3 pr-8 text-xs text-white transition-colors hover:border-slate-700 hover:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="published">Published (Live in Store)</option>
                        <option value="draft">Draft (Internal Staging)</option>
                        <option value="archived">Archived (Discontinued)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Customer Rating (0-5)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={rating}
                      onChange={(e) => setRating(parseFloat(e.target.value) || 4.5)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Manage Price */}
            {activeTab === "pricing" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Base Pricing & Margin Structure
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Base Retail Price ($ USD) *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">$</span>
                        <input
                          type="number"
                          required
                          min="0"
                          value={basePrice}
                          onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-7 pr-3 text-xs text-white font-mono font-semibold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Compare-at Price (MSRP)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">$</span>
                        <input
                          type="number"
                          min="0"
                          value={compareAtPrice || ""}
                          onChange={(e) => setCompareAtPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="e.g. 1299"
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-7 pr-3 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Cost Per Unit (BOM)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">$</span>
                        <input
                          type="number"
                          min="0"
                          value={costPrice || ""}
                          onChange={(e) => setCostPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="e.g. 650"
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-7 pr-3 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculated Margin Box */}
                  {costPrice && basePrice > costPrice && (
                    <div className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400">Estimated Gross Margin: </span>
                        <span className="font-bold text-emerald-400">
                          ${(basePrice - costPrice).toLocaleString()} per unit (
                          {(((basePrice - costPrice) / basePrice) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">Healthy Tier-1 Margin</span>
                    </div>
                  )}
                </div>

                {/* Storage Tier Pricing Matrix */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Tiered Storage Pricing Matrix
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Configured in &quot;Colors & Storage&quot; tab
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800/80 text-xs">
                    {storageOptions.map((v) => (
                      <div key={v.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-white">{v.capacity}</span>
                          <span className="text-slate-400 ml-2 font-mono text-[11px]">({v.ram})</span>
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-xs font-bold text-white">${v.price}</span>
                          {v.comparePrice && (
                            <span className="text-slate-500 line-through text-[11px]">
                              ${v.comparePrice}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Manage Colors & Storage */}
            {activeTab === "variants" && (
              <div className="space-y-6">
                {/* Colors Manager */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between mb-3.5">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                        Color Finishes ({colors.length})
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Chassis colors, hex swatches, and warehouse availability
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addColor}
                      className="rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 transition-colors"
                    >
                      + Add Color
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {colors.map((c) => (
                      <div
                        key={c.id}
                        className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-xs"
                      >
                        <input
                          type="color"
                          value={c.hex}
                          onChange={(e) => updateColor(c.id, { hex: e.target.value })}
                          className="h-7 w-7 rounded cursor-pointer bg-transparent border-0"
                          title="Choose hex color"
                        />
                        <div className="flex-1 min-w-[140px]">
                          <input
                            type="text"
                            value={c.name}
                            onChange={(e) => updateColor(c.id, { name: e.target.value })}
                            placeholder="Color Name (e.g. Titanium Blue)"
                            className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-white"
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-400 w-16">{c.hex}</span>
                        <label className="flex items-center gap-1.5 text-slate-300 text-[11px] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={c.inStock}
                            onChange={(e) => updateColor(c.id, { inStock: e.target.checked })}
                            className="rounded border-slate-700 bg-slate-950 text-indigo-600"
                          />
                          <span>In Stock</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeColor(c.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Remove color"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Storage Variants Manager */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between mb-3.5">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                        Storage & RAM Variants ({storageOptions.length})
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Storage capacity, memory specs, individual retail prices, and inventory
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addStorage}
                      className="rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 transition-colors"
                    >
                      + Add Storage Tier
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {storageOptions.map((s) => (
                      <div
                        key={s.id}
                        className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 items-center rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-xs"
                      >
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Capacity</label>
                          <input
                            type="text"
                            value={s.capacity}
                            onChange={(e) => updateStorage(s.id, { capacity: e.target.value })}
                            placeholder="e.g. 256GB"
                            className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-white font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">RAM Spec</label>
                          <input
                            type="text"
                            value={s.ram}
                            onChange={(e) => updateStorage(s.id, { ram: e.target.value })}
                            placeholder="e.g. 12GB"
                            className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Price ($)</label>
                          <input
                            type="number"
                            value={s.price}
                            onChange={(e) => updateStorage(s.id, { price: parseFloat(e.target.value) || 0 })}
                            className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-white font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">MSRP ($)</label>
                          <input
                            type="number"
                            value={s.comparePrice || ""}
                            onChange={(e) => updateStorage(s.id, { comparePrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                            className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-400 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Inventory Stock</label>
                          <input
                            type="number"
                            value={s.stock}
                            onChange={(e) => updateStorage(s.id, { stock: parseInt(e.target.value) || 0 })}
                            className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                        <div className="flex items-center justify-end pt-3 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => removeStorage(s.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Remove storage tier"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Manage Specifications */}
            {activeTab === "specs" && (
              <div className="space-y-4">
                {/* Display Specs */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Display & Screen
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Screen Size</label>
                      <input
                        type="text"
                        value={specs.display.size}
                        onChange={(e) => setSpecs({ ...specs, display: { ...specs.display, size: e.target.value } })}
                        className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Resolution</label>
                      <input
                        type="text"
                        value={specs.display.resolution}
                        onChange={(e) => setSpecs({ ...specs, display: { ...specs.display, resolution: e.target.value } })}
                        className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Panel Type & Rate</label>
                      <input
                        type="text"
                        value={specs.display.panelType}
                        onChange={(e) => setSpecs({ ...specs, display: { ...specs.display, panelType: e.target.value } })}
                        className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Processor Specs */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Processor & Chipset
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Chipset Name</label>
                      <input
                        type="text"
                        value={specs.processor.chipset}
                        onChange={(e) => setSpecs({ ...specs, processor: { ...specs.processor, chipset: e.target.value } })}
                        className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">NPU AI Engine</label>
                      <input
                        type="text"
                        value={specs.processor.neuralEngine}
                        onChange={(e) => setSpecs({ ...specs, processor: { ...specs.processor, neuralEngine: e.target.value } })}
                        className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Camera Specs */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Camera System
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Primary Lens</label>
                      <input
                        type="text"
                        value={specs.camera.main}
                        onChange={(e) => setSpecs({ ...specs, camera: { ...specs.camera, main: e.target.value } })}
                        className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Ultra-Wide Lens</label>
                      <input
                        type="text"
                        value={specs.camera.ultrawide}
                        onChange={(e) => setSpecs({ ...specs, camera: { ...specs.camera, ultrawide: e.target.value } })}
                        className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Telephoto / Zoom</label>
                      <input
                        type="text"
                        value={specs.camera.telephoto}
                        onChange={(e) => setSpecs({ ...specs, camera: { ...specs.camera, telephoto: e.target.value } })}
                        className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Battery & Charging */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Battery & Charging
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Battery Capacity</label>
                      <input
                        type="text"
                        value={specs.battery.capacity}
                        onChange={(e) => setSpecs({ ...specs, battery: { ...specs.battery, capacity: e.target.value } })}
                        className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Wired HyperCharge</label>
                      <input
                        type="text"
                        value={specs.battery.wiredCharging}
                        onChange={(e) => setSpecs({ ...specs, battery: { ...specs.battery, wiredCharging: e.target.value } })}
                        className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Wireless Charging</label>
                      <input
                        type="text"
                        value={specs.battery.wirelessCharging}
                        onChange={(e) => setSpecs({ ...specs, battery: { ...specs.battery, wirelessCharging: e.target.value } })}
                        className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Manage 3D Model */}
            {activeTab === "model3d" && (
              <div className="space-y-5">
                {/* 3D Asset Configuration */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                        3D Digital Twin Settings
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Enable interactive 360° product view on customer storefront & admin inspection
                      </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-200">
                      <input
                        type="checkbox"
                        checked={model3D.enabled}
                        onChange={(e) => setModel3D({ ...model3D, enabled: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-950 text-indigo-600 h-4 w-4"
                      />
                      <span>3D Asset Enabled</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Model Asset URL</label>
                      <input
                        type="text"
                        value={model3D.modelUrl}
                        onChange={(e) => setModel3D({ ...model3D, modelUrl: e.target.value })}
                        className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">File Format</label>
                      <div className="relative">
                        <select
                          value={model3D.fileFormat}
                          onChange={(e) =>
                            setModel3D({
                              ...model3D,
                              fileFormat: e.target.value as Model3DAsset["fileFormat"],
                            })
                          }
                          className="w-full appearance-none rounded border border-slate-800 bg-slate-950 py-2 pl-2.5 pr-7 text-xs text-white transition-colors hover:border-slate-700 hover:text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                        >
                          <option value="glb">GLB (Binary glTF - Recommended)</option>
                          <option value="gltf">glTF 2.0 JSON</option>
                          <option value="usdz">USDZ (Apple QuickLook AR)</option>
                          <option value="obj">Wavefront OBJ</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Polygon Count</label>
                      <input
                        type="number"
                        value={model3D.polygonCount}
                        onChange={(e) =>
                          setModel3D({ ...model3D, polygonCount: parseInt(e.target.value) || 0 })
                        }
                        className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-2 text-xs text-slate-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={model3D.autoRotate}
                        onChange={(e) => setModel3D({ ...model3D, autoRotate: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-950 text-indigo-600"
                      />
                      <span>Auto-Rotate by Default</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={model3D.wireframeSupported}
                        onChange={(e) => setModel3D({ ...model3D, wireframeSupported: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-950 text-indigo-600"
                      />
                      <span>Allow Wireframe Inspection</span>
                    </label>
                  </div>
                </div>

                {/* Real-Time Interactive 3D Preview Box */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Live 3D Geometry Preview
                  </h4>
                  <Phone3DViewer
                    model3D={model3D}
                    colors={colors}
                    activeColor={model3D.defaultColor}
                    onColorChange={(hex) => setModel3D({ ...model3D, defaultColor: hex })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Pinned Footer */}
          <div className="flex shrink-0 items-center justify-between gap-3 p-4 sm:px-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== "general" && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: TabKey[] = ["general", "pricing", "variants", "specs", "model3d"];
                    const currentIndex = tabs.indexOf(activeTab);
                    const prevTab = currentIndex > 0 ? tabs[currentIndex - 1] : undefined;
                    if (prevTab) setActiveTab(prevTab);
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  &larr; Previous Tab
                </button>
              )}

              {activeTab !== "model3d" ? (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: TabKey[] = ["general", "pricing", "variants", "specs", "model3d"];
                    const currentIndex = tabs.indexOf(activeTab);
                    const nextTab = currentIndex < tabs.length - 1 ? tabs[currentIndex + 1] : undefined;
                    if (nextTab) setActiveTab(nextTab);
                  }}
                  className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-medium text-white hover:bg-slate-700 transition-colors"
                >
                  Next Tab &rarr;
                </button>
              ) : null}

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/25 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Saving Product...</span>
                  </>
                ) : (
                  <span>{mode === "add" ? "Publish Phone Model" : "Save Changes"}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
}
