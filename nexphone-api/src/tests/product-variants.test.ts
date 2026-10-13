import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { Product } from "../models/product.model";
import { clearTestDb, createTestUser, startTestDb, stopTestDb } from "./helpers/db";
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
    email: "admin-variants@nexphone.io",
    role: "admin",
  });
  return signAccessToken(admin);
}

async function getCustomerToken() {
  const customer = await createTestUser({
    email: "customer-variants@example.com",
    role: "customer",
  });
  return signAccessToken(customer);
}

describe("Product Variant & Specification API", () => {
  describe("Colors Management", () => {
    it("GET /api/products/:id/colors returns all color options", async () => {
      const res = await request(app).get("/api/products/prod-001/colors");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("hex");
      expect(res.body[0]).toHaveProperty("name");
    });

    it("POST /api/products/:id/colors rejects unauthenticated user with 401", async () => {
      const res = await request(app)
        .post("/api/products/prod-001/colors")
        .send({ name: "Emerald Green", hex: "#00ff88" });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("TOKEN_REQUIRED");
    });

    it("POST /api/products/:id/colors rejects regular customer with 403", async () => {
      const customerToken = await getCustomerToken();
      const res = await request(app)
        .post("/api/products/prod-001/colors")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ name: "Emerald Green", hex: "#00ff88" });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");
    });

    it("POST /api/products/:id/colors allows admin to add a color option (201)", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .post("/api/products/prod-001/colors")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Cosmic Aurora",
          hex: "#8b5cf6",
          inStock: true,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("newColor");
      expect(res.body.newColor.name).toBe("Cosmic Aurora");
      expect(res.body.newColor.hex).toBe("#8b5cf6");
    });

    it("PUT /api/products/:id/colors/:colorId updates color details", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .put("/api/products/prod-001/colors/c1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Space Matte Gray",
          inStock: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.updatedColor.name).toBe("Space Matte Gray");
      expect(res.body.updatedColor.inStock).toBe(false);
    });

    it("DELETE /api/products/:id/colors/:colorId removes a color option", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .delete("/api/products/prod-001/colors/c4")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.deletedColorId).toBe("c4");
    });
  });

  describe("Storage & RAM Variants Management", () => {
    it("GET /api/products/:id/storage returns storage and RAM configurations", async () => {
      const res = await request(app).get("/api/products/prod-001/storage");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("capacity");
      expect(res.body[0]).toHaveProperty("ram");
      expect(res.body[0]).toHaveProperty("sku");
    });

    it("GET /api/products/:id/variants alias returns identical configurations", async () => {
      const res = await request(app).get("/api/products/prod-001/variants");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("POST /api/products/:id/storage allows admin to add a new storage & RAM variant", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .post("/api/products/prod-001/storage")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          capacity: "2TB",
          ram: "24GB LPDDR5X",
          price: 1899,
          comparePrice: 1999,
          stock: 25,
          sku: "NX-PRO-2TB",
        });

      expect(res.status).toBe(201);
      expect(res.body.newVariant.capacity).toBe("2TB");
      expect(res.body.newVariant.ram).toBe("24GB LPDDR5X");
      expect(res.body.newVariant.sku).toBe("NX-PRO-2TB");
    });

    it("PUT /api/products/:id/storage/:storageId updates RAM, capacity, and stock", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .put("/api/products/prod-001/storage/s1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ram: "16GB Ultra RAM",
          stock: 250,
          price: 1189,
        });

      expect(res.status).toBe(200);
      expect(res.body.updatedVariant.ram).toBe("16GB Ultra RAM");
      expect(res.body.updatedVariant.stock).toBe(250);
      expect(res.body.updatedVariant.price).toBe(1189);
    });

    it("DELETE /api/products/:id/storage/:storageId removes a variant", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .delete("/api/products/prod-001/storage/s3")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.deletedVariantId).toBe("s3");
    });
  });

  describe("Pricing Management", () => {
    it("GET /api/products/:id/pricing returns prices and hides costPrice from public", async () => {
      const res = await request(app).get("/api/products/prod-001/pricing");
      expect(res.status).toBe(200);
      expect(res.body.basePrice).toBeDefined();
      expect(res.body.costPrice).toBeUndefined();
      expect(Array.isArray(res.body.variantPrices)).toBe(true);
    });

    it("GET /api/products/:id/pricing exposes costPrice to admin", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .get("/api/products/prod-001/pricing")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.costPrice).toBeDefined();
    });

    it("PATCH /api/products/:id/pricing updates basePrice and variant prices", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .patch("/api/products/prod-001/pricing")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          basePrice: 1149,
          compareAtPrice: 1249,
          costPrice: 650,
          variantPrices: [
            { id: "s1", price: 1149, comparePrice: 1249 },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.basePrice).toBe(1149);
      expect(res.body.costPrice).toBe(650);
      const s1 = res.body.variantPrices.find((v: any) => v.id === "s1");
      expect(s1?.price).toBe(1149);
    });
  });

  describe("Specifications Management", () => {
    it("GET /api/products/:id/specifications returns phone specs", async () => {
      const res = await request(app).get("/api/products/prod-001/specifications");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("display");
      expect(res.body).toHaveProperty("processor");
      expect(res.body).toHaveProperty("camera");
      expect(res.body).toHaveProperty("battery");
    });

    it("PUT /api/products/:id/specifications updates specification sections", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .put("/api/products/prod-001/specifications")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          display: {
            refreshRate: "1-144Hz Quantum Adaptive",
            peakBrightness: "3,000 nits Extreme Vision",
          },
          battery: {
            capacity: "5,800 mAh Graphene-Enhanced",
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.display.refreshRate).toBe("1-144Hz Quantum Adaptive");
      expect(res.body.display.peakBrightness).toBe("3,000 nits Extreme Vision");
      expect(res.body.battery.capacity).toBe("5,800 mAh Graphene-Enhanced");
      // Other unchanged fields are preserved
      expect(res.body.processor).toBeDefined();
    });
  });

  describe("Product Images Management", () => {
    it("GET /api/products/:id/images returns image gallery", async () => {
      const res = await request(app).get("/api/products/prod-001/images");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("images");
    });

    it("POST /api/products/:id/images adds image URLs to gallery", async () => {
      const adminToken = await getAdminToken();
      const newUrl = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab";

      const res = await request(app)
        .post("/api/products/prod-001/images")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ imageUrl: newUrl });

      expect(res.status).toBe(201);
      expect(res.body.images).toContain(newUrl);
    });

    it("PATCH /api/products/:id/images/primary sets primary image URL", async () => {
      const adminToken = await getAdminToken();
      const primaryUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9";

      const res = await request(app)
        .patch("/api/products/prod-001/images/primary")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ imageUrl: primaryUrl });

      expect(res.status).toBe(200);
      expect(res.body.primaryImageUrl).toBe(primaryUrl);
    });

    it("DELETE /api/products/:id/images deletes an image from gallery", async () => {
      const adminToken = await getAdminToken();
      const targetUrl = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab";

      // Add image first
      await request(app)
        .post("/api/products/prod-001/images")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ imageUrl: targetUrl });

      const delRes = await request(app)
        .delete("/api/products/prod-001/images")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ imageUrl: targetUrl });

      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);
      expect(delRes.body.remainingImages).not.toContain(targetUrl);
    });
  });

  describe("3D Model URLs Management", () => {
    it("GET /api/products/:id/model-3d returns 3D model asset config", async () => {
      const res = await request(app).get("/api/products/prod-001/model-3d");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("enabled");
      expect(res.body).toHaveProperty("modelUrl");
    });

    it("PUT /api/products/:id/model-3d updates 3D model properties", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .put("/api/products/prod-001/model-3d")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          enabled: true,
          modelUrl: "/models/nexphone-pro-max-v2.glb",
          autoRotate: false,
          polygonCount: 65000,
        });

      expect(res.status).toBe(200);
      expect(res.body.enabled).toBe(true);
      expect(res.body.modelUrl).toBe("/models/nexphone-pro-max-v2.glb");
      expect(res.body.autoRotate).toBe(false);
      expect(res.body.polygonCount).toBe(65000);
    });
  });
});
