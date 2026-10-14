import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { SystemSettings } from "../models/settings.model";
import {
  clearTestDb,
  createTestUser,
  startTestDb,
  stopTestDb,
} from "./helpers/db";
import { signAccessToken } from "../services/token.service";
import { settingsRepository } from "../repositories/settings.repo";

beforeAll(async () => {
  await startTestDb();
});

afterAll(async () => {
  await stopTestDb();
});

beforeEach(async () => {
  await clearTestDb();
  await SystemSettings.deleteMany({});
  await settingsRepository.resetToDefaults();
});

async function getAdminToken() {
  const admin = await createTestUser({
    name: "Admin Operator",
    email: "admin-settings@nexphone.io",
    role: "admin",
    status: "active",
  });
  return signAccessToken(admin);
}

async function getCustomerToken() {
  const customer = await createTestUser({
    name: "Customer User",
    email: "customer-settings@example.com",
    role: "customer",
    status: "active",
  });
  return signAccessToken(customer);
}

describe("System & Settings API (Feature 20)", () => {
  // ==========================================
  // 1. Get Store Settings
  // ==========================================
  describe("1. Get Store Settings", () => {
    it("GET /api/settings returns public store settings for storefront", async () => {
      const res = await request(app).get("/api/settings");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("storeName");
      expect(res.body).toHaveProperty("currency");
      expect(res.body).toHaveProperty("currencySymbol");
      expect(res.body).toHaveProperty("supportEmail");
      expect(res.body).toHaveProperty("taxRate");
      expect(res.body).toHaveProperty("maintenanceMode");
      expect(res.body).toHaveProperty("allowGuestCheckout");
      expect(res.body).toHaveProperty("enable3DViewer");
      expect(res.body).toHaveProperty("enablePhoneComparison");
    });

    it("supports route aliases (/settings, /api/settings/store, /settings/store)", async () => {
      const aliases = ["/settings", "/api/settings/store", "/settings/store"];
      for (const path of aliases) {
        const res = await request(app).get(path);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.currency).toBe("USD");
      }
    });

    it("GET /api/settings returns authenticated admin view with full store object", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .get("/api/settings")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.store).toBeDefined();
      expect(res.body.store.storeName).toBe("NexPhone Global Store");
    });
  });

  // ==========================================
  // 2. Update Store Settings (Admin)
  // ==========================================
  describe("2. Update Store Settings (Admin)", () => {
    it("rejects unauthenticated update requests with 401", async () => {
      const res = await request(app)
        .put("/api/settings")
        .send({ storeName: "Unauthorized Store" });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("TOKEN_REQUIRED");
    });

    it("rejects non-admin customers with 403 FORBIDDEN", async () => {
      const customerToken = await getCustomerToken();
      const res = await request(app)
        .put("/api/settings")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ storeName: "Customer Hacked Store" });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");
    });

    it("PUT /api/settings allows admin to update store identity and feature flags", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .put("/api/settings")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          storeName: "NexPhone Premier Global",
          supportEmail: "concierge@nexphone.io",
          supportPhone: "+1 (888) 999-0100",
          taxRate: 9.25,
          maintenanceMode: false,
          inventoryLowStockThreshold: 20,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.storeName).toBe("NexPhone Premier Global");
      expect(res.body.supportEmail).toBe("concierge@nexphone.io");
      expect(res.body.supportPhone).toBe("+1 (888) 999-0100");
      expect(res.body.taxRate).toBe(9.25);
      expect(res.body.inventoryLowStockThreshold).toBe(20);

      // Verify storefront now sees updated settings
      const getRes = await request(app).get("/api/settings");
      expect(getRes.status).toBe(200);
      expect(getRes.body.storeName).toBe("NexPhone Premier Global");
      expect(getRes.body.taxRate).toBe(9.25);
    });

    it("supports PATCH /api/settings for partial updates", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .patch("/api/settings")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          maintenanceMode: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.maintenanceMode).toBe(true);
    });

    it("rejects invalid input formats (e.g. invalid supportEmail)", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .put("/api/settings")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          supportEmail: "not-an-email",
        });

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // 3. Configure Shipping Settings
  // ==========================================
  describe("3. Configure Shipping Settings", () => {
    it("GET /api/settings/shipping returns current shipping policies and rates", async () => {
      const res = await request(app).get("/api/settings/shipping");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("defaultCarrier");
      expect(res.body).toHaveProperty("freeShippingThreshold");
      expect(res.body).toHaveProperty("standardShippingFee");
      expect(res.body).toHaveProperty("expressShippingFee");
      expect(res.body).toHaveProperty("estimatedDeliveryDays");
      expect(res.body).toHaveProperty("pickupInStore");
      expect(Array.isArray(res.body.pickupInStore.locations)).toBe(true);
    });

    it("supports route alias GET /api/shipping/settings", async () => {
      const res = await request(app).get("/api/shipping/settings");
      expect(res.status).toBe(200);
      expect(res.body.defaultCarrier).toBe("FedEx Priority");
    });

    it("PUT /api/settings/shipping updates shipping fees, threshold, and carrier (Admin)", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .put("/api/settings/shipping")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          defaultCarrier: "DHL Express World",
          freeShippingThreshold: 600,
          standardShippingFee: 20,
          expressShippingFee: 45,
          overnightShippingFee: 75,
          estimatedDeliveryDays: {
            standard: "2-4 business days",
            express: "1 business day",
            overnight: "Next morning",
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.defaultCarrier).toBe("DHL Express World");
      expect(res.body.freeShippingThreshold).toBe(600);
      expect(res.body.standardShippingFee).toBe(20);
      expect(res.body.expressShippingFee).toBe(45);
      expect(res.body.estimatedDeliveryDays.standard).toBe("2-4 business days");

      // Verify changes persist
      const freshRes = await request(app).get("/api/settings/shipping");
      expect(freshRes.body.defaultCarrier).toBe("DHL Express World");
      expect(freshRes.body.freeShippingThreshold).toBe(600);
    });

    it("rejects unauthenticated shipping updates with 401", async () => {
      const res = await request(app)
        .put("/api/settings/shipping")
        .send({ standardShippingFee: 0 });

      expect(res.status).toBe(401);
    });
  });

  // ==========================================
  // 4. Configure Payment Settings
  // ==========================================
  describe("4. Configure Payment Settings", () => {
    it("GET /api/settings/payment returns public payment methods and hides secret keys", async () => {
      const res = await request(app).get("/api/settings/payment");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("sandboxMode");
      expect(res.body).toHaveProperty("defaultCurrency");
      expect(res.body).toHaveProperty("supportedCurrencies");
      expect(res.body).toHaveProperty("availableGateways");
      expect(res.body).toHaveProperty("gateways");

      // Public view must NOT leak secret keys
      expect(res.body.gateways.stripe).not.toHaveProperty("secretKey");
      expect(res.body.gateways.stripe).not.toHaveProperty("secretKeyMasked");
    });

    it("GET /api/settings/payment returns masked credentials for authenticated admin", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .get("/api/settings/payment")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.gateways.stripe).toHaveProperty("secretKeyMasked");
      expect(res.body.gateways.stripe.secretKeyMasked).toContain("••••••••");
      expect(res.body.gateways.stripe).toHaveProperty("webhookSecretConfigured", true);
      expect(res.body.gateways.bankTransfer).toHaveProperty("accountNumberMasked");
    });

    it("PUT /api/settings/payment allows admin to configure gateways and fraud protection", async () => {
      const adminToken = await getAdminToken();
      const res = await request(app)
        .put("/api/settings/payment")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          sandboxMode: false,
          fraudDetectionLevel: "strict",
          autoCapture: true,
          gateways: {
            stripe: {
              enabled: true,
              publishableKey: "pk_live_customNexPhoneProdKey991",
            },
            cod: {
              enabled: false,
            },
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.sandboxMode).toBe(false);
      expect(res.body.fraudDetectionLevel).toBe("strict");
      expect(res.body.gateways.stripe.publishableKey).toBe("pk_live_customNexPhoneProdKey991");
      expect(res.body.gateways.cod.enabled).toBe(false);

      // Verify storefront view reflects updated gateway availability
      const storefrontRes = await request(app).get("/api/settings/payment");
      expect(storefrontRes.body.sandboxMode).toBe(false);
      expect(storefrontRes.body.gateways.stripe.publishableKey).toBe("pk_live_customNexPhoneProdKey991");
      expect(storefrontRes.body.availableGateways).not.toContain("cod");
    });

    it("rejects non-admin customers from modifying payment settings with 403", async () => {
      const customerToken = await getCustomerToken();
      const res = await request(app)
        .put("/api/settings/payment")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ sandboxMode: true });

      expect(res.status).toBe(403);
    });
  });

  // ==========================================
  // 5. Health Check (/health)
  // ==========================================
  describe("5. Health Check (/health)", () => {
    it("GET /health responds 200 with service telemetry and memory usage", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status");
      expect(["ok", "degraded"]).toContain(res.body.status);
      expect(res.body).toHaveProperty("flavor");
      expect(res.body).toHaveProperty("version", "1.0.0");
      expect(res.body).toHaveProperty("uptimeSeconds");
      expect(typeof res.body.uptimeSeconds).toBe("number");
      expect(res.body).toHaveProperty("formattedUptime");
      expect(res.body).toHaveProperty("timestamp");

      expect(res.body).toHaveProperty("services");
      expect(res.body.services).toHaveProperty("database");
      expect(res.body.services.database).toHaveProperty("status");
      expect(res.body.services).toHaveProperty("memory");
      expect(res.body.services.memory).toHaveProperty("heapUsed");
      expect(res.body.services).toHaveProperty("storage");
      expect(res.body.services.storage).toHaveProperty("cloudinaryConfigured");
    });

    it("GET /api/health responds 200 (backward compatible with smoke tests)", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "ok");
      expect(res.body).toHaveProperty("uptimeSeconds");
    });

    it("supports orchestration probe endpoints (/healthz, /livez, /readyz)", async () => {
      const probes = ["/healthz", "/livez", "/readyz"];
      for (const probe of probes) {
        const res = await request(app).get(probe);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe("ok");
      }
    });
  });
});
