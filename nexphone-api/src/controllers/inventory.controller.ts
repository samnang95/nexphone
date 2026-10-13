import type { Request, Response } from "express";
import { inventoryService } from "../services/inventory.service";

export async function getInventory(req: Request, res: Response): Promise<void> {
  const query = (res.locals.parsedQuery || req.query) as any;
  const result = await inventoryService.getInventory(query);
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

  res.json(result.items);
}

export async function getInventoryById(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const item = await inventoryService.getInventoryById(id);
  res.json(item);
}

export async function getStockAvailability(req: Request, res: Response): Promise<void> {
  const { sku, productId } = req.query as { sku?: string; productId?: string };
  const availability = await inventoryService.getStockAvailability({ sku, productId });
  res.json({
    success: true,
    count: availability.length,
    availability: sku ? availability[0] : availability,
  });
}

export async function checkStockBeforePurchase(req: Request, res: Response): Promise<void> {
  const body = req.body;
  const checkResult = await inventoryService.checkStockBeforePurchase(body);
  res.json({
    success: true,
    ...checkResult,
  });
}

export async function adjustStock(req: Request, res: Response): Promise<void> {
  const user = req.auth?.user;
  const performer = user?.name ? `${user.name} (${user.email})` : undefined;
  const result = await inventoryService.adjustStock(req.body, performer);
  res.json(result);
}

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

export async function getLowStockProducts(req: Request, res: Response): Promise<void> {
  const warehouse = req.query.warehouse as string | undefined;
  const result = await inventoryService.getLowStockProducts(warehouse);
  res.json({
    success: true,
    ...result,
  });
}

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

  res.json(result.movements);
}

export async function updateThreshold(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await inventoryService.updateThreshold(id, req.body);
  res.json(result);
}

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
