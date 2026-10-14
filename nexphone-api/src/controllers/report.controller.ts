import type { Request, Response } from "express";
import { reportService } from "../services/report.service";

function sendReportResponse(res: Response, result: any): void {
  if (result && typeof result === "object" && result.isCsv) {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.filename || "report.csv"}"`
    );
    res.send(result.csv);
    return;
  }
  res.json(result);
}

// ==========================================
// 1. Sales Report
// ==========================================
export async function getSalesReport(req: Request, res: Response): Promise<void> {
  const isCsvRoute = req.path.endsWith("/csv");
  const format = isCsvRoute ? "csv" : (req.query.format as string) || "json";

  const result = await reportService.generateSalesReport({
    range: req.query.range as string,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
    groupBy: req.query.groupBy as string,
    format,
  });

  sendReportResponse(res, result);
}

// ==========================================
// 2. Order Report
// ==========================================
export async function getOrderReport(req: Request, res: Response): Promise<void> {
  const isCsvRoute = req.path.endsWith("/csv");
  const format = isCsvRoute ? "csv" : (req.query.format as string) || "json";

  const result = await reportService.generateOrderReport({
    range: req.query.range as string,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
    status: req.query.status as string,
    paymentStatus: req.query.paymentStatus as string,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    format,
  });

  sendReportResponse(res, result);
}

// ==========================================
// 3. Inventory Report
// ==========================================
export async function getInventoryReport(req: Request, res: Response): Promise<void> {
  const isCsvRoute = req.path.endsWith("/csv");
  const format = isCsvRoute ? "csv" : (req.query.format as string) || "json";

  const result = await reportService.generateInventoryReport({
    warehouse: req.query.warehouse as string,
    status: req.query.status as string,
    brand: req.query.brand as string,
    format,
  });

  sendReportResponse(res, result);
}

// ==========================================
// 4. Customer Report
// ==========================================
export async function getCustomerReport(req: Request, res: Response): Promise<void> {
  const isCsvRoute = req.path.endsWith("/csv");
  const format = isCsvRoute ? "csv" : (req.query.format as string) || "json";

  const result = await reportService.generateCustomerReport({
    tier: req.query.tier as string,
    status: req.query.status as string,
    minSpent: req.query.minSpent ? Number(req.query.minSpent) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    format,
  });

  sendReportResponse(res, result);
}

// ==========================================
// 5. Universal CSV Export Endpoint
// ==========================================
export async function exportReportToCsv(req: Request, res: Response): Promise<void> {
  const payload = req.method === "POST" ? req.body : req.query;

  const result = await reportService.exportReport({
    reportType: payload.reportType || "sales",
    range: payload.range,
    startDate: payload.startDate,
    endDate: payload.endDate,
    status: payload.status,
    paymentStatus: payload.paymentStatus,
    warehouse: payload.warehouse,
    tier: payload.tier,
  });

  sendReportResponse(res, result);
}

// ==========================================
// 6. Reports Overview & Catalog
// ==========================================
export async function getReportsOverview(_req: Request, res: Response): Promise<void> {
  const result = await reportService.getReportsOverview();
  res.json(result);
}
