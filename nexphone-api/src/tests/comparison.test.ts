import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";

describe("Phone Comparison API", () => {
  // ==========================================
  // 1. Compare 2–3 Phones
  // ==========================================
  describe("1. Compare 2–3 Phones", () => {
    it("GET /api/compare?ids=prod-001,prod-002 compares two phones side-by-side", async () => {
      const res = await request(app).get("/api/compare?ids=prod-001,prod-002");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.comparisonCount).toBe(2);
      expect(res.body.productIds).toEqual(["prod-001", "prod-002"]);
      expect(res.body.products).toHaveLength(2);
      expect(res.body.products[0].id).toBe("prod-001");
      expect(res.body.products[1].id).toBe("prod-002");
      expect(res.body.specifications.length).toBeGreaterThanOrEqual(6);
      expect(typeof res.body.totalDifferences).toBe("number");
      expect(res.body.totalDifferences).toBeGreaterThan(0);
      expect(Array.isArray(res.body.differingFields)).toBe(true);
    });

    it("POST /api/compare compares 3 phones via JSON body", async () => {
      const res = await request(app)
        .post("/api/compare")
        .send({ productIds: ["prod-001", "prod-002", "prod-003"] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.comparisonCount).toBe(3);
      expect(res.body.products).toHaveLength(3);
      expect(res.body.products.map((p: any) => p.id)).toEqual(["prod-001", "prod-002", "prod-003"]);
    });

    it("supports compare route aliases (/compare and /api/products/compare)", async () => {
      const res1 = await request(app).get("/compare?ids=prod-001,prod-002");
      expect(res1.status).toBe(200);
      expect(res1.body.comparisonCount).toBe(2);

      const res2 = await request(app).get("/api/products/compare?ids=prod-001,prod-002");
      expect(res2.status).toBe(200);
      expect(res2.body.comparisonCount).toBe(2);
    });

    it("supports comparing phones by slug", async () => {
      const res = await request(app).get(
        "/api/compare?ids=nexphone-pro-max-x,nexphone-enterprise-edge"
      );
      expect(res.status).toBe(200);
      expect(res.body.products[0].slug).toBe("nexphone-pro-max-x");
      expect(res.body.products[1].slug).toBe("nexphone-enterprise-edge");
    });

    it("highlightDifferences=true filters specifications to only differing rows", async () => {
      const fullRes = await request(app).get("/api/compare?ids=prod-001,prod-002");
      const filteredRes = await request(app).get(
        "/api/compare?ids=prod-001,prod-002&highlightDifferences=true"
      );

      expect(fullRes.status).toBe(200);
      expect(filteredRes.status).toBe(200);

      const totalFullRows = fullRes.body.specifications.reduce(
        (sum: number, cat: any) => sum + cat.rows.length,
        0
      );
      const totalFilteredRows = filteredRes.body.specifications.reduce(
        (sum: number, cat: any) => sum + cat.rows.length,
        0
      );

      expect(totalFilteredRows).toBe(filteredRes.body.totalDifferences);
      expect(totalFilteredRows).toBeLessThanOrEqual(totalFullRows);

      for (const cat of filteredRes.body.specifications) {
        for (const row of cat.rows) {
          expect(row.isDifferent).toBe(true);
        }
      }
    });

    it("returns 400 when less than 2 phones are requested", async () => {
      const res1 = await request(app).get("/api/compare?ids=prod-001");
      expect(res1.status).toBe(400);

      const res2 = await request(app).post("/api/compare").send({ productIds: [] });
      expect(res2.status).toBe(400);
    });

    it("returns 400 when identical phone IDs are provided", async () => {
      const res = await request(app).get("/api/compare?ids=prod-001,prod-001");
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/distinct phones/i);
    });

    it("returns 400 when exceeding 4 phones limit", async () => {
      const res = await request(app)
        .post("/api/compare")
        .send({ productIds: ["prod-001", "prod-002", "prod-003", "prod-004", "prod-005"] });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/maximum of 4 phones/i);
    });

    it("returns 404 when any phone ID is not found", async () => {
      const res = await request(app).get("/api/compare?ids=prod-001,unknown-phone-xyz");
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/Phone not found/i);
    });
  });

  // ==========================================
  // 2. Get Comparison Specifications
  // ==========================================
  describe("2. Get Comparison Specifications", () => {
    it("GET /api/compare/specifications returns only category specification matrix", async () => {
      const res = await request(app).get("/api/compare/specifications?ids=prod-001,prod-002");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.comparisonCount).toBe(2);
      expect(res.body.specifications).toBeInstanceOf(Array);
      expect(res.body.specifications.length).toBeGreaterThanOrEqual(6);

      const displayCategory = res.body.specifications.find(
        (c: any) => c.categoryKey === "display"
      );
      expect(displayCategory).toBeDefined();
      expect(displayCategory.categoryTitle).toBe("Display Architecture");
      expect(displayCategory.rows.length).toBeGreaterThan(0);

      const row = displayCategory.rows[0];
      expect(row).toHaveProperty("key");
      expect(row).toHaveProperty("label");
      expect(row.values).toHaveProperty("prod-001");
      expect(row.values).toHaveProperty("prod-002");
      expect(typeof row.isDifferent).toBe("boolean");
    });

    it("POST /api/compare/specifications supports highlightDifferences", async () => {
      const res = await request(app)
        .post("/api/compare/specifications")
        .send({
          productIds: ["prod-001", "prod-002"],
          highlightDifferences: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.specifications.every((c: any) =>
        c.rows.every((r: any) => r.isDifferent === true)
      )).toBe(true);
    });

    it("returns 400 when less than 2 phone IDs are passed", async () => {
      const res = await request(app).get("/api/compare/specifications");
      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // 3. Get Phone Comparison Data
  // ==========================================
  describe("3. Get Phone Comparison Data", () => {
    it("GET /api/compare/data returns available comparison candidates list", async () => {
      const res = await request(app).get("/api/compare/data");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
      expect(Array.isArray(res.body.phones)).toBe(true);

      const phone = res.body.phones[0];
      expect(phone).toHaveProperty("id");
      expect(phone).toHaveProperty("name");
      expect(phone).toHaveProperty("slug");
      expect(phone).toHaveProperty("brand");
      expect(phone).toHaveProperty("startingStorage");
      expect(phone).toHaveProperty("startingRam");
      expect(phone).toHaveProperty("basePrice");
      expect(phone).toHaveProperty("colors");
      expect(phone).toHaveProperty("storageOptions");
    });

    it("GET /api/compare/data?ids=prod-001,prod-002 filters to specific phone cards", async () => {
      const res = await request(app).get("/api/compare/data?ids=prod-001,prod-002");
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.phones.map((p: any) => p.id)).toEqual(["prod-001", "prod-002"]);
    });

    it("POST /api/compare/data returns comparison cards for requested array", async () => {
      const res = await request(app)
        .post("/api/compare/data")
        .send({ productIds: ["prod-002"] });
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.phones[0].id).toBe("prod-002");
    });
  });
});
