import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";
import { config } from "../config/env";

/**
 * 1. Get Total Revenue
 * GET /api/dashboard/revenue
 * GET /api/dashboard/total-revenue
 * GET /api/analytics/revenue
 */
export async function getTotalRevenue(req: Request, res: Response): Promise<void> {
  const range = (req.query.range as string) || "30d";
  const result = await dashboardService.getTotalRevenue(range);
  res.json(result);
}

/**
 * 2. Get Total Orders
 * GET /api/dashboard/total-orders
 * GET /api/analytics/orders
 */
export async function getTotalOrders(req: Request, res: Response): Promise<void> {
  const range = (req.query.range as string) || "30d";
  const result = await dashboardService.getTotalOrders(range);
  res.json(result);
}

/**
 * 3. Get Total Customers
 * GET /api/dashboard/total-customers
 * GET /api/analytics/customers
 */
export async function getTotalCustomers(_req: Request, res: Response): Promise<void> {
  const result = await dashboardService.getTotalCustomers();
  res.json(result);
}

/**
 * 4. Get Total Products
 * GET /api/dashboard/total-products
 */
export async function getTotalProducts(_req: Request, res: Response): Promise<void> {
  const result = await dashboardService.getTotalProducts();
  res.json(result);
}

/**
 * 5. Get Recent Orders
 * GET /api/dashboard/recent-orders
 * GET /api/dashboard/orders
 */
export async function getRecentOrders(req: Request, res: Response): Promise<void> {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const result = await dashboardService.getRecentOrders(limit);
  res.json(result);
}

/**
 * 6. Get Sales Chart Data
 * GET /api/dashboard/sales-chart
 * GET /api/analytics/sales
 */
export async function getSalesChartData(req: Request, res: Response): Promise<void> {
  const range = (req.query.range as string) || "30d";
  const result = await dashboardService.getSalesChartData(range);
  res.json(result);
}

/**
 * 7. Get Best-Selling Phones
 * GET /api/dashboard/best-selling-phones
 * GET /api/analytics/best-sellers
 */
export async function getBestSellingPhones(req: Request, res: Response): Promise<void> {
  const range = (req.query.range as string) || "30d";
  const limit = req.query.limit ? Number(req.query.limit) : 5;
  const result = await dashboardService.getBestSellingPhones(range, limit);
  res.json(result);
}

/**
 * 8. Get Low-Stock Summary
 * GET /api/dashboard/low-stock
 * GET /api/analytics/inventory
 */
export async function getLowStockSummary(req: Request, res: Response): Promise<void> {
  const threshold = req.query.threshold ? Number(req.query.threshold) : undefined;
  const result = await dashboardService.getLowStockSummary(threshold);
  res.json(result);
}

/**
 * 9. Get Dashboard Metrics (Overview summary)
 * GET /api/dashboard/metrics
 */
export async function getDashboardMetrics(_req: Request, res: Response): Promise<void> {
  const result = await dashboardService.getDashboardMetrics();
  res.json(result);
}

/**
 * 10. Get Analytics Overview
 * GET /api/dashboard/overview
 * GET /api/analytics/overview
 */
export async function getAnalyticsOverview(_req: Request, res: Response): Promise<void> {
  const result = await dashboardService.getAnalyticsOverview();
  res.json(result);
}

/**
 * 11. Legacy Devices Mock
 * GET /api/devices
 */
export function getDevices(_req: Request, res: Response): void {
  res.json([
    {
      id: "nx-dev-001",
      name: "NexPhone 15 Pro Max (Field Test Unit Alpha)",
      status: "online",
      batteryLevel: 94,
      firmwareVersion: "NX-OS 15.4.1",
      lastPingAt: new Date().toISOString(),
      location: "San Francisco, CA",
      environment: config.flavor,
    },
    {
      id: "nx-dev-002",
      name: "NexPhone Enterprise Edge Fleet #12",
      status: "online",
      batteryLevel: 82,
      firmwareVersion: "NX-OS 15.4.0",
      lastPingAt: new Date().toISOString(),
      location: "Berlin, DE",
      environment: config.flavor,
    },
    {
      id: "nx-dev-003",
      name: "NexPhone Lite Telemetry Lab Unit",
      status: "offline",
      batteryLevel: 12,
      firmwareVersion: "NX-OS 15.3.8",
      lastPingAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      location: "Tokyo, JP",
      environment: config.flavor,
    },
    {
      id: "nx-dev-004",
      name: "NexPhone Ultra Fold Prototype Gamma",
      status: "online",
      batteryLevel: 67,
      firmwareVersion: "NX-OS 16.0.0-beta",
      lastPingAt: new Date().toISOString(),
      location: "Singapore, SG",
      environment: config.flavor,
    },
  ]);
}
