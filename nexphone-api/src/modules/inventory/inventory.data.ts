// Inventory Management Data & CRUD Endpoints
export interface InventoryItemRecord {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  sku: string;
  variantCapacity: string;
  variantRam: string;
  colorFinishes: string[];
  warehouse: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  reorderPoint: number;
  unitCost: number;
  retailPrice: number;
  totalValue: number;
  status: "in_stock" | "low_stock" | "out_of_stock" | "overstocked";
  lastRestocked: string;
  updatedAt: string;
}

export interface InventoryMovementRecord {
  id: string;
  inventoryItemId: string;
  sku: string;
  productName: string;
  changeAmount: number;
  previousStock: number;
  newStock: number;
  reason: "restock_po" | "audit_correction" | "damage_writeoff" | "customer_return" | "warehouse_transfer";
  notes: string;
  performedBy: string;
  createdAt: string;
}

export function calculateStockStatus(qty: number, threshold: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (qty <= 0) return "out_of_stock";
  if (qty <= threshold) return "low_stock";
  return "in_stock";
}

export const inventoryCatalog: InventoryItemRecord[] = [
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

export const inventoryMovements: InventoryMovementRecord[] = [
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
