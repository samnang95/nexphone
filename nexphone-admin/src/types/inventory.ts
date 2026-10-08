export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "overstocked";

export type StockMovementReason =
  | "restock_po"
  | "audit_correction"
  | "damage_writeoff"
  | "customer_return"
  | "warehouse_transfer";

export interface InventoryItem {
  readonly id: string;
  readonly productId: string;
  readonly productName: string;
  readonly brandName: string;
  readonly sku: string;
  readonly variantCapacity: string;
  readonly variantRam: string;
  readonly colorFinishes: readonly string[];
  readonly warehouse: string;
  readonly stockQuantity: number;
  readonly reservedQuantity: number;
  readonly availableQuantity: number;
  readonly lowStockThreshold: number;
  readonly reorderPoint: number;
  readonly unitCost: number;
  readonly retailPrice: number;
  readonly totalValue: number;
  readonly status: StockStatus;
  readonly lastRestocked: string;
  readonly updatedAt: string;
}

export interface InventoryMovement {
  readonly id: string;
  readonly inventoryItemId: string;
  readonly sku: string;
  readonly productName: string;
  readonly changeAmount: number;
  readonly previousStock: number;
  readonly newStock: number;
  readonly reason: StockMovementReason;
  readonly notes: string;
  readonly performedBy: string;
  readonly createdAt: string;
}

export interface InventoryFilterState {
  readonly search: string;
  readonly status: "all" | StockStatus;
  readonly warehouse: "all" | string;
  readonly brand: "all" | string;
  readonly onlyAlerts: boolean;
  readonly sortBy: "stockQuantity" | "availableQuantity" | "totalValue" | "productName" | "sku" | "status";
  readonly sortDirection: "asc" | "desc";
}

export interface UpdateInventoryPayload {
  readonly inventoryItemId: string;
  readonly type: "add" | "subtract" | "set";
  readonly quantity: number;
  readonly reason: StockMovementReason;
  readonly notes?: string;
  readonly performedBy?: string;
}

export interface InventoryMetrics {
  readonly totalUnits: number;
  readonly totalValue: number;
  readonly lowStockCount: number;
  readonly outOfStockCount: number;
  readonly healthyCount: number;
  readonly totalSkus: number;
}
