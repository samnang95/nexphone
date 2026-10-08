"use client";

import { useEffect, useState, useMemo } from "react";
import type {
  Promotion,
  PromotionType,
  PromotionStatus,
  PromotionSummaryMetrics,
  CreatePromotionPayload,
} from "@/types/promotion";
import { PromotionService } from "@/services/promotion.service";
import { PromotionKPIs } from "@/components/promotions/PromotionKPIs";
import { PromotionTable } from "@/components/promotions/PromotionTable";
import { CreatePromotionModal } from "@/components/promotions/CreatePromotionModal";
import { EditPromotionModal } from "@/components/promotions/EditPromotionModal";
import { DeletePromotionModal } from "@/components/promotions/DeletePromotionModal";
import { PromotionDetailModal } from "@/components/promotions/PromotionDetailModal";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [metrics, setMetrics] = useState<PromotionSummaryMetrics>({
    totalPromotions: 0,
    activePromotions: 0,
    scheduledCampaigns: 0,
    expiredPromotions: 0,
    totalRedemptions: 0,
    totalDiscountGiven: 0,
    totalRevenueGenerated: 0,
    activePromoCodesCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<PromotionType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PromotionStatus | "all">("all");
  const [sortBy, setSortBy] = useState<
    "highest_discount" | "most_used" | "recent" | "ending_soon" | "revenue_desc"
  >("recent");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [deletingPromotion, setDeletingPromotion] = useState<Promotion | null>(null);
  const [inspectingPromotion, setInspectingPromotion] = useState<Promotion | null>(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [promos, mets] = await Promise.all([
        PromotionService.getPromotions(),
        PromotionService.getMetrics(),
      ]);
      setPromotions(promos);
      setMetrics(mets);
    } catch (err) {
      console.error("Failed to load promotion data:", err);
      showToast("Unable to load latest data from server. Using local cache.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    async function init() {
      try {
        const [promos, mets] = await Promise.all([
          PromotionService.getPromotions(),
          PromotionService.getMetrics(),
        ]);
        if (isSubscribed) {
          setPromotions(promos);
          setMetrics(mets);
        }
      } catch (err) {
        console.error("Failed to init promotions:", err);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }
    init();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Filtered & sorted promotions via useMemo
  const filteredPromotions = useMemo(() => {
    let result = [...promotions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.code && p.code.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q) ||
          (p.campaignTag && p.campaignTag.toLowerCase().includes(q)) ||
          (p.targetItems && p.targetItems.some((item) => item.toLowerCase().includes(q)))
      );
    }

    if (typeFilter !== "all") {
      result = result.filter((p) => p.type === typeFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (sortBy === "highest_discount") {
      result.sort((a, b) => b.discountValue - a.discountValue);
    } else if (sortBy === "most_used") {
      result.sort((a, b) => b.usedCount - a.usedCount);
    } else if (sortBy === "revenue_desc") {
      result.sort((a, b) => b.revenueGenerated - a.revenueGenerated);
    } else if (sortBy === "ending_soon") {
      result.sort((a, b) => {
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      });
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [promotions, searchQuery, typeFilter, statusFilter, sortBy]);

  // Handle Create Promotion
  const handleCreate = async (payload: CreatePromotionPayload) => {
    try {
      setIsActionSubmitting(true);
      const created = await PromotionService.createPromotion(payload);
      showToast(
        created.code
          ? `Promo code ${created.code} successfully created and active in checkout!`
          : `Campaign "${created.title}" successfully launched!`
      );
      await loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
        throw err;
      }
      showToast("Failed to create promotion.", "error");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Handle Edit Promotion
  const handleEdit = async (id: string, updates: Partial<CreatePromotionPayload>) => {
    try {
      setIsActionSubmitting(true);
      const updated = await PromotionService.updatePromotion(id, updates);
      showToast(`Promotion "${updated.title}" successfully updated!`);
      await loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
        throw err;
      }
      showToast("Failed to update promotion.", "error");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Handle Delete Promotion
  const handleDelete = async (id: string) => {
    try {
      setIsActionSubmitting(true);
      const target = promotions.find((p) => p.id === id);
      await PromotionService.deletePromotion(id);
      showToast(
        target?.code
          ? `Promo code ${target.code} removed from checkout.`
          : `Promotion removed successfully.`
      );
      await loadData();
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Failed to delete promotion.", "error");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Handle Toggle Status (Active <-> Disabled)
  const handleToggleStatus = async (promotion: Promotion) => {
    const newStatus: PromotionStatus = promotion.status === "active" ? "disabled" : "active";
    try {
      await PromotionService.toggleStatus(promotion.id, newStatus);
      showToast(
        newStatus === "active"
          ? `Promotion "${promotion.title}" is now active!`
          : `Promotion "${promotion.title}" has been paused.`
      );
      await loadData();
    } catch (err) {
      console.error("Toggle status failed:", err);
      showToast("Failed to update promotion status.", "error");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
    setSortBy("recent");
  };

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom duration-200 ${
            toastMessage.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/90 text-emerald-200"
              : toastMessage.type === "error"
              ? "border-rose-500/40 bg-rose-950/90 text-rose-200"
              : "border-indigo-500/40 bg-indigo-950/90 text-indigo-200"
          }`}
        >
          {toastMessage.type === "success" && (
            <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          )}
          {toastMessage.type === "error" && (
            <svg className="h-4 w-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          )}
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Promotion Management
            </h1>
            <span className="rounded-full bg-indigo-600/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-500/30">
              {metrics.totalPromotions} Discounts
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Create discount incentives, issue coupon codes, schedule sale campaigns, and track conversion GMV.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Create Discount</span>
          </button>
        </div>
      </div>

      {/* KPIs Summary Cards */}
      <PromotionKPIs
        metrics={metrics}
        activeCampaigns={promotions}
        onSelectCampaign={(c) => setInspectingPromotion(c)}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      {/* Promotions Table */}
      <PromotionTable
        promotions={filteredPromotions}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onViewDetails={(promo) => setInspectingPromotion(promo)}
        onEditPromotion={(promo) => setEditingPromotion(promo)}
        onDeletePromotion={(promo) => setDeletingPromotion(promo)}
        onToggleStatus={handleToggleStatus}
        onCreateClick={() => setIsCreateOpen(true)}
        onResetFilters={handleResetFilters}
      />

      {/* Modals */}
      <CreatePromotionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isActionSubmitting}
      />

      <EditPromotionModal
        promotion={editingPromotion}
        isOpen={Boolean(editingPromotion)}
        onClose={() => setEditingPromotion(null)}
        onSave={handleEdit}
        isSubmitting={isActionSubmitting}
      />

      <DeletePromotionModal
        promotion={deletingPromotion}
        isOpen={Boolean(deletingPromotion)}
        onClose={() => setDeletingPromotion(null)}
        onConfirm={handleDelete}
        isSubmitting={isActionSubmitting}
      />

      <PromotionDetailModal
        promotion={inspectingPromotion}
        isOpen={Boolean(inspectingPromotion)}
        onClose={() => setInspectingPromotion(null)}
        onEdit={(promo) => {
          setInspectingPromotion(null);
          setEditingPromotion(promo);
        }}
        onDelete={(promo) => {
          setInspectingPromotion(null);
          setDeletingPromotion(promo);
        }}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
