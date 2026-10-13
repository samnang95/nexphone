import type { Request, Response } from "express";
import { inventoryService } from "../services/inventory.service";

/**
 * 1. Get all inventory items (with optional filters)
 */
export async function getInventory(req: Request, res: Response): Promise<void> {
  const query = (res.locals.parsedQuery || req.query) as any;
  const result = await inventoryService.getInventory(query);

  // If client requests paginated envelope format
  if (req.query.format === "paginated" || req.query.detailed === "true") {
    res.json({
      success: true,
      items: result.items,
      total: result.total,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 100,
    });
    return;
  }

  // Bare array format for 100% compatibility with storefront & nexphone-admin
  res.json(result.items);
}

/**
 * Get inventory item by ID
 */
export async function getInventoryById(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const item = await inventoryService.getInventoryById(id);
  res.json(item);
}

/**
 * 1. Get Stock Availability (public / storefront / client)
 */
export async function getStockAvailability(req: Request, res: Response): Promise<void> {
  const { sku, productId } = req.query as { sku?: string; productId?: string };
  const availability = await inventoryService.getStockAvailability({ sku, productId });
  res.json({
    success: true,
    count: availability.length,
    availability: sku ? availability[0] : availability,
  });
}

/**
 * 2. Check Stock Before Purchase (pre-purchase verification)
 */
export async function checkStockBeforePurchase(req: Request, res: Response): Promise<void> {
  const body = req.body;
  const checkResult = await inventoryService.checkStockBeforePurchase(body);
  res.json({
    success: true,
    ...checkResult,
  });
}

/**
 * 3. Update Stock (Admin) - Manual adjustments (add, subtract, set)
 */
export async function adjustStock(req: Request, res: Response): Promise<void> {
  const user = req.auth?.user;
  const performer = user?.name ? `${user.name} (${user.email})` : undefined;
  const result = await inventoryService.adjustStock(req.body, performer);
  res.json(result);
}

/**
 * 4. Restock Products (Admin) - Replenish batch / purchase orders
 */
export async function restockProduct(req: Request, res: Response): Promise<void> {
  const identifier = String(req.params.id || req.body.inventoryItemId || req.body.sku || "");
  const user = req.auth?.user;
  const performer = user?.name ? `${user.name} (${user.email})` : undefined;
  const result = await inventoryService.restockProduct(identifier, req.body, performer);
  res.json({
    success: true,
    message: `Successfully restocked ${req.body.quantity} units for ${result.item.sku}.`,
    ...result,
  });
}

/**
 * 5. Get Low-Stock Products (Admin) - Stock alerts & reorder intelligence
 */
export async function getLowStockProducts(req: Request, res: Response): Promise<void> {
  const warehouse = req.query.warehouse as string | undefined;
  const result = await inventoryService.getLowStockProducts(warehouse);
  res.json({
    success: true,
    ...result,
  });
}

/**
 * 6. Track Stock Changes (Admin) - Movements & audit log
 */
export async function getStockMovements(req: Request, res: Response): Promise<void> {
  const query = (res.locals.parsedQuery || req.query) as any;
  const result = await inventoryService.getStockMovements(query);

  if (req.query.format === "paginated" || req.query.detailed === "true") {
    res.json({
      success: true,
      movements: result.movements,
      total: result.total,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 50,
    });
    return;
  }

  // Bare array format for 100% compatibility with nexphone-admin
  res.json(result.movements);
}

/**
 * Update low stock threshold and reorder point
 */
export async function updateThreshold(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await inventoryService.updateThreshold(id, req.body);
  res.json(result);
}

/**
 * Direct update of stock quantities / properties
 */
export async function updateStock(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const user = req.auth?.user;
  const performer = user?.name ? `${user.name} (${user.email})` : undefined;
  const result = await inventoryService.updateStock(id, req.body, performer);
  res.json({
    success: true,
    ...result,
  });
}
