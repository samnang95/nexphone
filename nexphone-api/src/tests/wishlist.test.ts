import { describe, expect, it, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app";

describe("Wishlist API", () => {
  const sessionId = "test-wishlist-session-456";
  const client = {
    get: (url: string) => request(app).get(url).set("x-session-id", sessionId),
    post: (url: string) => request(app).post(url).set("x-session-id", sessionId),
    delete: (url: string) => request(app).delete(url).set("x-session-id", sessionId),
  };

  beforeEach(async () => {
    // Clear wishlist before each test
    await client.delete("/api/wishlist");
  });

  // ==========================================
  // 1. Get Wishlist
  // ==========================================
  describe("1. Get Wishlist", () => {
    it("GET /api/wishlist returns an initialized empty wishlist for a new session", async () => {
      const res = await client.get("/api/wishlist");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id");
      expect(res.body.items).toEqual([]);
      expect(res.body.totalItems).toBe(0);
    });
  });

  // ==========================================
  // 2. Add Phone to Wishlist
  // ==========================================
  describe("2. Add Phone to Wishlist", () => {
    it("POST /api/wishlist/items adds a phone and auto-populates product details", async () => {
      const res = await client.post("/api/wishlist/items").send({
        productId: "prod-001",
      });

      expect(res.status).toBe(200);
      expect(res.body.totalItems).toBe(1);
      expect(res.body.items).toHaveLength(1);

      const item = res.body.items[0];
      expect(item.productId).toBe("prod-001");
      expect(item.productName).toBe("NexPhone Pro Max X");
      expect(item.productSlug).toBe("nexphone-pro-max-x");
      expect(item.basePrice).toBeGreaterThan(0);
      expect(item.inStock).toBe(true);
      expect(item).toHaveProperty("addedAt");
    });

    it("POST /api/wishlist allows specifying custom variant preferences", async () => {
      const res = await client.post("/api/wishlist").send({
        productId: "prod-001",
        selectedColor: { name: "Titanium Space Gray", hex: "#4A4D52" },
        selectedStorage: { capacity: "512GB", ram: "16GB", price: 1399 },
      });

      expect(res.status).toBe(200);
      expect(res.body.items[0].selectedColor?.name).toBe("Titanium Space Gray");
      expect(res.body.items[0].selectedStorage?.capacity).toBe("512GB");
    });

    it("POST /api/wishlist/items is idempotent and does not create duplicate entries", async () => {
      await client.post("/api/wishlist/items").send({ productId: "prod-001" });
      const res = await client.post("/api/wishlist/items").send({ productId: "prod-001" });

      expect(res.status).toBe(200);
      expect(res.body.totalItems).toBe(1);
      expect(res.body.items).toHaveLength(1);
    });

    it("POST /api/wishlist/items returns 404 when adding a non-existent product", async () => {
      const res = await client.post("/api/wishlist/items").send({
        productId: "non-existent-phone-999",
      });

      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 3. Remove Phone from Wishlist
  // ==========================================
  describe("3. Remove Phone from Wishlist", () => {
    it("DELETE /api/wishlist/items/:productId removes the specified phone", async () => {
      await client.post("/api/wishlist/items").send({ productId: "prod-001" });
      await client.post("/api/wishlist/items").send({ productId: "prod-002" });

      const res = await client.delete("/api/wishlist/items/prod-001");
      expect(res.status).toBe(200);
      expect(res.body.totalItems).toBe(1);
      expect(res.body.items[0].productId).toBe("prod-002");
    });

    it("DELETE /api/wishlist/:productId works as a direct removal endpoint", async () => {
      await client.post("/api/wishlist/items").send({ productId: "prod-001" });
      const res = await client.delete("/api/wishlist/prod-001");

      expect(res.status).toBe(200);
      expect(res.body.totalItems).toBe(0);
      expect(res.body.items).toHaveLength(0);
    });

    it("DELETE /api/wishlist/items/:productId returns 404 for item not in wishlist", async () => {
      const res = await client.delete("/api/wishlist/items/prod-999");
      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 4. Clear Wishlist
  // ==========================================
  describe("4. Clear Wishlist", () => {
    it("DELETE /api/wishlist empties all items in the wishlist", async () => {
      await client.post("/api/wishlist/items").send({ productId: "prod-001" });
      await client.post("/api/wishlist/items").send({ productId: "prod-002" });

      const res = await client.delete("/api/wishlist");
      expect(res.status).toBe(200);
      expect(res.body.totalItems).toBe(0);
      expect(res.body.items).toEqual([]);
    });
  });

  // ==========================================
  // 5. Check & Toggle Utilities
  // ==========================================
  describe("5. Check & Toggle Utilities", () => {
    it("GET /api/wishlist/check/:productId returns presence status", async () => {
      const beforeRes = await client.get("/api/wishlist/check/prod-001");
      expect(beforeRes.status).toBe(200);
      expect(beforeRes.body.inWishlist).toBe(false);

      await client.post("/api/wishlist/items").send({ productId: "prod-001" });

      const afterRes = await client.get("/api/wishlist/check/prod-001");
      expect(afterRes.status).toBe(200);
      expect(afterRes.body.inWishlist).toBe(true);
    });

    it("POST /api/wishlist/toggle toggles a phone in and out of the wishlist", async () => {
      // 1. First toggle adds item
      const addToggle = await client.post("/api/wishlist/toggle").send({ productId: "prod-003" });
      expect(addToggle.status).toBe(200);
      expect(addToggle.body.inWishlist).toBe(true);
      expect(addToggle.body.wishlist.totalItems).toBe(1);

      // 2. Second toggle removes item
      const removeToggle = await client.post("/api/wishlist/toggle").send({ productId: "prod-003" });
      expect(removeToggle.status).toBe(200);
      expect(removeToggle.body.inWishlist).toBe(false);
      expect(removeToggle.body.wishlist.totalItems).toBe(0);
    });
  });
});
