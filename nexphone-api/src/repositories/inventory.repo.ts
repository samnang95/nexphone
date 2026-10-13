import { InventoryItem, InventoryMovement, type InventoryItemDocument, type InventoryMovementDocument, type StockMovementReason } from "../models/inventory.model";
import { Product } from "../models/product.model";
import { inventoryCatalog, inventoryMovements, type InventoryItemRecord, type InventoryMovementRecord, calculateStockStatus } from "../data/inventory.data";
import { isDatabaseConnected } from "../config/database";

export interface InventoryQueryFilters {
  search?: string;
  status?: string;
  warehouse?: string;
  onlyAlerts?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}
let seeded = false;
export async function ensureInventorySeeded(): Promise<void> {
  if (seeded || !isDatabaseConnected()) return;
  try {
    const count = await InventoryItem.countDocuments();
    if (count === 0) {
      const itemsToSeed = inventoryCatalog.map((item) => ({
        ...item,
        lastRestocked: new Date(item.lastRestocked),
        createdAt: new Date(item.updatedAt || Date.now()),
        updatedAt: new Date(item.updatedAt || Date.now()),
      }));
      await InventoryItem.insertMany(itemsToSeed);
      console.log(`📦 [Inventory Repo] Auto-seeded ${itemsToSeed.length} inventory items to MongoDB.`);
    }

    const movCount = await InventoryMovement.countDocuments();
    if (movCount === 0) {
      const movementsToSeed = inventoryMovements.map((m) => ({
        ...m,
        createdAt: new Date(m.createdAt),
      }));
      await InventoryMovement.insertMany(movementsToSeed);
      console.log(`📜 [Inventory Repo] Auto-seeded ${movementsToSeed.length} inventory movements to MongoDB.`);
    }

    seeded = true;
  } catch (error) {
    console.warn("⚠️  [Inventory Repo] Could not auto-seed inventory to MongoDB:", (error as Error).message);
  }
}

export const inventoryRepository = {
  async findAll(
    filters: InventoryQueryFilters = {},
    sortBy: string = "stockQuantity",
    sortDirection: "asc" | "desc" = "asc",
    pagination?: PaginationOptions
  ): Promise<{ items: any[]; total: number }> {
    await ensureInventorySeeded();
    if (isDatabaseConnected()) {
      return this.findMongo(filters, sortBy, sortDirection, pagination);
    }
    return this.findInMemory(filters, sortBy, sortDirection, pagination);
  },

  async findMongo(
    filters: InventoryQueryFilters,
    sortBy: string,
    sortDirection: "asc" | "desc",
    pagination?: PaginationOptions
  ): Promise<{ items: InventoryItemDocument[]; total: number }> {
    const query: any = {};

    if (filters.status && filters.status !== "all") {
      query.status = filters.status;
    }
    if (filters.warehouse && filters.warehouse !== "all") {
      query.warehouse = new RegExp(filters.warehouse, "i");
    }
    if (filters.onlyAlerts) {
      query.$or = [
        { status: { $in: ["low_stock", "out_of_stock"] } },
        { $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] } },
      ];
    }
    if (filters.search?.trim()) {
      const regex = new RegExp(filters.search.trim(), "i");
      query.$or = [
        { sku: regex },
        { productName: regex },
        { brandName: regex },
        { warehouse: regex },
        { variantCapacity: regex },
      ];
    }

    const total = await InventoryItem.countDocuments(query);
    const sortOrder = sortDirection === "desc" ? -1 : 1;
    let queryExec = InventoryItem.find(query).sort({ [sortBy]: sortOrder });

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      queryExec = queryExec.skip(skip).limit(pagination.limit);
    }

    const items = await queryExec.exec();
    return { items, total };
  },

  findInMemory(
    filters: InventoryQueryFilters,
    sortBy: string,
    sortDirection: "asc" | "desc",
    pagination?: PaginationOptions
  ): { items: InventoryItemRecord[]; total: number } {
    let items = [...inventoryCatalog];

    if (filters.status && filters.status !== "all") {
      items = items.filter((item) => item.status === filters.status);
    }
    if (filters.warehouse && filters.warehouse !== "all") {
      items = items.filter((item) => item.warehouse.toLowerCase().includes(filters.warehouse!.toLowerCase()));
    }
    if (filters.onlyAlerts) {
      items = items.filter((item) => item.status === "low_stock" || item.status === "out_of_stock" || item.stockQuantity <= item.lowStockThreshold);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.sku.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q) ||
          item.brandName.toLowerCase().includes(q) ||
          item.warehouse.toLowerCase().includes(q)
      );
    }

    // Sort
    const sortMultiplier = sortDirection === "desc" ? -1 : 1;
    items.sort((a: any, b: any) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (typeof valA === "number" && typeof valB === "number") {
        return (valA - valB) * sortMultiplier;
      }
      return String(valA || "").localeCompare(String(valB || "")) * sortMultiplier;
    });

    const total = items.length;
    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      items = items.slice(skip, skip + pagination.limit);
    }

    return { items, total };
  },

  async findById(id: string): Promise<any | null> {
    await ensureInventorySeeded();
    if (isDatabaseConnected()) {
      const item = await InventoryItem.findOne({
        $or: [{ id }, { sku: new RegExp(`^${id}$`, "i") }],
      });
      if (item) return item;
    }
    return inventoryCatalog.find(
      (i) => i.id === id || i.sku.toLowerCase() === id.toLowerCase()
    ) || null;
  },

  async findBySku(sku: string): Promise<any | null> {
    await ensureInventorySeeded();
    if (isDatabaseConnected()) {
      const item = await InventoryItem.findOne({ sku: new RegExp(`^${sku}$`, "i") });
      if (item) return item;
    }
    return inventoryCatalog.find((i) => i.sku.toLowerCase() === sku.toLowerCase()) || null;
  },

  async findByProductId(productId: string): Promise<any[]> {
    await ensureInventorySeeded();
    if (isDatabaseConnected()) {
      const items = await InventoryItem.find({ productId });
      if (items.length > 0) return items;
    }
    return inventoryCatalog.filter((i) => i.productId === productId);
  },

  async findLowStock(warehouse?: string): Promise<any[]> {
    await ensureInventorySeeded();
    if (isDatabaseConnected()) {
      const query: any = {
        $or: [
          { status: { $in: ["low_stock", "out_of_stock"] } },
          { $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] } },
        ],
      };
      if (warehouse && warehouse !== "all") {
        query.warehouse = new RegExp(warehouse, "i");
      }
      return InventoryItem.find(query).sort({ stockQuantity: 1 });
    }

    return inventoryCatalog.filter((item) => {
      const matchesAlert =
        item.status === "low_stock" || item.status === "out_of_stock" || item.stockQuantity <= item.lowStockThreshold;
      const matchesWarehouse = !warehouse || warehouse === "all" || item.warehouse.toLowerCase().includes(warehouse.toLowerCase());
      return matchesAlert && matchesWarehouse;
    }).sort((a, b) => a.stockQuantity - b.stockQuantity);
  },

  async updateItem(id: string, updates: Partial<InventoryItemRecord>): Promise<any | null> {
    await ensureInventorySeeded();
    const timestamp = new Date().toISOString();
    const memIdx = inventoryCatalog.findIndex((i) => i.id === id || i.sku.toLowerCase() === id.toLowerCase());
    let memoryItem: InventoryItemRecord | null = null;
    if (memIdx !== -1) {
      const current = inventoryCatalog[memIdx];
      if (current) {
        const merged: InventoryItemRecord = {
          ...current,
          ...updates,
          updatedAt: timestamp,
        };
        inventoryCatalog[memIdx] = merged;
        memoryItem = merged;
      }
    }
    if (isDatabaseConnected()) {
      const dbItem = await InventoryItem.findOneAndUpdate(
        { $or: [{ id }, { sku: new RegExp(`^${id}$`, "i") }] },
        { $set: { ...updates, updatedAt: new Date() } },
        { new: true }
      );
      if (dbItem) {
        // Also sync product catalog variant stock if sku matches
        await this.syncProductVariantStock(dbItem.sku, dbItem.stockQuantity);
        return dbItem;
      }
    }

    // Sync product variant stock in-memory/DB
    if (memoryItem) {
      await this.syncProductVariantStock(memoryItem.sku, memoryItem.stockQuantity);
    }

    return memoryItem;
  },

  async createMovement(movementData: Omit<InventoryMovementRecord, "id" | "createdAt">): Promise<any> {
    const id = `mov-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const movementRecord: InventoryMovementRecord = {
      id,
      ...movementData,
      createdAt: now.toISOString(),
    };

    // 1. In-memory push
    inventoryMovements.unshift(movementRecord);

    // 2. Database insert
    if (isDatabaseConnected()) {
      try {
        const doc = await InventoryMovement.create({
          id,
          ...movementData,
          createdAt: now,
        });
        return doc;
      } catch (err) {
        console.warn("⚠️  [Inventory Repo] Could not persist movement to DB:", (err as Error).message);
      }
    }

    return movementRecord;
  },

  async findMovements(
    filters: { itemId?: string; sku?: string; reason?: string },
    pagination?: PaginationOptions
  ): Promise<{ movements: any[]; total: number }> {
    await ensureInventorySeeded();

    if (isDatabaseConnected()) {
      const query: any = {};
      if (filters.itemId) query.inventoryItemId = filters.itemId;
      if (filters.sku) query.sku = new RegExp(`^${filters.sku}$`, "i");
      if (filters.reason) query.reason = filters.reason;

      const total = await InventoryMovement.countDocuments(query);
      let queryExec = InventoryMovement.find(query).sort({ createdAt: -1 });
      if (pagination) {
        const skip = (pagination.page - 1) * pagination.limit;
        queryExec = queryExec.skip(skip).limit(pagination.limit);
      }
      const movements = await queryExec.exec();
      return { movements, total };
    }

    let movements = [...inventoryMovements];
    if (filters.itemId) {
      movements = movements.filter((m) => m.inventoryItemId === filters.itemId);
    }
    if (filters.sku) {
      movements = movements.filter((m) => m.sku.toLowerCase() === filters.sku!.toLowerCase());
    }
    if (filters.reason) {
      movements = movements.filter((m) => m.reason === filters.reason);
    }

    const total = movements.length;
    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      movements = movements.slice(skip, skip + pagination.limit);
    }

    return { movements, total };
  },

  async syncProductVariantStock(sku: string, newStock: number): Promise<void> {
    if (!sku) return;
    try {
      if (isDatabaseConnected()) {
        await Product.updateOne(
          { "storageOptions.sku": sku },
          { $set: { "storageOptions.$.stock": newStock } }
        );
      }
    } catch {
    }
  },
};
