"use client";

import { useEffect, useState, useCallback } from "react";
import type {
  HomepageBanner,
  FeaturedPhone,
  NewArrival,
  BestSeller,
  PromotionalSection,
  ContentSummaryMetrics,
  ContentTab,
  CreateBannerPayload,
  CreateFeaturedPhonePayload,
  CreateNewArrivalPayload,
  CreateBestSellerPayload,
  CreatePromotionalSectionPayload,
} from "@/types/content";
import { ContentService } from "@/services/content.service";
import { ContentKPIs } from "@/components/content/ContentKPIs";
import { HomepageBannersManager } from "@/components/content/HomepageBannersManager";
import { FeaturedPhonesManager } from "@/components/content/FeaturedPhonesManager";
import { NewArrivalsManager } from "@/components/content/NewArrivalsManager";
import { BestSellersManager } from "@/components/content/BestSellersManager";
import { PromotionalSectionsManager } from "@/components/content/PromotionalSectionsManager";
import { StorefrontLivePreview } from "@/components/content/StorefrontLivePreview";
import { BannerModal } from "@/components/content/BannerModal";
import { ItemModal } from "@/components/content/ItemModal";
import { DeleteContentModal } from "@/components/content/DeleteContentModal";

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<ContentTab>("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Content Data
  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [featuredPhones, setFeaturedPhones] = useState<FeaturedPhone[]>([]);
  const [newArrivals, setNewArrivals] = useState<NewArrival[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [promoSections, setPromoSections] = useState<PromotionalSection[]>([]);
  const [metrics, setMetrics] = useState<ContentSummaryMetrics>({
    activeBanners: 0,
    totalBanners: 0,
    featuredPhonesCount: 0,
    newArrivalsCount: 0,
    bestSellersCount: 0,
    activePromoSections: 0,
    totalBannerImpressions: 0,
    totalBannerClicks: 0,
    avgCtr: 0,
  });

  // Modal States
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HomepageBanner | null>(null);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalTarget, setItemModalTarget] = useState<
    "featured" | "new_arrivals" | "best_sellers" | "promo_sections"
  >("featured");
  const [editingItem, setEditingItem] = useState<
    (FeaturedPhone | NewArrival | BestSeller | PromotionalSection) | null
  >(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
    itemTypeLabel: string;
    collection: "banners" | "featured" | "new_arrivals" | "best_sellers" | "promo_sections";
  } | null>(null);

  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = useCallback((text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const [b, f, n, bs, p, m] = await Promise.all([
        ContentService.getBanners(),
        ContentService.getFeaturedPhones(),
        ContentService.getNewArrivals(),
        ContentService.getBestSellers(),
        ContentService.getPromoSections(),
        ContentService.getMetrics(),
      ]);
      setBanners(b);
      setFeaturedPhones(f);
      setNewArrivals(n);
      setBestSellers(bs);
      setPromoSections(p);
      setMetrics(m);
    } catch (err) {
      console.error("Failed to load content data:", err);
      showToast("Unable to load latest content data. Using offline fallback.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let isSubscribed = true;
    async function init() {
      try {
        const [b, f, n, bs, p, m] = await Promise.all([
          ContentService.getBanners(),
          ContentService.getFeaturedPhones(),
          ContentService.getNewArrivals(),
          ContentService.getBestSellers(),
          ContentService.getPromoSections(),
          ContentService.getMetrics(),
        ]);
        if (isSubscribed) {
          setBanners(b);
          setFeaturedPhones(f);
          setNewArrivals(n);
          setBestSellers(bs);
          setPromoSections(p);
          setMetrics(m);
        }
      } catch (err) {
        console.error("Failed initial content fetch:", err);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }
    init();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // --- Banner Actions ---
  const handleOpenNewBanner = () => {
    setEditingBanner(null);
    setIsBannerModalOpen(true);
  };

  const handleEditBanner = (banner: HomepageBanner) => {
    setEditingBanner(banner);
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async (payload: CreateBannerPayload) => {
    setIsActionSubmitting(true);
    try {
      if (editingBanner) {
        await ContentService.updateBanner(editingBanner.id, payload);
        showToast("Homepage banner updated successfully.");
      } else {
        await ContentService.createBanner(payload);
        showToast("New homepage hero slide created.");
      }
      await refreshAll();
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleToggleBannerStatus = async (banner: HomepageBanner) => {
    try {
      const nextStatus = banner.status === "active" ? "hidden" : "active";
      await ContentService.updateBanner(banner.id, { status: nextStatus });
      showToast(`Banner is now ${nextStatus}.`);
      await refreshAll();
    } catch {
      showToast("Failed to toggle banner status.", "error");
    }
  };

  const handleMoveBannerOrder = async (banner: HomepageBanner, direction: "up" | "down") => {
    const currentOrder = banner.displayOrder;
    const newOrder = direction === "up" ? Math.max(1, currentOrder - 1) : currentOrder + 1;
    try {
      await ContentService.updateBanner(banner.id, { displayOrder: newOrder });
      showToast(`Banner moved ${direction}.`);
      await refreshAll();
    } catch {
      showToast("Failed to reorder banner.", "error");
    }
  };

  const handleDeleteBannerClick = (banner: HomepageBanner) => {
    setDeleteTarget({
      id: banner.id,
      title: banner.title,
      itemTypeLabel: "Homepage Hero Banner",
      collection: "banners",
    });
  };

  // --- Generic Item Actions (Featured, New Arrival, Best Seller, Promo Section) ---
  const handleOpenNewItem = (target: typeof itemModalTarget) => {
    setItemModalTarget(target);
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleEditItem = (
    target: typeof itemModalTarget,
    item: FeaturedPhone | NewArrival | BestSeller | PromotionalSection
  ) => {
    setItemModalTarget(target);
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (
    payload:
      | CreateFeaturedPhonePayload
      | CreateNewArrivalPayload
      | CreateBestSellerPayload
      | CreatePromotionalSectionPayload
  ) => {
    setIsActionSubmitting(true);
    try {
      if (itemModalTarget === "featured") {
        if (editingItem) {
          await ContentService.updateFeaturedPhone(editingItem.id, payload as Partial<CreateFeaturedPhonePayload>);
          showToast("Featured phone showcase updated.");
        } else {
          await ContentService.createFeaturedPhone(payload as CreateFeaturedPhonePayload);
          showToast("Added new flagship to Featured Showcase.");
        }
      } else if (itemModalTarget === "new_arrivals") {
        if (editingItem) {
          await ContentService.updateNewArrival(editingItem.id, payload as Partial<CreateNewArrivalPayload>);
          showToast("New arrival entry updated.");
        } else {
          await ContentService.createNewArrival(payload as CreateNewArrivalPayload);
          showToast("New drop added to New Arrivals.");
        }
      } else if (itemModalTarget === "best_sellers") {
        if (editingItem) {
          await ContentService.updateBestSeller(editingItem.id, payload as Partial<CreateBestSellerPayload>);
          showToast("Best seller entry updated.");
        } else {
          await ContentService.createBestSeller(payload as CreateBestSellerPayload);
          showToast("New model added to Best Sellers Leaderboard.");
        }
      } else if (itemModalTarget === "promo_sections") {
        if (editingItem) {
          await ContentService.updatePromoSection(editingItem.id, payload as Partial<CreatePromotionalSectionPayload>);
          showToast("Promotional section updated.");
        } else {
          await ContentService.createPromoSection(payload as CreatePromotionalSectionPayload);
          showToast("New promotional section created.");
        }
      }
      await refreshAll();
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Status Toggles
  const handleToggleFeaturedStatus = async (phone: FeaturedPhone) => {
    const nextStatus = phone.status === "active" ? "hidden" : "active";
    await ContentService.updateFeaturedPhone(phone.id, { status: nextStatus });
    showToast(`Featured phone is now ${nextStatus}.`);
    await refreshAll();
  };

  const handleMoveFeaturedOrder = async (phone: FeaturedPhone, direction: "up" | "down") => {
    const newOrder = direction === "up" ? Math.max(1, phone.displayOrder - 1) : phone.displayOrder + 1;
    await ContentService.updateFeaturedPhone(phone.id, { displayOrder: newOrder });
    showToast(`Featured phone moved ${direction}.`);
    await refreshAll();
  };

  const handleToggleNewArrivalStatus = async (item: NewArrival) => {
    const nextStatus = item.status === "active" ? "hidden" : "active";
    await ContentService.updateNewArrival(item.id, { status: nextStatus });
    showToast(`New arrival is now ${nextStatus}.`);
    await refreshAll();
  };

  const handleMoveNewArrivalOrder = async (item: NewArrival, direction: "up" | "down") => {
    const newOrder = direction === "up" ? Math.max(1, item.displayOrder - 1) : item.displayOrder + 1;
    await ContentService.updateNewArrival(item.id, { displayOrder: newOrder });
    showToast(`New arrival moved ${direction}.`);
    await refreshAll();
  };

  const handleToggleBestSellerStatus = async (item: BestSeller) => {
    const nextStatus = item.status === "active" ? "hidden" : "active";
    await ContentService.updateBestSeller(item.id, { status: nextStatus });
    showToast(`Best seller is now ${nextStatus}.`);
    await refreshAll();
  };

  const handleMoveBestSellerRank = async (item: BestSeller, direction: "up" | "down") => {
    const newRank = direction === "up" ? Math.max(1, item.rank - 1) : item.rank + 1;
    await ContentService.updateBestSeller(item.id, { rank: newRank });
    showToast(`Best seller rank updated to #${newRank}.`);
    await refreshAll();
  };

  const handleTogglePromoSectionStatus = async (sec: PromotionalSection) => {
    const nextStatus = sec.status === "active" ? "hidden" : "active";
    await ContentService.updatePromoSection(sec.id, { status: nextStatus });
    showToast(`Promotional section is now ${nextStatus}.`);
    await refreshAll();
  };

  const handleMovePromoSectionOrder = async (sec: PromotionalSection, direction: "up" | "down") => {
    const newOrder = direction === "up" ? Math.max(1, sec.displayOrder - 1) : sec.displayOrder + 1;
    await ContentService.updatePromoSection(sec.id, { displayOrder: newOrder });
    showToast(`Promotional section moved ${direction}.`);
    await refreshAll();
  };

  // Generic Deletion
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsActionSubmitting(true);
    try {
      switch (deleteTarget.collection) {
        case "banners":
          await ContentService.deleteBanner(deleteTarget.id);
          break;
        case "featured":
          await ContentService.deleteFeaturedPhone(deleteTarget.id);
          break;
        case "new_arrivals":
          await ContentService.deleteNewArrival(deleteTarget.id);
          break;
        case "best_sellers":
          await ContentService.deleteBestSeller(deleteTarget.id);
          break;
        case "promo_sections":
          await ContentService.deletePromoSection(deleteTarget.id);
          break;
      }
      showToast(`${deleteTarget.itemTypeLabel} was removed successfully.`);
      setDeleteTarget(null);
      await refreshAll();
    } catch {
      showToast("Failed to delete content item.", "error");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/95 px-4 py-3 text-xs shadow-2xl backdrop-blur-xl animate-slideDown">
          <span
            className={`h-2 w-2 rounded-full ${
              toastMessage.type === "success"
                ? "bg-emerald-400"
                : toastMessage.type === "error"
                ? "bg-rose-500"
                : "bg-cyan-400"
            }`}
          />
          <span className="font-semibold text-white">{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Title & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Storefront</span>
            <span>/</span>
            <span className="text-indigo-400">Content Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Storefront & CMS Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Curate homepage hero banners, flagship showcases, new drops, best seller leaderboards, and marketing blocks.
          </p>
        </div>

        {/* Global Refresh Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refreshAll()}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <svg
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards & Section Tabs */}
      <ContentKPIs
        metrics={metrics}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateClick={() => {
          if (activeTab === "banners") handleOpenNewBanner();
          else if (activeTab === "featured") handleOpenNewItem("featured");
          else if (activeTab === "new_arrivals") handleOpenNewItem("new_arrivals");
          else if (activeTab === "best_sellers") handleOpenNewItem("best_sellers");
          else if (activeTab === "promo_sections") handleOpenNewItem("promo_sections");
          else handleOpenNewBanner();
        }}
      />

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Launchpad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab("banners")}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-indigo-500/50 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">🖼</span>
                  <span className="rounded-full bg-indigo-500/10 text-indigo-400 px-2 py-0.5 text-[10px] font-bold">
                    {banners.filter((b) => b.status === "active").length} Active
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                  Homepage Hero Banners
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage high-resolution carousel slides, call-to-actions, and CTR click rates.
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-400 mt-4 flex items-center gap-1">
                Configure Slides →
              </span>
            </div>

            <div
              onClick={() => setActiveTab("featured")}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-cyan-500/50 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">⭐</span>
                  <span className="rounded-full bg-cyan-500/10 text-cyan-400 px-2 py-0.5 text-[10px] font-bold">
                    {featuredPhones.filter((f) => f.status === "active").length} Active
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Featured Smartphones
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select flagship models to showcase prominently in the high-tier catalog.
                </p>
              </div>
              <span className="text-xs font-semibold text-cyan-400 mt-4 flex items-center gap-1">
                Manage Showcase →
              </span>
            </div>

            <div
              onClick={() => setActiveTab("preview")}
              className="group cursor-pointer rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 p-5 hover:border-indigo-400/60 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">👁</span>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                    Interactive
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Live Storefront Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Preview how customers experience the storefront on both Desktop and Mobile devices.
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-300 mt-4 flex items-center gap-1">
                Launch Live Simulator →
              </span>
            </div>
          </div>

          {/* Quick Snapshot of Storefront */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-4 sm:p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Homepage Live Preview Snapshot</h2>
                <p className="text-xs text-slate-400">
                  Instant visual check of the customer storefront.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Expand Full Simulator ↗
              </button>
            </div>
            <StorefrontLivePreview
              banners={banners}
              featuredPhones={featuredPhones}
              newArrivals={newArrivals}
              bestSellers={bestSellers}
              promoSections={promoSections}
              onNavigateToTab={setActiveTab}
            />
          </div>
        </div>
      )}

      {activeTab === "banners" && (
        <HomepageBannersManager
          banners={banners}
          onEdit={handleEditBanner}
          onDelete={handleDeleteBannerClick}
          onToggleStatus={handleToggleBannerStatus}
          onMoveOrder={handleMoveBannerOrder}
          onNewBanner={handleOpenNewBanner}
        />
      )}

      {activeTab === "featured" && (
        <FeaturedPhonesManager
          featuredPhones={featuredPhones}
          onEdit={(phone) => handleEditItem("featured", phone)}
          onDelete={(phone) =>
            setDeleteTarget({
              id: phone.id,
              title: phone.productName,
              itemTypeLabel: "Featured Phone Showcase",
              collection: "featured",
            })
          }
          onToggleStatus={handleToggleFeaturedStatus}
          onMoveOrder={handleMoveFeaturedOrder}
          onAddPhone={() => handleOpenNewItem("featured")}
        />
      )}

      {activeTab === "new_arrivals" && (
        <NewArrivalsManager
          newArrivals={newArrivals}
          onEdit={(item) => handleEditItem("new_arrivals", item)}
          onDelete={(item) =>
            setDeleteTarget({
              id: item.id,
              title: item.productName,
              itemTypeLabel: "New Arrival Drop",
              collection: "new_arrivals",
            })
          }
          onToggleStatus={handleToggleNewArrivalStatus}
          onMoveOrder={handleMoveNewArrivalOrder}
          onAddNewArrival={() => handleOpenNewItem("new_arrivals")}
        />
      )}

      {activeTab === "best_sellers" && (
        <BestSellersManager
          bestSellers={bestSellers}
          onEdit={(item) => handleEditItem("best_sellers", item)}
          onDelete={(item) =>
            setDeleteTarget({
              id: item.id,
              title: item.productName,
              itemTypeLabel: "Best Seller Leaderboard Entry",
              collection: "best_sellers",
            })
          }
          onToggleStatus={handleToggleBestSellerStatus}
          onMoveRank={handleMoveBestSellerRank}
          onAddBestSeller={() => handleOpenNewItem("best_sellers")}
        />
      )}

      {activeTab === "promo_sections" && (
        <PromotionalSectionsManager
          sections={promoSections}
          onEdit={(sec) => handleEditItem("promo_sections", sec)}
          onDelete={(sec) =>
            setDeleteTarget({
              id: sec.id,
              title: sec.title,
              itemTypeLabel: "Promotional Section",
              collection: "promo_sections",
            })
          }
          onToggleStatus={handleTogglePromoSectionStatus}
          onMoveOrder={handleMovePromoSectionOrder}
          onAddSection={() => handleOpenNewItem("promo_sections")}
        />
      )}

      {activeTab === "preview" && (
        <StorefrontLivePreview
          banners={banners}
          featuredPhones={featuredPhones}
          newArrivals={newArrivals}
          bestSellers={bestSellers}
          promoSections={promoSections}
          onNavigateToTab={setActiveTab}
        />
      )}

      {/* Modals */}
      <BannerModal
        isOpen={isBannerModalOpen}
        initialBanner={editingBanner}
        onClose={() => setIsBannerModalOpen(false)}
        onSubmit={handleSaveBanner}
        isSubmitting={isActionSubmitting}
      />

      <ItemModal
        isOpen={isItemModalOpen}
        target={itemModalTarget}
        initialItem={editingItem}
        onClose={() => setIsItemModalOpen(false)}
        onSubmit={handleSaveItem}
        isSubmitting={isActionSubmitting}
      />

      <DeleteContentModal
        isOpen={Boolean(deleteTarget)}
        itemTitle={deleteTarget?.title ?? ""}
        itemTypeLabel={deleteTarget?.itemTypeLabel ?? "Content Item"}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isActionSubmitting}
      />
    </div>
  );
}
