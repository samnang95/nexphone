"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import type { Brand, BrandFormData, BrandStatus, BrandTier } from "@/types/brand";
import { brandService } from "@/services/brand.service";
import { BrandCard } from "@/components/brands/BrandCard";
import { BrandTable } from "@/components/brands/BrandTable";
import { BrandFormModal } from "@/components/brands/BrandFormModal";
import { BrandDetailModal } from "@/components/brands/BrandDetailModal";
import { DeleteBrandModal } from "@/components/brands/DeleteBrandModal";
import { cn } from "@/utils/cn";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BrandStatus>("all");
  const [tierFilter, setTierFilter] = useState<"all" | BrandTier>("all");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [viewingBrand, setViewingBrand] = useState<Brand | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load brands on mount
  useEffect(() => {
    let isSubscribed = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await brandService.fetchBrands();
        if (isSubscribed) {
          setBrands(data);
        }
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Filtered list
  const filteredBrands = useMemo(() => {
    return brandService.applyLocalFilters(brands, {
      search,
      status: statusFilter,
      tier: tierFilter,
    });
  }, [brands, search, statusFilter, tierFilter]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const total = brands.length;
    const active = brands.filter((b) => b.status === "active").length;
    const flagship = brands.filter((b) => b.tier === "Flagship").length;
    const countries = new Set(brands.map((b) => b.country)).size;
    return { total, active, flagship, countries };
  }, [brands]);

  // Handlers
  const handleCreateBrand = async (formData: BrandFormData) => {
    setIsSaving(true);
    try {
      const created = await brandService.createBrand(formData);
      startTransition(() => {
        setBrands((prev) => [created, ...prev]);
        setIsAddModalOpen(false);
      });
      showToast(`Brand "${created.name}" registered successfully.`);
    } catch {
      alert("Failed to register brand. Please check the fields and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateBrand = async (formData: BrandFormData) => {
    if (!editingBrand) return;
    setIsSaving(true);
    try {
      const updated = await brandService.updateBrand(editingBrand.id, formData);
      startTransition(() => {
        setBrands((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        setEditingBrand(null);
      });
      showToast(`Brand "${updated.name}" updated successfully.`);
    } catch {
      alert("Failed to update brand. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBrand = async (brand: Brand) => {
    setIsDeleting(true);
    try {
      await brandService.deleteBrand(brand.id);
      startTransition(() => {
        setBrands((prev) => prev.filter((b) => b.id !== brand.id));
        setDeletingBrand(null);
      });
      showToast(`Brand "${brand.name}" removed from registry.`);
    } catch {
      alert("Failed to delete brand. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTierFilter("all");
  };

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "all" || tierFilter !== "all";

  return (
    <main className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 md:p-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-slate-900/95 px-4 py-3 text-xs font-semibold text-emerald-300 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5">
          <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Brand Management</h1>
          <p className="mt-1 text-xs text-slate-400">
            Hardware manufacturer registry, partner tiers, regional operations, and fleet specifications.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-600/40 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Register Brand</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Card 1: Total Brands */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Registered Brands</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871a3.375 3.375 0 0 0-3.375-3.375h-.379a3.375 3.375 0 0 0-3.375 3.375h-.871c-.622 0-1.125.504-1.125 1.125V18.75m10.5 0h-9" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{metrics.total}</span>
            <span className="text-[11px] text-slate-400">partners in registry</span>
          </div>
        </div>

        {/* Card 2: Active Partners */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Partners</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">{metrics.active}</span>
            <span className="text-[11px] text-slate-400">in production</span>
          </div>
        </div>

        {/* Card 3: Flagship Tier */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Flagship Tier</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-purple-300">{metrics.flagship}</span>
            <span className="text-[11px] text-slate-400">premium lines</span>
          </div>
        </div>

        {/* Card 4: Global Nations */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Global Markets</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-300">{metrics.countries}</span>
            <span className="text-[11px] text-slate-400">nations</span>
          </div>
        </div>
      </div>

      {/* Filter and Action Toolbar */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Search brands by name, code, HQ, or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-800 bg-slate-900/80 pl-9 pr-8 text-xs text-white placeholder-slate-500 transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | BrandStatus)}
              className="h-9 appearance-none rounded-lg border border-slate-800 bg-slate-900/80 pl-3 pr-8 text-xs text-white transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Tier Dropdown */}
          <div className="relative">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as "all" | BrandTier)}
              className="h-9 appearance-none rounded-lg border border-slate-800 bg-slate-900/80 pl-3 pr-8 text-xs text-white transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Tiers</option>
              <option value="Flagship">Flagship</option>
              <option value="Enterprise">Enterprise</option>
              <option value="OEM Partner">OEM Partner</option>
              <option value="Strategic">Strategic</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex h-9 items-center rounded-lg border border-slate-800 bg-slate-900/80 p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
                viewMode === "grid"
                  ? "bg-slate-800 text-white font-semibold shadow"
                  : "text-slate-400 hover:text-slate-200"
              )}
              title="Grid View"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
                viewMode === "table"
                  ? "bg-slate-800 text-white font-semibold shadow"
                  : "text-slate-400 hover:text-slate-200"
              )}
              title="Table View"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>

        {/* Results Count & Clear Filter */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white font-semibold">{filteredBrands.length}</strong> of{" "}
            {brands.length} brand partners
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-3 text-xs text-slate-400">Loading brand catalog...</p>
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-500 mb-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No brand partners found</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            No brands matched your filter criteria. Try resetting filters or register a new brand partner.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500"
          >
            Register Brand
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredBrands.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              onEdit={(b) => setEditingBrand(b)}
              onDelete={(b) => setDeletingBrand(b)}
              onView={(b) => setViewingBrand(b)}
            />
          ))}
        </div>
      ) : (
        <BrandTable
          brands={filteredBrands}
          onEdit={(b) => setEditingBrand(b)}
          onDelete={(b) => setDeletingBrand(b)}
          onView={(b) => setViewingBrand(b)}
        />
      )}

      {/* Modals */}
      <BrandFormModal
        isOpen={isAddModalOpen}
        mode="add"
        isSaving={isSaving}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleCreateBrand}
      />

      <BrandFormModal
        isOpen={Boolean(editingBrand)}
        mode="edit"
        initialBrand={editingBrand}
        isSaving={isSaving}
        onClose={() => setEditingBrand(null)}
        onSave={handleUpdateBrand}
      />

      <DeleteBrandModal
        isOpen={Boolean(deletingBrand)}
        brand={deletingBrand}
        isDeleting={isDeleting}
        onClose={() => setDeletingBrand(null)}
        onConfirm={handleDeleteBrand}
      />

      <BrandDetailModal
        isOpen={Boolean(viewingBrand)}
        brand={viewingBrand}
        onClose={() => setViewingBrand(null)}
        onEdit={(b) => {
          setViewingBrand(null);
          setEditingBrand(b);
        }}
      />
    </main>
  );
}
