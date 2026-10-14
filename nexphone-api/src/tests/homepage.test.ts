import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";

describe("Homepage Content API (Feature 16)", () => {
  let createdBannerId = "";
  let createdSectionId = "";

  // ==========================================
  // 1. Get Homepage Banners
  // ==========================================
  describe("1. Get Homepage Banners", () => {
    it("GET /api/homepage/banners returns sorted list of banners", async () => {
      const res = await request(app).get("/api/homepage/banners");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const banner = res.body[0];
      expect(banner).toHaveProperty("id");
      expect(banner).toHaveProperty("title");
      expect(banner).toHaveProperty("badge");
      expect(banner).toHaveProperty("primaryCta");
      expect(banner.primaryCta).toHaveProperty("label");
      expect(banner.primaryCta).toHaveProperty("url");
      expect(banner).toHaveProperty("imageUrl");
      expect(banner).toHaveProperty("displayOrder");
      expect(banner).toHaveProperty("status");
    });

    it("supports legacy route GET /api/content/banners", async () => {
      const res = await request(app).get("/api/content/banners");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("supports top-level alias GET /api/banners", async () => {
      const res = await request(app).get("/api/banners");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("filters banners by status (?status=active)", async () => {
      const res = await request(app).get("/api/homepage/banners?status=active");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((b: any) => {
        expect(b.status).toBe("active");
      });
    });

    it("GET /api/homepage/banners/:id retrieves specific banner details", async () => {
      const listRes = await request(app).get("/api/homepage/banners");
      const firstId = listRes.body[0].id;

      const res = await request(app).get(`/api/homepage/banners/${firstId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", firstId);
      expect(res.body).toHaveProperty("title");
    });

    it("returns 404 for unknown banner ID", async () => {
      const res = await request(app).get("/api/homepage/banners/non-existent-banner-id");
      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 2. Get Featured Products
  // ==========================================
  describe("2. Get Featured Products", () => {
    it("GET /api/homepage/featured-products returns featured phone items", async () => {
      const res = await request(app).get("/api/homepage/featured-products");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const item = res.body[0];
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("productName");
      expect(item).toHaveProperty("productPrice");
      expect(item).toHaveProperty("formattedPrice");
      expect(item.formattedPrice).toMatch(/^\$/);
      expect(item).toHaveProperty("badge");
      expect(item).toHaveProperty("headline");
      expect(Array.isArray(item.highlightSpecs)).toBe(true);
      expect(item).toHaveProperty("rating");
    });

    it("supports route alias GET /api/homepage/featured", async () => {
      const res = await request(app).get("/api/homepage/featured");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("supports legacy route GET /api/content/featured", async () => {
      const res = await request(app).get("/api/content/featured");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("supports filtering by series query parameter", async () => {
      const res = await request(app).get("/api/homepage/featured-products?series=Pro");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0].series.toLowerCase()).toContain("pro");
      }
    });
  });

  // ==========================================
  // 3. Get Promotional Sections
  // ==========================================
  describe("3. Get Promotional Sections", () => {
    it("GET /api/homepage/promotional-sections returns promotional content blocks", async () => {
      const res = await request(app).get("/api/homepage/promotional-sections");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const section = res.body[0];
      expect(section).toHaveProperty("id");
      expect(section).toHaveProperty("sectionKey");
      expect(section).toHaveProperty("title");
      expect(section).toHaveProperty("type");
      expect(section).toHaveProperty("ctaLabel");
      expect(section).toHaveProperty("accentColor");
      expect(Array.isArray(section.features)).toBe(true);
    });

    it("supports route alias GET /api/homepage/sections", async () => {
      const res = await request(app).get("/api/homepage/sections");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("supports legacy route GET /api/content/promo-sections", async () => {
      const res = await request(app).get("/api/content/promo-sections");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("GET /api/homepage/sections/:id returns specific section", async () => {
      const listRes = await request(app).get("/api/homepage/sections");
      const firstKey = listRes.body[0].sectionKey;

      const res = await request(app).get(`/api/homepage/sections/${firstKey}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("sectionKey", firstKey);
    });
  });

  // ==========================================
  // 4. Create Banner (Admin)
  // ==========================================
  describe("4. Create Banner (Admin)", () => {
    it("POST /api/homepage/banners creates a new promotional banner", async () => {
      const newBannerPayload = {
        title: "NexPhone Quantum Edition Launch",
        subtitle: "The world's first sub-orbital mesh smartphone.",
        badge: "World Premiere",
        primaryCta: {
          label: "Reserve VIP Allocation",
          url: "/products/quantum",
        },
        secondaryCta: {
          label: "View Keynote Video",
          url: "/keynote",
        },
        imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80",
        alignment: "center",
        displayOrder: 10,
        status: "active",
      };

      const res = await request(app).post("/api/homepage/banners").send(newBannerPayload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.title).toBe("NexPhone Quantum Edition Launch");
      expect(res.body.badge).toBe("World Premiere");
      expect(res.body.primaryCta.label).toBe("Reserve VIP Allocation");
      expect(res.body.displayOrder).toBe(10);

      createdBannerId = res.body.id;
    });

    it("supports legacy route POST /api/content/banners", async () => {
      const payload = {
        title: "Autumn Enterprise Showcase",
        primaryCta: { label: "Learn More", url: "/enterprise" },
      };
      const res = await request(app).post("/api/content/banners").send(payload);
      expect(res.status).toBe(201);
      expect(res.body.title).toBe("Autumn Enterprise Showcase");
    });

    it("rejects creation when required title is missing with 400", async () => {
      const res = await request(app).post("/api/homepage/banners").send({
        badge: "Missing Title Banner",
        primaryCta: { label: "Click", url: "/test" },
      });
      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // 5. Update Banner (Admin)
  // ==========================================
  describe("5. Update Banner (Admin)", () => {
    it("PUT /api/homepage/banners/:id updates banner properties", async () => {
      expect(createdBannerId).toBeTruthy();

      const updatePayload = {
        title: "NexPhone Quantum Edition Launch (Updated Title)",
        subtitle: "Global delivery begins next week worldwide.",
        badge: "Special Edition",
        displayOrder: 5,
        status: "active",
      };

      const res = await request(app)
        .put(`/api/homepage/banners/${createdBannerId}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdBannerId);
      expect(res.body.title).toBe("NexPhone Quantum Edition Launch (Updated Title)");
      expect(res.body.badge).toBe("Special Edition");
      expect(res.body.displayOrder).toBe(5);
    });

    it("supports PATCH /api/homepage/banners/:id for partial update", async () => {
      const res = await request(app)
        .patch(`/api/homepage/banners/${createdBannerId}`)
        .send({ badge: "Limited Run 500 Units" });

      expect(res.status).toBe(200);
      expect(res.body.badge).toBe("Limited Run 500 Units");
    });

    it("returns 404 when updating non-existent banner", async () => {
      const res = await request(app)
        .put("/api/homepage/banners/banner-does-not-exist")
        .send({ title: "Ghost Banner" });

      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 6. Delete Banner (Admin)
  // ==========================================
  describe("6. Delete Banner (Admin)", () => {
    it("DELETE /api/homepage/banners/:id removes banner successfully", async () => {
      expect(createdBannerId).toBeTruthy();

      const res = await request(app).delete(`/api/homepage/banners/${createdBannerId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(res.body).toHaveProperty("banner");
      expect(res.body.banner.id).toBe(createdBannerId);

      // Verify it's no longer retrievable
      const checkRes = await request(app).get(`/api/homepage/banners/${createdBannerId}`);
      expect(checkRes.status).toBe(404);
    });

    it("returns 404 when deleting an already deleted or non-existent banner", async () => {
      const res = await request(app).delete(`/api/homepage/banners/${createdBannerId}`);
      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 7. Manage Homepage Sections (Admin)
  // ==========================================
  describe("7. Manage Homepage Sections (Admin)", () => {
    it("POST /api/homepage/sections creates a new promotional section", async () => {
      const sectionPayload = {
        sectionKey: "ai_satellite_mesh_callout",
        title: "Autonomous AI Mesh Routing",
        subtitle: "Groundbreaking peer-to-peer satellite communication without cellular towers.",
        type: "feature_grid",
        ctaLabel: "Explore AI Routing Protocol",
        ctaUrl: "/technology/ai-mesh",
        accentColor: "purple",
        displayOrder: 15,
        features: [
          { icon: "cpu", title: "On-Device Neural Engine", desc: "Real-time voice encoding with zero latency." },
          { icon: "shield", title: "Post-Quantum Enclave", desc: "Military-grade end-to-end signal encryption." },
        ],
      };

      const res = await request(app).post("/api/homepage/sections").send(sectionPayload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.sectionKey).toBe("ai_satellite_mesh_callout");
      expect(res.body.title).toBe("Autonomous AI Mesh Routing");
      expect(res.body.accentColor).toBe("purple");

      createdSectionId = res.body.id;
    });

    it("PUT /api/homepage/sections/:id updates the promotional section", async () => {
      expect(createdSectionId).toBeTruthy();

      const updatePayload = {
        title: "Autonomous AI Mesh Routing V2",
        subtitle: "Enhanced protocol with 10x throughput.",
        accentColor: "indigo",
      };

      const res = await request(app)
        .put(`/api/homepage/sections/${createdSectionId}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Autonomous AI Mesh Routing V2");
      expect(res.body.accentColor).toBe("indigo");
    });

    it("PUT /api/homepage/sections/reorder bulk-reorders sections", async () => {
      const listRes = await request(app).get("/api/homepage/sections");
      const sectionIds = listRes.body.slice(0, 3).map((s: any) => s.id).reverse();

      const res = await request(app)
        .put("/api/homepage/sections/reorder")
        .send({ sectionIds });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].id).toBe(sectionIds[0]);
    });

    it("DELETE /api/homepage/sections/:id removes the promotional section", async () => {
      expect(createdSectionId).toBeTruthy();

      const res = await request(app).delete(`/api/homepage/sections/${createdSectionId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");

      const checkRes = await request(app).get(`/api/homepage/sections/${createdSectionId}`);
      expect(checkRes.status).toBe(404);
    });
  });

  // ==========================================
  // 8. Composite Homepage API & Summary Metrics
  // ==========================================
  describe("8. Composite Homepage & Metrics", () => {
    it("GET /api/homepage aggregates complete storefront content in 1 request", async () => {
      const res = await request(app).get("/api/homepage");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("banners");
      expect(Array.isArray(res.body.banners)).toBe(true);
      expect(res.body).toHaveProperty("featuredProducts");
      expect(Array.isArray(res.body.featuredProducts)).toBe(true);
      expect(res.body).toHaveProperty("promotionalSections");
      expect(Array.isArray(res.body.promotionalSections)).toBe(true);
      expect(res.body).toHaveProperty("newArrivals");
      expect(res.body).toHaveProperty("bestSellers");
      expect(res.body).toHaveProperty("meta");
      expect(res.body.meta).toHaveProperty("generatedAt");
    });

    it("GET /api/content/metrics returns marketing engagement KPIs", async () => {
      const res = await request(app).get("/api/content/metrics");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("activeBanners");
      expect(res.body).toHaveProperty("totalBanners");
      expect(res.body).toHaveProperty("featuredPhonesCount");
      expect(res.body).toHaveProperty("totalBannerImpressions");
      expect(res.body).toHaveProperty("totalBannerClicks");
      expect(res.body).toHaveProperty("avgCtr");
    });
  });

  // ==========================================
  // 9. New Arrivals Storefront & Management
  // ==========================================
  describe("9. New Arrivals API", () => {
    let newArrivalId = "";

    it("GET /api/content/new-arrivals returns list of new arrivals", async () => {
      const res = await request(app).get("/api/content/new-arrivals");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("id");
      expect(res.body[0]).toHaveProperty("productName");
      expect(res.body[0]).toHaveProperty("formattedPrice");
    });

    it("POST /api/content/new-arrivals creates a new arrival item", async () => {
      const payload = {
        productId: "p99",
        productName: "NexPhone Horizon Fold",
        productSubtitle: "Foldable OLED Display with Quantum Satellite Link",
        productPrice: 1999,
        tag: "Pre-order Now",
        isPreOrder: true,
      };
      const res = await request(app).post("/api/content/new-arrivals").send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.productName).toBe("NexPhone Horizon Fold");
      expect(res.body.isPreOrder).toBe(true);
      newArrivalId = res.body.id;
    });

    it("GET /api/content/new-arrivals/:id retrieves item by ID", async () => {
      const res = await request(app).get(`/api/content/new-arrivals/${newArrivalId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(newArrivalId);
      expect(res.body.productName).toBe("NexPhone Horizon Fold");
    });

    it("PUT /api/content/new-arrivals/:id updates new arrival item", async () => {
      const res = await request(app)
        .put(`/api/content/new-arrivals/${newArrivalId}`)
        .send({ tag: "Now Shipping", initialStock: 1000 });
      expect(res.status).toBe(200);
      expect(res.body.tag).toBe("Now Shipping");
    });

    it("DELETE /api/content/new-arrivals/:id deletes item", async () => {
      const res = await request(app).delete(`/api/content/new-arrivals/${newArrivalId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");

      const checkRes = await request(app).get(`/api/content/new-arrivals/${newArrivalId}`);
      expect(checkRes.status).toBe(404);
    });
  });

  // ==========================================
  // 10. Best Sellers Storefront & Management
  // ==========================================
  describe("10. Best Sellers API", () => {
    let bestSellerId = "";

    it("GET /api/content/best-sellers returns list of top selling phones", async () => {
      const res = await request(app).get("/api/content/best-sellers");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("id");
      expect(res.body[0]).toHaveProperty("unitsSold");
      expect(res.body[0]).toHaveProperty("formattedPrice");
    });

    it("POST /api/content/best-sellers creates a top seller entry", async () => {
      const payload = {
        productId: "p88",
        productName: "NexPhone Cyber Lite",
        productPrice: 799,
        rank: 1,
        unitsSold: 25000,
        badge: "Global #1",
      };
      const res = await request(app).post("/api/content/best-sellers").send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.productName).toBe("NexPhone Cyber Lite");
      expect(res.body.badge).toBe("Global #1");
      bestSellerId = res.body.id;
    });

    it("GET /api/content/best-sellers/:id retrieves best seller by ID", async () => {
      const res = await request(app).get(`/api/content/best-sellers/${bestSellerId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(bestSellerId);
    });

    it("PUT /api/content/best-sellers/:id updates best seller properties", async () => {
      const res = await request(app)
        .put(`/api/content/best-sellers/${bestSellerId}`)
        .send({ unitsSold: 30000, badge: "Triple Platinum" });
      expect(res.status).toBe(200);
      expect(res.body.unitsSold).toBe(30000);
      expect(res.body.badge).toBe("Triple Platinum");
    });

    it("DELETE /api/content/best-sellers/:id deletes best seller item", async () => {
      const res = await request(app).delete(`/api/content/best-sellers/${bestSellerId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");

      const checkRes = await request(app).get(`/api/content/best-sellers/${bestSellerId}`);
      expect(checkRes.status).toBe(404);
    });
  });
});

