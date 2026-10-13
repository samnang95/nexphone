import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";

describe("Dashboard Analytics API (Feature 15)", () => {
  describe("1. Get Total Revenue", () => {
    it("GET /api/dashboard/revenue returns formatted revenue metrics with breakdowns", async () => {
      const res = await request(app).get("/api/dashboard/revenue");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("value");
      expect(typeof res.body.value).toBe("string");
      expect(res.body.value).toMatch(/^\$/);
      expect(res.body).toHaveProperty("amount");
      expect(typeof res.body.amount).toBe("number");
      expect(res.body.amount).toBeGreaterThan(0);
      expect(res.body).toHaveProperty("grossRevenue");
      expect(res.body).toHaveProperty("netRevenue");
      expect(res.body).toHaveProperty("changePercentage");
      expect(res.body).toHaveProperty("trend");
      expect(Array.isArray(res.body.monthlyPoints)).toBe(true);
      expect(res.body.monthlyPoints.length).toBeGreaterThan(0);
      expect(Array.isArray(res.body.categoryBreakdown)).toBe(true);
      expect(res.body.categoryBreakdown.length).toBeGreaterThan(0);
    });

    it("supports route alias GET /api/dashboard/total-revenue", async () => {
      const res = await request(app).get("/api/dashboard/total-revenue");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("amount");
      expect(res.body).toHaveProperty("categoryBreakdown");
    });

    it("supports analytics route GET /api/analytics/revenue with range query", async () => {
      const res = await request(app).get("/api/analytics/revenue?range=7d");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("amount");
    });

    it("rejects invalid range query parameter with 400", async () => {
      const res = await request(app).get("/api/dashboard/revenue?range=century");
      expect(res.status).toBe(400);
    });
  });

  describe("2. Get Total Orders", () => {
    it("GET /api/dashboard/total-orders returns order volume and status counts", async () => {
      const res = await request(app).get("/api/dashboard/total-orders");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("value");
      expect(res.body).toHaveProperty("count");
      expect(typeof res.body.count).toBe("number");
      expect(res.body.count).toBeGreaterThan(0);
      expect(res.body).toHaveProperty("statusBreakdown");
      expect(res.body.statusBreakdown).toHaveProperty("confirmed");
      expect(res.body.statusBreakdown).toHaveProperty("delivered");
      expect(res.body).toHaveProperty("fulfillmentRate");
      expect(typeof res.body.fulfillmentRate).toBe("number");
    });

    it("accepts valid range query param", async () => {
      const res = await request(app).get("/api/dashboard/total-orders?range=quarter");
      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThan(0);
    });
  });

  describe("3. Get Total Customers", () => {
    it("GET /api/dashboard/total-customers returns customer counts and tier distribution", async () => {
      const res = await request(app).get("/api/dashboard/total-customers");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("value");
      expect(res.body).toHaveProperty("count");
      expect(typeof res.body.count).toBe("number");
      expect(res.body).toHaveProperty("activeBuyersCount");
      expect(res.body).toHaveProperty("newSignups");
      expect(Array.isArray(res.body.tierDistribution)).toBe(true);
      expect(res.body.tierDistribution.length).toBeGreaterThan(0);
    });

    it("supports analytics route GET /api/analytics/customers", async () => {
      const res = await request(app).get("/api/analytics/customers");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("count");
    });
  });

  describe("4. Get Total Products", () => {
    it("GET /api/dashboard/total-products returns product count and stock health metrics", async () => {
      const res = await request(app).get("/api/dashboard/total-products");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("value");
      expect(res.body).toHaveProperty("count");
      expect(typeof res.body.count).toBe("number");
      expect(res.body.count).toBeGreaterThan(0);
      expect(res.body).toHaveProperty("inStockCount");
      expect(res.body).toHaveProperty("lowStockCount");
      expect(res.body).toHaveProperty("outOfStockCount");
    });
  });

  describe("5. Get Recent Orders", () => {
    it("GET /api/dashboard/recent-orders returns serialized list of recent orders", async () => {
      const res = await request(app).get("/api/dashboard/recent-orders");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const order = res.body[0];
      expect(order).toHaveProperty("orderNumber");
      expect(order).toHaveProperty("customerName");
      expect(order).toHaveProperty("amount");
      expect(order).toHaveProperty("status");
    });

    it("supports route alias GET /api/dashboard/orders with limit query", async () => {
      const res = await request(app).get("/api/dashboard/orders?limit=2");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(2);
    });

    it("rejects invalid limit query parameter (>50) with 400", async () => {
      const res = await request(app).get("/api/dashboard/recent-orders?limit=100");
      expect(res.status).toBe(400);
    });
  });

  describe("6. Get Sales Chart Data", () => {
    it("GET /api/dashboard/sales-chart returns timeline points and category distribution", async () => {
      const res = await request(app).get("/api/dashboard/sales-chart?range=30d");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("range", "30d");
      expect(res.body).toHaveProperty("totalSalesVolume");
      expect(res.body).toHaveProperty("totalUnitsSold");
      expect(Array.isArray(res.body.dailyTimeline)).toBe(true);
      expect(res.body.dailyTimeline.length).toBeGreaterThan(0);

      const firstPoint = res.body.dailyTimeline[0];
      expect(firstPoint).toHaveProperty("date");
      expect(firstPoint).toHaveProperty("revenue");
      expect(firstPoint).toHaveProperty("orders");

      expect(Array.isArray(res.body.channels)).toBe(true);
    });

    it("supports analytics route GET /api/analytics/sales with range=7d", async () => {
      const res = await request(app).get("/api/analytics/sales?range=7d");
      expect(res.status).toBe(200);
      expect(res.body.range).toBe("7d");
      expect(res.body.dailyTimeline.length).toBe(7);
    });

    it("supports range=today", async () => {
      const res = await request(app).get("/api/dashboard/sales-chart?range=today");
      expect(res.status).toBe(200);
      expect(res.body.range).toBe("today");
      expect(Array.isArray(res.body.dailyTimeline)).toBe(true);
    });
  });

  describe("7. Get Best-Selling Phones", () => {
    it("GET /api/dashboard/best-selling-phones returns ranked phones by sales and revenue", async () => {
      const res = await request(app).get("/api/dashboard/best-selling-phones?limit=3");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(3);

      const phone = res.body[0];
      expect(phone).toHaveProperty("id");
      expect(phone).toHaveProperty("productId");
      expect(phone).toHaveProperty("name");
      expect(phone).toHaveProperty("unitsSold");
      expect(phone).toHaveProperty("revenue");
      expect(phone).toHaveProperty("averagePrice");
    });

    it("supports analytics route GET /api/analytics/best-sellers", async () => {
      const res = await request(app).get("/api/analytics/best-sellers?limit=2");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(2);
    });
  });

  describe("8. Get Low-Stock Summary", () => {
    it("GET /api/dashboard/low-stock returns inventory health and warehouse metrics", async () => {
      const res = await request(app).get("/api/dashboard/low-stock");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalValuation");
      expect(res.body).toHaveProperty("totalUnitsInStock");
      expect(res.body).toHaveProperty("lowStockItemsCount");
      expect(res.body).toHaveProperty("outOfStockItemsCount");
      expect(res.body).toHaveProperty("stockTurnoverRate");
      expect(Array.isArray(res.body.fastDepletingSkus)).toBe(true);
      expect(Array.isArray(res.body.warehouses)).toBe(true);
    });

    it("supports analytics route GET /api/analytics/inventory with custom threshold", async () => {
      const res = await request(app).get("/api/analytics/inventory?threshold=15");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalUnitsInStock");
      expect(res.body).toHaveProperty("warehouses");
    });
  });

  describe("9. Platform Overview & Device Fleet", () => {
    it("GET /api/dashboard/metrics aggregates high-level platform KPIs", async () => {
      const res = await request(app).get("/api/dashboard/metrics");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalSales");
      expect(res.body).toHaveProperty("totalOrders");
      expect(res.body).toHaveProperty("totalCustomers");
      expect(res.body).toHaveProperty("totalProducts");
      expect(res.body).toHaveProperty("activeDevices");
      expect(res.body).toHaveProperty("systemHealth");
    });

    it("GET /api/analytics/overview returns executive performance summary", async () => {
      const res = await request(app).get("/api/analytics/overview");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("generatedAt");
      expect(res.body).toHaveProperty("executiveSummary");
      expect(typeof res.body.executiveSummary).toBe("string");
    });

    it("GET /api/devices returns field test device telemetry", async () => {
      const res = await request(app).get("/api/devices");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("id");
      expect(res.body[0]).toHaveProperty("status");
      expect(res.body[0]).toHaveProperty("batteryLevel");
    });
  });
});
