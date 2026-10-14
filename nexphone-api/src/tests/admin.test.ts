import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { User } from "../models/user.model";
import {
  clearTestDb,
  createTestUser,
  startTestDb,
  stopTestDb,
  TEST_PASSWORD,
} from "./helpers/db";
import { signAccessToken } from "../services/token.service";

beforeAll(async () => {
  await startTestDb();
});

afterAll(async () => {
  await stopTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

async function createSuperAdmin(email = "superadmin@nexphone.io") {
  return createTestUser({
    name: "Alex Vance (Super)",
    email,
    password: TEST_PASSWORD,
    role: "super_admin",
    status: "active",
  });
}

async function createRegularAdmin(email = "admin@nexphone.io") {
  return createTestUser({
    name: "Marcus Miller",
    email,
    password: TEST_PASSWORD,
    role: "admin",
    status: "active",
  });
}

async function createCustomer(email = "customer@example.com") {
  return createTestUser({
    name: "Jane Customer",
    email,
    password: TEST_PASSWORD,
    role: "customer",
    status: "active",
  });
}

describe("Admin Management API (Feature 18)", () => {
  // ==========================================
  // Authentication & Authorization Guards
  // ==========================================
  describe("Authentication & Authorization Guards", () => {
    it("rejects unauthenticated requests with 401 TOKEN_REQUIRED", async () => {
      const res = await request(app).get("/api/admin/profile");
      expect(res.status).toBe(401);
      expect(res.body.code).toBe("TOKEN_REQUIRED");
    });

    it("rejects non-admin customer tokens with 403 FORBIDDEN", async () => {
      const customer = await createCustomer();
      const token = signAccessToken(customer);

      const res = await request(app)
        .get("/api/admin/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");
    });

    it("rejects suspended/disabled admin with 403 ACCOUNT_DISABLED", async () => {
      const admin = await createTestUser({
        email: "suspended-admin@nexphone.io",
        role: "admin",
        status: "disabled",
      });
      const token = signAccessToken(admin);

      const res = await request(app)
        .get("/api/admin/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("ACCOUNT_DISABLED");
    });

    it("allows both admin and super_admin access", async () => {
      const superAdmin = await createSuperAdmin();
      const regularAdmin = await createRegularAdmin();

      const superRes = await request(app)
        .get("/api/admin/profile")
        .set("Authorization", `Bearer ${signAccessToken(superAdmin)}`);
      expect(superRes.status).toBe(200);

      const adminRes = await request(app)
        .get("/api/admin/profile")
        .set("Authorization", `Bearer ${signAccessToken(regularAdmin)}`);
      expect(adminRes.status).toBe(200);
    });
  });

  // ==========================================
  // 1. Get Admin Profile
  // ==========================================
  describe("1. Get Admin Profile", () => {
    it("GET /api/admin/profile returns authenticated admin identity and permissions", async () => {
      const superAdmin = await createSuperAdmin("elena@nexphone.io");
      const token = signAccessToken(superAdmin);

      const res = await request(app)
        .get("/api/admin/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.email).toBe("elena@nexphone.io");
      expect(res.body.role).toBe("super_admin");
      expect(res.body.permissions).toEqual(["*"]);
      expect(res.body).not.toHaveProperty("passwordHash");
    });

    it("GET /api/admin/profile returns scoped permissions for standard admin", async () => {
      const admin = await createRegularAdmin("ops@nexphone.io");
      const token = signAccessToken(admin);

      const res = await request(app)
        .get("/api/admin/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.role).toBe("admin");
      expect(Array.isArray(res.body.permissions)).toBe(true);
      expect(res.body.permissions).toContain("orders:read");
      expect(res.body.permissions).toContain("products:write");
      expect(res.body.permissions).not.toContain("*");
    });

    it("supports route aliases GET /api/admin/me and GET /admin/profile", async () => {
      const admin = await createRegularAdmin();
      const token = signAccessToken(admin);

      const res1 = await request(app)
        .get("/api/admin/me")
        .set("Authorization", `Bearer ${token}`);
      expect(res1.status).toBe(200);

      const res2 = await request(app)
        .get("/admin/profile")
        .set("Authorization", `Bearer ${token}`);
      expect(res2.status).toBe(200);
    });
  });

  // ==========================================
  // 2. Update Admin Profile
  // ==========================================
  describe("2. Update Admin Profile", () => {
    it("PUT /api/admin/profile updates name, phone, company, and avatarUrl", async () => {
      const admin = await createRegularAdmin();
      const token = signAccessToken(admin);

      const res = await request(app)
        .put("/api/admin/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Marcus Vance",
          phone: "+1 415 555 0199",
          company: "NexPhone Operations HQ",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.name).toBe("Marcus Vance");
      expect(res.body.phone).toBe("+1 415 555 0199");
      expect(res.body.company).toBe("NexPhone Operations HQ");
      expect(res.body.avatarUrl).toBe("https://images.unsplash.com/photo-1534528741775-53994a69daeb");

      // Verify in database
      const freshUser = await User.findById(admin._id);
      expect(freshUser?.name).toBe("Marcus Vance");
    });

    it("supports PATCH /api/admin/profile for partial updates", async () => {
      const admin = await createRegularAdmin();
      const token = signAccessToken(admin);

      const res = await request(app)
        .patch("/api/admin/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Marcus Only",
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Marcus Only");
    });

    it("validates input fields (e.g. invalid avatarUrl or short name)", async () => {
      const admin = await createRegularAdmin();
      const token = signAccessToken(admin);

      const res = await request(app)
        .put("/api/admin/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "A", // too short (min 2)
          avatarUrl: "invalid-url",
        });

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // 3. Change Admin Password
  // ==========================================
  describe("3. Change Admin Password", () => {
    it("POST /api/admin/change-password succeeds with valid current password and returns new token", async () => {
      const admin = await createRegularAdmin();
      const token = signAccessToken(admin);
      const newPassword = "NewSecretPassword2026!";

      const res = await request(app)
        .post("/api/admin/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: TEST_PASSWORD,
          newPassword,
          confirmPassword: newPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");

      // Verify old token is now rejected because tokenVersion incremented
      const oldTokenRes = await request(app)
        .get("/api/admin/profile")
        .set("Authorization", `Bearer ${token}`);
      expect(oldTokenRes.status).toBe(401);

      // Verify new token works immediately
      const newTokenRes = await request(app)
        .get("/api/admin/profile")
        .set("Authorization", `Bearer ${res.body.accessToken}`);
      expect(newTokenRes.status).toBe(200);

      // Verify login with new password works
      const loginRes = await request(app)
        .post("/api/auth/admin/login")
        .send({
          email: admin.email,
          password: newPassword,
        });
      expect(loginRes.status).toBe(200);

      // Verify login with old password fails
      const failedLogin = await request(app)
        .post("/api/auth/admin/login")
        .send({
          email: admin.email,
          password: TEST_PASSWORD,
        });
      expect(failedLogin.status).toBe(401);
    });

    it("rejects when current password is incorrect", async () => {
      const admin = await createRegularAdmin();
      const token = signAccessToken(admin);

      const res = await request(app)
        .post("/api/admin/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "WrongPassword999!",
          newPassword: "BrandNewPassword2026!",
          confirmPassword: "BrandNewPassword2026!",
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("INVALID_CURRENT_PASSWORD");
    });

    it("rejects when new password matches current password", async () => {
      const admin = await createRegularAdmin();
      const token = signAccessToken(admin);

      const res = await request(app)
        .post("/api/admin/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: TEST_PASSWORD,
          newPassword: TEST_PASSWORD,
          confirmPassword: TEST_PASSWORD,
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("PASSWORD_UNCHANGED");
    });

    it("rejects when new password does not match confirmation", async () => {
      const admin = await createRegularAdmin();
      const token = signAccessToken(admin);

      const res = await request(app)
        .post("/api/admin/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: TEST_PASSWORD,
          newPassword: "NewSecretPassword2026!",
          confirmPassword: "DifferentSecretPassword2026!",
        });

      expect(res.status).toBe(400);
    });

    it("supports route aliases PUT /api/admin/change-password and POST /api/admin/password", async () => {
      const admin = await createRegularAdmin();
      const token = signAccessToken(admin);

      const res = await request(app)
        .put("/api/admin/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: TEST_PASSWORD,
          newPassword: "AliasPassword2026!",
          confirmPassword: "AliasPassword2026!",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 4. List Admin Accounts
  // ==========================================
  describe("4. List Admin Accounts", () => {
    it("GET /api/admin/accounts returns paginated admin records", async () => {
      const superAdmin = await createSuperAdmin("root@nexphone.io");
      await createRegularAdmin("admin1@nexphone.io");
      await createRegularAdmin("admin2@nexphone.io");
      await createCustomer("customer@nexphone.io"); // Customers must not be included

      const token = signAccessToken(superAdmin);
      const res = await request(app)
        .get("/api/admin/accounts")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.admins)).toBe(true);
      expect(res.body.total).toBe(3);
      expect(res.body.admins.length).toBe(3);
      expect(res.body.pagination).toHaveProperty("total", 3);
      expect(res.body.pagination).toHaveProperty("page", 1);

      // Verify no customer is in the list
      const hasCustomer = res.body.admins.some((a: any) => a.role === "customer");
      expect(hasCustomer).toBe(false);

      // Verify passwordHash is never leaked
      const hasHash = res.body.admins.some((a: any) => "passwordHash" in a);
      expect(hasHash).toBe(false);
    });

    it("supports role and status filters", async () => {
      const superAdmin = await createSuperAdmin("super@nexphone.io");
      await createRegularAdmin("active-admin@nexphone.io");
      await createTestUser({
        name: "Disabled Admin",
        email: "disabled-admin@nexphone.io",
        role: "admin",
        status: "disabled",
      });

      const token = signAccessToken(superAdmin);

      // Filter by role=super_admin
      const superRes = await request(app)
        .get("/api/admin/accounts?role=super_admin")
        .set("Authorization", `Bearer ${token}`);
      expect(superRes.status).toBe(200);
      expect(superRes.body.total).toBe(1);
      expect(superRes.body.admins[0].role).toBe("super_admin");

      // Filter by status=disabled
      const disabledRes = await request(app)
        .get("/api/admin/accounts?status=disabled")
        .set("Authorization", `Bearer ${token}`);
      expect(disabledRes.status).toBe(200);
      expect(disabledRes.body.total).toBe(1);
      expect(disabledRes.body.admins[0].email).toBe("disabled-admin@nexphone.io");
    });

    it("supports search query for name or email", async () => {
      const superAdmin = await createSuperAdmin("super@nexphone.io");
      await createRegularAdmin("security-officer@nexphone.io");

      const token = signAccessToken(superAdmin);
      const res = await request(app)
        .get("/api/admin/accounts?search=security-officer")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.admins[0].email).toBe("security-officer@nexphone.io");
    });

    it("supports route alias GET /api/admin/users", async () => {
      const superAdmin = await createSuperAdmin();
      const token = signAccessToken(superAdmin);

      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 5. Create Admin Account (Protected)
  // ==========================================
  describe("5. Create Admin Account (Protected)", () => {
    it("POST /api/admin/accounts creates a new admin user with active status", async () => {
      const superAdmin = await createSuperAdmin();
      const token = signAccessToken(superAdmin);

      const res = await request(app)
        .post("/api/admin/accounts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Devon Vance",
          email: "devon@nexphone.io",
          password: "DevonPassword2026!",
          role: "admin",
          phone: "+1 555 334 0987",
          company: "NexPhone Engineering",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.admin).toHaveProperty("id");
      expect(res.body.admin.email).toBe("devon@nexphone.io");
      expect(res.body.admin.name).toBe("Devon Vance");
      expect(res.body.admin.role).toBe("admin");
      expect(res.body.admin.status).toBe("active");
      expect(res.body.admin).not.toHaveProperty("passwordHash");

      // Verify the new admin can authenticate
      const loginRes = await request(app)
        .post("/api/auth/admin/login")
        .send({
          email: "devon@nexphone.io",
          password: "DevonPassword2026!",
        });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.user.role).toBe("admin");
    });

    it("rejects creating admin with duplicate email (409 Conflict)", async () => {
      const superAdmin = await createSuperAdmin("root@nexphone.io");
      const token = signAccessToken(superAdmin);

      const res = await request(app)
        .post("/api/admin/accounts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Duplicate Admin",
          email: "root@nexphone.io",
          password: "Password123456!",
          role: "admin",
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe("EMAIL_EXISTS");
    });

    it("rejects invalid payload (short password, bad email)", async () => {
      const superAdmin = await createSuperAdmin();
      const token = signAccessToken(superAdmin);

      const res = await request(app)
        .post("/api/admin/accounts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "A", // too short
          email: "not-an-email",
          password: "short", // min 8
        });

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // 6. Update Admin Account (Protected)
  // ==========================================
  describe("6. Update Admin Account (Protected)", () => {
    it("PUT /api/admin/accounts/:id updates an admin's role, company, and phone", async () => {
      const superAdmin = await createSuperAdmin();
      const targetAdmin = await createRegularAdmin("target@nexphone.io");
      const token = signAccessToken(superAdmin);

      const res = await request(app)
        .put(`/api/admin/accounts/${targetAdmin._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Target Admin Promoted",
          role: "super_admin",
          company: "Executive Leadership",
          phone: "+1 800 555 0100",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.admin.role).toBe("super_admin");
      expect(res.body.admin.company).toBe("Executive Leadership");

      // Verify in DB
      const fresh = await User.findById(targetAdmin._id);
      expect(fresh?.role).toBe("super_admin");
      expect(fresh?.company).toBe("Executive Leadership");
    });

    it("prevents demoting the last active super_admin", async () => {
      const soleSuperAdmin = await createSuperAdmin("sole-super@nexphone.io");
      const token = signAccessToken(soleSuperAdmin);

      const res = await request(app)
        .put(`/api/admin/accounts/${soleSuperAdmin._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          role: "admin",
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("LAST_SUPER_ADMIN");
    });

    it("returns 404 when updating non-existent admin ID", async () => {
      const superAdmin = await createSuperAdmin();
      const token = signAccessToken(superAdmin);

      const res = await request(app)
        .put("/api/admin/accounts/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Non Existent",
        });

      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 7. Disable Admin Account (Protected)
  // ==========================================
  describe("7. Disable Admin Account (Protected)", () => {
    it("PATCH /api/admin/accounts/:id/disable marks account as disabled and logs reason", async () => {
      const superAdmin = await createSuperAdmin();
      const targetAdmin = await createRegularAdmin("to-disable@nexphone.io");
      const superToken = signAccessToken(superAdmin);
      const targetToken = signAccessToken(targetAdmin);

      const res = await request(app)
        .patch(`/api/admin/accounts/${targetAdmin._id}/disable`)
        .set("Authorization", `Bearer ${superToken}`)
        .send({
          reason: "Security audit compliance flag",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.admin.status).toBe("disabled");
      expect(res.body.admin.disabledReason).toBe("Security audit compliance flag");

      // Verify target admin cannot access admin endpoints anymore
      const blockedRes = await request(app)
        .get("/api/admin/profile")
        .set("Authorization", `Bearer ${targetToken}`);
      expect(blockedRes.status).toBe(403);
      expect(blockedRes.body.code).toBe("ACCOUNT_DISABLED");
    });

    it("prevents self-disable (admin cannot disable their own account)", async () => {
      const superAdmin = await createSuperAdmin();
      const token = signAccessToken(superAdmin);

      const res = await request(app)
        .patch(`/api/admin/accounts/${superAdmin._id}/disable`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          reason: "Accidental self lock",
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("SELF_DISABLE_FORBIDDEN");
    });

    it("prevents disabling the last active super_admin", async () => {
      const superAdmin1 = await createSuperAdmin("sole-super@nexphone.io");
      const regularAdmin = await createRegularAdmin("admin-actor@nexphone.io");
      const token = signAccessToken(regularAdmin);

      const res = await request(app)
        .patch(`/api/admin/accounts/${superAdmin1._id}/disable`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          reason: "Attempting to lock last super admin",
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("LAST_SUPER_ADMIN");
    });

    it("supports route aliases (DELETE /api/admin/accounts/:id and POST /disable)", async () => {
      const superAdmin = await createSuperAdmin();
      const target1 = await createRegularAdmin("alias-del@nexphone.io");
      const target2 = await createRegularAdmin("alias-post@nexphone.io");
      const token = signAccessToken(superAdmin);

      const delRes = await request(app)
        .delete(`/api/admin/accounts/${target1._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ reason: "Decommissioned via DELETE" });
      expect(delRes.status).toBe(200);
      expect(delRes.body.admin.status).toBe("disabled");

      const postRes = await request(app)
        .post(`/api/admin/accounts/${target2._id}/disable`)
        .set("Authorization", `Bearer ${token}`)
        .send({ reason: "Decommissioned via POST" });
      expect(postRes.status).toBe(200);
      expect(postRes.body.admin.status).toBe("disabled");
    });
  });

  // ==========================================
  // 8. Enable Admin Account (Protected)
  // ==========================================
  describe("8. Enable Admin Account (Protected)", () => {
    it("PATCH /api/admin/accounts/:id/enable re-activates disabled account", async () => {
      const superAdmin = await createSuperAdmin();
      const disabledAdmin = await createTestUser({
        name: "Re-enable Me",
        email: "reenable@nexphone.io",
        role: "admin",
        status: "disabled",
        disabledReason: "Prior investigation",
      });
      const superToken = signAccessToken(superAdmin);

      const res = await request(app)
        .patch(`/api/admin/accounts/${disabledAdmin._id}/enable`)
        .set("Authorization", `Bearer ${superToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.admin.status).toBe("active");
      expect(res.body.admin.disabledReason).toBeNull();

      // Verify the user can log in and access profile now
      const loginRes = await request(app)
        .post("/api/auth/admin/login")
        .send({
          email: "reenable@nexphone.io",
          password: TEST_PASSWORD,
        });
      expect(loginRes.status).toBe(200);

      const profileRes = await request(app)
        .get("/api/admin/profile")
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`);
      expect(profileRes.status).toBe(200);
      expect(profileRes.body.email).toBe("reenable@nexphone.io");
    });

    it("supports route alias POST /api/admin/accounts/:id/enable", async () => {
      const superAdmin = await createSuperAdmin();
      const disabledAdmin = await createTestUser({
        email: "post-enable@nexphone.io",
        role: "admin",
        status: "disabled",
      });
      const superToken = signAccessToken(superAdmin);

      const res = await request(app)
        .post(`/api/admin/accounts/${disabledAdmin._id}/enable`)
        .set("Authorization", `Bearer ${superToken}`);

      expect(res.status).toBe(200);
      expect(res.body.admin.status).toBe("active");
    });

    it("returns 404 when enabling non-existent admin ID", async () => {
      const superAdmin = await createSuperAdmin();
      const superToken = signAccessToken(superAdmin);

      const res = await request(app)
        .patch("/api/admin/accounts/507f1f77bcf86cd799439011/enable")
        .set("Authorization", `Bearer ${superToken}`);

      expect(res.status).toBe(404);
    });
  });
});
