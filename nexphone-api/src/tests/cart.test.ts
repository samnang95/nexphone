import { describe, expect, it, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app";

describe("Shopping Cart API", () => {
  const sessionId = "test-cart-session-123";
  const client = {
    get: (url: string) => request(app).get(url).set("x-session-id", sessionId),
    post: (url: string) => request(app).post(url).set("x-session-id", sessionId),
    put: (url: string) => request(app).put(url).set("x-session-id", sessionId),
    patch: (url: string) => request(app).patch(url).set("x-session-id", sessionId),
    delete: (url: string) => request(app).delete(url).set("x-session-id", sessionId),
  };

  beforeEach(async () => {
    // Clear cart before each test
    await client.delete("/api/cart");
  });

  // ==========================================
  // 1. Get Cart
  // ==========================================
  describe("1. Get Cart", () => {
    it("GET /api/cart returns an initialized empty cart for new session", async () => {
      const res = await client.get("/api/cart");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id");
      expect(res.body.items).toEqual([]);
      expect(res.body.totalItems).toBe(0);
      expect(res.body.subtotal).toBe(0);
      expect(res.body.shipping).toBe(0);
      expect(res.body.discount).toBe(0);
      expect(res.body.total).toBe(0);
    });
  });

  // ==========================================
  // 2. Add to Cart
  // ==========================================
  describe("2. Add to Cart", () => {
    it("POST /api/cart/items adds a phone variant to the cart", async () => {
      const res = await client
        .post("/api/cart/items")
        .send({
          productId: "prod-001",
          color: { id: "titanium-space-gray", name: "Titanium Space Gray", hex: "#4A4D52" },
          storage: { id: "256gb", capacity: "256GB", ram: "12GB LPDDR5X", sku: "NX-PRO-256", price: 1199 },
          unitPrice: 1199,
          quantity: 1,
        });

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].productId).toBe("prod-001");
      expect(res.body.items[0].storage.sku).toBe("NX-PRO-256");
      expect(res.body.totalItems).toBe(1);
      expect(res.body.subtotal).toBe(1199);
      // Free armored courier for orders >= $1,000
      expect(res.body.shipping).toBe(0);
      expect(res.body.total).toBe(1199);
    });

    it("POST /api/cart/items charges $35 courier shipping when subtotal is under $1,000", async () => {
      const res = await client
        .post("/api/cart/items")
        .send({
          productId: "prod-004",
          color: { id: "midnight-blue", name: "Midnight Blue", hex: "#1A2238" },
          storage: { id: "128gb", capacity: "128GB", ram: "8GB LPDDR5", sku: "NX-LITE-128", price: 599 },
          unitPrice: 599,
          quantity: 1,
        });

      expect(res.status).toBe(200);
      expect(res.body.subtotal).toBe(599);
      expect(res.body.shipping).toBe(35);
      expect(res.body.total).toBe(599 + 35);
    });

    it("POST /api/cart/items increments quantity when adding the identical item", async () => {
      const payload = {
        productId: "prod-001",
        color: { id: "titanium-space-gray", name: "Titanium Space Gray", hex: "#4A4D52" },
        storage: { id: "256gb", capacity: "256GB", ram: "12GB LPDDR5X", sku: "NX-PRO-256", price: 1199 },
        unitPrice: 1199,
        quantity: 1,
      };

      await client.post("/api/cart/items").send(payload);
      const res = await client.post("/api/cart/items").send(payload);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].quantity).toBe(2);
      expect(res.body.totalItems).toBe(2);
      expect(res.body.subtotal).toBe(1199 * 2);
    });

    it("POST /api/cart/items rejects adding more units than available inventory stock", async () => {
      const res = await client
        .post("/api/cart/items")
        .send({
          productId: "prod-001",
          color: { id: "titanium-space-gray", name: "Titanium Space Gray", hex: "#4A4D52" },
          storage: { id: "256gb", capacity: "256GB", ram: "12GB LPDDR5X", sku: "NX-PRO-256" },
          quantity: 999999,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Insufficient stock");
    });
  });

  // ==========================================
  // 3. Update Cart Item Quantity
  // ==========================================
  describe("3. Update Cart Item Quantity", () => {
    it("PUT /api/cart/items/:itemId updates the item quantity and recalculates totals", async () => {
      const addRes = await client
        .post("/api/cart/items")
        .send({
          productId: "prod-001",
          color: { id: "titanium-space-gray", name: "Titanium Space Gray", hex: "#4A4D52" },
          storage: { id: "256gb", capacity: "256GB", ram: "12GB LPDDR5X", sku: "NX-PRO-256", price: 1199 },
          quantity: 1,
        });

      const itemId = addRes.body.items[0].id;
      const res = await client
        .put(`/api/cart/items/${itemId}`)
        .send({ quantity: 3 });

      expect(res.status).toBe(200);
      expect(res.body.items[0].quantity).toBe(3);
      expect(res.body.totalItems).toBe(3);
      expect(res.body.subtotal).toBe(1199 * 3);
    });

    it("PUT /api/cart/items/:itemId removes the item when quantity is set to 0", async () => {
      const addRes = await client
        .post("/api/cart/items")
        .send({
          productId: "prod-001",
          color: { id: "titanium-space-gray", name: "Titanium Space Gray", hex: "#4A4D52" },
          storage: { id: "256gb", capacity: "256GB", ram: "12GB LPDDR5X", sku: "NX-PRO-256", price: 1199 },
          quantity: 1,
        });

      const itemId = addRes.body.items[0].id;
      const res = await client
        .put(`/api/cart/items/${itemId}`)
        .send({ quantity: 0 });

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(0);
      expect(res.body.totalItems).toBe(0);
      expect(res.body.total).toBe(0);
    });
  });

  // ==========================================
  // 4. Remove Cart Item
  // ==========================================
  describe("4. Remove Cart Item", () => {
    it("DELETE /api/cart/items/:itemId removes a specific item", async () => {
      const addRes = await client
        .post("/api/cart/items")
        .send({
          productId: "prod-001",
          color: { id: "titanium-space-gray", name: "Titanium Space Gray", hex: "#4A4D52" },
          storage: { id: "256gb", capacity: "256GB", ram: "12GB LPDDR5X", sku: "NX-PRO-256", price: 1199 },
          quantity: 1,
        });

      const itemId = addRes.body.items[0].id;
      const res = await client.delete(`/api/cart/items/${itemId}`);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(0);
    });

    it("DELETE /api/cart/items/:itemId returns 404 for unknown itemId", async () => {
      const res = await client.delete("/api/cart/items/nonexistent-item-id");
      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 5. Clear Cart
  // ==========================================
  describe("5. Clear Cart", () => {
    it("DELETE /api/cart empties all items and resets totals to zero", async () => {
      await client
        .post("/api/cart/items")
        .send({
          productId: "prod-001",
          color: { id: "titanium-space-gray", name: "Titanium Space Gray", hex: "#4A4D52" },
          storage: { id: "256gb", capacity: "256GB", ram: "12GB LPDDR5X", sku: "NX-PRO-256", price: 1199 },
          quantity: 2,
        });

      const res = await client.delete("/api/cart");
      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(0);
      expect(res.body.totalItems).toBe(0);
      expect(res.body.subtotal).toBe(0);
      expect(res.body.total).toBe(0);
    });
  });

  // ==========================================
  // 6. Calculate Subtotal, Discounts, and Total
  // ==========================================
  describe("6. Calculate Subtotal and Total", () => {
    it("POST /api/cart/calculate computes subtotal and total for supplied items", async () => {
      const res = await request(app)
        .post("/api/cart/calculate")
        .send({
          items: [
            {
              productId: "prod-001",
              color: { id: "titanium-space-gray", name: "Titanium Space Gray", hex: "#4A4D52" },
              storage: { id: "256gb", capacity: "256GB", ram: "12GB", sku: "NX-PRO-256" },
              unitPrice: 1000,
              quantity: 2,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.totalItems).toBe(2);
      expect(res.body.subtotal).toBe(2000);
      expect(res.body.shipping).toBe(0);
      expect(res.body.total).toBe(2000);
    });

    it("POST /api/cart/calculate applies percentage promo discount (NEX10)", async () => {
      const res = await request(app)
        .post("/api/cart/calculate")
        .send({
          promoCode: "NEX10",
          items: [
            {
              productId: "prod-001",
              color: { id: "titanium-space-gray", name: "Titanium Space Gray", hex: "#4A4D52" },
              storage: { id: "256gb", capacity: "256GB", ram: "12GB", sku: "NX-PRO-256" },
              unitPrice: 1000,
              quantity: 1,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.subtotal).toBe(1000);
      expect(res.body.discount).toBe(100); // 10% of 1000
      expect(res.body.total).toBe(900);
    });

    it("POST /api/cart/calculate applies fixed discount (TITANIUM100)", async () => {
      const res = await request(app)
        .post("/api/cart/calculate")
        .send({
          promoCode: "TITANIUM100",
          items: [
            {
              productId: "prod-001",
              color: { id: "titanium-space-gray", name: "Titanium Space Gray", hex: "#4A4D52" },
              storage: { id: "256gb", capacity: "256GB", ram: "12GB", sku: "NX-PRO-256" },
              unitPrice: 1200,
              quantity: 1,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.discount).toBe(100);
      expect(res.body.total).toBe(1100);
    });

    it("POST /api/cart/promo applies promo to active cart session and recalculates", async () => {
      await client
        .post("/api/cart/items")
        .send({
          productId: "prod-001",
          color: { id: "titanium-space-gray", name: "Titanium Space Gray", hex: "#4A4D52" },
          storage: { id: "256gb", capacity: "256GB", ram: "12GB LPDDR5X", sku: "NX-PRO-256", price: 1000 },
          unitPrice: 1000,
          quantity: 1,
        });

      const res = await client.post("/api/cart/promo").send({ code: "NEX10" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cart.appliedPromo.code).toBe("NEX10");
      expect(res.body.cart.discount).toBe(100);
      expect(res.body.cart.total).toBe(900);
    });

    it("DELETE /api/cart/promo removes applied promo and restores full price", async () => {
      await client
        .post("/api/cart/items")
        .send({
          productId: "prod-001",
          color: { id: "titanium-space-gray", name: "Titanium Space Gray", hex: "#4A4D52" },
          storage: { id: "256gb", capacity: "256GB", ram: "12GB LPDDR5X", sku: "NX-PRO-256", price: 1000 },
          unitPrice: 1000,
          quantity: 1,
        });

      await client.post("/api/cart/promo").send({ code: "NEX10" });
      const res = await client.delete("/api/cart/promo");

      expect(res.status).toBe(200);
      expect(res.body.cart.appliedPromo).toBeNull();
      expect(res.body.cart.discount).toBe(0);
      expect(res.body.cart.total).toBe(1000);
    });
  });
});
