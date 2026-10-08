"use client";

import { useState } from "react";
import type {
  Promotion,
  DiscountType,
  DiscountScope,
  PromotionStatus,
  CampaignTheme,
  CreatePromotionPayload,
} from "@/types/promotion";

interface EditPromotionModalProps {
  readonly promotion: Promotion | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: (id: string, updates: Partial<CreatePromotionPayload>) => Promise<void>;
  readonly isSubmitting: boolean;
}

export function EditPromotionModal({
  promotion,
  isOpen,
  onClose,
  onSave,
  isSubmitting,
}: EditPromotionModalProps) {
  if (!isOpen || !promotion) return null;

  return (
    <EditPromotionForm
      promotion={promotion}
      onClose={onClose}
      onSave={onSave}
      isSubmitting={isSubmitting}
    />
  );
}

function EditPromotionForm({
  promotion,
  onClose,
  onSave,
  isSubmitting,
}: {
  readonly promotion: Promotion;
  readonly onClose: () => void;
  readonly onSave: (id: string, updates: Partial<CreatePromotionPayload>) => Promise<void>;
  readonly isSubmitting: boolean;
}) {
  const [title, setTitle] = useState(promotion.title);
  const [code, setCode] = useState(promotion.code || "");
  const [description, setDescription] = useState(promotion.description);
  const [discountType, setDiscountType] = useState<DiscountType>(promotion.discountType);
  const [discountValue, setDiscountValue] = useState<number>(promotion.discountValue);
  const [minOrderValue, setMinOrderValue] = useState<string>(
    promotion.minOrderValue !== undefined ? String(promotion.minOrderValue) : ""
  );
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>(
    promotion.maxDiscountAmount !== undefined ? String(promotion.maxDiscountAmount) : ""
  );
  const [scope, setScope] = useState<DiscountScope>(promotion.scope);
  const [status, setStatus] = useState<PromotionStatus>(promotion.status);
  const [usageLimit, setUsageLimit] = useState<string>(
    promotion.usageLimit !== null && promotion.usageLimit !== undefined
      ? String(promotion.usageLimit)
      : ""
  );
  const [customerLimit, setCustomerLimit] = useState<number>(promotion.customerLimit || 1);
  const [campaignTag, setCampaignTag] = useState(promotion.campaignTag || "");
  const [bannerColor, setBannerColor] = useState<CampaignTheme>(promotion.bannerColor || "indigo");

  const [startDate, setStartDate] = useState(
    promotion.startDate ? promotion.startDate.split("T")[0]! : ""
  );
  const [hasEndDate, setHasEndDate] = useState(Boolean(promotion.endDate));
  const [endDate, setEndDate] = useState(
    promotion.endDate ? promotion.endDate.split("T")[0]! : ""
  );
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Title cannot be empty.");
      return;
    }

    if (promotion.type === "promo_code" && !code.trim()) {
      setFormError("Promo code is required.");
      return;
    }

    try {
      await onSave(promotion.id, {
        title: title.trim(),
        code: promotion.type === "promo_code" ? code.trim().toUpperCase() : undefined,
        description: description.trim(),
        discountType,
        discountValue: discountType === "free_shipping" ? 0 : Number(discountValue),
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        maxDiscountAmount: maxDiscountAmount && discountType === "percentage" ? Number(maxDiscountAmount) : undefined,
        scope,
        status,
        startDate: startDate ? new Date(startDate).toISOString() : promotion.startDate,
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
        setFormError("Failed to update promotion.");
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
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Edit Promotion</h2>
              <p className="text-xs text-slate-400">
                Update parameters for &ldquo;{promotion.title}&rdquo;
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
          {/* Title & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PromotionStatus)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="disabled">Disabled (Paused)</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Code (if applicable) & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {promotion.type === "promo_code" ? (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Promo Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full uppercase font-mono font-bold tracking-wider rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-indigo-300 focus:border-indigo-500 focus:outline-none"
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
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}

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
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none resize-none"
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
                  {discountType === "percentage" ? "Value (%)" : "Amount ($)"}
                </label>
                <input
                  type="number"
                  min={1}
                  max={discountType === "percentage" ? 100 : 10000}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white font-semibold focus:border-indigo-500 focus:outline-none"
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
                placeholder="0 = none"
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

            {promotion.type === "sale_campaign" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Theme Palette
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

          {/* Usage Limit & Customer Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Usage Limit (Current: {promotion.usedCount} used)
              </label>
              <input
                type="number"
                min={promotion.usedCount}
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
