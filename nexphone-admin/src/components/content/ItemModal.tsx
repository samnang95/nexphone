"use client";

import { useState } from "react";
import type {
  FeaturedPhone,
  NewArrival,
  BestSeller,
  PromotionalSection,
  CreateFeaturedPhonePayload,
  CreateNewArrivalPayload,
  CreateBestSellerPayload,
  CreatePromotionalSectionPayload,
} from "@/types/content";

type ContentTarget = "featured" | "new_arrivals" | "best_sellers" | "promo_sections";

interface ItemModalProps {
  readonly isOpen: boolean;
  readonly target: ContentTarget;
  readonly initialItem: (FeaturedPhone | NewArrival | BestSeller | PromotionalSection) | null;
  readonly onClose: () => void;
  readonly onSubmit: (
    payload:
      | CreateFeaturedPhonePayload
      | CreateNewArrivalPayload
      | CreateBestSellerPayload
      | CreatePromotionalSectionPayload
  ) => Promise<void>;
  readonly isSubmitting: boolean;
}

const SAMPLE_PHONE_PRESETS = [
  {
    productId: "p1",
    productName: "NexPhone 15 Pro Max",
    productSubtitle: "Aerospace Titanium with Satellite Edge",
    productPrice: 1299,
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
    series: "Pro Max Series",
  },
  {
    productId: "p2",
    productName: "NexPhone 15 Enterprise Edge",
    productSubtitle: "Corporate Zero-Touch Fleet Standard",
    productPrice: 1199,
    productImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    series: "Enterprise Series",
  },
  {
    productId: "p3",
    productName: "NexPhone 15 Studio",
    productSubtitle: "High-Bandwidth ProRes Telemetry Camera",
    productPrice: 999,
    productImage: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80",
    series: "Studio Series",
  },
  {
    productId: "p4",
    productName: "NexPhone Fold Ultra",
    productSubtitle: "Seamless Dual-OLED Multi-Window",
    productPrice: 1799,
    productImage: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80",
    series: "Fold Series",
  },
];

export function ItemModal({
  isOpen,
  target,
  initialItem,
  onClose,
  onSubmit,
  isSubmitting,
}: ItemModalProps) {
  if (!isOpen) return null;

  return (
    <ItemModalForm
      key={`${target}_${initialItem?.id ?? "new"}`}
      target={target}
      initialItem={initialItem}
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

function ItemModalForm({
  target,
  initialItem,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  readonly target: ContentTarget;
  readonly initialItem: (FeaturedPhone | NewArrival | BestSeller | PromotionalSection) | null;
  readonly onClose: () => void;
  readonly onSubmit: (
    payload:
      | CreateFeaturedPhonePayload
      | CreateNewArrivalPayload
      | CreateBestSellerPayload
      | CreatePromotionalSectionPayload
  ) => Promise<void>;
  readonly isSubmitting: boolean;
}) {
  const isEditing = Boolean(initialItem);

  const featuredInit = target === "featured" && initialItem ? (initialItem as FeaturedPhone) : null;
  const newArrivalInit = target === "new_arrivals" && initialItem ? (initialItem as NewArrival) : null;
  const bestSellerInit = target === "best_sellers" && initialItem ? (initialItem as BestSeller) : null;
  const promoSecInit = target === "promo_sections" && initialItem ? (initialItem as PromotionalSection) : null;

  // Common Phone Fields
  const [productId, setProductId] = useState(
    featuredInit?.productId ?? newArrivalInit?.productId ?? bestSellerInit?.productId ?? "p1"
  );
  const [productName, setProductName] = useState(
    featuredInit?.productName ??
      newArrivalInit?.productName ??
      bestSellerInit?.productName ??
      SAMPLE_PHONE_PRESETS[0]!.productName
  );
  const [productSubtitle, setProductSubtitle] = useState(
    featuredInit?.productSubtitle ??
      newArrivalInit?.productSubtitle ??
      bestSellerInit?.productSubtitle ??
      SAMPLE_PHONE_PRESETS[0]!.productSubtitle
  );
  const [productPrice, setProductPrice] = useState<number>(
    featuredInit?.productPrice ??
      newArrivalInit?.productPrice ??
      bestSellerInit?.productPrice ??
      SAMPLE_PHONE_PRESETS[0]!.productPrice
  );
  const [productImage, setProductImage] = useState(
    featuredInit?.productImage ??
      newArrivalInit?.productImage ??
      bestSellerInit?.productImage ??
      promoSecInit?.imageUrl ??
      SAMPLE_PHONE_PRESETS[0]!.productImage
  );
  const [series, setSeries] = useState(
    featuredInit?.series ??
      newArrivalInit?.series ??
      bestSellerInit?.series ??
      SAMPLE_PHONE_PRESETS[0]!.series
  );
  const [displayOrder, setDisplayOrder] = useState<number>(
    featuredInit?.displayOrder ??
      newArrivalInit?.displayOrder ??
      promoSecInit?.displayOrder ??
      1
  );
  const [status, setStatus] = useState<"active" | "hidden">(
    featuredInit?.status ??
      newArrivalInit?.status ??
      bestSellerInit?.status ??
      promoSecInit?.status ??
      "active"
  );

  // Featured Specific
  const [badge, setBadge] = useState(
    featuredInit?.badge ?? bestSellerInit?.badge ?? "Flagship Premiere"
  );
  const [headline, setHeadline] = useState(
    featuredInit?.headline ?? "The world's most advanced aerospace satellite smartphone."
  );
  const [rating, setRating] = useState<number>(featuredInit?.rating ?? 4.9);
  const [highlightSpecs, setHighlightSpecs] = useState(
    featuredInit?.highlightSpecs?.join(", ") ?? "A18 Bionic, Satellite VoIP, Titanium 5G"
  );

  // New Arrival Specific
  const [tag, setTag] = useState(newArrivalInit?.tag ?? "Just Dropped");
  const [isPreOrder, setIsPreOrder] = useState(newArrivalInit?.isPreOrder ?? false);
  const [initialStock, setInitialStock] = useState<number>(newArrivalInit?.initialStock ?? 250);

  // Best Seller Specific
  const [rank, setRank] = useState<number>(bestSellerInit?.rank ?? 1);
  const [unitsSold, setUnitsSold] = useState<number>(bestSellerInit?.unitsSold ?? 12500);
  const [satisfactionRate, setSatisfactionRate] = useState<number>(
    bestSellerInit?.satisfactionRate ?? 98.5
  );
  const [monthlyGrowth, setMonthlyGrowth] = useState<number>(
    bestSellerInit?.monthlyGrowth ?? 12
  );

  // Promotional Section Specific
  const [sectionKey, setSectionKey] = useState(promoSecInit?.sectionKey ?? "trade_in_bar");
  const [promoTitle, setPromoTitle] = useState(
    promoSecInit?.title ?? "Trade In & Upgrade to NexPhone"
  );
  const [promoSubtitle, setPromoSubtitle] = useState(
    promoSecInit?.subtitle ??
      "Receive up to $800 instant credit when exchanging any fleet device."
  );
  const [promoType, setPromoType] = useState<PromotionalSection["type"]>(
    promoSecInit?.type ?? "split_banner"
  );
  const [ctaLabel, setCtaLabel] = useState(promoSecInit?.ctaLabel ?? "Get Trade-In Estimate");
  const [ctaUrl, setCtaUrl] = useState(promoSecInit?.ctaUrl ?? "/promotions");
  const [accentColor, setAccentColor] = useState<PromotionalSection["accentColor"]>(
    promoSecInit?.accentColor ?? "indigo"
  );

  const [formError, setFormError] = useState<string | null>(null);

  const handleSelectPreset = (preset: (typeof SAMPLE_PHONE_PRESETS)[0]) => {
    setProductId(preset.productId);
    setProductName(preset.productName);
    setProductSubtitle(preset.productSubtitle);
    setProductPrice(preset.productPrice);
    setProductImage(preset.productImage);
    setSeries(preset.series);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (target === "featured") {
        if (!productName.trim()) throw new Error("Product name is required.");
        const specs = highlightSpecs
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const payload: CreateFeaturedPhonePayload = {
          productId,
          productName: productName.trim(),
          productSubtitle: productSubtitle.trim(),
          productPrice: Number(productPrice) || 0,
          productImage: productImage.trim(),
          series: series.trim(),
          badge: badge.trim(),
          headline: headline.trim(),
          rating: Number(rating) || 4.5,
          highlightSpecs: specs.length > 0 ? specs : ["Titanium Chassis", "Satellite VoIP"],
          displayOrder: Number(displayOrder) || 1,
          status,
        };
        await onSubmit(payload);
      } else if (target === "new_arrivals") {
        if (!productName.trim()) throw new Error("Product name is required.");
        const payload: CreateNewArrivalPayload = {
          productId,
          productName: productName.trim(),
          productSubtitle: productSubtitle.trim(),
          productPrice: Number(productPrice) || 0,
          productImage: productImage.trim(),
          series: series.trim(),
          tag: tag.trim(),
          isPreOrder,
          initialStock: Number(initialStock) || 100,
          displayOrder: Number(displayOrder) || 1,
          status,
        };
        await onSubmit(payload);
      } else if (target === "best_sellers") {
        if (!productName.trim()) throw new Error("Product name is required.");
        const payload: CreateBestSellerPayload = {
          productId,
          productName: productName.trim(),
          productSubtitle: productSubtitle.trim(),
          productPrice: Number(productPrice) || 0,
          productImage: productImage.trim(),
          series: series.trim(),
          rank: Number(rank) || 1,
          unitsSold: Number(unitsSold) || 0,
          badge: badge.trim(),
          satisfactionRate: Number(satisfactionRate) || 98.0,
          monthlyGrowth: Number(monthlyGrowth) || 0,
          status,
        };
        await onSubmit(payload);
      } else if (target === "promo_sections") {
        if (!promoTitle.trim()) throw new Error("Section title is required.");
        const payload: CreatePromotionalSectionPayload = {
          sectionKey: sectionKey.trim() || `sec_${Date.now()}`,
          title: promoTitle.trim(),
          subtitle: promoSubtitle.trim(),
          type: promoType,
          ctaLabel: ctaLabel.trim(),
          ctaUrl: ctaUrl.trim(),
          imageUrl: productImage.trim() || undefined,
          accentColor,
          displayOrder: Number(displayOrder) || 1,
          status,
        };
        await onSubmit(payload);
      }
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save item");
    }
  };

  const getModalTitle = () => {
    const action = isEditing ? "Edit" : "Add";
    switch (target) {
      case "featured":
        return `${action} Featured Phone Showcase`;
      case "new_arrivals":
        return `${action} New Arrival Drop`;
      case "best_sellers":
        return `${action} Best Seller Leaderboard Entry`;
      case "promo_sections":
        return `${action} Promotional Section`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">{getModalTitle()}</h2>
            <p className="text-xs text-slate-400">
              Configure parameters, visuals, and catalog placement.
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

          {/* Quick presets for phone items */}
          {target !== "promo_sections" && (
            <div className="space-y-1.5 rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Product Autofill Presets:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SAMPLE_PHONE_PRESETS.map((p) => (
                  <button
                    key={p.productId}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-indigo-500 hover:text-white transition-colors"
                  >
                    {p.productName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {target !== "promo_sections" ? (
            <>
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Product Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Series Line</label>
                  <input
                    type="text"
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Subtitle / Spec Descriptor
                  </label>
                  <input
                    type="text"
                    value={productSubtitle}
                    onChange={(e) => setProductSubtitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Base Price (USD)</label>
                  <input
                    type="number"
                    min={0}
                    value={productPrice}
                    onChange={(e) => setProductPrice(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Product High-Res Image URL
                </label>
                <input
                  type="url"
                  value={productImage}
                  onChange={(e) => setProductImage(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {/* Featured Specific */}
              {target === "featured" && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Badge Label</label>
                      <input
                        type="text"
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        placeholder="Flagship Premiere"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Rating (1 - 5)</label>
                      <input
                        type="number"
                        step="0.1"
                        min={1}
                        max={5}
                        value={rating}
                        onChange={(e) => setRating(parseFloat(e.target.value) || 4.5)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Headline</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="The pinnacle of mobile performance"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Highlight Specs (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={highlightSpecs}
                      onChange={(e) => setHighlightSpecs(e.target.value)}
                      placeholder="Titanium 5G, A18 Pro, 48MP Macro"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* New Arrival Specific */}
              {target === "new_arrivals" && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Release Tag</label>
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        placeholder="Just Dropped / Pre-Order"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Initial Stock</label>
                      <input
                        type="number"
                        min={0}
                        value={initialStock}
                        onChange={(e) => setInitialStock(parseInt(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isPreOrder"
                      checked={isPreOrder}
                      onChange={(e) => setIsPreOrder(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isPreOrder" className="text-xs text-slate-300 font-medium">
                      Mark as Pre-Order item
                    </label>
                  </div>
                </div>
              )}

              {/* Best Seller Specific */}
              {target === "best_sellers" && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Rank (#)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={rank}
                        onChange={(e) => setRank(parseInt(e.target.value) || 1)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Units Sold</label>
                      <input
                        type="number"
                        min={0}
                        value={unitsSold}
                        onChange={(e) => setUnitsSold(parseInt(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Badge</label>
                      <input
                        type="text"
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        placeholder="#1 Fleet Choice"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Satisfaction %</label>
                      <input
                        type="number"
                        step="0.1"
                        min={0}
                        max={100}
                        value={satisfactionRate}
                        onChange={(e) => setSatisfactionRate(parseFloat(e.target.value) || 98)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Monthly Growth %</label>
                      <input
                        type="number"
                        value={monthlyGrowth}
                        onChange={(e) => setMonthlyGrowth(parseInt(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Promotional Section Fields */
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Section Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    placeholder="Trade In & Upgrade"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Section Identifier Key</label>
                  <input
                    type="text"
                    value={sectionKey}
                    onChange={(e) => setSectionKey(e.target.value)}
                    placeholder="trade_in_bar"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Subtitle Copy</label>
                <textarea
                  rows={2}
                  value={promoSubtitle}
                  onChange={(e) => setPromoSubtitle(e.target.value)}
                  placeholder="Get up to $800 credit when trading in your device."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Block Layout Type</label>
                  <select
                    value={promoType}
                    onChange={(e) => setPromoType(e.target.value as PromotionalSection["type"])}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="split_banner">Split Banner with Image</option>
                    <option value="feature_grid">Feature Grid with Icons</option>
                    <option value="countdown_bar">Urgency Countdown Bar</option>
                    <option value="trust_badges">Trust & Security Badges</option>
                    <option value="callout_card">Centered Callout Card</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Accent Theme</label>
                  <select
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value as PromotionalSection["accentColor"])}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="indigo">Indigo Glow</option>
                    <option value="cyan">Cyan Modern</option>
                    <option value="emerald">Emerald Fresh</option>
                    <option value="amber">Amber Warm</option>
                    <option value="rose">Rose Bold</option>
                    <option value="purple">Purple Royal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">CTA Button Label</label>
                  <input
                    type="text"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    placeholder="Estimate Trade-In"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">CTA Button Link</label>
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="/promotions"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Side Artwork URL (optional)</label>
                <input
                  type="url"
                  value={productImage}
                  onChange={(e) => setProductImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Common Footer Controls: Order & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Display Order</label>
              <input
                type="number"
                min={1}
                max={50}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Visibility Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "hidden")}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="active">Active (Visible)</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
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
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add to Storefront"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
