import { Router, type Request, type Response } from "express";
import { InventoryItemRecord, InventoryMovementRecord, calculateStockStatus, inventoryCatalog, inventoryMovements } from "./inventory.data";

export const inventoryRouter = Router();

// Inventory Endpoints
inventoryRouter.get("/api/inventory", (req: Request, res: Response) => {
  const { search, status, warehouse, onlyAlerts } = req.query;
  let items = [...inventoryCatalog];

  if (status && typeof status === "string" && status !== "all") {
    items = items.filter((item) => item.status === status);
  }

  if (warehouse && typeof warehouse === "string" && warehouse !== "all") {
    items = items.filter((item) => item.warehouse.toLowerCase().includes(warehouse.toLowerCase()));
  }

  if (onlyAlerts === "true") {
    items = items.filter((item) => item.status === "low_stock" || item.status === "out_of_stock");
  }

  if (search && typeof search === "string" && search.trim() !== "") {
    const q = search.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.sku.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.brandName.toLowerCase().includes(q) ||
        item.warehouse.toLowerCase().includes(q)
    );
  }

  res.json(items);
});

inventoryRouter.get("/api/inventory/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const item = inventoryCatalog.find((i) => i.id === id);
  if (!item) {
    res.status(404).json({ error: "Inventory item not found", id });
    return;
  }
  res.json(item);
});

inventoryRouter.post("/api/inventory/adjust", (req: Request, res: Response) => {
  const { inventoryItemId, type, quantity, reason, notes, performedBy } = req.body;
  const index = inventoryCatalog.findIndex((i) => i.id === inventoryItemId);
  const current = inventoryCatalog[index];

  if (index === -1 || !current) {
    res.status(404).json({ error: "Inventory item not found", inventoryItemId });
    return;
  }

  const prevStock = current.stockQuantity;
  let newStock = prevStock;
  const changeAmountNum = Number(quantity) || 0;

  if (type === "add") {
    newStock = prevStock + changeAmountNum;
  } else if (type === "subtract") {
    newStock = Math.max(0, prevStock - changeAmountNum);
  } else if (type === "set") {
    newStock = Math.max(0, changeAmountNum);
  }

  const changeDelta = newStock - prevStock;
  const newStatus = calculateStockStatus(newStock, current.lowStockThreshold);
  const newAvailable = Math.max(0, newStock - current.reservedQuantity);
  const newTotalVal = newStock * current.unitCost;

  const updated: InventoryItemRecord = {
    ...current,
    stockQuantity: newStock,
    availableQuantity: newAvailable,
    totalValue: newTotalVal,
    status: newStatus,
    lastRestocked: type === "add" ? new Date().toISOString() : current.lastRestocked,
    updatedAt: new Date().toISOString(),
  };

  inventoryCatalog[index] = updated;

  const movement: InventoryMovementRecord = {
    id: `mov-${Date.now().toString(36)}`,
    inventoryItemId,
    sku: current.sku,
    productName: current.productName,
    changeAmount: changeDelta,
    previousStock: prevStock,
    newStock,
    reason: reason || "audit_correction",
    notes: notes || "Manual inventory adjustment via Admin console",
    performedBy: performedBy || "System Admin",
    createdAt: new Date().toISOString(),
  };

  inventoryMovements.unshift(movement);

  res.json({ item: updated, movement });
});

inventoryRouter.put("/api/inventory/:id/threshold", (req: Request, res: Response) => {
  const { id } = req.params;
  const { lowStockThreshold, reorderPoint } = req.body;
  const index = inventoryCatalog.findIndex((i) => i.id === id);
  const current = inventoryCatalog[index];

  if (index === -1 || !current) {
    res.status(404).json({ error: "Inventory item not found", id });
    return;
  }

  const newThreshold = Number(lowStockThreshold) ?? current.lowStockThreshold;
  const newReorder = Number(reorderPoint) ?? current.reorderPoint;
  const newStatus = calculateStockStatus(current.stockQuantity, newThreshold);

  const updated: InventoryItemRecord = {
    ...current,
    lowStockThreshold: newThreshold,
    reorderPoint: newReorder,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  inventoryCatalog[index] = updated;
  res.json(updated);
});

inventoryRouter.get("/api/inventory-movements", (req: Request, res: Response) => {
  const { itemId } = req.query;
  let movements = [...inventoryMovements];

  if (itemId && typeof itemId === "string") {
    movements = movements.filter((m) => m.inventoryItemId === itemId);
  }

  res.json(movements);
});
