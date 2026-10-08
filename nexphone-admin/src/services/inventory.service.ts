import type {
  InventoryItem,
  InventoryMovement,
  InventoryFilterState,
  UpdateInventoryPayload,
  InventoryMetrics,
} from "@/types/inventory";
import { appConfig } from "@/config/env";

function calculateStockStatus(qty: number, threshold: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (qty <= 0) return "out_of_stock";
  if (qty <= threshold) return "low_stock";
  return "in_stock";
}

let memoryInventory: InventoryItem[] = [
  {
    id: "inv-nx-pro-256",
    productId: "prod-001",
    productName: "NexPhone Pro Max X",
    brandName: "NexPhone Labs",
    sku: "NX-PRO-256",
    variantCapacity: "256GB",
    variantRam: "12GB LPDDR5X",
    colorFinishes: ["Titanium Space Gray", "Silver Frost", "Deep Cobalt"],
    warehouse: "US-West Central Hub (SFO)",
    stockQuantity: 184,
    reservedQuantity: 14,
    availableQuantity: 170,
    lowStockThreshold: 30,
    reorderPoint: 50,
    unitCost: 680,
    retailPrice: 1199,
    totalValue: 125120,
    status: "in_stock",
    lastRestocked: "2026-10-02T14:30:00.000Z",
    updatedAt: "2026-10-07T18:00:00.000Z",
  },
  {
    id: "inv-nx-pro-512",
    productId: "prod-001",
    productName: "NexPhone Pro Max X",
    brandName: "NexPhone Labs",
    sku: "NX-PRO-512",
    variantCapacity: "512GB",
    variantRam: "16GB LPDDR5X",
    colorFinishes: ["Titanium Space Gray", "Silver Frost", "Deep Cobalt"],
    warehouse: "US-West Central Hub (SFO)",
    stockQuantity: 96,
    reservedQuantity: 8,
    availableQuantity: 88,
    lowStockThreshold: 25,
    reorderPoint: 40,
    unitCost: 750,
    retailPrice: 1399,
    totalValue: 72000,
    status: "in_stock",
    lastRestocked: "2026-09-28T09:15:00.000Z",
    updatedAt: "2026-10-06T12:00:00.000Z",
  },
  {
    id: "inv-nx-pro-1tb",
    productId: "prod-001",
    productName: "NexPhone Pro Max X",
    brandName: "NexPhone Labs",
    sku: "NX-PRO-1TB",
    variantCapacity: "1TB",
    variantRam: "16GB LPDDR5X",
    colorFinishes: ["Titanium Space Gray", "Desert Sand Gold"],
    warehouse: "US-West Central Hub (SFO)",
    stockQuantity: 18,
    reservedQuantity: 5,
    availableQuantity: 13,
    lowStockThreshold: 25,
    reorderPoint: 35,
    unitCost: 890,
    retailPrice: 1599,
    totalValue: 16020,
    status: "low_stock",
    lastRestocked: "2026-09-15T11:00:00.000Z",
    updatedAt: "2026-10-07T16:45:00.000Z",
  },
  {
    id: "inv-nx-ent-256",
    productId: "prod-002",
    productName: "NexPhone Enterprise Secure",
    brandName: "NexPhone Labs",
    sku: "NX-ENT-256",
    variantCapacity: "256GB",
    variantRam: "16GB ECC LPDDR5X",
    colorFinishes: ["Tactical Matte Black", "Armor Gunmetal"],
    warehouse: "EU-Central Hub (FRA)",
    stockQuantity: 520,
    reservedQuantity: 65,
    availableQuantity: 455,
    lowStockThreshold: 80,
    reorderPoint: 120,
    unitCost: 790,
    retailPrice: 1399,
    totalValue: 410800,
    status: "in_stock",
    lastRestocked: "2026-10-04T10:00:00.000Z",
    updatedAt: "2026-10-07T08:30:00.000Z",
  },
  {
    id: "inv-nx-ent-512",
    productId: "prod-002",
    productName: "NexPhone Enterprise Secure",
    brandName: "NexPhone Labs",
    sku: "NX-ENT-512",
    variantCapacity: "512GB",
    variantRam: "16GB ECC LPDDR5X",
    colorFinishes: ["Tactical Matte Black", "Armor Gunmetal"],
    warehouse: "EU-Central Hub (FRA)",
    stockQuantity: 310,
    reservedQuantity: 40,
    availableQuantity: 270,
    lowStockThreshold: 60,
    reorderPoint: 100,
    unitCost: 860,
    retailPrice: 1599,
    totalValue: 266600,
    status: "in_stock",
    lastRestocked: "2026-09-29T16:20:00.000Z",
    updatedAt: "2026-10-06T14:10:00.000Z",
  },
  {
    id: "inv-nx-fold-512",
    productId: "prod-003",
    productName: "NexPhone Titanium Fold",
    brandName: "Titanium Dynamics",
    sku: "NX-FOLD-512",
    variantCapacity: "512GB",
    variantRam: "16GB LPDDR5X",
    colorFinishes: ["Astral Obsidian", "Champagne Pearl"],
    warehouse: "APAC Hub (HND)",
    stockQuantity: 14,
    reservedQuantity: 4,
    availableQuantity: 10,
    lowStockThreshold: 20,
    reorderPoint: 30,
    unitCost: 1100,
    retailPrice: 1899,
    totalValue: 15400,
    status: "low_stock",
    lastRestocked: "2026-09-18T13:40:00.000Z",
    updatedAt: "2026-10-07T11:20:00.000Z",
  },
  {
    id: "inv-nx-fold-1tb",
    productId: "prod-003",
    productName: "NexPhone Titanium Fold",
    brandName: "Titanium Dynamics",
    sku: "NX-FOLD-1TB",
    variantCapacity: "1TB",
    variantRam: "24GB LPDDR5X",
    colorFinishes: ["Astral Obsidian"],
    warehouse: "APAC Hub (HND)",
    stockQuantity: 0,
    reservedQuantity: 0,
    availableQuantity: 0,
    lowStockThreshold: 15,
    reorderPoint: 25,
    unitCost: 1250,
    retailPrice: 2199,
    totalValue: 0,
    status: "out_of_stock",
    lastRestocked: "2026-08-30T09:00:00.000Z",
    updatedAt: "2026-10-07T09:00:00.000Z",
  },
  {
    id: "inv-nx-lite-128",
    productId: "prod-004",
    productName: "NexPhone Lite",
    brandName: "Aero Dynamic Tech",
    sku: "NX-LITE-128",
    variantCapacity: "128GB",
    variantRam: "8GB LPDDR5",
    colorFinishes: ["Midnight Blue", "Mint Emerald", "Chalk White"],
    warehouse: "US-West Central Hub (SFO)",
    stockQuantity: 310,
    reservedQuantity: 28,
    availableQuantity: 282,
    lowStockThreshold: 50,
    reorderPoint: 75,
    unitCost: 320,
    retailPrice: 599,
    totalValue: 99200,
    status: "in_stock",
    lastRestocked: "2026-10-01T15:10:00.000Z",
    updatedAt: "2026-10-06T17:00:00.000Z",
  },
  {
    id: "inv-nx-lite-256",
    productId: "prod-004",
    productName: "NexPhone Lite",
    brandName: "Aero Dynamic Tech",
    sku: "NX-LITE-256",
    variantCapacity: "256GB",
    variantRam: "8GB LPDDR5",
    colorFinishes: ["Midnight Blue", "Blush Pink"],
    warehouse: "US-West Central Hub (SFO)",
    stockQuantity: 145,
    reservedQuantity: 12,
    availableQuantity: 133,
    lowStockThreshold: 40,
    reorderPoint: 60,
    unitCost: 360,
    retailPrice: 679,
    totalValue: 52200,
    status: "in_stock",
    lastRestocked: "2026-09-25T12:00:00.000Z",
    updatedAt: "2026-10-05T19:30:00.000Z",
  },
  {
    id: "inv-qtm-shield-512",
    productId: "prod-005",
    productName: "Quantum Cipher Sentinel",
    brandName: "Quantum Devices Inc",
    sku: "QTM-CIPHER-512",
    variantCapacity: "512GB",
    variantRam: "16GB CryptoRAM",
    colorFinishes: ["Obsidian Shield"],
    warehouse: "EU-Central Hub (FRA)",
    stockQuantity: 8,
    reservedQuantity: 2,
    availableQuantity: 6,
    lowStockThreshold: 15,
    reorderPoint: 25,
    unitCost: 1150,
    retailPrice: 1950,
    totalValue: 9200,
    status: "low_stock",
    lastRestocked: "2026-09-10T14:00:00.000Z",
    updatedAt: "2026-10-07T15:00:00.000Z",
  },
];

const memoryMovements: InventoryMovement[] = [
  {
    id: "mov-001",
    inventoryItemId: "inv-nx-pro-256",
    sku: "NX-PRO-256",
    productName: "NexPhone Pro Max X",
    changeAmount: 50,
    previousStock: 134,
    newStock: 184,
    reason: "restock_po",
    notes: "PO-8491 shipment received from Fremont Advanced Manufacturing facility",
    performedBy: "Alex Chen (Logistics Mgr)",
    createdAt: "2026-10-02T14:30:00.000Z",
  },
  {
    id: "mov-002",
    inventoryItemId: "inv-nx-fold-1tb",
    sku: "NX-FOLD-1TB",
    productName: "NexPhone Titanium Fold",
    changeAmount: -4,
    previousStock: 4,
    newStock: 0,
    reason: "warehouse_transfer",
    notes: "Expedited transfer to Tokyo Flagship Store VIP showroom demo fleet",
    performedBy: "Kenji Sato (APAC Ops)",
    createdAt: "2026-10-07T09:00:00.000Z",
  },
  {
    id: "mov-003",
    inventoryItemId: "inv-qtm-shield-512",
    sku: "QTM-CIPHER-512",
    productName: "Quantum Cipher Sentinel",
    changeAmount: -2,
    previousStock: 10,
    newStock: 8,
    reason: "damage_writeoff",
    notes: "Package damaged in transit during air freight security clearance",
    performedBy: "Marcus Vance (Security Auditing)",
    createdAt: "2026-10-07T15:00:00.000Z",
  },
];

export const inventoryService = {
  /**
   * Fetch inventory items with optional filtering
   */
  async fetchInventory(filters?: Partial<InventoryFilterState>): Promise<InventoryItem[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== "all") params.set("status", filters.status);
      if (filters?.warehouse && filters.warehouse !== "all") params.set("warehouse", filters.warehouse);
      if (filters?.onlyAlerts) params.set("onlyAlerts", "true");
      if (filters?.search?.trim()) params.set("search", filters.search.trim());

      const queryStr = params.toString();
      const endpoint = `${appConfig.apiUrl}/inventory${queryStr ? `?${queryStr}` : ""}`;

      const res = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          memoryInventory = data;
          return this.applyLocalFilters(memoryInventory, filters);
        }
      }
    } catch {
      // Local fallback
    }

    return this.applyLocalFilters(memoryInventory, filters);
  },

  /**
   * Get single inventory item by ID
   */
  async getInventoryItem(id: string): Promise<InventoryItem | null> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/inventory/${encodeURIComponent(id)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Local fallback
    }

    return memoryInventory.find((i) => i.id === id) || null;
  },

  /**
   * Adjust stock (Add, Deduct, Set) and record movement
   */
  async adjustStock(
    payload: UpdateInventoryPayload
  ): Promise<{ item: InventoryItem; movement: InventoryMovement }> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/inventory/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const data = await res.json();
        const idx = memoryInventory.findIndex((i) => i.id === payload.inventoryItemId);
        if (idx !== -1) {
          memoryInventory[idx] = data.item;
        }
        memoryMovements.unshift(data.movement);
        return data;
      }
    } catch {
      // Local fallback
    }

    // Local calculation
    const idx = memoryInventory.findIndex((i) => i.id === payload.inventoryItemId);
    const current = memoryInventory[idx];
    if (idx === -1 || !current) {
      throw new Error("Item not found");
    }

    const prevStock = current.stockQuantity;
    let newStock = prevStock;
    const qty = Number(payload.quantity) || 0;

    if (payload.type === "add") newStock = prevStock + qty;
    else if (payload.type === "subtract") newStock = Math.max(0, prevStock - qty);
    else if (payload.type === "set") newStock = Math.max(0, qty);

    const changeDelta = newStock - prevStock;
    const newStatus = calculateStockStatus(newStock, current.lowStockThreshold);
    const newAvail = Math.max(0, newStock - current.reservedQuantity);
    const newTotalVal = newStock * current.unitCost;

    const updatedItem: InventoryItem = {
      ...current,
      stockQuantity: newStock,
      availableQuantity: newAvail,
      totalValue: newTotalVal,
      status: newStatus,
      lastRestocked: payload.type === "add" ? new Date().toISOString() : current.lastRestocked,
      updatedAt: new Date().toISOString(),
    };

    memoryInventory[idx] = updatedItem;

    const movement: InventoryMovement = {
      id: `mov-${Date.now().toString(36)}`,
      inventoryItemId: current.id,
      sku: current.sku,
      productName: current.productName,
      changeAmount: changeDelta,
      previousStock: prevStock,
      newStock,
      reason: payload.reason,
      notes: payload.notes || "Manual stock adjustment",
      performedBy: payload.performedBy || "System Admin",
      createdAt: new Date().toISOString(),
    };

    memoryMovements.unshift(movement);

    return { item: updatedItem, movement };
  },

  /**
   * Update low stock alert threshold and reorder point
   */
  async updateThreshold(
    id: string,
    lowStockThreshold: number,
    reorderPoint: number
  ): Promise<InventoryItem> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/inventory/${encodeURIComponent(id)}/threshold`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lowStockThreshold, reorderPoint }),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const updated = await res.json();
        const idx = memoryInventory.findIndex((i) => i.id === id);
        if (idx !== -1) memoryInventory[idx] = updated;
        return updated;
      }
    } catch {
      // Local fallback
    }

    const idx = memoryInventory.findIndex((i) => i.id === id);
    const current = memoryInventory[idx];
    if (idx === -1 || !current) throw new Error("Item not found");

    const updated: InventoryItem = {
      ...current,
      lowStockThreshold,
      reorderPoint,
      status: calculateStockStatus(current.stockQuantity, lowStockThreshold),
      updatedAt: new Date().toISOString(),
    };

    memoryInventory[idx] = updated;
    return updated;
  },

  /**
   * Fetch inventory movements / audit trail
   */
  async fetchMovements(itemId?: string): Promise<InventoryMovement[]> {
    try {
      const endpoint = `${appConfig.apiUrl}/inventory-movements${itemId ? `?itemId=${encodeURIComponent(itemId)}` : ""}`;
      const res = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // Local fallback
    }

    if (itemId) {
      return memoryMovements.filter((m) => m.inventoryItemId === itemId);
    }
    return memoryMovements;
  },

  /**
   * Calculate summary KPI metrics
   */
  calculateMetrics(items: InventoryItem[]): InventoryMetrics {
    const totalUnits = items.reduce((sum, item) => sum + item.stockQuantity, 0);
    const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStockCount = items.filter((item) => item.status === "low_stock").length;
    const outOfStockCount = items.filter((item) => item.status === "out_of_stock").length;
    const healthyCount = items.filter((item) => item.status === "in_stock").length;

    return {
      totalUnits,
      totalValue,
      lowStockCount,
      outOfStockCount,
      healthyCount,
      totalSkus: items.length,
    };
  },

  /**
   * Local filter & sort helper
   */
  applyLocalFilters(items: InventoryItem[], filters?: Partial<InventoryFilterState>): InventoryItem[] {
    let result = [...items];

    if (filters?.status && filters.status !== "all") {
      result = result.filter((item) => item.status === filters.status);
    }

    if (filters?.warehouse && filters.warehouse !== "all") {
      result = result.filter((item) => item.warehouse.includes(filters.warehouse as string));
    }

    if (filters?.onlyAlerts) {
      result = result.filter((item) => item.status === "low_stock" || item.status === "out_of_stock");
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.sku.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q) ||
          item.brandName.toLowerCase().includes(q) ||
          item.warehouse.toLowerCase().includes(q) ||
          item.variantCapacity.toLowerCase().includes(q)
      );
    }

    if (filters?.sortBy) {
      result.sort((a, b) => {
        const valA = a[filters.sortBy as keyof InventoryItem];
        const valB = b[filters.sortBy as keyof InventoryItem];

        if (typeof valA === "number" && typeof valB === "number") {
          return filters.sortDirection === "asc" ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return filters.sortDirection === "asc" ? -1 : 1;
        if (strA > strB) return filters.sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  },
};
