"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { ROUTES } from "@/routes";
import { productService } from "@/services/product.service";
import type { PhoneProduct, CatalogFilterState, CatalogSortOption } from "@/types/product";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductFilterSidebar } from "@/components/catalog/ProductFilterSidebar";
import { ProductSearchBar } from "@/components/catalog/ProductSearchBar";
import {
  PhoneQuickViewModal,
  type QuickViewPhone,
} from "@/components/home/PhoneQuickViewModal";

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const seriesParam = searchParams.get("series") || "all";

  const [products, setProducts] = useState<PhoneProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [quickViewPhone, setQuickViewPhone] = useState<QuickViewPhone | null>(null);

  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priceRange, setPriceRange] = useState<CatalogFilterState["priceRange"]>("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<CatalogSortOption>("featured");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await productService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products catalog:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const effectiveSeries = selectedSeries !== null ? selectedSeries : seriesParam;

  const filters: CatalogFilterState = {
    searchQuery,
    series: effectiveSeries,
    priceRange,
    minRating,
    inStockOnly,
    sortBy,
  };

  const handleFilterChange = (newFilters: Partial<CatalogFilterState>) => {
    if (newFilters.searchQuery !== undefined) setSearchQuery(newFilters.searchQuery);
    if (newFilters.series !== undefined) setSelectedSeries(newFilters.series);
    if (newFilters.priceRange !== undefined) setPriceRange(newFilters.priceRange);
    if (newFilters.minRating !== undefined) setMinRating(newFilters.minRating);
    if (newFilters.inStockOnly !== undefined) setInStockOnly(newFilters.inStockOnly);
    if (newFilters.sortBy !== undefined) setSortBy(newFilters.sortBy);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedSeries("all");
    setPriceRange("all");
    setMinRating(0);
    setInStockOnly(false);
    setSortBy("featured");
  };

  const filteredProducts = productService.filterAndSort(products, filters);

  const handleOpenQuickView = (product: PhoneProduct) => {
    setQuickViewPhone({
      name: product.name,
      subtitle: product.subtitle,
      price: product.basePrice,
      image: product.imageUrl || "",
      specs: [
        `${product.specifications.display.size} ${product.specifications.display.panelType}`,
        product.specifications.processor.chipset,
        product.specifications.camera.main,
        product.specifications.battery.capacity,
      ],
      badge: product.isFeatured ? "Featured" : product.series,
      series: product.series,
    });
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      {/* Breadcrumb Header */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-slate-400">
          <Link href={ROUTES.HOME} className="hover:text-cyan-400 transition-colors">
            Home
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-white font-medium">Device Catalog</span>
        </div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Catalog Banner Title */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Hardware Enclave Store</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Flagship Hardware Catalog
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl leading-relaxed">
            Discover precision-engineered smartphones featuring aerospace titanium, dual Secure Enclave cryptoprocessors, and global satellite mesh transceivers.
          </p>
        </div>

        {/* Search, Sort, and View Switcher Bar */}
        <ProductSearchBar
          searchQuery={filters.searchQuery}
          onSearchChange={(query) => handleFilterChange({ searchQuery: query })}
          sortBy={filters.sortBy}
          onSortChange={(sort: CatalogSortOption) => handleFilterChange({ sortBy: sort })}
          viewMode={viewMode}
          onViewModeChange={(mode) => setViewMode(mode)}
          totalResults={filteredProducts.length}
        />

        {/* Main Content Layout: Sidebar + Products List/Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <ProductFilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            totalMatches={filteredProducts.length}
          />

          {/* Catalog Products Content */}
          <div className="flex-1 w-full">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className="h-96 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse p-6"
                  />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onQuickView={handleOpenQuickView}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="rounded-3xl bg-slate-900/40 border border-slate-800 p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Matching Phones Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                  We couldn&apos;t find any devices matching your search or active filter criteria. Try adjusting your series or price filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Quick View Modal */}
      <PhoneQuickViewModal
        phone={quickViewPhone}
        onClose={() => setQuickViewPhone(null)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 py-10 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-[10px]">
              N
            </div>
            <span className="font-semibold text-white">NexPhone Systems Inc.</span>
            <span>— Hardware Catalog</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href={ROUTES.HOME} className="hover:text-cyan-400 transition-colors">
              Home
            </Link>
            <Link href={ROUTES.AUTH.LOGIN} className="hover:text-cyan-400 transition-colors">
              Sign In
            </Link>
            <Link href={ROUTES.AUTH.REGISTER} className="hover:text-cyan-400 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080c14] flex items-center justify-center text-slate-400 text-xs">
          Loading hardware catalog...
        </div>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  );
}
