import { z } from "zod";

export const dashboardRangeSchema = z.object({
  range: z.enum(["today", "7d", "30d", "quarter", "year"]).optional().default("30d"),
});

export const recentOrdersQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const bestSellersQuerySchema = z.object({
  range: z.enum(["today", "7d", "30d", "quarter", "year"]).optional().default("30d"),
  limit: z.coerce.number().int().min(1).max(20).optional().default(5),
});

export const lowStockQuerySchema = z.object({
  threshold: z.coerce.number().int().min(1).optional(),
});
