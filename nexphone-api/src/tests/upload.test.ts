import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { Product } from "../models/product.model";
import { Brand } from "../models/brand.model";
import { clearTestDb, createTestUser, startTestDb, stopTestDb, TEST_PASSWORD } from "./helpers/db";
import { signAccessToken } from "../services/token.service";
import { productsCatalog } from "../data/products.data";
import { brandsCatalog } from "../data/brands.data";

beforeAll(startTestDb);
afterAll(stopTestDb);

beforeEach(async () => {
  await clearTestDb();
  await Product.deleteMany({});
  await Brand.deleteMany({});
  await Product.insertMany(productsCatalog);
  await Brand.insertMany(brandsCatalog);
});

async function getAdminToken() {
  const admin = await createTestUser({
    name: "Admin Uploader",
    email: "admin-uploader@nexphone.io",
    role: "admin",
    status: "active",
  });
  return signAccessToken(admin);
}

async function getCustomerToken() {
  const customer = await createTestUser({
    name: "Customer Uploader",
    email: "customer-uploader@example.com",
    role: "customer",
    status: "active",
  });
  return signAccessToken(customer);
}

// 1x1 transparent PNG buffer for mock image uploads
const MOCK_PNG_BUFFER = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

// Minimal binary buffer representing GLB header (Magic 0x46546C67 "glTF")
const MOCK_GLB_BUFFER = Buffer.concat([
  Buffer.from([0x67, 0x6c, 0x54, 0x46, 0x02, 0x00, 0x00, 0x00, 0x4c, 0x00, 0x00, 0x00]),
  Buffer.alloc(64, 0),
]);

describe("File Upload API (Feature 19)", () => {
  // ==========================================
  // Authentication & Backward Compatibility
  // ==========================================
  describe("Authentication & Backward Compatibility", () => {
    it("rejects unauthenticated upload requests with 401", async () => {
      const endpoints = [
        "/api/upload/image",
        "/api/upload/avatar",
        "/api/upload/products",
        "/api/upload/brands",
        "/api/upload/banners",
        "/api/upload/models-3d",
      ];

      for (const path of endpoints) {
        const res = await request(app).post(path);
        expect(res.status).toBe(401);
        expect(res.body.code).toBe("TOKEN_REQUIRED");
      }
    });

    it("rejects non-admin customers from catalog upload endpoints with 403", async () => {
      const customerToken = await getCustomerToken();
      const adminEndpoints = [
        "/api/upload/products",
        "/api/upload/brands",
        "/api/upload/banners",
        "/api/upload/models-3d",
      ];

      for (const path of adminEndpoints) {
        const res = await request(app)
          .post(path)
          .set("Authorization", `Bearer ${customerToken}`)
          .attach("file", MOCK_PNG_BUFFER, "test.png");

        expect(res.status).toBe(403);
        expect(res.body.code).toBe("FORBIDDEN");
      }
    });

    it("POST /api/upload/image allows authenticated customer upload", async () => {
      const customerToken = await getCustomerToken();

      const res = await request(app)
        .post("/api/upload/image")
        .set("Authorization", `Bearer ${customerToken}`)
        .attach("image", MOCK_PNG_BUFFER, "sample.png");

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("url");
      expect(res.body).toHaveProperty("secureUrl");
      expect(res.body).toHaveProperty("publicId");
    });
  });

  // ==========================================
  // 1. Upload Product Images
  // ==========================================
  describe("1. Upload Product Images", () => {
    it("POST /api/upload/products uploads product image with metadata", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .post("/api/upload/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("file", MOCK_PNG_BUFFER, "nexphone-obsidian.webp")
        .field("productId", "prod-001")
        .field("isPrimary", "true")
        .field("color", "Obsidian Black")
        .field("altText", "NexPhone Ultra Front Angle");

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.assetType).toBe("product_image");
      expect(res.body.folder).toBe("nexphone/products");
      expect(res.body).toHaveProperty("url");
      expect(res.body).toHaveProperty("secureUrl");
      expect(res.body).toHaveProperty("publicId");
      expect(res.body.metadata.productId).toBe("prod-001");
      expect(res.body.metadata.isPrimary).toBe(true);
      expect(res.body.metadata.color).toBe("Obsidian Black");

      // Verify product in database has image attached
      const product = await Product.findOne({ id: "prod-001" });
      expect(product).toBeDefined();
      expect(product?.images).toContain(res.body.secureUrl);
      expect(product?.imageUrl).toBe(res.body.secureUrl);
    });

    it("supports route alias POST /api/upload/product-image", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .post("/api/upload/product-image")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("image", MOCK_PNG_BUFFER, "alias-test.png");

      expect(res.status).toBe(201);
      expect(res.body.assetType).toBe("product_image");
    });

    it("returns 400 when no file is attached", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .post("/api/upload/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .field("productId", "prod-001");

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("NO_FILE_PROVIDED");
    });
  });

  // ==========================================
  // 2. Upload Brand Logos
  // ==========================================
  describe("2. Upload Brand Logos", () => {
    it("POST /api/upload/brands uploads brand logo and links to brand", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .post("/api/upload/brands")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("file", MOCK_PNG_BUFFER, "nexphone-brand-logo.png")
        .field("brandId", "brand-001")
        .field("brandSlug", "nexphone")
        .field("theme", "dark")
        .field("altText", "NexPhone Official Vector Mark");

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.assetType).toBe("brand_logo");
      expect(res.body.folder).toBe("nexphone/brands");
      expect(res.body.metadata.brandId).toBe("brand-001");
      expect(res.body.metadata.theme).toBe("dark");

      // Verify brand document updated in database
      const brand = await Brand.findOne({ id: "brand-001" });
      expect(brand?.logoUrl).toBe(res.body.secureUrl);
    });

    it("supports route alias POST /api/upload/brand-logo", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .post("/api/upload/brand-logo")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("logo", MOCK_PNG_BUFFER, "logo-alias.png")
        .field("theme", "light");

      expect(res.status).toBe(201);
      expect(res.body.assetType).toBe("brand_logo");
    });
  });

  // ==========================================
  // 3. Upload Homepage Banners
  // ==========================================
  describe("3. Upload Homepage Banners", () => {
    it("POST /api/upload/banners uploads homepage banner asset", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .post("/api/upload/banners")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("file", MOCK_PNG_BUFFER, "spring-launch-hero.webp")
        .field("placement", "hero")
        .field("deviceTarget", "desktop")
        .field("title", "NexPhone 2026 Spring Launch")
        .field("linkUrl", "/promotions/spring-2026");

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.assetType).toBe("homepage_banner");
      expect(res.body.folder).toBe("nexphone/banners");
      expect(res.body.metadata.placement).toBe("hero");
      expect(res.body.metadata.deviceTarget).toBe("desktop");
      expect(res.body.metadata.title).toBe("NexPhone 2026 Spring Launch");
    });

    it("supports route alias POST /api/upload/banner", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .post("/api/upload/banner")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("banner", MOCK_PNG_BUFFER, "strip.webp")
        .field("placement", "promo_strip");

      expect(res.status).toBe(201);
      expect(res.body.assetType).toBe("homepage_banner");
    });
  });

  // ==========================================
  // 4. Upload 3D Phone Models
  // ==========================================
  describe("4. Upload 3D Phone Models", () => {
    it("POST /api/upload/models-3d uploads .glb 3D mesh and links to product", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .post("/api/upload/models-3d")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("file", MOCK_GLB_BUFFER, "nexphone-flagship.glb")
        .field("productId", "prod-001")
        .field("polygonCount", "54000")
        .field("autoRotate", "true")
        .field("defaultColor", "#0f172a")
        .field("wireframeSupported", "true");

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.assetType).toBe("3d_model");
      expect(res.body.format).toBe("glb");
      expect(res.body.folder).toBe("nexphone/3d-models");
      expect(res.body.metadata.polygonCount).toBe(54000);
      expect(res.body.metadata.autoRotate).toBe(true);

      // Verify product in database has model3D populated
      const product = await Product.findOne({ id: "prod-001" });
      expect(product?.model3D?.enabled).toBe(true);
      expect(product?.model3D?.modelUrl).toBe(res.body.secureUrl);
      expect(product?.model3D?.fileFormat).toBe("glb");
      expect(product?.model3D?.polygonCount).toBe(54000);
    });

    it("rejects non-3D file type (e.g. .exe or .pdf) with 400", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .post("/api/upload/models-3d")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("file", Buffer.from("Not a 3D model"), "document.pdf");

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("INVALID_3D_FILE_TYPE");
    });

    it("supports route alias POST /api/upload/3d-model", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .post("/api/upload/3d-model")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("model", MOCK_GLB_BUFFER, "model-alias.glb");

      expect(res.status).toBe(201);
      expect(res.body.assetType).toBe("3d_model");
    });
  });

  // ==========================================
  // 5. Delete Uploaded Files
  // ==========================================
  describe("5. Delete Uploaded Files", () => {
    it("DELETE /api/upload/files/:id removes uploaded asset", async () => {
      const adminToken = await getAdminToken();

      // 1. Upload an asset
      const uploadRes = await request(app)
        .post("/api/upload/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("file", MOCK_PNG_BUFFER, "to-delete.png");

      expect(uploadRes.status).toBe(201);
      const fileId = uploadRes.body.id;

      // 2. Delete it by ID
      const deleteRes = await request(app)
        .delete(`/api/upload/files/${fileId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // 3. Verify it's no longer retrievable
      const getRes = await request(app)
        .get(`/api/upload/files/${fileId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(getRes.status).toBe(404);
    });

    it("supports POST /api/upload/delete with body { publicId }", async () => {
      const adminToken = await getAdminToken();

      // 1. Upload an asset
      const uploadRes = await request(app)
        .post("/api/upload/banners")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("file", MOCK_PNG_BUFFER, "banner-to-delete.png");

      const publicId = uploadRes.body.publicId;

      // 2. Delete via POST /delete
      const delRes = await request(app)
        .post("/api/upload/delete")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ publicId });

      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);
      expect(delRes.body.publicId).toBe(publicId);
    });
  });

  // ==========================================
  // 6. List & Query Uploaded Files
  // ==========================================
  describe("6. List & Query Uploaded Files", () => {
    it("GET /api/upload/files returns catalog of uploaded assets with pagination", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .get("/api/upload/files")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.files)).toBe(true);
      expect(res.body.files.length).toBeGreaterThan(0);
      expect(res.body).toHaveProperty("pagination");
    });

    it("supports filtering by assetType (e.g. ?assetType=3d_model)", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .get("/api/upload/files?assetType=3d_model")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.files.every((f: any) => f.assetType === "3d_model")).toBe(true);
    });

    it("supports search filter query", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .get("/api/upload/files?search=nexphone")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.files.length).toBeGreaterThan(0);
    });
  });
});
