"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import type {
  InventoryItem,
  InventoryMovement,
  StockStatus,
  UpdateInventoryPayload,
} from "@/types/inventory";
import { inventoryService } from "@/services/inventory.service";
import { InventoryKPIs } from "@/components/inventory/InventoryKPIs";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { LowStockAlertBanner } from "@/components/inventory/LowStockAlertBanner";
import { UpdateStockModal } from "@/components/inventory/UpdateStockModal";
import { ThresholdSettingsModal } from "@/components/inventory/ThresholdSettingsModal";
import { StockAuditModal } from "@/components/inventory/StockAuditModal";
import { cn } from "@/utils/cn";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StockStatus>("all");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  // Modals state
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [thresholdItem, setThresholdItem] = useState<InventoryItem | null>(null);
  const [auditItem, setAuditItem] = useState<InventoryItem | null>(null);
  const [isGlobalAuditOpen, setIsGlobalAuditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load data on mount
  useEffect(() => {
    let isSubscribed = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [invData, movData] = await Promise.all([
          inventoryService.fetchInventory(),
          inventoryService.fetchMovements(),
        ]);
        if (isSubscribed) {
          setItems(invData);
          setMovements(movData);
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
  const filteredItems = useMemo(() => {
    return inventoryService.applyLocalFilters(items, {
      search,
      status: statusFilter,
      warehouse: warehouseFilter,
      onlyAlerts,
    });
  }, [items, search, statusFilter, warehouseFilter, onlyAlerts]);

  // Warehouse options extracted from data
  const warehouseOptions = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.warehouse)));
  }, [items]);

  // Summary Metrics
  const metrics = useMemo(() => {
    return inventoryService.calculateMetrics(items);
  }, [items]);

  // Handlers
  const handleStockAdjustment = async (payload: UpdateInventoryPayload) => {
    setIsSaving(true);
    try {
      const result = await inventoryService.adjustStock(payload);
      startTransition(() => {
        setItems((prev) =>
          prev.map((i) => (i.id === result.item.id ? result.item : i))
        );
        setMovements((prev) => [result.movement, ...prev]);
        setAdjustingItem(null);
      });
      showToast(
        `Stock updated for ${result.item.sku}: now ${result.item.stockQuantity} units (${result.item.status.replace("_", " ")}).`
      );
    } catch {
      alert("Failed to update stock. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleThresholdUpdate = async (
    id: string,
    lowStockThreshold: number,
    reorderPoint: number
  ) => {
    setIsSaving(true);
    try {
      const updated = await inventoryService.updateThreshold(id, lowStockThreshold, reorderPoint);
      startTransition(() => {
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        setThresholdItem(null);
      });
      showToast(`Threshold updated for ${updated.sku}: Low-stock alert at ≤ ${lowStockThreshold} units.`);
    } catch {
      alert("Failed to update alert threshold. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setWarehouseFilter("all");
    setOnlyAlerts(false);
  };

  const hasActiveFilters =
    search.trim() !== "" || statusFilter !== "all" || warehouseFilter !== "all" || onlyAlerts;

  return (
    <main className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-6 xl:p-8">
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
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Inventory Management</h1>
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
              {metrics.totalSkus} Active SKUs
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time physical stock counts, reorder thresholds, warehouse allocation, and supply chain movements.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsGlobalAuditOpen(true)}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-900/80 px-3.5 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          >
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>Movement Audit Trail</span>
          </button>

          {items.length > 0 && (
            <button
              onClick={() => setAdjustingItem(items[0] || null)}
              className="flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-600/40 active:scale-[0.98]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Quick Restock</span>
            </button>
          )}
        </div>
      </div>

      {/* Low-Stock Alert Warning Banner */}
      <LowStockAlertBanner
        items={items}
        isFiltered={onlyAlerts}
        onFilterAlerts={() => setOnlyAlerts((prev) => !prev)}
      />

      {/* KPI Cards */}
      <InventoryKPIs
        metrics={metrics}
        activeStatus={statusFilter}
        onStatusFilter={(status) => setStatusFilter(status)}
      />

      {/* Filter and Search Toolbar */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Search by SKU, Phone Model, Brand, or Warehouse..."
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

          {/* Stock Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | StockStatus)}
              className="h-9 appearance-none rounded-lg border border-slate-800 bg-slate-900/80 pl-3 pr-8 text-xs text-white transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="in_stock">In Stock (Healthy)</option>
              <option value="low_stock">Low Stock (≤ Threshold)</option>
              <option value="out_of_stock">Out of Stock (0 units)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Warehouse Dropdown */}
          <div className="relative">
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="h-9 appearance-none rounded-lg border border-slate-800 bg-slate-900/80 pl-3 pr-8 text-xs text-white transition-colors hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Warehouses</option>
              {warehouseOptions.map((wh) => (
                <option key={wh} value={wh}>
                  {wh}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Quick Alert Filter Toggle */}
          <button
            type="button"
            onClick={() => setOnlyAlerts((prev) => !prev)}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all",
              onlyAlerts
                ? "border-amber-500/60 bg-amber-500/20 text-amber-300 shadow-sm"
                : "border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-white"
            )}
          >
            <span>⚠️ Alerts Only</span>
            {(metrics.lowStockCount > 0 || metrics.outOfStockCount > 0) && (
              <span className="rounded-full bg-amber-500/30 px-1.5 py-0.2 text-[10px] font-mono text-amber-300">
                {metrics.lowStockCount + metrics.outOfStockCount}
              </span>
            )}
          </button>
        </div>

        {/* Results Count & Reset Filter */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white font-semibold">{filteredItems.length}</strong> of{" "}
            {items.length} inventory variants
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

      {/* Main Inventory Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-3 text-xs text-slate-400">Loading inventory catalog and telemetry...</p>
        </div>
      ) : (
        <InventoryTable
          items={filteredItems}
          onAdjustStock={(item) => setAdjustingItem(item)}
          onConfigureThreshold={(item) => setThresholdItem(item)}
          onViewMovements={(item) => setAuditItem(item)}
        />
      )}

      {/* Modals */}
      <UpdateStockModal
        isOpen={Boolean(adjustingItem)}
        item={adjustingItem}
        isSaving={isSaving}
        onClose={() => setAdjustingItem(null)}
        onSave={handleStockAdjustment}
      />

      <ThresholdSettingsModal
        isOpen={Boolean(thresholdItem)}
        item={thresholdItem}
        isSaving={isSaving}
        onClose={() => setThresholdItem(null)}
        onSave={handleThresholdUpdate}
      />

      <StockAuditModal
        isOpen={Boolean(auditItem) || isGlobalAuditOpen}
        item={auditItem}
        movements={movements}
        onClose={() => {
          setAuditItem(null);
          setIsGlobalAuditOpen(false);
        }}
      />
    </main>
  );
}
