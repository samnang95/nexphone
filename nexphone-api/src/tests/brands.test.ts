import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { Brand } from "../models/brand.model";
import { Product } from "../models/product.model";
import { clearTestDb, createTestUser, startTestDb, stopTestDb } from "./helpers/db";
import { signAccessToken } from "../services/token.service";
import { brandsCatalog } from "../data/brands.data";
import { productsCatalog } from "../data/products.data";

beforeAll(async () => {
  await startTestDb();
});

afterAll(async () => {
  await stopTestDb();
});

beforeEach(async () => {
  await clearTestDb();
  await Brand.deleteMany({});
  await Product.deleteMany({});
  await Brand.insertMany(brandsCatalog);
  await Product.insertMany(productsCatalog);
});

async function getAdminToken() {
  const admin = await createTestUser({
    email: "admin-brands@nexphone.io",
    role: "admin",
  });
  return signAccessToken(admin);
}

async function getCustomerToken() {
  const customer = await createTestUser({
    email: "customer-brands@example.com",
    role: "customer",
  });
  return signAccessToken(customer);
}

describe("Brand API", () => {
  describe("Get All Brands", () => {
    it("returns all active partner brands via GET /api/brands", async () => {
      const res = await request(app).get("/api/brands");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.headers["x-total-count"]).toBeDefined();
    });

    it("supports paginated envelope format when paginated=true", async () => {
      const res = await request(app).get("/api/brands?paginated=true&page=1&limit=2");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("pagination");
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(4);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
    });
  });

  describe("Get Brand by ID or Slug", () => {
    it("returns brand by ID (brand-001)", async () => {
      const res = await request(app).get("/api/brands/brand-001");
      expect(res.status).toBe(200);
      expect(res.body.id).toBe("brand-001");
      expect(res.body.name).toBe("NexPhone Labs");
      expect(res.body.code).toBe("NX");
    });

    it("returns brand by slug (nexphone-labs)", async () => {
      const res = await request(app).get("/api/brands/nexphone-labs");
      expect(res.status).toBe(200);
      expect(res.body.slug).toBe("nexphone-labs");
      expect(res.body.id).toBe("brand-001");
    });

    it("returns 404 for nonexistent brand ID or slug", async () => {
      const res = await request(app).get("/api/brands/non-existent-brand-xyz");
      expect(res.status).toBe(404);
      expect(res.body.code).toBe("BRAND_NOT_FOUND");
    });
  });

  describe("Filter and Search Brands", () => {
    it("filters brands by tier (Flagship)", async () => {
      const res = await request(app).get("/api/brands?tier=Flagship");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((b: any) => b.tier.toLowerCase() === "flagship")).toBe(true);
    });

    it("filters brands by status (all)", async () => {
      const res = await request(app).get("/api/brands?status=all");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(6);
    });

    it("searches brands by keyword ?search=Quantum", async () => {
      const res = await request(app).get("/api/brands?search=Quantum");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((b: any) => b.name.includes("Quantum"))).toBe(true);
    });
  });

  describe("Sort Brands", () => {
    it("sorts brands by name ascending (name-asc)", async () => {
      const res = await request(app).get("/api/brands?status=all&sortBy=name-asc");
      expect(res.status).toBe(200);
      const names = res.body.map((b: any) => b.name);
      for (let i = 0; i < names.length - 1; i++) {
        expect(names[i].localeCompare(names[i + 1])).toBeLessThanOrEqual(0);
      }
    });

    it("sorts brands by rating descending", async () => {
      const res = await request(app).get("/api/brands?status=all&sortBy=rating-desc");
      expect(res.status).toBe(200);
      const ratings = res.body.map((b: any) => b.rating);
      for (let i = 0; i < ratings.length - 1; i++) {
        expect(ratings[i]).toBeGreaterThanOrEqual(ratings[i + 1]);
      }
    });
  });

  describe("Admin Brand CRUD Operations", () => {
    it("rejects brand creation without authentication with 401", async () => {
      const res = await request(app).post("/api/brands").send({ name: "Unauth Brand", code: "UNAUTH" });
      expect(res.status).toBe(401);
      expect(res.body.code).toBe("TOKEN_REQUIRED");
    });

    it("rejects brand creation by regular customer with 403", async () => {
      const customerToken = await getCustomerToken();
      const res = await request(app)
        .post("/api/brands")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ name: "Customer Brand", code: "CUSTB" });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");
    });

    it("rejects brand creation with duplicate code with 409", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .post("/api/brands")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Duplicate NX Brand",
          code: "NX", // already exists
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe("BRAND_CODE_EXISTS");
    });

    it("allows admin to create a new brand (201)", async () => {
      const adminToken = await getAdminToken();
      const newBrandPayload = {
        name: "CyberShield Telecom",
        code: "CYBER",
        tier: "Enterprise",
        country: "Sweden",
        headquarters: "Stockholm",
        foundedYear: 2023,
        description: "Zero-knowledge encryption mobile network hardware.",
        status: "active",
        isFeatured: true,
      };

      const res = await request(app)
        .post("/api/brands")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newBrandPayload);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("CyberShield Telecom");
      expect(res.body.code).toBe("CYBER");
      expect(res.body.slug).toBe("cybershield-telecom");
      expect(res.body.id).toBeDefined();

      // Verify searchable via GET
      const getRes = await request(app).get(`/api/brands/${res.body.id}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.name).toBe("CyberShield Telecom");
    });

    it("allows admin to update a brand (200)", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .put("/api/brands/brand-002")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          description: "Updated aerospace titanium descriptions for partner network.",
          marketShare: "24.5%",
        });

      expect(res.status).toBe(200);
      expect(res.body.description).toBe("Updated aerospace titanium descriptions for partner network.");
      expect(res.body.marketShare).toBe("24.5%");
      expect(res.body.id).toBe("brand-002");
    });

    it("prevents brand deletion if products reference it (400)", async () => {
      const adminToken = await getAdminToken();

      // Brand-001 has name "NexPhone Labs" or products reference "NexPhone"
      // Let's create a test product referencing brand-003 name "Aero Dynamic Tech"
      await Product.create({
        id: "prod-test-aero",
        name: "Aero X Phone",
        slug: "aero-x-phone",
        brand: "Aero Dynamic Tech",
        series: "Lite",
        basePrice: 499,
        colors: [{ id: "c1", name: "Black", hex: "#000", inStock: true }],
        storageOptions: [{ id: "s1", capacity: "128GB", ram: "8GB", price: 499, stock: 10, sku: "AERO-128" }],
      });

      const res = await request(app)
        .delete("/api/brands/brand-003")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("BRAND_HAS_ASSOCIATED_PRODUCTS");
    });

    it("allows admin to delete an unreferenced brand (200)", async () => {
      const adminToken = await getAdminToken();

      // brand-006 has no products referencing it
      const res = await request(app)
        .delete("/api/brands/brand-006")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.deletedId).toBe("brand-006");

      // Verify it is gone
      const verifyRes = await request(app).get("/api/brands/brand-006");
      expect(verifyRes.status).toBe(404);
    });
  });
});
