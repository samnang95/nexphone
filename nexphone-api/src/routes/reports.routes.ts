import { Router } from "express";
import { optionalAuthenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  salesReportQuerySchema,
  orderReportQuerySchema,
  inventoryReportQuerySchema,
  customerReportQuerySchema,
  exportReportSchema,
} from "../validators/report.validator";
import * as controller from "../controllers/report.controller";

export const reportsRouter = Router();

// ==========================================
// 1. Reports Catalog & Overview
// ==========================================
reportsRouter.get(
  ["/api/reports/overview", "/reports/overview"],
  optionalAuthenticate,
  controller.getReportsOverview
);

// ==========================================
// 2. Sales Report (JSON & CSV)
// ==========================================
reportsRouter.get(
  ["/api/reports/sales/csv", "/reports/sales/csv"],
  optionalAuthenticate,
  controller.getSalesReport
);

reportsRouter.get(
  ["/api/reports/sales", "/reports/sales"],
  optionalAuthenticate,
  validate({ query: salesReportQuerySchema }),
  controller.getSalesReport
);

// ==========================================
// 3. Order Report (JSON & CSV)
// ==========================================
reportsRouter.get(
  ["/api/reports/orders/csv", "/reports/orders/csv"],
  optionalAuthenticate,
  controller.getOrderReport
);

reportsRouter.get(
  ["/api/reports/orders", "/reports/orders"],
  optionalAuthenticate,
  validate({ query: orderReportQuerySchema }),
  controller.getOrderReport
);

// ==========================================
// 4. Inventory Report (JSON & CSV)
// ==========================================
reportsRouter.get(
  ["/api/reports/inventory/csv", "/reports/inventory/csv"],
  optionalAuthenticate,
  controller.getInventoryReport
);

reportsRouter.get(
  ["/api/reports/inventory", "/reports/inventory"],
  optionalAuthenticate,
  validate({ query: inventoryReportQuerySchema }),
  controller.getInventoryReport
);

// ==========================================
// 5. Customer Report (JSON & CSV)
// ==========================================
reportsRouter.get(
  ["/api/reports/customers/csv", "/reports/customers/csv"],
  optionalAuthenticate,
  controller.getCustomerReport
);

reportsRouter.get(
  ["/api/reports/customers", "/reports/customers"],
  optionalAuthenticate,
  validate({ query: customerReportQuerySchema }),
  controller.getCustomerReport
);

// ==========================================
// 6. Universal CSV Export Endpoints
// ==========================================
reportsRouter.get(
  ["/api/reports/export", "/reports/export"],
  optionalAuthenticate,
  validate({ query: exportReportSchema }),
  controller.exportReportToCsv
);

reportsRouter.post(
  ["/api/reports/export", "/reports/export"],
  optionalAuthenticate,
  validate({ body: exportReportSchema }),
  controller.exportReportToCsv
);

// ==========================================
// 7. Root Reports List
// ==========================================
reportsRouter.get(
  ["/api/reports", "/reports"],
  optionalAuthenticate,
  controller.getReportsOverview
);
