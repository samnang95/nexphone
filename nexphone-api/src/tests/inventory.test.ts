import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { inventoryCatalog } from "../data/inventory.data";

describe("Inventory API", () => {
  // ==========================================
  // 1. Get Stock Availability
  // ==========================================
  describe("1. Get Stock Availability", () => {
    it("GET /api/inventory/availability returns stock availability for all products", async () => {
      const res = await request(app).get("/api/inventory/availability");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.availability)).toBe(true);
      expect(res.body.availability.length).toBeGreaterThan(0);

      const first = res.body.availability[0];
      expect(first).toHaveProperty("sku");
      expect(first).toHaveProperty("productId");
      expect(first).toHaveProperty("inStock");
      expect(first).toHaveProperty("availableQuantity");
      expect(first).toHaveProperty("stockQuantity");
      expect(first).toHaveProperty("status");
    });

    it("GET /api/inventory/availability?sku=NX-PRO-256 returns availability for a specific SKU", async () => {
      const res = await request(app).get("/api/inventory/availability?sku=NX-PRO-256");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.availability.sku).toBe("NX-PRO-256");
      expect(res.body.availability.inStock).toBe(true);
      expect(res.body.availability.availableQuantity).toBeGreaterThan(0);
    });

    it("GET /api/inventory/availability?productId=prod-001 returns all variants of that product", async () => {
      const res = await request(app).get("/api/inventory/availability?productId=prod-001");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.availability)).toBe(true);
      expect(res.body.availability.length).toBeGreaterThanOrEqual(2);
      expect(res.body.availability.every((i: any) => i.productId === "prod-001")).toBe(true);
    });

    it("GET /api/inventory/availability?sku=UNKNOWN-SKU returns 404", async () => {
      const res = await request(app).get("/api/inventory/availability?sku=UNKNOWN-SKU");
      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 2. Check Stock Before Purchase
  // ==========================================
  describe("2. Check Stock Before Purchase", () => {
    it("POST /api/inventory/check-stock succeeds when requested stock is available", async () => {
      const res = await request(app)
        .post("/api/inventory/check-stock")
        .send({
          items: [
            { sku: "NX-PRO-256", quantity: 2 },
            { sku: "NX-LITE-128", quantity: 1 },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.available).toBe(true);
      expect(res.body.totalRequestedUnits).toBe(3);
      expect(res.body.issues).toHaveLength(0);
      expect(res.body.items).toHaveLength(2);
      expect(res.body.items[0].sufficientStock).toBe(true);
    });

    it("POST /api/inventory/check-stock flags items with excessive requested quantity", async () => {
      const res = await request(app)
        .post("/api/inventory/check-stock")
        .send({
          items: [{ sku: "NX-PRO-256", quantity: 999999 }],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.available).toBe(false);
      expect(res.body.issues.length).toBeGreaterThan(0);
      expect(res.body.items[0].sufficientStock).toBe(false);
    });

    it("POST /api/inventory/check-stock flags out-of-stock items (NX-FOLD-1TB)", async () => {
      const res = await request(app)
        .post("/api/inventory/check-stock")
        .send({
          items: [{ sku: "NX-FOLD-1TB", quantity: 1 }],
        });

      expect(res.status).toBe(200);
      expect(res.body.available).toBe(false);
      expect(res.body.items[0].availableQuantity).toBe(0);
      expect(res.body.items[0].sufficientStock).toBe(false);
      expect(res.body.issues[0]).toContain("out of stock");
    });

    it("POST /api/inventory/check-stock can resolve items by productId and variantCapacity", async () => {
      const res = await request(app)
        .post("/api/inventory/check-stock")
        .send({
          items: [{ productId: "prod-001", variantCapacity: "256GB", quantity: 1 }],
        });

      expect(res.status).toBe(200);
      expect(res.body.available).toBe(true);
      expect(res.body.items[0].sku).toBe("NX-PRO-256");
    });

    it("POST /api/inventory/check-stock rejects empty items array with 400", async () => {
      const res = await request(app)
        .post("/api/inventory/check-stock")
        .send({ items: [] });

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // 3. Update Stock (Admin)
  // ==========================================
  describe("3. Update Stock (Admin)", () => {
    it("POST /api/inventory/adjust adds stock and generates an audit movement", async () => {
      const initialItem = inventoryCatalog.find((i) => i.id === "inv-nx-lite-128")!;
      const prevStock = initialItem.stockQuantity;

      const res = await request(app)
        .post("/api/inventory/adjust")
        .send({
          inventoryItemId: "inv-nx-lite-128",
          type: "add",
          quantity: 20,
          reason: "restock_po",
          notes: "Received batch from warehouse transfer",
          performedBy: "Test Admin",
        });

      expect(res.status).toBe(200);
      expect(res.body.item.stockQuantity).toBe(prevStock + 20);
      expect(res.body.movement).toBeDefined();
      expect(res.body.movement.inventoryItemId).toBe("inv-nx-lite-128");
      expect(res.body.movement.changeAmount).toBe(20);
      expect(res.body.movement.reason).toBe("restock_po");
    });

    it("POST /api/inventory/adjust subtracts stock correctly", async () => {
      const currentItem = inventoryCatalog.find((i) => i.id === "inv-nx-lite-128")!;
      const prevStock = currentItem.stockQuantity;

      const res = await request(app)
        .post("/api/inventory/adjust")
        .send({
          inventoryItemId: "inv-nx-lite-128",
          type: "subtract",
          quantity: 5,
          reason: "damage_writeoff",
          notes: "Damaged box write-off",
        });

      expect(res.status).toBe(200);
      expect(res.body.item.stockQuantity).toBe(prevStock - 5);
      expect(res.body.movement.changeAmount).toBe(-5);
      expect(res.body.movement.reason).toBe("damage_writeoff");
    });

    it("POST /api/inventory/adjust rejects subtract that exceeds current stock", async () => {
      const res = await request(app)
        .post("/api/inventory/adjust")
        .send({
          inventoryItemId: "inv-nx-fold-1tb", // stock is 0
          type: "subtract",
          quantity: 10,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("cannot be negative");
    });

    it("POST /api/inventory/adjust sets exact stock value", async () => {
      const res = await request(app)
        .post("/api/inventory/adjust")
        .send({
          inventoryItemId: "inv-nx-lite-256",
          type: "set",
          quantity: 150,
          reason: "audit_correction",
          notes: "Annual cycle count adjustment",
        });

      expect(res.status).toBe(200);
      expect(res.body.item.stockQuantity).toBe(150);
    });

    it("PUT /api/inventory/:id/threshold updates low stock threshold and reorder point", async () => {
      const res = await request(app)
        .put("/api/inventory/inv-nx-pro-256/threshold")
        .send({
          lowStockThreshold: 45,
          reorderPoint: 65,
        });

      expect(res.status).toBe(200);
      expect(res.body.lowStockThreshold).toBe(45);
      expect(res.body.reorderPoint).toBe(65);
    });

    it("PATCH /api/inventory/:id/stock updates multiple inventory attributes", async () => {
      const res = await request(app)
        .patch("/api/inventory/inv-nx-pro-256/stock")
        .send({
          warehouse: "US-West Central Hub (SFO) - Building B",
          unitCost: 690,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.item.warehouse).toBe("US-West Central Hub (SFO) - Building B");
      expect(res.body.item.unitCost).toBe(690);
    });
  });

  // ==========================================
  // 4. Restock Products (Admin)
  // ==========================================
  describe("4. Restock Products (Admin)", () => {
    it("POST /api/inventory/:id/restock restocks inventory with PO number and updates totalValue", async () => {
      const currentItem = inventoryCatalog.find((i) => i.id === "inv-qtm-shield-512")!;
      const prevStock = currentItem.stockQuantity;

      const res = await request(app)
        .post("/api/inventory/inv-qtm-shield-512/restock")
        .send({
          quantity: 25,
          poNumber: "PO-2026-9921",
          unitCost: 1100,
          notes: "Quarterly batch delivery from OEM factory",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.item.stockQuantity).toBe(prevStock + 25);
      expect(res.body.item.unitCost).toBe(1100);
      expect(res.body.item.totalValue).toBe((prevStock + 25) * 1100);
      expect(res.body.movement.reason).toBe("restock_po");
      expect(res.body.movement.notes).toContain("PO-2026-9921");
    });

    it("POST /api/inventory/restock accepts SKU in request body", async () => {
      const res = await request(app)
        .post("/api/inventory/restock")
        .send({
          sku: "NX-FOLD-1TB",
          quantity: 15,
          poNumber: "PO-RESTOCK-FOLD",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.item.stockQuantity).toBeGreaterThanOrEqual(15);
      expect(res.body.item.status).not.toBe("out_of_stock");
    });

    it("POST /api/inventory/restock rejects invalid quantity with 400", async () => {
      const res = await request(app)
        .post("/api/inventory/restock")
        .send({
          sku: "NX-PRO-256",
          quantity: -5,
        });

      expect(res.status).toBe(400);
    });

    it("POST /api/inventory/restock returns 404 for unknown item", async () => {
      const res = await request(app)
        .post("/api/inventory/restock")
        .send({
          sku: "UNKNOWN-SKU-999",
          quantity: 10,
        });

      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 5. Get Low-Stock Products (Admin)
  // ==========================================
  describe("5. Get Low-Stock Products (Admin)", () => {
    it("GET /api/inventory/low-stock returns items requiring reorder with recommendations", async () => {
      const res = await request(app).get("/api/inventory/low-stock");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("totalAlerts");
      expect(res.body).toHaveProperty("criticalCount");
      expect(res.body).toHaveProperty("warningCount");
      expect(Array.isArray(res.body.items)).toBe(true);

      if (res.body.items.length > 0) {
        const item = res.body.items[0];
        expect(item).toHaveProperty("recommendedReorderQuantity");
        expect(item).toHaveProperty("urgencyLevel");
        expect(["critical", "warning"]).toContain(item.urgencyLevel);
      }
    });

    it("GET /api/inventory/alerts works as an alias for low-stock", async () => {
      const res = await request(app).get("/api/inventory/alerts");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("totalAlerts");
    });

    it("GET /api/inventory/low-stock?warehouse=SFO filters by warehouse", async () => {
      const res = await request(app).get("/api/inventory/low-stock?warehouse=SFO");
      expect(res.status).toBe(200);
      expect(res.body.items.every((i: any) => i.warehouse.toLowerCase().includes("sfo"))).toBe(true);
    });
  });

  // ==========================================
  // 6. Track Stock Changes (Admin)
  // ==========================================
  describe("6. Track Stock Changes (Admin)", () => {
    it("GET /api/inventory-movements returns movement history as a bare array", async () => {
      const res = await request(app).get("/api/inventory-movements");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const mov = res.body[0];
      expect(mov).toHaveProperty("id");
      expect(mov).toHaveProperty("sku");
      expect(mov).toHaveProperty("changeAmount");
      expect(mov).toHaveProperty("reason");
      expect(mov).toHaveProperty("performedBy");
      expect(mov).toHaveProperty("createdAt");
    });

    it("GET /api/inventory/movements?format=paginated returns paginated envelope", async () => {
      const res = await request(app).get("/api/inventory/movements?format=paginated&limit=5");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.movements)).toBe(true);
      expect(res.body).toHaveProperty("total");
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(5);
    });

    it("GET /api/inventory-movements?sku=NX-PRO-256 filters movements by SKU", async () => {
      const res = await request(app).get("/api/inventory-movements?sku=NX-PRO-256");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((m: any) => m.sku === "NX-PRO-256")).toBe(true);
    });
  });

  // ==========================================
  // 7. General Inventory Retrieval & Filtering
  // ==========================================
  describe("7. General Inventory Retrieval & Filtering", () => {
    it("GET /api/inventory returns full list of inventory items", async () => {
      const res = await request(app).get("/api/inventory");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("GET /api/inventory?status=in_stock filters items", async () => {
      const res = await request(app).get("/api/inventory?status=in_stock");
      expect(res.status).toBe(200);
      expect(res.body.every((i: any) => i.status === "in_stock")).toBe(true);
    });

    it("GET /api/inventory?search=Fold performs case-insensitive text search", async () => {
      const res = await request(app).get("/api/inventory?search=Fold");
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.some((i: any) => i.productName.toLowerCase().includes("fold"))).toBe(true);
    });

    it("GET /api/inventory/:id returns a single inventory item", async () => {
      const res = await request(app).get("/api/inventory/inv-nx-pro-256");
      expect(res.status).toBe(200);
      expect(res.body.id).toBe("inv-nx-pro-256");
      expect(res.body.sku).toBe("NX-PRO-256");
    });

    it("GET /api/inventory/nonexistent-id returns 404", async () => {
      const res = await request(app).get("/api/inventory/nonexistent-id");
      expect(res.status).toBe(404);
    });
  });
});
