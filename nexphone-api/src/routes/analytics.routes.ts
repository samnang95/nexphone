import { Router } from "express";
import { optionalAuthenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  dashboardRangeSchema,
  bestSellersQuerySchema,
  lowStockQuerySchema,
} from "../validators/dashboard.validator";
import * as controller from "../controllers/dashboard.controller";

export const analyticsRouter = Router();

// ==========================================
// Analytics Endpoints
// ==========================================
analyticsRouter.get(
  ["/api/analytics/sales", "/analytics/sales"],
  optionalAuthenticate,
  validate({ query: dashboardRangeSchema }),
  controller.getSalesChartData
);

analyticsRouter.get(
  ["/api/analytics/revenue", "/analytics/revenue"],
  optionalAuthenticate,
  validate({ query: dashboardRangeSchema }),
  controller.getTotalRevenue
);

analyticsRouter.get(
  ["/api/analytics/best-sellers", "/analytics/best-sellers"],
  optionalAuthenticate,
  validate({ query: bestSellersQuerySchema }),
  controller.getBestSellingPhones
);

analyticsRouter.get(
  ["/api/analytics/customers", "/analytics/customers"],
  optionalAuthenticate,
  controller.getTotalCustomers
);

analyticsRouter.get(
  ["/api/analytics/inventory", "/analytics/inventory"],
  optionalAuthenticate,
  validate({ query: lowStockQuerySchema }),
  controller.getLowStockSummary
);

analyticsRouter.get(
  ["/api/analytics/overview", "/analytics/overview"],
  optionalAuthenticate,
  controller.getAnalyticsOverview
);
