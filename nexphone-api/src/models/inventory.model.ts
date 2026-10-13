import mongoose, { Schema, Document, Model } from "mongoose";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "overstocked";

export type StockMovementReason =
  | "restock_po"
  | "audit_correction"
  | "damage_writeoff"
  | "customer_return"
  | "warehouse_transfer"
  | "order_fulfillment"
  | "order_cancellation";

export interface InventoryItemDocument extends Document {
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
  status: StockStatus;
  lastRestocked: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryMovementDocument extends Document {
  id: string;
  inventoryItemId: string;
  sku: string;
  productName: string;
  changeAmount: number;
  previousStock: number;
  newStock: number;
  reason: StockMovementReason;
  notes: string;
  performedBy: string;
  createdAt: Date;
}

const InventoryItemSchema = new Schema<InventoryItemDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true, index: true },
    productName: { type: String, required: true, trim: true },
    brandName: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    variantCapacity: { type: String, required: true, trim: true },
    variantRam: { type: String, required: true, trim: true },
    colorFinishes: { type: [String], default: [] },
    warehouse: { type: String, required: true, trim: true, index: true },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    reservedQuantity: { type: Number, required: true, min: 0, default: 0 },
    availableQuantity: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, required: true, min: 0, default: 20 },
    reorderPoint: { type: Number, required: true, min: 0, default: 30 },
    unitCost: { type: Number, required: true, min: 0, default: 0 },
    retailPrice: { type: Number, required: true, min: 0, default: 0 },
    totalValue: { type: Number, required: true, min: 0, default: 0 },
    status: {
      type: String,
      enum: ["in_stock", "low_stock", "out_of_stock", "overstocked"],
      default: "in_stock",
      index: true,
    },
    lastRestocked: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

InventoryItemSchema.index({
  productName: "text",
  brandName: "text",
  sku: "text",
  warehouse: "text",
});

const InventoryMovementSchema = new Schema<InventoryMovementDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    inventoryItemId: { type: String, required: true, index: true },
    sku: { type: String, required: true, index: true, uppercase: true },
    productName: { type: String, required: true },
    changeAmount: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: {
      type: String,
      enum: [
        "restock_po",
        "audit_correction",
        "damage_writeoff",
        "customer_return",
        "warehouse_transfer",
        "order_fulfillment",
        "order_cancellation",
      ],
      required: true,
      index: true,
    },
    notes: { type: String, default: "" },
    performedBy: { type: String, default: "System Admin" },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
  }
);

export const InventoryItem: Model<InventoryItemDocument> = mongoose.models.InventoryItem || mongoose.model<InventoryItemDocument>("InventoryItem", InventoryItemSchema);
export const InventoryMovement: Model<InventoryMovementDocument> = mongoose.models.InventoryMovement || mongoose.model<InventoryMovementDocument>("InventoryMovement", InventoryMovementSchema);