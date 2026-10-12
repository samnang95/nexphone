import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";

/**
 * Smoke test for the legacy in-memory modules that were split out of app.ts.
 * Guards against a router not being mounted, or being mounted after the 404 fallback.
 */
const listEndpoints = [
  "/",
  "/api/health",
  "/api/flavor",
  "/api/devices",
  "/api/dashboard/metrics",
  "/api/dashboard/revenue",
  "/api/dashboard/orders",
  "/api/products",
  "/api/brands",
  "/api/inventory",
  "/api/inventory-movements",
  "/api/orders",
  "/api/orders-metrics",
  "/api/customers",
  "/api/customers-metrics",
  "/api/reviews",
  "/api/reviews-metrics",
  "/api/promotions",
  "/api/promotions-metrics",
  "/api/content/banners",
  "/api/notifications",
  "/api/analytics/overview",
  "/analytics/overview",
];

const detailEndpoints: Array<[string, string]> = [
  ["/api/products/prod-001", "id"],
  ["/api/brands/brand-001", "id"],
  ["/api/inventory/inv-nx-pro-256", "id"],
  ["/api/orders/NX-ORD-9042", "id"],
  ["/api/customers/cust-001", "id"],
  ["/api/reviews/rev-001", "id"],
  ["/api/promotions/NEXLAUNCH20", "id"],
];

describe("legacy module routers (split from app.ts)", () => {
  it.each(listEndpoints)("GET %s responds 200", async (path) => {
    const res = await request(app).get(path);
    expect(res.status).toBe(200);
  });

  it.each(detailEndpoints)("GET %s returns the seeded record", async (path, key) => {
    const res = await request(app).get(path);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty(key);
  });

  it("customer detail still includes cross-module recent orders", async () => {
    const res = await request(app).get("/api/customers/cust-001");
    expect(Array.isArray(res.body.recentOrders)).toBe(true);
    expect(res.body.recentOrders.length).toBeGreaterThan(0);
  });

  it("unknown routes still reach the 404 fallback", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
  });
});
