import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { Product } from "../models/product.model";
import { clearTestDb, createTestUser, startTestDb, stopTestDb, TEST_PASSWORD } from "./helpers/db";
import { signAccessToken } from "../services/token.service";
import { productsCatalog } from "../data/products.data";

beforeAll(async () => {
  await startTestDb();
});

afterAll(async () => {
  await stopTestDb();
});

beforeEach(async () => {
  await clearTestDb();
  await Product.deleteMany({});
  await Product.insertMany(productsCatalog);
});

async function getAdminToken() {
  const admin = await createTestUser({
    email: "admin-tester@nexphone.io",
    role: "admin",
  });
  return signAccessToken(admin);
}

async function getCustomerToken() {
  const customer = await createTestUser({
    email: "customer-tester@example.com",
    role: "customer",
  });
  return signAccessToken(customer);
}

describe("Phone / Product API", () => {
  describe("Get All Phones & Aliases", () => {
    it("returns all published phones via /api/products", async () => {
      const res = await request(app).get("/api/products");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.headers["x-total-count"]).toBeDefined();
    });

    it("returns all published phones via /api/phones alias", async () => {
      const res = await request(app).get("/api/phones");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("supports paginated envelope format when paginated=true", async () => {
      const res = await request(app).get("/api/phones?paginated=true&page=1&limit=2");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("pagination");
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(3);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
    });
  });

  describe("Get Phone by ID / Slug", () => {
    it("returns phone by custom ID (prod-001)", async () => {
      const res = await request(app).get("/api/products/prod-001");
      expect(res.status).toBe(200);
      expect(res.body.id).toBe("prod-001");
      expect(res.body.name).toBe("NexPhone Pro Max X");
    });

    it("returns phone by slug (nexphone-pro-max-x)", async () => {
      const res = await request(app).get("/api/phones/nexphone-pro-max-x");
      expect(res.status).toBe(200);
      expect(res.body.slug).toBe("nexphone-pro-max-x");
      expect(res.body.id).toBe("prod-001");
    });

    it("returns 404 for nonexistent product ID or slug", async () => {
      const res = await request(app).get("/api/phones/non-existent-device-xyz");
      expect(res.status).toBe(404);
      expect(res.body.code).toBe("PRODUCT_NOT_FOUND");
    });

    it("hides costPrice from public requests", async () => {
      const res = await request(app).get("/api/products/prod-001");
      expect(res.status).toBe(200);
      expect(res.body.costPrice).toBeUndefined();
    });

    it("exposes costPrice to authenticated admin requests", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .get("/api/products/prod-001")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.costPrice).toBeDefined();
    });
  });

  describe("Search Phones", () => {
    it("searches phones by query parameter ?search=titanium", async () => {
      const res = await request(app).get("/api/products?search=Titanium");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(
        res.body.some((p: any) =>
          p.name.toLowerCase().includes("titanium") || p.subtitle.toLowerCase().includes("titanium")
        )
      ).toBe(true);
    });

    it("searches phones via dedicated /api/phones/search?q=Fold", async () => {
      const res = await request(app).get("/api/phones/search?q=Fold");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("Filter Phones", () => {
    it("filters phones by series", async () => {
      const res = await request(app).get("/api/phones?series=Pro%20Series");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((p: any) => p.series.toLowerCase() === "pro series")).toBe(true);
    });

    it("filters phones by price range (under-700)", async () => {
      const res = await request(app).get("/api/products?priceRange=under-700");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((p: any) => p.basePrice < 700)).toBe(true);
    });

    it("filters phones by inStock=true", async () => {
      const res = await request(app).get("/api/phones?inStock=true");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("filters phones by minRating", async () => {
      const res = await request(app).get("/api/phones?minRating=4.8");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((p: any) => p.rating >= 4.8)).toBe(true);
    });
  });

  describe("Sort Phones", () => {
    it("sorts phones by price ascending (price-asc)", async () => {
      const res = await request(app).get("/api/phones?sortBy=price-asc");
      expect(res.status).toBe(200);
      const prices = res.body.map((p: any) => p.basePrice);
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
      }
    });

    it("sorts phones by price descending (price-desc)", async () => {
      const res = await request(app).get("/api/phones?sortBy=price-desc");
      expect(res.status).toBe(200);
      const prices = res.body.map((p: any) => p.basePrice);
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
      }
    });

    it("sorts phones by rating", async () => {
      const res = await request(app).get("/api/phones?sortBy=rating");
      expect(res.status).toBe(200);
      const ratings = res.body.map((p: any) => p.rating);
      for (let i = 0; i < ratings.length - 1; i++) {
        expect(ratings[i]).toBeGreaterThanOrEqual(ratings[i + 1]);
      }
    });
  });

  describe("Featured, New Arrivals, Best Sellers", () => {
    it("GET /api/products/featured returns featured phones", async () => {
      const res = await request(app).get("/api/products/featured");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((p: any) => p.isFeatured === true)).toBe(true);
    });

    it("GET /api/phones/new-arrivals returns new arrival phones", async () => {
      const res = await request(app).get("/api/phones/new-arrivals");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("GET /api/phones/best-sellers returns best seller phones", async () => {
      const res = await request(app).get("/api/phones/best-sellers");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("Admin CRUD Operations", () => {
    it("rejects phone creation without auth with 401", async () => {
      const res = await request(app).post("/api/products").send({ name: "Unauthenticated" });
      expect(res.status).toBe(401);
      expect(res.body.code).toBe("TOKEN_REQUIRED");
    });

    it("rejects phone creation by regular customer with 403", async () => {
      const customerToken = await getCustomerToken();
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ name: "Customer phone" });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");
    });

    it("allows admin to create a new phone (201)", async () => {
      const adminToken = await getAdminToken();
      const newPhonePayload = {
        name: "NexPhone Cyber 10",
        subtitle: "Next-gen cybernetic flagship",
        series: "Pro Series",
        basePrice: 999,
        compareAtPrice: 1099,
        costPrice: 550,
        status: "published",
        isFeatured: true,
        colors: [
          { id: "c-cyber", name: "Cyber Neon", hex: "#00ffcc", inStock: true },
        ],
        storageOptions: [
          { id: "s-cyber-1", capacity: "256GB", ram: "12GB", price: 999, stock: 50, sku: "NX-CYBER-256" },
        ],
        specifications: {
          display: { size: "6.7 inch" },
        },
      };

      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newPhonePayload);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("NexPhone Cyber 10");
      expect(res.body.slug).toBe("nexphone-cyber-10");
      expect(res.body.id).toBeDefined();

      // Verify searchable via GET
      const getRes = await request(app).get(`/api/products/${res.body.id}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.name).toBe("NexPhone Cyber 10");
    });

    it("allows admin to update a phone (200)", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .put("/api/products/prod-001")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          subtitle: "Updated titanium flagship subtitle",
          basePrice: 1149,
        });

      expect(res.status).toBe(200);
      expect(res.body.subtitle).toBe("Updated titanium flagship subtitle");
      expect(res.body.basePrice).toBe(1149);
      expect(res.body.id).toBe("prod-001");
    });

    it("allows admin to delete a phone (200)", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .delete("/api/products/prod-004")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.deletedId).toBe("prod-004");

      // Verify it is gone
      const verifyRes = await request(app).get("/api/products/prod-004");
      expect(verifyRes.status).toBe(404);
    });
  });
});
