import { Router } from "express";
import { optionalAuthenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  queryInventorySchema,
  checkStockSchema,
  adjustStockSchema,
  restockSchema,
  updateThresholdSchema,
  updateStockSchema,
  queryMovementsSchema,
} from "../validators/inventory.validator";
import * as controller from "../controllers/inventory.controller";

export const inventoryRouter = Router();

// ==========================================
// 1. Stock Availability & Verification (Public / Storefront / Client)
// ==========================================
inventoryRouter.get(["/api/inventory/availability", "/inventory/availability"],optionalAuthenticate,controller.getStockAvailability);
inventoryRouter.post(["/api/inventory/check-stock", "/inventory/check-stock"],optionalAuthenticate,validate({ body: checkStockSchema }),controller.checkStockBeforePurchase);

// ==========================================
// 2. Low-Stock Intelligence & Alerts (Admin / Logistics)
// ==========================================
inventoryRouter.get(["/api/inventory/low-stock", "/inventory/low-stock", "/api/inventory/alerts", "/inventory/alerts"],optionalAuthenticate,controller.getLowStockProducts);

// ==========================================
// 3. Stock Adjustments & Restocking (Admin)
// ==========================================
inventoryRouter.post(["/api/inventory/adjust", "/inventory/adjust"],optionalAuthenticate,validate({ body: adjustStockSchema }),controller.adjustStock);
inventoryRouter.post(["/api/inventory/restock", "/inventory/restock"],optionalAuthenticate,validate({ body: restockSchema }),controller.restockProduct);
inventoryRouter.post(["/api/inventory/:id/restock", "/inventory/:id/restock"],optionalAuthenticate,validate({ body: restockSchema }),controller.restockProduct);
inventoryRouter.put(["/api/inventory/:id/threshold", "/inventory/:id/threshold"],optionalAuthenticate,validate({ body: updateThresholdSchema }),controller.updateThreshold);
inventoryRouter.put(["/api/inventory/:id/stock", "/inventory/:id/stock"],optionalAuthenticate,validate({ body: updateStockSchema }),controller.updateStock);
inventoryRouter.patch(["/api/inventory/:id/stock", "/inventory/:id/stock"],optionalAuthenticate,validate({ body: updateStockSchema }),controller.updateStock);

// ==========================================
// 4. Stock Change Audit Log & Movements (Admin)
// ==========================================
inventoryRouter.get(["/api/inventory/movements","/inventory/movements","/api/inventory-movements","/inventory-movements"],optionalAuthenticate,validate({ query: queryMovementsSchema }),controller.getStockMovements);

// ==========================================
// 5. Inventory Collection & Detail
// (Must be declared after static sub-paths)
// ==========================================
inventoryRouter.get(["/api/inventory", "/inventory"],optionalAuthenticate,validate({ query: queryInventorySchema }),controller.getInventory);
inventoryRouter.get(["/api/inventory/:id", "/inventory/:id"],optionalAuthenticate,controller.getInventoryById);