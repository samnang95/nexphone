"use client";

import { useState } from "react";
import type {
  CreatePromotionPayload,
  PromotionType,
  DiscountType,
  DiscountScope,
  CampaignTheme,
} from "@/types/promotion";

interface CreatePromotionModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (payload: CreatePromotionPayload) => Promise<void>;
  readonly isSubmitting: boolean;
}

export function CreatePromotionModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: CreatePromotionModalProps) {
  const [promoType, setPromoType] = useState<PromotionType>("promo_code");
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minOrderValue, setMinOrderValue] = useState<string>("500");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>("300");
  const [scope, setScope] = useState<DiscountScope>("all_products");
  const [campaignTag, setCampaignTag] = useState("Flash Sale");
  const [bannerColor, setBannerColor] = useState<CampaignTheme>("indigo");
  const [usageLimit, setUsageLimit] = useState<string>("500");
  const [customerLimit, setCustomerLimit] = useState<number>(1);
  const [hasEndDate, setHasEndDate] = useState(true);

  // Default dates
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]!);
  const [endDate, setEndDate] = useState(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "NEX-";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Please enter a title for the promotion.");
      return;
    }

    if (promoType === "promo_code" && !code.trim()) {
      setFormError("Please enter or generate a coupon code.");
      return;
    }

    if (discountType !== "free_shipping" && (!discountValue || discountValue <= 0)) {
      setFormError("Please provide a valid discount value greater than 0.");
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        code: promoType === "promo_code" ? code.trim().toUpperCase() : undefined,
        description: description.trim() || `${title} promotional discount`,
        type: promoType,
        discountType,
        discountValue: discountType === "free_shipping" ? 0 : Number(discountValue),
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        maxDiscountAmount: maxDiscountAmount && discountType === "percentage" ? Number(maxDiscountAmount) : undefined,
        scope,
        targetItems: scope === "all_products" ? ["All Catalog Products"] : ["Selected Commercial Fleet"],
        status: new Date(startDate).getTime() > Date.now() ? "scheduled" : "active",
        startDate: new Date(startDate).toISOString(),
        endDate: hasEndDate && endDate ? new Date(endDate).toISOString() : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        customerLimit,
        campaignTag: campaignTag.trim() || undefined,
        bannerColor,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Failed to create promotion. Please verify the input values.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Promotion</h2>
              <p className="text-xs text-slate-400">
                Launch a coupon code, sitewide sale campaign, or checkout auto-discount
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Promotion Type Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Promotion Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPromoType("promo_code")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  promoType === "promo_code"
                    ? "border-indigo-500 bg-indigo-600/20 text-white font-semibold ring-1 ring-indigo-500/40"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="text-base mb-1">🏷</span>
                <span>Promo Code</span>
                <span className="text-[10px] text-slate-500">Customer enters code</span>
              </button>
              <button
                type="button"
                onClick={() => setPromoType("sale_campaign")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  promoType === "sale_campaign"
                    ? "border-indigo-500 bg-indigo-600/20 text-white font-semibold ring-1 ring-indigo-500/40"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="text-base mb-1">⚡</span>
                <span>Sale Campaign</span>
                <span className="text-[10px] text-slate-500">Sitewide event banner</span>
              </button>
              <button
                type="button"
                onClick={() => setPromoType("automatic")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  promoType === "automatic"
                    ? "border-indigo-500 bg-indigo-600/20 text-white font-semibold ring-1 ring-indigo-500/40"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="text-base mb-1">⚙</span>
                <span>Automatic</span>
                <span className="text-[10px] text-slate-500">Applies at checkout</span>
              </button>
            </div>
          </div>

          {/* Title & Code Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Promotion Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Spring Fleet Upgrade 2026"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {promoType === "promo_code" ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Promo Code *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    🎲 Random Code
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. NEXLAUNCH20"
                  className="w-full uppercase font-mono font-bold tracking-wider rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-indigo-300 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Campaign Tag / Event Name
                </label>
                <input
                  type="text"
                  value={campaignTag}
                  onChange={(e) => setCampaignTag(e.target.value)}
                  placeholder="e.g. Flash Sale, Black Friday"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description / Terms
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details about who qualifies and how the discount is calculated..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          {/* Discount Value Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_amount">Fixed Dollar ($)</option>
                <option value="free_shipping">Free Global Shipping</option>
              </select>
            </div>

            {discountType !== "free_shipping" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {discountType === "percentage" ? "Discount Percentage (%)" : "Discount Amount ($)"}
                </label>
                <input
                  type="number"
                  min={1}
                  max={discountType === "percentage" ? 100 : 10000}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none font-semibold"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Min Order Cart ($)
              </label>
              <input
                type="number"
                min={0}
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                placeholder="0 = no minimum"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {discountType === "percentage" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Max Discount Cap ($)
                </label>
                <input
                  type="number"
                  min={0}
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(e.target.value)}
                  placeholder="e.g. 400"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {promoType === "sale_campaign" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Banner Theme Color
                </label>
                <select
                  value={bannerColor}
                  onChange={(e) => setBannerColor(e.target.value as CampaignTheme)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="indigo">Indigo Fleet</option>
                  <option value="cyan">Cyan Modern</option>
                  <option value="emerald">Emerald VIP</option>
                  <option value="amber">Amber Flash</option>
                  <option value="rose">Rose Surge</option>
                  <option value="purple">Purple Executive</option>
                </select>
              </div>
            )}
          </div>

          {/* Scope and Limits Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Eligible Scope
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as DiscountScope)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="all_products">All Catalog Products</option>
                <option value="specific_products">Specific Flagship Hardware</option>
                <option value="specific_brands">Partner Brand Lines</option>
                <option value="min_order_value">High Volume Tiers Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Total Redemptions Limit
              </label>
              <input
                type="number"
                min={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Leave blank for unlimited"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Uses Per Customer
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={customerLimit}
                onChange={(e) => setCustomerLimit(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  End Date
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!hasEndDate}
                    onChange={(e) => setHasEndDate(!e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>No Expiry</span>
                </label>
              </div>
              <input
                type="date"
                disabled={!hasEndDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-40"
              />
            </div>
          </div>

          {/* Buttons Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Launch Promotion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
