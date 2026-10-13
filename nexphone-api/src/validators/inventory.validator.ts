import { z } from "zod";

export const queryInventorySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["all", "in_stock", "low_stock", "out_of_stock", "overstocked"]).optional(),
  warehouse: z.string().trim().optional(),
  onlyAlerts: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((val) => val === true || val === "true")
    .optional(),
  sortBy: z.enum(["stockQuantity", "availableQuantity", "totalValue", "productName", "sku", "status"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).default("asc").optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100).optional(),
});

export const checkStockItemSchema = z.object({
  sku: z.string().trim().optional(),
  productId: z.string().trim().optional(),
  inventoryItemId: z.string().trim().optional(),
  variantCapacity: z.string().trim().optional(),
  quantity: z.coerce.number().int().positive("Requested quantity must be at least 1").default(1),
}).refine((item) => Boolean(item.sku || item.productId || item.inventoryItemId), {
  message: "Each stock check item must specify either sku, productId, or inventoryItemId",
});

export const checkStockSchema = z.object({
  items: z.array(checkStockItemSchema).min(1, "At least one item must be provided for stock check"),
});

export const adjustStockSchema = z.object({
  inventoryItemId: z.string().min(1, "inventoryItemId is required"),
  type: z.enum(["add", "subtract", "set"]),
  quantity: z.coerce.number().min(0, "Quantity must be greater than or equal to 0"),
  reason: z
    .enum([
      "restock_po",
      "audit_correction",
      "damage_writeoff",
      "customer_return",
      "warehouse_transfer",
      "order_fulfillment",
      "order_cancellation",
    ])
    .default("audit_correction"),
  notes: z.string().max(1000).optional(),
  performedBy: z.string().max(120).optional(),
});

export const restockSchema = z.object({
  inventoryItemId: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  quantity: z.coerce.number().int().positive("Restock quantity must be at least 1"),
  unitCost: z.coerce.number().positive("Unit cost must be positive").optional(),
  poNumber: z.string().trim().max(100).optional(),
  warehouse: z.string().trim().max(150).optional(),
  notes: z.string().max(1000).optional(),
  performedBy: z.string().max(120).optional(),
});

export const updateThresholdSchema = z.object({
  lowStockThreshold: z.coerce.number().min(0, "lowStockThreshold must be >= 0"),
  reorderPoint: z.coerce.number().min(0, "reorderPoint must be >= 0"),
});

export const updateStockSchema = z.object({
  stockQuantity: z.coerce.number().int().min(0).optional(),
  reservedQuantity: z.coerce.number().int().min(0).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  reorderPoint: z.coerce.number().int().min(0).optional(),
  warehouse: z.string().trim().min(1).optional(),
  unitCost: z.coerce.number().min(0).optional(),
  retailPrice: z.coerce.number().min(0).optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  performedBy: z.string().optional(),
});

export const queryMovementsSchema = z.object({
  itemId: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  reason: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50).optional(),
});

export type QueryInventoryInput = z.infer<typeof queryInventorySchema>;
export type CheckStockInput = z.infer<typeof checkStockSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type RestockInput = z.infer<typeof restockSchema>;
export type UpdateThresholdInput = z.infer<typeof updateThresholdSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
export type QueryMovementsInput = z.infer<typeof queryMovementsSchema>;
