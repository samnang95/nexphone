"use client";

import { useState } from "react";
import type { HomepageBanner, CreateBannerPayload, ContentStatus } from "@/types/content";

interface BannerModalProps {
  readonly isOpen: boolean;
  readonly initialBanner: HomepageBanner | null;
  readonly onClose: () => void;
  readonly onSubmit: (payload: CreateBannerPayload) => Promise<void>;
  readonly isSubmitting: boolean;
}

const SAMPLE_HERO_IMAGES = [
  {
    label: "Titanium Slate Pro",
    url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Cyber Enterprise Dark",
    url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Neon Cyber Tech",
    url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Foldable Glass Studio",
    url: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
  },
];

export function BannerModal({
  isOpen,
  initialBanner,
  onClose,
  onSubmit,
  isSubmitting,
}: BannerModalProps) {
  if (!isOpen) return null;

  return (
    <BannerModalForm
      key={initialBanner?.id ?? "new_banner"}
      initialBanner={initialBanner}
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

function BannerModalForm({
  initialBanner,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  readonly initialBanner: HomepageBanner | null;
  readonly onClose: () => void;
  readonly onSubmit: (payload: CreateBannerPayload) => Promise<void>;
  readonly isSubmitting: boolean;
}) {
  const isEditing = Boolean(initialBanner);

  const [title, setTitle] = useState(initialBanner?.title ?? "");
  const [subtitle, setSubtitle] = useState(initialBanner?.subtitle ?? "");
  const [badge, setBadge] = useState(initialBanner?.badge ?? "Flagship Premiere");
  const [primaryLabel, setPrimaryLabel] = useState(initialBanner?.primaryCta.label ?? "Configure & Order");
  const [primaryUrl, setPrimaryUrl] = useState(initialBanner?.primaryCta.url ?? "/products");
  const [hasSecondaryCta, setHasSecondaryCta] = useState(Boolean(initialBanner?.secondaryCta));
  const [secondaryLabel, setSecondaryLabel] = useState(initialBanner?.secondaryCta?.label ?? "Learn More");
  const [secondaryUrl, setSecondaryUrl] = useState(initialBanner?.secondaryCta?.url ?? "/products");
  const [imageUrl, setImageUrl] = useState(initialBanner?.imageUrl ?? SAMPLE_HERO_IMAGES[0]!.url);
  const [gradientOverlay, setGradientOverlay] = useState(
    initialBanner?.gradientOverlay || "from-indigo-950/95 via-slate-900/80 to-transparent"
  );
  const [alignment, setAlignment] = useState<"left" | "center" | "right">(initialBanner?.alignment ?? "left");
  const [status, setStatus] = useState<ContentStatus>(initialBanner?.status ?? "active");
  const [displayOrder, setDisplayOrder] = useState<number>(initialBanner?.displayOrder ?? 1);
  const [startDate, setStartDate] = useState(
    () => (initialBanner?.startDate ? initialBanner.startDate.split("T")[0]! : new Date().toISOString().split("T")[0]!)
  );
  const [endDate, setEndDate] = useState(
    () => (initialBanner?.endDate ? initialBanner.endDate.split("T")[0]! : "")
  );
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Banner title is required.");
      return;
    }
    if (!primaryLabel.trim() || !primaryUrl.trim()) {
      setFormError("Primary Call to Action label and URL are required.");
      return;
    }
    if (!imageUrl.trim()) {
      setFormError("Hero background image URL is required.");
      return;
    }

    try {
      const payload: CreateBannerPayload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        badge: badge.trim(),
        primaryCta: {
          label: primaryLabel.trim(),
          url: primaryUrl.trim(),
        },
        secondaryCta: hasSecondaryCta
          ? {
              label: secondaryLabel.trim(),
              url: secondaryUrl.trim(),
            }
          : undefined,
        imageUrl: imageUrl.trim(),
        gradientOverlay,
        alignment,
        displayOrder: Number(displayOrder) || 1,
        status,
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save banner");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {isEditing ? "Edit Homepage Hero Banner" : "Create New Hero Slide"}
            </h2>
            <p className="text-xs text-slate-400">
              Configure hero photography, headlines, call-to-actions, and sequencing.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {formError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {formError}
            </div>
          )}

          {/* Title & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Hero Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. NexPhone 15 Pro Max"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Badge Tag
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Flagship Premiere"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Subtitle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Subtitle & Marketing Copy
            </label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Titanium aerospace chassis with global satellite VoIP everywhere on Earth."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          {/* Image URL & Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Hero Background Image URL <span className="text-rose-400">*</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              required
            />
            <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
              <span className="text-[10px] text-slate-500 font-medium shrink-0">Sample Presets:</span>
              {SAMPLE_HERO_IMAGES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageUrl(sample.url)}
                  className="rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-1 text-[10px] font-medium text-slate-300 hover:border-indigo-500 hover:text-white shrink-0 transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Primary Button Label <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={primaryLabel}
                onChange={(e) => setPrimaryLabel(e.target.value)}
                placeholder="Configure & Order"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Primary Button Link <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={primaryUrl}
                onChange={(e) => setPrimaryUrl(e.target.value)}
                placeholder="/products/p1"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Secondary CTA Toggle */}
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Include Secondary Button</span>
              <button
                type="button"
                onClick={() => setHasSecondaryCta(!hasSecondaryCta)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  hasSecondaryCta ? "bg-indigo-600" : "bg-slate-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    hasSecondaryCta ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            {hasSecondaryCta && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Secondary Label</label>
                  <input
                    type="text"
                    value={secondaryLabel}
                    onChange={(e) => setSecondaryLabel(e.target.value)}
                    placeholder="Explore 3D Model"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Secondary Link</label>
                  <input
                    type="text"
                    value={secondaryUrl}
                    onChange={(e) => setSecondaryUrl(e.target.value)}
                    placeholder="/products"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Alignment, Order, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Text Alignment</label>
              <select
                value={alignment}
                onChange={(e) => setAlignment(e.target.value as "left" | "center" | "right")}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="left">Left Aligned</option>
                <option value="center">Centered</option>
                <option value="right">Right Aligned</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Display Order</label>
              <input
                type="number"
                min={1}
                max={50}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="active">Active (Visible)</option>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          {/* Scheduling Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Campaign Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">End Date (optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Gradient Overlay */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Gradient Overlay Theme</label>
            <select
              value={gradientOverlay}
              onChange={(e) => setGradientOverlay(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="from-indigo-950/95 via-slate-900/80 to-transparent">Deep Indigo Fade</option>
              <option value="from-purple-950/95 via-slate-900/80 to-transparent">Royal Purple Fade</option>
              <option value="from-cyan-950/95 via-slate-900/80 to-transparent">Cyber Cyan Fade</option>
              <option value="from-amber-950/95 via-slate-900/80 to-transparent">Sunset Amber Fade</option>
              <option value="from-slate-950/95 via-slate-900/80 to-transparent">Graphite Stealth Fade</option>
            </select>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/30"
            >
              {isSubmitting ? "Saving Slide..." : isEditing ? "Save Changes" : "Create Hero Slide"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
