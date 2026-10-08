"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { PhoneProduct, ProductSeries, ProductStatus } from "@/types/product";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/product.service";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductTable } from "@/components/products/ProductTable";
import { PhoneFormModal } from "@/components/products/PhoneFormModal";
import { DeletePhoneModal } from "@/components/products/DeletePhoneModal";
import { View3DModal } from "@/components/products/View3DModal";

export default function ProductsPage() {
  const [products, setProducts] = useState<readonly PhoneProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeries, setSelectedSeries] = useState<ProductSeries | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Notification Banner
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modals state
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    product: PhoneProduct | null;
  }>({
    isOpen: false,
    mode: "add",
    product: null,
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    product: PhoneProduct | null;
  }>({
    isOpen: false,
    product: null,
  });

  const [view3DModal, setView3DModal] = useState<{
    isOpen: boolean;
    product: PhoneProduct | null;
  }>({
    isOpen: false,
    product: null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Manual reload for refresh button
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch {
      setNotification({
        type: "error",
        message: "Failed to load product catalog. Showing local cache.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let ignore = false;
    getProducts()
      .then((data) => {
        if (!ignore) {
          setProducts(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setNotification({
            type: "error",
            message: "Failed to load product catalog. Showing local cache.",
          });
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Auto-dismiss notification after 4s
  useEffect(() => {
    if (!notification) return undefined;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Series filter
      if (selectedSeries !== "all" && p.series !== selectedSeries) {
        return false;
      }
      // Status filter
      if (selectedStatus !== "all" && p.status !== selectedStatus) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesSubtitle = p.subtitle.toLowerCase().includes(query);
        const matchesSku = p.storageOptions.some((s) =>
          s.sku.toLowerCase().includes(query)
        );
        const matchesSeries = p.series.toLowerCase().includes(query);
        if (!matchesName && !matchesSubtitle && !matchesSku && !matchesSeries) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedSeries, selectedStatus, searchQuery]);

  // Catalog KPI Metrics
  const stats = useMemo(() => {
    const totalModels = products.length;
    const publishedCount = products.filter((p) => p.status === "published").length;
    const draftCount = products.filter((p) => p.status === "draft").length;

    const totalStock = products.reduce((acc, p) => {
      return acc + p.storageOptions.reduce((sub, v) => sub + v.stock, 0);
    }, 0);

    const avgPrice =
      totalModels > 0
        ? Math.round(
            products.reduce((acc, p) => acc + p.basePrice, 0) / totalModels
          )
        : 0;

    const modelsWith3D = products.filter((p) => p.model3D?.enabled).length;

    return {
      totalModels,
      publishedCount,
      draftCount,
      totalStock,
      avgPrice,
      modelsWith3D,
    };
  }, [products]);

  // Modal Triggers
  const handleOpenAdd = () => {
    setFormModal({
      isOpen: true,
      mode: "add",
      product: null,
    });
  };

  const handleOpenEdit = (product: PhoneProduct) => {
    // If opening edit from 3D modal, close 3D modal first
    setView3DModal({ isOpen: false, product: null });
    setFormModal({
      isOpen: true,
      mode: "edit",
      product,
    });
  };

  const handleOpenDelete = (product: PhoneProduct) => {
    setDeleteModal({
      isOpen: true,
      product,
    });
  };

  const handleOpenView3D = (product: PhoneProduct) => {
    setView3DModal({
      isOpen: true,
      product,
    });
  };

  // CRUD actions
  const handleSaveProduct = async (
    productData: Omit<PhoneProduct, "id" | "createdAt" | "updatedAt">
  ) => {
    setIsSaving(true);
    try {
      if (formModal.mode === "add") {
        const created = await createProduct(productData);
        setProducts((prev) => [created, ...prev]);
        setNotification({
          type: "success",
          message: `Phone "${created.name}" created successfully.`,
        });
      } else if (formModal.product) {
        const updated = await updateProduct(formModal.product.id, productData);
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        setNotification({
          type: "success",
          message: `Phone "${updated.name}" updated successfully.`,
        });
      }
      setFormModal({ isOpen: false, mode: "add", product: null });
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save phone model.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async (product: PhoneProduct) => {
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setDeleteModal({ isOpen: false, product: null });
      setNotification({
        type: "success",
        message: `Phone "${product.name}" deleted from catalog.`,
      });
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete phone model.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 md:p-8">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
            notification.type === "success"
              ? "border-emerald-500/30 bg-emerald-950/80 text-emerald-200"
              : "border-rose-500/30 bg-rose-950/80 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === "success" ? (
              <svg className="h-5 w-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="rounded p-1 text-slate-400 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header section with Action Button */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Product Management
            </h1>
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
              {products.length} Models
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Configure phone hardware specs, color finishes, storage tiers, BOM pricing, and 3D digital twins.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadProducts}
            className="flex items-center gap-1.5"
            title="Reload products from server"
          >
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/20"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Add New Phone</span>
          </Button>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section
        aria-label="Product Catalog Key Metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Total Phone Models"
          value={stats.totalModels.toString()}
          caption={`${stats.publishedCount} published • ${stats.draftCount} draft`}
          icon={
            <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          }
        />
        <StatCard
          title="Warehouse Stock"
          value={stats.totalStock.toLocaleString()}
          caption="Total units across all variants"
          trend="up"
          changePercentage={12.4}
          icon={
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          }
        />
        <StatCard
          title="Average Base MSRP"
          value={`$${stats.avgPrice.toLocaleString()}`}
          caption="Entry pricing standard"
          icon={
            <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        <StatCard
          title="3D Digital Twins"
          value={`${stats.modelsWith3D} / ${stats.totalModels}`}
          caption="Interactive GLB models online"
          icon={
            <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          }
        />
      </section>

      {/* Search, Series Filter, Status Filter & View Switcher with Result Counter */}
      <div className="space-y-2.5">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 sm:p-3 backdrop-blur-sm sm:flex-row sm:items-center">
          {/* Search Input (flexible width without awkward void) */}
          <div className="relative flex-1 min-w-[240px]">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phones by model name, subtitle, or SKU..."
              className="h-9 w-full rounded-lg border border-slate-700/80 bg-slate-950 pl-9.5 pr-8 text-xs sm:text-sm text-slate-200 placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-white"
                title="Clear search query"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Controls Bar with standardized height & spacing */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Series Filter Tabs */}
            <div className="flex h-9 items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs shrink-0">
              {(
                [
                  { label: "All Series", value: "all" },
                  { label: "Pro", value: "Pro Series" },
                  { label: "Enterprise", value: "Enterprise" },
                  { label: "Foldable", value: "Foldable" },
                  { label: "Lite", value: "Lite" },
                ] as const
              ).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setSelectedSeries(item.value)}
                  className={`flex h-7 items-center justify-center rounded-md px-3 font-medium transition-all ${
                    selectedSeries === item.value
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative shrink-0">
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as ProductStatus | "all")
                }
                className="h-9 appearance-none rounded-lg border border-slate-800 bg-slate-950 pl-3 pr-8 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>

            {/* View Mode Toggle: Grid vs Table */}
            <div className="flex h-9 items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex h-7 w-7 items-center justify-center rounded transition-all ${
                  viewMode === "grid"
                    ? "bg-slate-800 text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-300"
                }`}
                title="Grid Card View"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex h-7 w-7 items-center justify-center rounded transition-all ${
                  viewMode === "table"
                    ? "bg-slate-800 text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-300"
                }`}
                title="Table View"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 1.875 1.875v11.25a1.875 1.875 0 0 1-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V6.375A1.875 1.875 0 0 1 5.625 4.5Z" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Result Counter & Active Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-white">{filteredProducts.length}</strong> of{" "}
              {products.length} models
            </span>
            {(selectedSeries !== "all" || selectedStatus !== "all" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSeries("all");
                  setSelectedStatus("all");
                  setSearchQuery("");
                }}
                className="text-indigo-400 hover:underline hover:text-indigo-300"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Catalog Display Section */}
      <section aria-label="Phone Products Catalog">
        {isLoading ? (
          /* Loading Skeleton */
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-4 w-20 bg-slate-800 rounded-full" />
                  <div className="h-6 w-3/4 bg-slate-800 rounded" />
                  <div className="h-3 w-full bg-slate-800/60 rounded" />
                </div>
                <div className="space-y-3 pt-6 border-t border-slate-800">
                  <div className="h-8 w-1/3 bg-slate-800 rounded" />
                  <div className="h-9 w-full bg-slate-800 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20 mb-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">No phone models match your search</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-400">
              Try adjusting your search terms, series filter, or status selection to see available catalog devices.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedSeries("all");
                  setSelectedStatus("all");
                  setSearchQuery("");
                }}
              >
                Clear all filters
              </Button>
              <Button variant="primary" size="sm" onClick={handleOpenAdd}>
                + Add Phone Model
              </Button>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* Cards Grid View */
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onView3D={handleOpenView3D}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
            <ProductTable
              products={filteredProducts}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onView3D={handleOpenView3D}
            />
          </div>
        )}
      </section>

      {/* Multi-Tab Form Modal (Add / Edit Phone, Specs, Colors, Pricing & 3D) */}
      <PhoneFormModal
        isOpen={formModal.isOpen}
        mode={formModal.mode}
        initialProduct={formModal.product}
        isSaving={isSaving}
        onClose={() => setFormModal({ isOpen: false, mode: "add", product: null })}
        onSave={handleSaveProduct}
      />

      {/* Delete Confirmation Modal */}
      <DeletePhoneModal
        product={deleteModal.product}
        isOpen={deleteModal.isOpen}
        isDeleting={isDeleting}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* 3D Model Dedicated Studio Inspector */}
      <View3DModal
        product={view3DModal.product}
        isOpen={view3DModal.isOpen}
        onClose={() => setView3DModal({ isOpen: false, product: null })}
        onOpenEdit={handleOpenEdit}
      />
    </main>
  );
}
