import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { User } from "../models/user.model";
import { clearTestDb, createTestUser, startTestDb, stopTestDb, TEST_PASSWORD } from "./helpers/db";

beforeAll(startTestDb);
afterAll(stopTestDb);
beforeEach(clearTestDb);

async function registerCustomer(email = "customer@example.com", name = "Ada Lovelace") {
  const res = await request(app).post("/api/auth/register").send({
    name,
    email,
    password: TEST_PASSWORD,
    phone: "+1 (555) 010-2030",
  });
  return {
    token: res.body.token as string,
    user: res.body.user,
    id: res.body.user.id as string,
  };
}

describe("Feature 2: User & Profile API", () => {
  describe("Authentication & Authorization Guards", () => {
    it("rejects unauthenticated requests with 401", async () => {
      const endpoints = [
        { method: "get", path: "/api/user/profile" },
        { method: "put", path: "/api/user/profile" },
        { method: "post", path: "/api/user/avatar" },
        { method: "get", path: "/api/user/addresses" },
        { method: "post", path: "/api/user/addresses" },
      ];

      for (const ep of endpoints) {
        const res = await (request(app) as any)[ep.method](ep.path);
        expect(res.status).toBe(401);
        expect(res.body.code).toBe("TOKEN_REQUIRED");
      }
    });

    it("rejects requests with an invalid Bearer token with 401", async () => {
      const res = await request(app)
        .get("/api/user/profile")
        .set("Authorization", "Bearer invalid-token-string");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("TOKEN_INVALID");
    });

    it("rejects requests from a disabled account with 403", async () => {
      const { token, id } = await registerCustomer("disabled@example.com");

      // Admin disables user
      await User.findByIdAndUpdate(id, { status: "disabled", disabledReason: "Policy violation" });

      const res = await request(app)
        .get("/api/user/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("ACCOUNT_DISABLED");
    });
  });

  describe("GET /api/user/profile", () => {
    it("retrieves current user profile without leaking sensitive fields", async () => {
      const { token, user } = await registerCustomer("profile@example.com", "Grace Hopper");

      const res = await request(app)
        .get("/api/user/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe("Grace Hopper");
      expect(res.body.user.email).toBe("profile@example.com");
      expect(res.body.user.role).toBe("customer");
      expect(res.body.user.tier).toBe("Regular");
      expect(res.body.user.status).toBe("active");
      expect(Array.isArray(res.body.user.addresses)).toBe(true);

      // Verify no sensitive fields in payload
      const rawString = JSON.stringify(res.body);
      expect(rawString).not.toMatch(/passwordHash/);
      expect(rawString).not.toMatch(/passwordResetCodeHash/);
      expect(rawString).not.toMatch(/\$2[aby]\$/);
    });

    it("supports route aliases (/api/user/me, /api/users/profile, /user/profile)", async () => {
      const { token } = await registerCustomer("aliases@example.com");

      const aliases = ["/api/user/me", "/api/users/profile", "/user/profile"];
      for (const path of aliases) {
        const res = await request(app).get(path).set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe("aliases@example.com");
      }
    });
  });

  describe("PUT & PATCH /api/user/profile", () => {
    it("updates customer name, phone, and company", async () => {
      const { token, id } = await registerCustomer("upd@example.com", "Alan Turing");

      const res = await request(app)
        .put("/api/user/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Sir Alan Turing",
          phone: "+44 20 7946 0991",
          company: "Bletchley Park Ltd",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.name).toBe("Sir Alan Turing");
      expect(res.body.user.phone).toBe("+44 20 7946 0991");
      expect(res.body.user.company).toBe("Bletchley Park Ltd");

      // Verify database document was updated and phone was normalized
      const doc = await User.findById(id);
      expect(doc?.name).toBe("Sir Alan Turing");
      expect(doc?.phoneNormalized).toBe("442079460991");
    });

    it("works via PATCH /api/user/profile", async () => {
      const { token } = await registerCustomer("patch@example.com");

      const res = await request(app)
        .patch("/api/user/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          company: "Acme Corp",
        });

      expect(res.status).toBe(200);
      expect(res.body.user.company).toBe("Acme Corp");
    });

    it("rejects invalid profile inputs with 400 validation error", async () => {
      const { token } = await registerCustomer("val@example.com");

      const res = await request(app)
        .put("/api/user/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "A", // too short (min 2)
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST & PUT /api/user/avatar", () => {
    it("updates avatar URL successfully", async () => {
      const { token, id } = await registerCustomer("avatar@example.com");

      const newAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb";
      const res = await request(app)
        .post("/api/user/avatar")
        .set("Authorization", `Bearer ${token}`)
        .send({ avatarUrl: newAvatar });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.avatarUrl).toBe(newAvatar);

      const doc = await User.findById(id);
      expect(doc?.avatarUrl).toBe(newAvatar);
    });

    it("rejects empty avatar URL with 400 validation error", async () => {
      const { token } = await registerCustomer("avatar-err@example.com");

      const res = await request(app)
        .post("/api/user/avatar")
        .set("Authorization", `Bearer ${token}`)
        .send({ avatarUrl: "" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("Manage Delivery Addresses", () => {
    const validAddress1 = {
      type: "home" as const,
      label: "Home",
      recipient: "John Doe",
      phone: "+1 (555) 234-5678",
      street: "123 Main Street",
      apartment: "Apt 4B",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "United States",
      instructions: "Ring buzzer 4B",
    };

    const validAddress2 = {
      type: "work" as const,
      label: "Office",
      recipient: "John Doe",
      phone: "+1 (555) 234-5678",
      street: "500 Howard Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "United States",
    };

    it("adds first address and makes it default automatically", async () => {
      const { token } = await registerCustomer("addr1@example.com");

      const res = await request(app)
        .post("/api/user/addresses")
        .set("Authorization", `Bearer ${token}`)
        .send(validAddress1);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.addresses).toHaveLength(1);
      expect(res.body.addresses[0].isDefault).toBe(true);
      expect(res.body.addresses[0].id).toMatch(/^addr-/);
      expect(res.body.addresses[0].street).toBe("123 Main Street");
    });

    it("adds a second address without isDefault, preserving first as default", async () => {
      const { token } = await registerCustomer("addr2@example.com");

      await request(app).post("/api/user/addresses").set("Authorization", `Bearer ${token}`).send(validAddress1);

      const res = await request(app)
        .post("/api/user/addresses")
        .set("Authorization", `Bearer ${token}`)
        .send(validAddress2);

      expect(res.status).toBe(201);
      expect(res.body.addresses).toHaveLength(2);
      expect(res.body.addresses[0].isDefault).toBe(true);
      expect(res.body.addresses[1].isDefault).toBe(false);
    });

    it("adding a new address with isDefault: true clears default on previous addresses", async () => {
      const { token } = await registerCustomer("addr3@example.com");

      await request(app).post("/api/user/addresses").set("Authorization", `Bearer ${token}`).send(validAddress1);

      const res = await request(app)
        .post("/api/user/addresses")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...validAddress2, isDefault: true });

      expect(res.status).toBe(201);
      expect(res.body.addresses[0].isDefault).toBe(false);
      expect(res.body.addresses[1].isDefault).toBe(true);
    });

    it("GET /api/user/addresses returns current list of addresses", async () => {
      const { token } = await registerCustomer("addr4@example.com");

      await request(app).post("/api/user/addresses").set("Authorization", `Bearer ${token}`).send(validAddress1);
      await request(app).post("/api/user/addresses").set("Authorization", `Bearer ${token}`).send(validAddress2);

      const res = await request(app)
        .get("/api/user/addresses")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });

    it("PUT & PATCH /api/user/addresses/:addressId updates address fields", async () => {
      const { token } = await registerCustomer("addr5@example.com");

      const addRes = await request(app)
        .post("/api/user/addresses")
        .set("Authorization", `Bearer ${token}`)
        .send(validAddress1);

      const addressId = addRes.body.addresses[0].id;

      const updateRes = await request(app)
        .put(`/api/user/addresses/${addressId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          street: "789 Market Street",
          city: "San Jose",
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.address.street).toBe("789 Market Street");
      expect(updateRes.body.address.city).toBe("San Jose");
      expect(updateRes.body.address.recipient).toBe("John Doe"); // preserved
    });

    it("PATCH /api/user/addresses/:addressId/default designates default address", async () => {
      const { token } = await registerCustomer("addr6@example.com");

      const res1 = await request(app)
        .post("/api/user/addresses")
        .set("Authorization", `Bearer ${token}`)
        .send(validAddress1);
      const res2 = await request(app)
        .post("/api/user/addresses")
        .set("Authorization", `Bearer ${token}`)
        .send(validAddress2);

      const addr1Id = res1.body.addresses[0].id;
      const addr2Id = res2.body.addresses[1].id;

      // Make addr2 default
      const defRes = await request(app)
        .patch(`/api/user/addresses/${addr2Id}/default`)
        .set("Authorization", `Bearer ${token}`);

      expect(defRes.status).toBe(200);
      const addresses = defRes.body.addresses;
      const a1 = addresses.find((a: any) => a.id === addr1Id);
      const a2 = addresses.find((a: any) => a.id === addr2Id);
      expect(a1.isDefault).toBe(false);
      expect(a2.isDefault).toBe(true);
    });

    it("DELETE /api/user/addresses/:addressId removes address and maintains default invariant", async () => {
      const { token } = await registerCustomer("addr7@example.com");

      const res1 = await request(app)
        .post("/api/user/addresses")
        .set("Authorization", `Bearer ${token}`)
        .send(validAddress1);
      const res2 = await request(app)
        .post("/api/user/addresses")
        .set("Authorization", `Bearer ${token}`)
        .send(validAddress2);

      const addr1Id = res1.body.addresses[0].id; // addr1 is default
      const addr2Id = res2.body.addresses[1].id;

      // Delete addr1 (the default)
      const delRes = await request(app)
        .delete(`/api/user/addresses/${addr1Id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.addresses).toHaveLength(1);
      expect(delRes.body.addresses[0].id).toBe(addr2Id);
      // Invariant: addr2 must now become default
      expect(delRes.body.addresses[0].isDefault).toBe(true);
    });

    it("returns 404 when updating or deleting non-existent address", async () => {
      const { token } = await registerCustomer("addr8@example.com");

      const resPut = await request(app)
        .put("/api/user/addresses/addr-nonexistent")
        .set("Authorization", `Bearer ${token}`)
        .send({ city: "Nowhere" });
      expect(resPut.status).toBe(404);

      const resDel = await request(app)
        .delete("/api/user/addresses/addr-nonexistent")
        .set("Authorization", `Bearer ${token}`);
      expect(resDel.status).toBe(404);
    });
  });

  describe("Admin Customer Endpoints (/api/customers)", () => {
    it("GET /api/customers/:id returns user details from MongoDB", async () => {
      const { id, user } = await registerCustomer("adminview@example.com", "Katherine Johnson");

      const res = await request(app).get(`/api/customers/${id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
      expect(res.body.name).toBe("Katherine Johnson");
      expect(res.body.email).toBe("adminview@example.com");
      expect(res.body.customerNumber).toBe(user.customerNumber);
      expect(res.body).not.toHaveProperty("passwordHash");
    });

    it("PATCH /api/customers/:id/status disables customer account and revokes active tokens", async () => {
      const { token, id } = await registerCustomer("to-disable@example.com");

      // Verify token works initially
      const beforeRes = await request(app)
        .get("/api/user/profile")
        .set("Authorization", `Bearer ${token}`);
      expect(beforeRes.status).toBe(200);

      // Admin disables account
      const patchRes = await request(app)
        .patch(`/api/customers/${id}/status`)
        .send({
          status: "disabled",
          reason: "Suspicious activity detected",
          performedBy: "Security Lead",
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.status).toBe("disabled");
      expect(patchRes.body.disabledReason).toBe("Suspicious activity detected");

      // Check DB document
      const doc = await User.findById(id);
      expect(doc?.status).toBe("disabled");
      expect(doc?.tokenVersion).toBeGreaterThan(0);

      // Now the previously issued token MUST be rejected on /api/user/profile
      const afterRes = await request(app)
        .get("/api/user/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(afterRes.status).toBe(403);
      expect(afterRes.body.code).toBe("ACCOUNT_DISABLED");
    });

    it("PATCH /api/customers/:id/status re-enables customer account", async () => {
      const { id } = await registerCustomer("re-enable@example.com");

      // Disable first
      await request(app).patch(`/api/customers/${id}/status`).send({ status: "disabled" });

      // Re-enable
      const res = await request(app)
        .patch(`/api/customers/${id}/status`)
        .send({ status: "active", performedBy: "Super Admin" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("active");

      const doc = await User.findById(id);
      expect(doc?.status).toBe("active");
    });
  });
});
