import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";

describe("Reports API (Feature 17)", () => {
  // ==========================================
  // 1. Generate Sales Report
  // ==========================================
  describe("1. Generate Sales Report", () => {
    it("GET /api/reports/sales returns structured commercial sales analytics (JSON)", async () => {
      const res = await request(app).get("/api/reports/sales");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reportType", "sales");
      expect(res.body).toHaveProperty("generatedAt");
      expect(res.body).toHaveProperty("period");
      expect(res.body.period).toHaveProperty("range", "30d");

      expect(res.body).toHaveProperty("summary");
      expect(res.body.summary).toHaveProperty("totalRevenue");
      expect(res.body.summary).toHaveProperty("formattedTotalRevenue");
      expect(typeof res.body.summary.totalRevenue).toBe("number");
      expect(res.body.summary.totalRevenue).toBeGreaterThan(0);
      expect(res.body.summary).toHaveProperty("totalOrders");
      expect(res.body.summary).toHaveProperty("averageOrderValue");
      expect(res.body.summary).toHaveProperty("netRevenue");

      expect(Array.isArray(res.body.breakdown)).toBe(true);
      expect(res.body.breakdown.length).toBeGreaterThan(0);
      const firstRow = res.body.breakdown[0];
      expect(firstRow).toHaveProperty("period");
      expect(firstRow).toHaveProperty("revenue");
      expect(firstRow).toHaveProperty("ordersCount");

      expect(Array.isArray(res.body.topProducts)).toBe(true);
      expect(Array.isArray(res.body.channels)).toBe(true);
    });

    it("supports range filtering (GET /api/reports/sales?range=7d)", async () => {
      const res = await request(app).get("/api/reports/sales?range=7d");
      expect(res.status).toBe(200);
      expect(res.body.period.range).toBe("7d");
      expect(res.body.summary.totalRevenue).toBeGreaterThan(0);
    });

    it("exports sales report to CSV via format=csv query param", async () => {
      const res = await request(app).get("/api/reports/sales?format=csv");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.headers["content-disposition"]).toContain("attachment; filename=");
      expect(typeof res.text).toBe("string");
      expect(res.text).toContain("Period,Revenue (USD),Orders Count,Units Sold,Average Order Value (USD)");
    });

    it("supports direct CSV sub-path GET /api/reports/sales/csv", async () => {
      const res = await request(app).get("/api/reports/sales/csv");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.text).toContain("Revenue (USD)");
    });
  });

  // ==========================================
  // 2. Generate Order Report
  // ==========================================
  describe("2. Generate Order Report", () => {
    it("GET /api/reports/orders returns operational fulfillment metrics (JSON)", async () => {
      const res = await request(app).get("/api/reports/orders");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reportType", "orders");
      expect(res.body).toHaveProperty("generatedAt");

      expect(res.body).toHaveProperty("summary");
      expect(res.body.summary).toHaveProperty("totalOrders");
      expect(res.body.summary).toHaveProperty("fulfilledOrders");
      expect(res.body.summary).toHaveProperty("fulfillmentRate");
      expect(res.body.summary).toHaveProperty("totalAmount");

      expect(res.body).toHaveProperty("statusBreakdown");
      expect(res.body.statusBreakdown).toHaveProperty("confirmed");
      expect(res.body.statusBreakdown).toHaveProperty("delivered");

      expect(res.body).toHaveProperty("paymentBreakdown");
      expect(res.body.paymentBreakdown).toHaveProperty("paid");

      expect(Array.isArray(res.body.orders)).toBe(true);
      expect(res.body.orders.length).toBeGreaterThan(0);

      const sampleOrder = res.body.orders[0];
      expect(sampleOrder).toHaveProperty("orderNumber");
      expect(sampleOrder).toHaveProperty("customerName");
      expect(sampleOrder).toHaveProperty("totalAmount");
      expect(sampleOrder).toHaveProperty("status");
    });

    it("filters order report by status (GET /api/reports/orders?status=delivered)", async () => {
      const res = await request(app).get("/api/reports/orders?status=delivered");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.orders)).toBe(true);
      res.body.orders.forEach((o: any) => {
        expect(o.status).toBe("delivered");
      });
    });

    it("exports order report to CSV via format=csv", async () => {
      const res = await request(app).get("/api/reports/orders?format=csv");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.headers["content-disposition"]).toContain("attachment; filename=");
      expect(res.text).toContain("Order Number,Customer Name,Customer Email,Order Status");
    });

    it("supports direct CSV sub-path GET /api/reports/orders/csv", async () => {
      const res = await request(app).get("/api/reports/orders/csv");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.text).toContain("Order Number");
    });
  });

  // ==========================================
  // 3. Generate Inventory Report
  // ==========================================
  describe("3. Generate Inventory Report", () => {
    it("GET /api/reports/inventory returns warehouse valuation & stock health (JSON)", async () => {
      const res = await request(app).get("/api/reports/inventory");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reportType", "inventory");

      expect(res.body).toHaveProperty("summary");
      expect(res.body.summary).toHaveProperty("totalItems");
      expect(res.body.summary).toHaveProperty("totalUnits");
      expect(res.body.summary).toHaveProperty("totalValuation");
      expect(res.body.summary).toHaveProperty("lowStockCount");
      expect(res.body.summary).toHaveProperty("averageUnitCost");

      expect(Array.isArray(res.body.warehouseBreakdown)).toBe(true);
      expect(res.body.warehouseBreakdown.length).toBeGreaterThan(0);

      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThan(0);

      const sampleItem = res.body.items[0];
      expect(sampleItem).toHaveProperty("sku");
      expect(sampleItem).toHaveProperty("productName");
      expect(sampleItem).toHaveProperty("stockQuantity");
      expect(sampleItem).toHaveProperty("unitCost");
      expect(sampleItem).toHaveProperty("retailPrice");
      expect(sampleItem).toHaveProperty("totalValue");
      expect(sampleItem).toHaveProperty("status");
    });

    it("filters inventory report by warehouse (GET /api/reports/inventory?warehouse=Frankfurt)", async () => {
      const res = await request(app).get("/api/reports/inventory?warehouse=Frankfurt");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      res.body.items.forEach((it: any) => {
        expect(it.warehouse.toLowerCase()).toContain("frankfurt");
      });
    });

    it("exports inventory report to CSV via format=csv", async () => {
      const res = await request(app).get("/api/reports/inventory?format=csv");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.text).toContain("SKU,Product Name,Brand,Warehouse,Stock Qty");
    });

    it("supports direct CSV sub-path GET /api/reports/inventory/csv", async () => {
      const res = await request(app).get("/api/reports/inventory/csv");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.text).toContain("Total Value (USD)");
    });
  });

  // ==========================================
  // 4. Generate Customer Report
  // ==========================================
  describe("4. Generate Customer Report", () => {
    it("GET /api/reports/customers returns customer cohorts and LTV (JSON)", async () => {
      const res = await request(app).get("/api/reports/customers");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reportType", "customers");

      expect(res.body).toHaveProperty("summary");
      expect(res.body.summary).toHaveProperty("totalCustomers");
      expect(res.body.summary).toHaveProperty("activeCustomers");
      expect(res.body.summary).toHaveProperty("totalLifetimeSpent");
      expect(res.body.summary).toHaveProperty("averageCustomerLifetimeValue");

      expect(res.body).toHaveProperty("tierBreakdown");
      expect(Array.isArray(res.body.tierBreakdown)).toBe(true);

      expect(Array.isArray(res.body.customers)).toBe(true);
      expect(res.body.customers.length).toBeGreaterThan(0);

      const customer = res.body.customers[0];
      expect(customer).toHaveProperty("customerNumber");
      expect(customer).toHaveProperty("name");
      expect(customer).toHaveProperty("email");
      expect(customer).toHaveProperty("tier");
      expect(customer).toHaveProperty("totalSpent");
      expect(customer).toHaveProperty("avgOrderValue");
    });

    it("filters customer report by tier (GET /api/reports/customers?tier=VIP)", async () => {
      const res = await request(app).get("/api/reports/customers?tier=VIP");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.customers)).toBe(true);
      res.body.customers.forEach((c: any) => {
        expect(c.tier).toBe("VIP");
      });
    });

    it("exports customer report to CSV via format=csv", async () => {
      const res = await request(app).get("/api/reports/customers?format=csv");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.text).toContain("Customer Number,Name,Email,Company,Tier");
    });

    it("supports direct CSV sub-path GET /api/reports/customers/csv", async () => {
      const res = await request(app).get("/api/reports/customers/csv");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.text).toContain("Total Spent (USD)");
    });
  });

  // ==========================================
  // 5. Export Reports to CSV API
  // ==========================================
  describe("5. Export Reports to CSV API", () => {
    it("POST /api/reports/export exports sales report to CSV", async () => {
      const res = await request(app)
        .post("/api/reports/export")
        .send({ reportType: "sales", range: "30d" });

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.text).toContain("Revenue (USD)");
    });

    it("POST /api/reports/export exports orders report to CSV", async () => {
      const res = await request(app)
        .post("/api/reports/export")
        .send({ reportType: "orders" });

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.text).toContain("Order Number");
    });

    it("POST /api/reports/export exports inventory report to CSV", async () => {
      const res = await request(app)
        .post("/api/reports/export")
        .send({ reportType: "inventory" });

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.text).toContain("SKU,Product Name");
    });

    it("POST /api/reports/export exports customers report to CSV", async () => {
      const res = await request(app)
        .post("/api/reports/export")
        .send({ reportType: "customers", tier: "VIP" });

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.text).toContain("Customer Number,Name");
    });

    it("GET /api/reports/export?reportType=sales exports sales CSV via GET query", async () => {
      const res = await request(app).get("/api/reports/export?reportType=sales");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
    });

    it("rejects invalid reportType with 400 validation error", async () => {
      const res = await request(app)
        .post("/api/reports/export")
        .send({ reportType: "invalid_report_type" });

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // 6. Reports Overview & Catalog
  // ==========================================
  describe("6. Reports Overview & Catalog", () => {
    it("GET /api/reports returns catalog of available analytics reports", async () => {
      const res = await request(app).get("/api/reports");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("availableReports");
      expect(Array.isArray(res.body.availableReports)).toBe(true);
      expect(res.body.availableReports.length).toBe(4);

      const types = res.body.availableReports.map((r: any) => r.type);
      expect(types).toContain("sales");
      expect(types).toContain("orders");
      expect(types).toContain("inventory");
      expect(types).toContain("customers");
    });
  });
});
