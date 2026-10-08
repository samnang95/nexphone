"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { Brand, BrandFormData, BrandStatus, BrandTier } from "@/types/brand";
import { cn } from "@/utils/cn";

interface BrandFormModalProps {
  readonly isOpen: boolean;
  readonly mode: "add" | "edit";
  readonly initialBrand?: Brand | null;
  readonly isSaving?: boolean;
  readonly onClose: () => void;
  readonly onSave: (brandData: BrandFormData) => void;
}

type BrandIconType = "sparkles" | "shield" | "zap" | "cpu" | "gem" | "globe" | "layers";

const PRESET_COLORS = [
  { name: "Indigo", hex: "#6366f1" },
  { name: "Cyan", hex: "#0ea5e9" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Purple", hex: "#8b5cf6" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Rose", hex: "#ec4899" },
  { name: "Slate", hex: "#64748b" },
];

const PRESET_ICONS: { id: BrandIconType; label: string }[] = [
  { id: "sparkles", label: "Sparkles (Innovation)" },
  { id: "shield", label: "Shield (Security/Rugged)" },
  { id: "zap", label: "Zap (Speed/Performance)" },
  { id: "cpu", label: "CPU (Hardware/Compute)" },
  { id: "gem", label: "Gem (Luxury/Flagship)" },
  { id: "globe", label: "Globe (Global/Telecom)" },
  { id: "layers", label: "Layers (Ecosystem)" },
];

function BrandIconRenderer({ icon, className }: { icon?: string; className?: string }) {
  switch (icon) {
    case "sparkles":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
        </svg>
      );
    case "shield":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      );
    case "zap":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
        </svg>
      );
    case "cpu":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
        </svg>
      );
    case "gem":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      );
    case "globe":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871a3.375 3.375 0 0 0-3.375-3.375h-.379a3.375 3.375 0 0 0-3.375 3.375h-.871c-.622 0-1.125.504-1.125 1.125V18.75m10.5 0h-9" />
        </svg>
      );
  }
}

export function BrandFormModal({
  isOpen,
  mode,
  initialBrand,
  isSaving = false,
  onClose,
  onSave,
}: BrandFormModalProps) {
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

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <BrandFormDialogContent
      mode={mode}
      initialBrand={initialBrand}
      isSaving={isSaving}
      onClose={onClose}
      onSave={onSave}
    />,
    document.body
  );
}

function BrandFormDialogContent({
  mode,
  initialBrand,
  isSaving,
  onClose,
  onSave,
}: {
  mode: "add" | "edit";
  initialBrand?: Brand | null;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (brandData: BrandFormData) => void;
}) {
  const [activeTab, setActiveTab] = useState<"identity" | "company" | "about">("identity");

  // Form State
  const [name, setName] = useState(initialBrand?.name ?? "");
  const [code, setCode] = useState(initialBrand?.code ?? "");
  const [slug, setSlug] = useState(initialBrand?.slug ?? "");
  const [tier, setTier] = useState<BrandTier>(initialBrand?.tier ?? "Flagship");
  const [status, setStatus] = useState<BrandStatus>(initialBrand?.status ?? "active");
  const [accentColor, setAccentColor] = useState(initialBrand?.accentColor ?? "#6366f1");
  const [logoIcon, setLogoIcon] = useState<BrandIconType>(initialBrand?.logoIcon ?? "sparkles");
  const [country, setCountry] = useState(initialBrand?.country ?? "");
  const [headquarters, setHeadquarters] = useState(initialBrand?.headquarters ?? "");
  const [foundedYear, setFoundedYear] = useState<number>(initialBrand?.foundedYear ?? new Date().getFullYear());
  const [website, setWebsite] = useState(initialBrand?.website ?? "");
  const [supportEmail, setSupportEmail] = useState(initialBrand?.supportEmail ?? "");
  const [marketShare, setMarketShare] = useState(initialBrand?.marketShare ?? "5.0%");
  const [isFeatured, setIsFeatured] = useState<boolean>(initialBrand?.isFeatured ?? false);
  const [description, setDescription] = useState(initialBrand?.description ?? "");

  // Auto-generate code & slug when typing name in Add mode
  const handleNameChange = (val: string) => {
    setName(val);
    if (mode === "add") {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);

      // Simple uppercase acronym suggestion if code is empty or untouched
      if (!code || code.length <= 4) {
        const words = val.trim().split(/\s+/);
        let acronym = "";
        if (words.length > 1) {
          acronym = words.map((w) => w[0]).join("").toUpperCase().slice(0, 4);
        } else if (val.length >= 2) {
          acronym = val.slice(0, 3).toUpperCase();
        }
        if (acronym) setCode(acronym);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please provide a Brand Name.");
      return;
    }
    if (!code.trim()) {
      alert("Please provide a Brand Code.");
      return;
    }

    onSave({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      tier,
      status,
      accentColor,
      logoIcon,
      country: country.trim() || "Global",
      headquarters: headquarters.trim() || "Headquarters",
      foundedYear: Number(foundedYear) || 2024,
      website: website.trim() || "https://nexphone.io",
      supportEmail: supportEmail.trim() || "contact@nexphone.io",
      marketShare: marketShare.trim() || "0.0%",
      isFeatured,
      description: description.trim() || "Hardware ecosystem partner specializing in telecom devices.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark backdrop with click-to-close */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Gradient Accent Bar */}
        <div
          className="h-1.5 w-full transition-colors duration-300"
          style={{ backgroundColor: accentColor }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl border font-bold text-sm shadow"
              style={{
                backgroundColor: `${accentColor}20`,
                borderColor: `${accentColor}50`,
                color: accentColor,
              }}
            >
              <BrandIconRenderer icon={logoIcon} className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {mode === "add" ? "Register New Brand" : `Edit Brand: ${initialBrand?.name}`}
              </h2>
              <p className="text-xs text-slate-400">
                Configure brand identity, partner tier, headquarters, and hardware fleet metadata.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6">
          <button
            type="button"
            onClick={() => setActiveTab("identity")}
            className={cn(
              "border-b-2 py-3 px-4 text-xs font-semibold transition-colors",
              activeTab === "identity"
                ? "border-indigo-500 text-indigo-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            1. Identity & Style
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("company")}
            className={cn(
              "border-b-2 py-3 px-4 text-xs font-semibold transition-colors",
              activeTab === "company"
                ? "border-indigo-500 text-indigo-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            2. Company & Market
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={cn(
              "border-b-2 py-3 px-4 text-xs font-semibold transition-colors",
              activeTab === "about"
                ? "border-indigo-500 text-indigo-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            3. Bio & Description
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[65vh] overflow-y-auto space-y-5">
            {/* Tab 1: Identity & Style */}
            {activeTab === "identity" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Brand Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Brand Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Titanium Dynamics, Aero Tech, Quantum Devices"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Brand Code */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Brand Code (2-5 Chars) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. TTN, NX, AERO"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="w-full font-mono font-bold uppercase rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. titanium-dynamics"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase())}
                      className="w-full font-mono rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-300 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Operational Status
                    </label>
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as BrandStatus)}
                        className="w-full appearance-none rounded-lg border border-slate-800 bg-slate-950 pl-3 pr-8 py-2 text-sm text-white transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="active">Active (Production Ready)</option>
                        <option value="pending">Pending Review (Onboarding)</option>
                        <option value="inactive">Inactive (Decommissioned)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Tier Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Partner Tier
                    </label>
                    <div className="relative">
                      <select
                        value={tier}
                        onChange={(e) => setTier(e.target.value as BrandTier)}
                        className="w-full appearance-none rounded-lg border border-slate-800 bg-slate-950 pl-3 pr-8 py-2 text-sm text-white transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="Flagship">Flagship Tier</option>
                        <option value="Enterprise">Enterprise Partner</option>
                        <option value="OEM Partner">OEM Hardware Partner</option>
                        <option value="Strategic">Strategic Alliance</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Identity: Color & Icon */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Visual Brand Identity
                  </h4>

                  {/* Accent Color Swatches */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Accent Color Theme</label>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setAccentColor(c.hex)}
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-transform",
                            accentColor === c.hex ? "scale-110 border-white shadow-lg" : "border-transparent opacity-80 hover:opacity-100"
                          )}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {accentColor === c.hex && (
                            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          )}
                        </button>
                      ))}

                      {/* Custom Color Input */}
                      <div className="flex items-center gap-2 ml-2">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="h-7 w-7 cursor-pointer rounded border border-slate-700 bg-transparent"
                        />
                        <span className="font-mono text-xs text-slate-400 uppercase">{accentColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Brand Symbol Icon</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_ICONS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setLogoIcon(item.id)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all text-left",
                            logoIcon === item.id
                              ? "border-indigo-500 bg-indigo-500/10 text-white font-semibold"
                              : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          )}
                        >
                          <BrandIconRenderer icon={item.id} className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label.split(" ")[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Badge Preview */}
                  <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/90 p-3 mt-3">
                    <span className="text-xs text-slate-400">Live Preview:</span>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg border font-bold text-xs"
                        style={{
                          backgroundColor: `${accentColor}20`,
                          borderColor: `${accentColor}50`,
                          color: accentColor,
                        }}
                      >
                        <BrandIconRenderer icon={logoIcon} className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{name || "Brand Name"}</span>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {code || "CODE"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Company & Market */}
            {activeTab === "company" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Country */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Country of Origin
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. United States, Germany, Japan"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Headquarters City */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Headquarters City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. San Francisco, Munich, Tokyo"
                      value={headquarters}
                      onChange={(e) => setHeadquarters(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Founded Year */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Founded Year
                    </label>
                    <input
                      type="number"
                      min={1950}
                      max={2030}
                      value={foundedYear}
                      onChange={(e) => setFoundedYear(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Market Share */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Estimated Market Share
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 25.4%"
                      value={marketShare}
                      onChange={(e) => setMarketShare(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Official Website */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Official Website
                    </label>
                    <input
                      type="url"
                      placeholder="https://brand.domain"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Technical Support Email */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Support / Partner Email
                    </label>
                    <input
                      type="email"
                      placeholder="support@brand.domain"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Featured Partner Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Featured Partner Badge</span>
                    <p className="text-[11px] text-slate-400">
                      Highlight this brand in the partner showcase banner and customer devices catalog.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Tab 3: Bio & Description */}
            {activeTab === "about" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Brand Overview & Bio
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Provide a detailed summary of this hardware partner, manufacturing specializations, certifications, and communication protocols..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3.5 text-xs leading-relaxed text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    This bio appears in the brand profile modal and device documentation.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/90 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">
                {activeTab === "identity" && "Step 1 of 3"}
                {activeTab === "company" && "Step 2 of 3"}
                {activeTab === "about" && "Step 3 of 3"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-lg border border-slate-700/60 bg-slate-800/60 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </button>

              {activeTab !== "about" ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "identity") setActiveTab("company");
                    else if (activeTab === "company") setActiveTab("about");
                  }}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                >
                  Continue &rarr;
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-500 shadow-md shadow-indigo-600/30 disabled:opacity-60"
                >
                  {isSaving && (
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  <span>{mode === "add" ? "Register Brand" : "Save Changes"}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
