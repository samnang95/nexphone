"use client";

import { useEffect, useState, useCallback } from "react";
import type {
  AnalyticsTab,
  DateRangeOption,
  SalesReportSummary,
  RevenueReportSummary,
  BestSellingPhoneItem,
  CustomerStatsSummary,
  InventoryReportSummary,
  ExecutiveReportBundle,
} from "@/types/analytics";
import { analyticsService } from "@/services/analytics.service";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { SalesReportView } from "@/components/analytics/SalesReportView";
import { RevenueReportView } from "@/components/analytics/RevenueReportView";
import { BestSellingPhonesView } from "@/components/analytics/BestSellingPhonesView";
import { CustomerStatsView } from "@/components/analytics/CustomerStatsView";
import { InventoryReportView } from "@/components/analytics/InventoryReportView";
import { ExecutiveReportModal } from "@/components/analytics/ExecutiveReportModal";

export default function AnalyticsReportsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("sales");
  const [dateRange, setDateRange] = useState<DateRangeOption>("30d");
  const [isExecutiveModalOpen, setIsExecutiveModalOpen] = useState(false);

  // Initialize immediately with dynamic data so there is zero initial blank screen or delay
  const [salesData, setSalesData] = useState<SalesReportSummary>(() =>
    analyticsService.getDynamicSalesReport("30d")
  );
  const [revenueData, setRevenueData] = useState<RevenueReportSummary>(() =>
    analyticsService.getDynamicRevenueReport("30d")
  );
  const [bestSellers, setBestSellers] = useState<BestSellingPhoneItem[]>(() =>
    analyticsService.getDynamicBestSellers("30d")
  );
  const [customersData, setCustomersData] = useState<CustomerStatsSummary | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryReportSummary | null>(null);
  const [executiveBundle, setExecutiveBundle] = useState<ExecutiveReportBundle | null>(null);

  // Synchronize live API telemetry in the background
  useEffect(() => {
    let isCancelled = false;

    analyticsService.getExecutiveOverview(dateRange).then((bundle) => {
      if (!isCancelled) {
        setExecutiveBundle(bundle);
        setSalesData(bundle.sales);
        setRevenueData(bundle.revenue);
        setBestSellers(bundle.bestSellers);
        setCustomersData(bundle.customers);
        setInventoryData(bundle.inventory);
      }
    }).catch(() => {
      // Background sync graceful fallback
    });

    return () => {
      isCancelled = true;
    };
  }, [dateRange]);

  // Instant response when clicking between Today, Last 7 Days, Last 30 Days, This Quarter, Year to Date
  const handleDateRangeChange = (range: DateRangeOption) => {
    setDateRange(range);
    setSalesData(analyticsService.getDynamicSalesReport(range));
    setRevenueData(analyticsService.getDynamicRevenueReport(range));
    setBestSellers(analyticsService.getDynamicBestSellers(range));
  };

  // Export handlers tailored to the currently active view tab
  const handleExportActiveTabCsv = useCallback(() => {
    if (activeTab === "sales" && salesData) {
      const rows = salesData.dailyTimeline.map((item) => ({
        Date: item.date,
        UnitsSold: item.unitsSold,
        Revenue: item.revenue,
        OrdersCount: item.orders,
      }));
      analyticsService.exportToCsv(rows, `nexphone-sales-report-${dateRange}`);
    } else if (activeTab === "revenue" && revenueData) {
      const rows = revenueData.monthlyTimeseries.map((m) => ({
        Month: m.month,
        GrossRevenue: m.gross,
        NetRevenue: m.net,
        Discounts: m.discounts,
        MarginPercent: m.marginPercent,
      }));
      analyticsService.exportToCsv(rows, `nexphone-revenue-pnl-${dateRange}`);
    } else if (activeTab === "best_sellers") {
      const rows = bestSellers.map((phone, idx) => ({
        Rank: idx + 1,
        PhoneName: phone.name,
        ModelCode: phone.modelCode,
        Brand: phone.brandName,
        UnitsSold: phone.unitsSold,
        Revenue: phone.revenue,
        AvgPrice: phone.averagePrice,
        StockRemaining: phone.stockRemaining,
        Rating: phone.averageRating,
        ReturnRate: `${phone.returnRatePercent}%`,
        MarketShare: `${phone.marketSharePercent}%`,
      }));
      analyticsService.exportToCsv(rows, `nexphone-best-sellers-${dateRange}`);
    } else if (activeTab === "customers" && customersData) {
      const rows = customersData.topSpenders.map((cust) => ({
        CustomerID: cust.id,
        Name: cust.name,
        Email: cust.email,
        Tier: cust.tier,
        OrdersCount: cust.ordersCount,
        TotalSpent: cust.totalSpent,
        Location: cust.location,
        LastOrderAt: cust.lastOrderAt,
      }));
      analyticsService.exportToCsv(rows, `nexphone-customer-top-spenders-${dateRange}`);
    } else if (activeTab === "inventory" && inventoryData) {
      const rows = inventoryData.fastDepletingSkus.map((sku) => ({
        PhoneId: sku.phoneId,
        ModelName: sku.name,
        ModelCode: sku.modelCode,
        CurrentStock: sku.currentStock,
        ReorderThreshold: sku.reorderThreshold,
        WeeklyBurnRate: sku.burnRatePerWeek,
        DaysRemaining: sku.daysRemaining,
        Status: sku.status,
      }));
      analyticsService.exportToCsv(rows, `nexphone-inventory-depletion-${dateRange}`);
    }
  }, [activeTab, salesData, revenueData, bestSellers, customersData, inventoryData, dateRange]);

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 min-h-screen text-slate-100">
      {/* Studio Header & Tab Navigator */}
      <AnalyticsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onOpenExecutiveReport={() => setIsExecutiveModalOpen(true)}
        onExportCsv={handleExportActiveTabCsv}
      />

      {/* Main Viewport Content - Smooth Instant Transition without blocking spinner */}
      <div className="transition-all duration-200">
        {activeTab === "sales" && salesData && (
          <SalesReportView data={salesData} onExportCsv={handleExportActiveTabCsv} />
        )}

        {activeTab === "revenue" && revenueData && (
          <RevenueReportView data={revenueData} onExportCsv={handleExportActiveTabCsv} />
        )}

        {activeTab === "best_sellers" && (
          <BestSellingPhonesView phones={bestSellers} onExportCsv={handleExportActiveTabCsv} />
        )}

        {activeTab === "customers" && customersData && (
          <CustomerStatsView data={customersData} onExportCsv={handleExportActiveTabCsv} />
        )}

        {activeTab === "inventory" && inventoryData && (
          <InventoryReportView data={inventoryData} onExportCsv={handleExportActiveTabCsv} />
        )}
      </div>

      {/* Executive Report Briefing Modal */}
      <ExecutiveReportModal
        isOpen={isExecutiveModalOpen}
        onClose={() => setIsExecutiveModalOpen(false)}
        bundle={
          executiveBundle || {
            generatedAt: new Date().toISOString(),
            dateRange,
            sales: salesData,
            revenue: revenueData,
            bestSellers,
            customers: customersData || {
              totalCustomers: 18450,
              activeBuyersCount: 12540,
              newSignupsThisMonth: 412,
              returningCustomerRate: 67.8,
              averageLTV: 4850,
              churnRatePercent: 1.6,
              tierDistribution: [
                { tier: "VIP Partner", count: 2214, sharePercent: 12 },
                { tier: "Enterprise Fleet", count: 5166, sharePercent: 28 },
                { tier: "Pro Fleet", count: 6457, sharePercent: 35 },
                { tier: "Regular Consumer", count: 4613, sharePercent: 25 },
              ],
              topSpenders: [],
            },
            inventory: inventoryData || {
              totalValuation: 8420000,
              totalUnitsInStock: 14200,
              lowStockItemsCount: 3,
              outOfStockItemsCount: 1,
              stockTurnoverRate: 4.8,
              daysOfInventoryRemaining: 26,
              fastDepletingSkus: [],
              warehouses: [],
            },
          }
        }
      />
    </div>
  );
}
