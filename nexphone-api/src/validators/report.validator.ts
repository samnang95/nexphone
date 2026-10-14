import { z } from "zod";

export const salesReportQuerySchema = z.object({
  range: z.enum(["today", "7d", "30d", "quarter", "year", "custom"]).optional().default("30d"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(["day", "week", "month", "category", "channel"]).optional().default("day"),
  format: z.enum(["json", "csv"]).optional().default("json"),
});

export const orderReportQuerySchema = z.object({
  range: z.enum(["today", "7d", "30d", "quarter", "year", "custom"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z
    .enum(["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"])
    .optional()
    .default("all"),
  paymentStatus: z
    .enum(["all", "paid", "pending", "refunded", "failed"])
    .optional()
    .default("all"),
  limit: z.coerce.number().int().min(1).max(500).optional(),
  format: z.enum(["json", "csv"]).optional().default("json"),
});

export const inventoryReportQuerySchema = z.object({
  warehouse: z.string().optional().default("all"),
  status: z
    .enum(["all", "in_stock", "low_stock", "out_of_stock", "overstocked"])
    .optional()
    .default("all"),
  brand: z.string().optional().default("all"),
  format: z.enum(["json", "csv"]).optional().default("json"),
});

export const customerReportQuerySchema = z.object({
  tier: z.enum(["all", "VIP", "Enterprise", "Pro", "Regular"]).optional().default("all"),
  status: z.enum(["all", "active", "disabled"]).optional().default("all"),
  minSpent: z.coerce.number().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
  format: z.enum(["json", "csv"]).optional().default("json"),
});

export const exportReportSchema = z.object({
  reportType: z.enum(["sales", "orders", "inventory", "customers"]),
  range: z.enum(["today", "7d", "30d", "quarter", "year", "custom"]).optional().default("30d"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  warehouse: z.string().optional(),
  tier: z.string().optional(),
  format: z.enum(["csv", "json"]).optional().default("csv"),
});
