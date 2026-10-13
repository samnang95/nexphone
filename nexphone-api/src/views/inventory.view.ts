import type { InventoryItemRecord, InventoryMovementRecord } from "../data/inventory.data";
import type { InventoryItemDocument, InventoryMovementDocument } from "../models/inventory.model";

export function serializeInventoryItem(doc: InventoryItemDocument | InventoryItemRecord | any): InventoryItemRecord {
  const item = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    id: item.id || String(item._id),
    productId: item.productId,
    productName: item.productName,
    brandName: item.brandName,
    sku: item.sku,
    variantCapacity: item.variantCapacity,
    variantRam: item.variantRam,
    colorFinishes: item.colorFinishes || [],
    warehouse: item.warehouse,
    stockQuantity: Number(item.stockQuantity) || 0,
    reservedQuantity: Number(item.reservedQuantity) || 0,
    availableQuantity: Number(item.availableQuantity) || 0,
    lowStockThreshold: Number(item.lowStockThreshold) || 20,
    reorderPoint: Number(item.reorderPoint) || 30,
    unitCost: Number(item.unitCost) || 0,
    retailPrice: Number(item.retailPrice) || 0,
    totalValue: Number(item.totalValue) || 0,
    status: item.status || "in_stock",
    lastRestocked: item.lastRestocked instanceof Date ? item.lastRestocked.toISOString() : (item.lastRestocked || new Date().toISOString()),
    updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : (item.updatedAt || new Date().toISOString()),
  };
}

export function serializeInventoryMovement(doc: InventoryMovementDocument | InventoryMovementRecord | any): InventoryMovementRecord {
  const mov = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    id: mov.id || String(mov._id),
    inventoryItemId: mov.inventoryItemId,
    sku: mov.sku,
    productName: mov.productName,
    changeAmount: Number(mov.changeAmount) || 0,
    previousStock: Number(mov.previousStock) || 0,
    newStock: Number(mov.newStock) || 0,
    reason: mov.reason,
    notes: mov.notes || "",
    performedBy: mov.performedBy || "System Admin",
    createdAt: mov.createdAt instanceof Date ? mov.createdAt.toISOString() : (mov.createdAt || new Date().toISOString()),
  };
}

export interface StockAvailabilityView {
  sku: string;
  productId: string;
  productName: string;
  variantCapacity: string;
  warehouse: string;
  inStock: boolean;
  availableQuantity: number;
  stockQuantity: number;
  reservedQuantity: number;
  status: string;
  reorderRequired: boolean;
}

export function serializeStockAvailability(doc: InventoryItemDocument | InventoryItemRecord | any): StockAvailabilityView {
  const item = serializeInventoryItem(doc);
  return {
    sku: item.sku,
    productId: item.productId,
    productName: item.productName,
    variantCapacity: item.variantCapacity,
    warehouse: item.warehouse,
    inStock: item.availableQuantity > 0,
    availableQuantity: item.availableQuantity,
    stockQuantity: item.stockQuantity,
    reservedQuantity: item.reservedQuantity,
    status: item.status,
    reorderRequired: item.stockQuantity <= item.reorderPoint,
  };
}

export interface StockCheckItemResult {
  sku?: string;
  productId?: string;
  inventoryItemId?: string;
  productName?: string;
  requestedQuantity: number;
  availableQuantity: number;
  sufficientStock: boolean;
  status: string;
  message?: string;
}

export interface StockCheckResult {
  available: boolean;
  totalRequestedUnits: number;
  items: StockCheckItemResult[];
  issues: string[];
}