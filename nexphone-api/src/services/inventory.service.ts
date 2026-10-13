import { inventoryRepository } from "../repositories/inventory.repo";
import {
  serializeInventoryItem,
  serializeInventoryMovement,
  serializeStockAvailability,
  type StockAvailabilityView,
  type StockCheckResult,
  type StockCheckItemResult,
} from "../views/inventory.view";
import { calculateStockStatus, type InventoryItemRecord } from "../data/inventory.data";
import { HttpError } from "../utils/httpError";
import type {
  QueryInventoryInput,
  CheckStockInput,
  AdjustStockInput,
  RestockInput,
  UpdateThresholdInput,
  UpdateStockInput,
  QueryMovementsInput,
} from "../validators/inventory.validator";

export const inventoryService = {
  async getInventory(query: QueryInventoryInput = {}): Promise<{ items: InventoryItemRecord[]; total: number }> {
    const { search, status, warehouse, onlyAlerts, sortBy = "stockQuantity", sortDirection = "asc", page = 1, limit = 100 } = query;
    const filters = { search, status, warehouse, onlyAlerts };
    const pagination = { page, limit };
    const { items, total } = await inventoryRepository.findAll(filters, sortBy, sortDirection, pagination);
    return {
      items: items.map(serializeInventoryItem),
      total,
    };
  },

  async getInventoryById(id: string): Promise<InventoryItemRecord> {
    const item = await inventoryRepository.findById(id);
    if (!item) {
      throw HttpError.notFound(`Inventory item not found: ${id}`);
    }
    return serializeInventoryItem(item);
  },

  async getStockAvailability(query: { sku?: string; productId?: string }): Promise<StockAvailabilityView[]> {
    if (query.sku?.trim()) {
      const item = await inventoryRepository.findBySku(query.sku.trim());
      if (!item) {
        throw HttpError.notFound(`No inventory found for SKU: ${query.sku}`);
      }
      return [serializeStockAvailability(item)];
    }

    if (query.productId?.trim()) {
      const items = await inventoryRepository.findByProductId(query.productId.trim());
      if (!items || items.length === 0) {
        throw HttpError.notFound(`No inventory items found for product ID: ${query.productId}`);
      }
      return items.map(serializeStockAvailability);
    }

    // Default: return availability overview of all items
    const { items } = await inventoryRepository.findAll({}, "productName", "asc", { page: 1, limit: 100 });
    return items.map(serializeStockAvailability);
  },

  async checkStockBeforePurchase(input: CheckStockInput): Promise<StockCheckResult> {
    const results: StockCheckItemResult[] = [];
    const issues: string[] = [];
    let totalRequestedUnits = 0;

    for (const reqItem of input.items) {
      const requestedQty = reqItem.quantity || 1;
      totalRequestedUnits += requestedQty;

      // Find item by sku, inventoryItemId, or productId
      let item: any = null;
      if (reqItem.sku) {
        item = await inventoryRepository.findBySku(reqItem.sku);
      } else if (reqItem.inventoryItemId) {
        item = await inventoryRepository.findById(reqItem.inventoryItemId);
      } else if (reqItem.productId) {
        const productItems = await inventoryRepository.findByProductId(reqItem.productId);
        if (reqItem.variantCapacity) {
          item = productItems.find((i: any) => i.variantCapacity.toLowerCase() === reqItem.variantCapacity!.toLowerCase());
        }
        if (!item && productItems.length > 0) {
          item = productItems[0];
        }
      }

      if (!item) {
        const identifier = reqItem.sku || reqItem.inventoryItemId || reqItem.productId || "unknown";
        issues.push(`Product or variant not found: ${identifier}`);
        results.push({
          sku: reqItem.sku,
          productId: reqItem.productId,
          inventoryItemId: reqItem.inventoryItemId,
          requestedQuantity: requestedQty,
          availableQuantity: 0,
          sufficientStock: false,
          status: "out_of_stock",
          message: `Product or variant not found (${identifier}).`,
        });
        continue;
      }

      const available = Number(item.availableQuantity) || 0;
      const sufficient = available >= requestedQty;

      if (!sufficient) {
        if (available <= 0) {
          issues.push(`${item.productName} (${item.sku}) is currently out of stock.`);
        } else {
          issues.push(
            `Insufficient stock for ${item.productName} (${item.sku}): requested ${requestedQty}, but only ${available} available.`
          );
        }
      }

      results.push({
        sku: item.sku,
        productId: item.productId,
        inventoryItemId: item.id,
        productName: item.productName,
        requestedQuantity: requestedQty,
        availableQuantity: available,
        sufficientStock: sufficient,
        status: item.status,
        message: sufficient ? "In stock and ready to order." : `Only ${available} unit(s) available.`,
      });
    }

    const allSufficient = results.every((r) => r.sufficientStock);

    return {
      available: allSufficient,
      totalRequestedUnits,
      items: results,
      issues,
    };
  },

  async adjustStock(
    payload: AdjustStockInput,
    performedByFallback?: string
  ): Promise<{ item: InventoryItemRecord; movement: any }> {
    const current = await inventoryRepository.findById(payload.inventoryItemId);
    if (!current) {
      throw HttpError.notFound(`Inventory item not found: ${payload.inventoryItemId}`);
    }

    const prevStock = Number(current.stockQuantity) || 0;
    const qty = Number(payload.quantity) || 0;
    let newStock = prevStock;

    if (payload.type === "add") {
      newStock = prevStock + qty;
    } else if (payload.type === "subtract") {
      if (prevStock - qty < 0) {
        throw HttpError.badRequest(
          `Cannot subtract ${qty} units. Current stock is ${prevStock} units. Stock cannot be negative.`
        );
      }
      newStock = prevStock - qty;
    } else if (payload.type === "set") {
      newStock = Math.max(0, qty);
    }

    const delta = newStock - prevStock;
    const threshold = Number(current.lowStockThreshold) || 20;
    const reserved = Number(current.reservedQuantity) || 0;
    const unitCost = Number(current.unitCost) || 0;

    const newStatus = calculateStockStatus(newStock, threshold);
    const newAvailable = Math.max(0, newStock - reserved);
    const newTotalVal = newStock * unitCost;
    const performer = payload.performedBy || performedByFallback || "System Admin";

    const updated = await inventoryRepository.updateItem(current.id, {
      stockQuantity: newStock,
      availableQuantity: newAvailable,
      totalValue: newTotalVal,
      status: newStatus,
      lastRestocked: payload.type === "add" ? new Date().toISOString() : current.lastRestocked,
    });

    const movement = await inventoryRepository.createMovement({
      inventoryItemId: current.id,
      sku: current.sku,
      productName: current.productName,
      changeAmount: delta,
      previousStock: prevStock,
      newStock,
      reason: payload.reason || "audit_correction",
      notes: payload.notes || "Manual inventory adjustment via Admin console",
      performedBy: performer,
    });

    return {
      item: serializeInventoryItem(updated),
      movement: serializeInventoryMovement(movement),
    };
  },

  async restockProduct(
    identifier: string,
    payload: RestockInput,
    performedByFallback?: string
  ): Promise<{ item: InventoryItemRecord; movement: any }> {
    const item = await inventoryRepository.findById(identifier);
    if (!item) {
      throw HttpError.notFound(`Inventory item not found: ${identifier}`);
    }

    const prevStock = Number(item.stockQuantity) || 0;
    const restockQty = Number(payload.quantity);
    const newStock = prevStock + restockQty;
    const unitCost = payload.unitCost !== undefined ? Number(payload.unitCost) : Number(item.unitCost) || 0;
    const threshold = Number(item.lowStockThreshold) || 20;
    const reserved = Number(item.reservedQuantity) || 0;

    const newStatus = calculateStockStatus(newStock, threshold);
    const newAvailable = Math.max(0, newStock - reserved);
    const newTotalVal = newStock * unitCost;
    const performer = payload.performedBy || performedByFallback || "Logistics Admin";

    const updates: Partial<InventoryItemRecord> = {
      stockQuantity: newStock,
      availableQuantity: newAvailable,
      unitCost,
      totalValue: newTotalVal,
      status: newStatus,
      lastRestocked: new Date().toISOString(),
    };

    if (payload.warehouse?.trim()) {
      updates.warehouse = payload.warehouse.trim();
    }

    const updated = await inventoryRepository.updateItem(item.id, updates);

    const movement = await inventoryRepository.createMovement({
      inventoryItemId: item.id,
      sku: item.sku,
      productName: item.productName,
      changeAmount: restockQty,
      previousStock: prevStock,
      newStock,
      reason: "restock_po",
      notes: [
        payload.poNumber ? `PO #${payload.poNumber}` : "",
        payload.notes || (payload.poNumber ? "Restock shipment received" : "Inventory replenishment shipment received"),
      ]
        .filter(Boolean)
        .join(" - "),
      performedBy: performer,
    });

    return {
      item: serializeInventoryItem(updated),
      movement: serializeInventoryMovement(movement),
    };
  },

  async getLowStockProducts(warehouse?: string): Promise<{
    totalAlerts: number;
    criticalCount: number;
    warningCount: number;
    items: Array<InventoryItemRecord & { recommendedReorderQuantity: number; urgencyLevel: "critical" | "warning" }>;
  }> {
    const lowStockItems = await inventoryRepository.findLowStock(warehouse);
    let criticalCount = 0;
    let warningCount = 0;
    const enriched = lowStockItems.map((raw) => {
      const item = serializeInventoryItem(raw);
      const isCritical = item.stockQuantity === 0;
      if (isCritical) {
        criticalCount++;
      } else {
        warningCount++;
      }

      const recommendedReorderQuantity = Math.max(
        item.reorderPoint,
        item.reorderPoint * 2 - item.stockQuantity
      );

      return {
        ...item,
        recommendedReorderQuantity,
        urgencyLevel: (isCritical ? "critical" : "warning") as "critical" | "warning",
      };
    });

    return {
      totalAlerts: enriched.length,
      criticalCount,
      warningCount,
      items: enriched,
    };
  },

  async getStockMovements(query: QueryMovementsInput = {}): Promise<{ movements: any[]; total: number }> {
    const { itemId, sku, reason, page = 1, limit = 50 } = query;
    const pagination = { page, limit };
    const { movements, total } = await inventoryRepository.findMovements({ itemId, sku, reason }, pagination);

    return {
      movements: movements.map(serializeInventoryMovement),
      total,
    };
  },

  async updateThreshold(id: string, payload: UpdateThresholdInput): Promise<InventoryItemRecord> {
    const item = await inventoryRepository.findById(id);
    if (!item) {
      throw HttpError.notFound(`Inventory item not found: ${id}`);
    }

    const lowStockThreshold = Number(payload.lowStockThreshold);
    const reorderPoint = Number(payload.reorderPoint);
    const currentStock = Number(item.stockQuantity) || 0;
    const newStatus = calculateStockStatus(currentStock, lowStockThreshold);

    const updated = await inventoryRepository.updateItem(item.id, {
      lowStockThreshold,
      reorderPoint,
      status: newStatus,
    });

    return serializeInventoryItem(updated);
  },

  async updateStock(
    id: string,
    payload: UpdateStockInput,
    performedByFallback?: string
  ): Promise<{ item: InventoryItemRecord; movement?: any }> {
    const item = await inventoryRepository.findById(id);
    if (!item) {
      throw HttpError.notFound(`Inventory item not found: ${id}`);
    }

    const prevStock = Number(item.stockQuantity) || 0;
    const newStock = payload.stockQuantity !== undefined ? Number(payload.stockQuantity) : prevStock;
    const reserved = payload.reservedQuantity !== undefined ? Number(payload.reservedQuantity) : Number(item.reservedQuantity) || 0;
    const threshold = payload.lowStockThreshold !== undefined ? Number(payload.lowStockThreshold) : Number(item.lowStockThreshold) || 20;
    const reorder = payload.reorderPoint !== undefined ? Number(payload.reorderPoint) : Number(item.reorderPoint) || 30;
    const unitCost = payload.unitCost !== undefined ? Number(payload.unitCost) : Number(item.unitCost) || 0;
    const retailPrice = payload.retailPrice !== undefined ? Number(payload.retailPrice) : Number(item.retailPrice) || 0;

    const newStatus = calculateStockStatus(newStock, threshold);
    const newAvailable = Math.max(0, newStock - reserved);
    const newTotalVal = newStock * unitCost;

    const updates: Partial<InventoryItemRecord> = {
      stockQuantity: newStock,
      reservedQuantity: reserved,
      availableQuantity: newAvailable,
      lowStockThreshold: threshold,
      reorderPoint: reorder,
      unitCost,
      retailPrice,
      totalValue: newTotalVal,
      status: newStatus,
    };

    if (payload.warehouse) updates.warehouse = payload.warehouse;

    const updated = await inventoryRepository.updateItem(item.id, updates);

    let movement: any = null;
    if (newStock !== prevStock) {
      movement = await inventoryRepository.createMovement({
        inventoryItemId: item.id,
        sku: item.sku,
        productName: item.productName,
        changeAmount: newStock - prevStock,
        previousStock: prevStock,
        newStock,
        reason: (payload.reason as any) || "audit_correction",
        notes: payload.notes || "Stock updated by Administrator",
        performedBy: payload.performedBy || performedByFallback || "System Admin",
      });
    }

    return {
      item: serializeInventoryItem(updated),
      movement: movement ? serializeInventoryMovement(movement) : undefined,
    };
  },
};