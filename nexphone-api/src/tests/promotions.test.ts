import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";

describe("Promotion & Coupon API", () => {
  // ==========================================
  // 1. Get Active Promotions
  // ==========================================
  describe("1. Get Active Promotions", () => {
    it("GET /api/promotions/active returns list of active promotions for storefront", async () => {
      const res = await request(app).get("/api/promotions/active");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const promo = res.body[0];
      expect(promo).toHaveProperty("id");
      expect(promo).toHaveProperty("title");
      expect(promo).toHaveProperty("discountType");
      expect(promo).toHaveProperty("discountValue");
      expect(promo).toHaveProperty("bannerColor");
      // Public view should NOT leak internal revenue statistics
      expect(promo).not.toHaveProperty("revenueGenerated");
      expect(promo).not.toHaveProperty("ordersCount");
    });

    it("supports route alias GET /promotions/active", async () => {
      const res = await request(app).get("/promotions/active");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ==========================================
  // 2. Get Promotion Details
  // ==========================================
  describe("2. Get Promotion Details", () => {
    it("GET /api/promotions/:code returns promotion by promo code", async () => {
      const res = await request(app).get("/api/promotions/NEXLAUNCH20");
      expect(res.status).toBe(200);
      expect(res.body.code).toBe("NEXLAUNCH20");
      expect(res.body.discountType).toBe("percentage");
      expect(res.body.discountValue).toBe(20);
    });

    it("GET /api/promotions/:id returns promotion by unique ID", async () => {
      const res = await request(app).get("/api/promotions/promo-001");
      expect(res.status).toBe(200);
      expect(res.body.id).toBe("promo-001");
      expect(res.body.code).toBe("NEXLAUNCH20");
    });

    it("returns 404 for unknown promotion code or ID", async () => {
      const res = await request(app).get("/api/promotions/UNKNOWN-CODE-999");
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not found/i);
    });
  });

  // ==========================================
  // 3. Validate Coupon
  // ==========================================
  describe("3. Validate Coupon", () => {
    it("POST /api/promotions/validate successfully validates percentage discount coupon", async () => {
      const res = await request(app)
        .post("/api/promotions/validate")
        .send({
          code: "NEXLAUNCH20",
          cartTotal: 1000,
        });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.code).toBe("NEXLAUNCH20");
      expect(res.body.discountType).toBe("percentage");
      expect(res.body.discountValue).toBe(20);
      expect(res.body.discountAmount).toBe(200);
      expect(res.body.cartTotal).toBe(1000);
      expect(res.body.finalTotal).toBe(800);
      expect(res.body).toHaveProperty("message");
    });

    it("POST /api/promotions/validate respects maximum discount amount ceiling", async () => {
      // NEXLAUNCH20 has maxDiscountAmount = 400. On a $3000 cart, 20% would be $600, capped at $400.
      const res = await request(app)
        .post("/api/promotions/validate")
        .send({
          code: "NEXLAUNCH20",
          cartTotal: 3000,
        });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.discountAmount).toBe(400);
      expect(res.body.finalTotal).toBe(2600);
    });

    it("returns 400 when cartTotal does not meet minOrderValue", async () => {
      // FLEETVIP100 requires minOrderValue of $1500
      const res = await request(app)
        .post("/api/promotions/validate")
        .send({
          code: "FLEETVIP100",
          cartTotal: 600,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/minimum order/i);
    });

    it("returns 404 for nonexistent coupon code", async () => {
      const res = await request(app)
        .post("/api/promotions/validate")
        .send({
          code: "INVALID_PROMO_CODE",
          cartTotal: 500,
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/does not exist/i);
    });
  });

  // ==========================================
  // 4. Apply Coupon
  // ==========================================
  describe("4. Apply Coupon", () => {
    it("POST /api/promotions/apply applies coupon and returns calculations", async () => {
      const res = await request(app)
        .post("/api/promotions/apply")
        .send({
          code: "NEXLAUNCH20",
          cartTotal: 1200,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.applied).toBe(true);
      expect(res.body.code).toBe("NEXLAUNCH20");
      expect(res.body.discountAmount).toBe(240);
      expect(res.body.subtotal).toBe(1200);
      expect(res.body.finalTotal).toBe(960);
    });

    it("POST /api/promotions/apply syncs applied promo with user cart session", async () => {
      const sessionId = "coupon-test-session-789";

      // 1. Add item to cart
      await request(app)
        .post("/api/cart/items")
        .set("x-session-id", sessionId)
        .send({
          productId: "prod-001",
          color: { id: "titanium-space-gray", name: "Titanium Space Gray", hex: "#4A4D52" },
          storage: { id: "256gb", capacity: "256GB", ram: "12GB LPDDR5X", sku: "NX-PRO-256", price: 1199 },
          unitPrice: 1199,
          quantity: 1,
        });

      // 2. Apply coupon
      const res = await request(app)
        .post("/api/promotions/apply")
        .set("x-session-id", sessionId)
        .send({ code: "NEXLAUNCH20" });

      expect(res.status).toBe(200);
      expect(res.body.applied).toBe(true);
      expect(res.body.cart).toBeDefined();
      expect(res.body.cart.appliedPromo).not.toBeNull();
      expect(res.body.discountAmount).toBeGreaterThan(0);
      expect(res.body.cart.discount).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // 5. Create Coupon (Admin)
  // ==========================================
  describe("5. Create Coupon (Admin)", () => {
    const testCode = `PROMO${Date.now().toString().slice(-4)}`;

    it("POST /api/promotions/coupons creates a new coupon", async () => {
      const res = await request(app)
        .post("/api/promotions/coupons")
        .send({
          code: testCode,
          title: "Winter Tech Blowout",
          description: "Exclusive $150 holiday discount",
          discountType: "fixed_amount",
          discountValue: 150,
          minOrderValue: 700,
          bannerColor: "rose",
          status: "active",
        });

      expect(res.status).toBe(201);
      expect(res.body.code).toBe(testCode);
      expect(res.body.title).toBe("Winter Tech Blowout");
      expect(res.body.discountValue).toBe(150);
      expect(res.body.discountType).toBe("fixed_amount");
      expect(res.body.minOrderValue).toBe(700);
    });

    it("returns 409 Conflict when attempting to create duplicate coupon code", async () => {
      const res = await request(app)
        .post("/api/promotions/coupons")
        .send({
          code: testCode,
          title: "Duplicate Code Attempt",
          discountType: "percentage",
          discountValue: 10,
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it("returns 400 when required fields are missing or invalid", async () => {
      const res = await request(app)
        .post("/api/promotions/coupons")
        .send({
          code: "AB", // Less than 3 chars
          // missing title and discountType
          discountValue: 10,
        });

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // 6. Update Coupon (Admin)
  // ==========================================
  describe("6. Update Coupon (Admin)", () => {
    let createdPromoId: string;
    const updateCode = `UPD${Date.now().toString().slice(-4)}`;

    it("PUT /api/promotions/:id updates coupon details", async () => {
      // 1. Create a coupon to update
      const createRes = await request(app)
        .post("/api/promotions")
        .send({
          code: updateCode,
          title: "Initial Title",
          discountType: "percentage",
          discountValue: 15,
        });
      expect(createRes.status).toBe(201);
      createdPromoId = createRes.body.id;

      // 2. Update it
      const updateRes = await request(app)
        .put(`/api/promotions/${createdPromoId}`)
        .send({
          title: "Updated Spring Sale",
          discountValue: 25,
          minOrderValue: 500,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.title).toBe("Updated Spring Sale");
      expect(updateRes.body.discountValue).toBe(25);
      expect(updateRes.body.minOrderValue).toBe(500);
    });

    it("PATCH /api/promotions/:id/status updates coupon status", async () => {
      const res = await request(app)
        .patch(`/api/promotions/${createdPromoId}/status`)
        .send({ status: "disabled" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("disabled");
    });
  });

  // ==========================================
  // 7. Delete Coupon (Admin)
  // ==========================================
  describe("7. Delete Coupon (Admin)", () => {
    it("DELETE /api/promotions/:id removes a coupon", async () => {
      const delCode = `DEL${Date.now().toString().slice(-4)}`;
      const createRes = await request(app)
        .post("/api/promotions")
        .send({
          code: delCode,
          title: "Temporary Coupon to Delete",
          discountType: "fixed_amount",
          discountValue: 50,
        });
      expect(createRes.status).toBe(201);
      const id = createRes.body.id;

      // Delete
      const delRes = await request(app).delete(`/api/promotions/${id}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body.message).toMatch(/removed successfully/i);

      // Verify it no longer exists
      const getRes = await request(app).get(`/api/promotions/${id}`);
      expect(getRes.status).toBe(404);
    });
  });

  // ==========================================
  // 8. Metrics & Listing
  // ==========================================
  describe("8. Metrics & Query", () => {
    it("GET /api/promotions-metrics returns aggregated coupon statistics", async () => {
      const res = await request(app).get("/api/promotions-metrics");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalPromotions");
      expect(res.body).toHaveProperty("activePromotions");
      expect(res.body).toHaveProperty("totalRedemptions");
      expect(res.body).toHaveProperty("totalDiscountGiven");
    });

    it("GET /api/promotions supports query filtering by search and type", async () => {
      const res = await request(app).get("/api/promotions?type=promo_code");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((p: any) => p.type === "promo_code")).toBe(true);
    });
  });
});
