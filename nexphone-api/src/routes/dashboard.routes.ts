import { Router } from "express";
import { optionalAuthenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  dashboardRangeSchema,
  recentOrdersQuerySchema,
  bestSellersQuerySchema,
  lowStockQuerySchema,
} from "../validators/dashboard.validator";
import * as controller from "../controllers/dashboard.controller";

export const dashboardRouter = Router();

// ==========================================
// 1. Dashboard Metrics Summary
// ==========================================
dashboardRouter.get(["/api/dashboard/metrics", "/dashboard/metrics"], optionalAuthenticate, controller.getDashboardMetrics);
dashboardRouter.get(["/api/dashboard/overview", "/dashboard/overview"], optionalAuthenticate, controller.getAnalyticsOverview);

// ==========================================
// 2. Total Revenue & Sales Chart Data
// ==========================================
dashboardRouter.get(["/api/dashboard/revenue","/dashboard/revenue","/api/dashboard/total-revenue","/dashboard/total-revenue"], optionalAuthenticate, validate({ query: dashboardRangeSchema }), controller.getTotalRevenue);
dashboardRouter.get(["/api/dashboard/sales-chart", "/dashboard/sales-chart"], optionalAuthenticate, validate({ query: dashboardRangeSchema }), controller.getSalesChartData);

// ==========================================
// 3. Orders: Total Orders & Recent Orders
// ==========================================
dashboardRouter.get(["/api/dashboard/total-orders", "/dashboard/total-orders"], optionalAuthenticate, validate({ query: dashboardRangeSchema }), controller.getTotalOrders);
dashboardRouter.get(["/api/dashboard/orders","/dashboard/orders","/api/dashboard/recent-orders","/dashboard/recent-orders"], optionalAuthenticate, validate({ query: recentOrdersQuerySchema }), controller.getRecentOrders);

// ==========================================
// 4. Total Customers & Total Products
// ==========================================
dashboardRouter.get(["/api/dashboard/total-customers", "/dashboard/total-customers"], optionalAuthenticate, controller.getTotalCustomers);
dashboardRouter.get(["/api/dashboard/total-products", "/dashboard/total-products"], optionalAuthenticate, controller.getTotalProducts);

// ==========================================
// 5. Best-Selling Phones & Low-Stock Summary
// ==========================================
dashboardRouter.get(["/api/dashboard/best-selling-phones", "/dashboard/best-selling-phones"], optionalAuthenticate, validate({ query: bestSellersQuerySchema }), controller.getBestSellingPhones);
dashboardRouter.get(["/api/dashboard/low-stock", "/dashboard/low-stock"], optionalAuthenticate, validate({ query: lowStockQuerySchema }), controller.getLowStockSummary);

// ==========================================
// 6. Devices (Legacy Mock)
// ==========================================
dashboardRouter.get(["/api/devices", "/devices"], optionalAuthenticate, controller.getDevices);
