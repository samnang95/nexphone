import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { app } from "../app";
import { authenticate, requireAdmin } from "../middleware/auth";
import { errorHandler } from "../middleware/errorHandler";
import { User } from "../models/user.model";
import { clearTestDb, createTestUser, startTestDb, stopTestDb, TEST_PASSWORD } from "./helpers/db";

const SECRET = process.env.JWT_SECRET!;
const GENERIC_INVALID = "Invalid credentials. Please verify your email and password.";

// Tiny app that exercises the real middleware on an admin-only route.
const guarded = express();
guarded.get("/admin-only", authenticate, requireAdmin, (_req, res) => {
  res.json({ ok: true });
});
guarded.use(errorHandler);

const validRegistration = {
  name: "Ada Lovelace",
  email: "Ada@Example.com",
  phone: "+1 (555) 010-2030",
  password: TEST_PASSWORD,
};

async function registerAndGetToken(email = "reg@example.com") {
  const res = await request(app).post("/api/auth/register").send({ ...validRegistration, email });
  return { token: res.body.token as string, id: res.body.user.id as string };
}

beforeAll(startTestDb);
afterAll(stopTestDb);
beforeEach(clearTestDb);

describe("POST /api/auth/register", () => {
  it("creates a customer and returns { token, user } without secrets", async () => {
    const res = await request(app).post("/api/auth/register").send(validRegistration);

    expect(res.status).toBe(201);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      tier: "Regular",
      status: "active",
      role: "customer",
    });
    expect(res.body.user.id).toBeTruthy();
    expect(res.body.user.customerNumber).toMatch(/^CUST-/);
    expect(res.body.user.createdAt).toBeTruthy();
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|\$2[aby]\$/);
  });

  it("stores only a bcrypt hash of the password", async () => {
    await request(app).post("/api/auth/register").send(validRegistration);
    const stored = await User.findOne({ email: "ada@example.com" }).select("+passwordHash");
    expect(stored?.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(stored?.passwordHash).not.toContain(TEST_PASSWORD);
  });

  it("ignores role, tier, status and other privileged fields in the body", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validRegistration, role: "super_admin", tier: "VIP", status: "disabled", tokenVersion: 99 });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("customer");
    expect(res.body.user.tier).toBe("Regular");
    expect(res.body.user.status).toBe("active");

    const stored = await User.findOne({ email: "ada@example.com" });
    expect(stored?.role).toBe("customer");
    expect(stored?.tokenVersion).toBe(0);
  });

  it("maps accountType=enterprise to the Enterprise tier only", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validRegistration, accountType: "enterprise", company: "Acme" });
    expect(res.body.user.tier).toBe("Enterprise");
    expect(res.body.user.role).toBe("customer");
    expect(res.body.user.company).toBe("Acme");
  });

  it("rejects a duplicate email (case-insensitive) with 409", async () => {
    await request(app).post("/api/auth/register").send(validRegistration);
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validRegistration, email: "ADA@example.COM" });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("An account with this email address already exists.");
  });

  it("returns the existing 400 message when required fields are missing", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "x@example.com" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Full name, email, and password are required.");
  });

  it("rejects short passwords", async () => {
    const res = await request(app).post("/api/auth/register").send({ ...validRegistration, password: "short" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Password must be at least 8 characters long.");
  });

  it("rejects passwords over 72 characters (bcrypt would silently truncate them)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validRegistration, password: "a".repeat(73) });
    expect(res.status).toBe(400);
  });

  it("rejects an invalid email address", async () => {
    const res = await request(app).post("/api/auth/register").send({ ...validRegistration, email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("rejects malformed JSON with 400 JSON error", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "application/json")
      .send("{not json");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_JSON");
  });

  it("is also reachable on the legacy /auth alias", async () => {
    const res = await request(app).post("/auth/register").send(validRegistration);
    expect(res.status).toBe(201);
  });
});

describe("POST /api/auth/login", () => {
  it("logs a customer in and returns { token, user }", async () => {
    await createTestUser({ email: "cust@example.com", name: "Cust" });
    const res = await request(app).post("/api/auth/login").send({ email: "CUST@example.com", password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user).toMatchObject({ email: "cust@example.com", role: "customer", status: "active" });
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("rejects a wrong password with 401", async () => {
    await createTestUser({ email: "cust@example.com" });
    const res = await request(app).post("/api/auth/login").send({ email: "cust@example.com", password: "WrongPass123" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe(GENERIC_INVALID);
  });

  it("gives an unknown email exactly the same answer as a wrong password", async () => {
    await createTestUser({ email: "cust@example.com" });
    const wrong = await request(app).post("/api/auth/login").send({ email: "cust@example.com", password: "WrongPass123" });
    const unknown = await request(app).post("/api/auth/login").send({ email: "nobody@example.com", password: "WrongPass123" });
    expect(unknown.status).toBe(wrong.status);
    expect(unknown.body.error).toBe(wrong.body.error);
  });

  it("no longer accepts the old demo password 'Password123!' for any account", async () => {
    await createTestUser({ email: "seeded@example.com", password: TEST_PASSWORD });
    const res = await request(app).post("/api/auth/login").send({ email: "seeded@example.com", password: "Password123!" });
    expect(res.status).toBe(401);
  });

  it("rejects a disabled account (403) only after the correct password is given", async () => {
    await createTestUser({ email: "off@example.com", status: "disabled", disabledReason: "Chargeback fraud" });

    const right = await request(app).post("/api/auth/login").send({ email: "off@example.com", password: TEST_PASSWORD });
    expect(right.status).toBe(403);
    expect(right.body.error).toContain("Account suspended: Chargeback fraud");

    const wrong = await request(app).post("/api/auth/login").send({ email: "off@example.com", password: "WrongPass123" });
    expect(wrong.status).toBe(401); // suspension is not revealed to someone without the password
  });

  it("supports phone-number login when exactly one customer has that number", async () => {
    await createTestUser({ email: "phone@example.com", phone: "+1 (206) 555-0194" });
    const res = await request(app).post("/api/auth/login").send({ email: "12065550194", password: TEST_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("phone@example.com");
  });

  it("refuses phone-number login when the number is shared by two accounts", async () => {
    await createTestUser({ email: "a@example.com", phone: "+1 555 000 1111" });
    await createTestUser({ email: "b@example.com", phone: "+1 555 000 1111" });
    const res = await request(app).post("/api/auth/login").send({ email: "15550001111", password: TEST_PASSWORD });
    expect(res.status).toBe(401);
  });

  it("does not let staff log in through the customer endpoint", async () => {
    await createTestUser({ email: "boss@example.com", role: "admin" });
    const res = await request(app).post("/api/auth/login").send({ email: "boss@example.com", password: TEST_PASSWORD });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe(GENERIC_INVALID);
  });

  it("returns 400 when credentials are missing", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "a@example.com" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email and password are required.");
  });
});

describe("POST /api/auth/admin/login", () => {
  it("logs an admin in and reports the role", async () => {
    await createTestUser({ email: "admin@example.com", role: "super_admin", name: "Root" });
    const res = await request(app).post("/api/auth/admin/login").send({ email: "admin@example.com", password: TEST_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("super_admin");
    expect(typeof res.body.token).toBe("string");
  });

  it("rejects a customer with the same generic error as a bad password", async () => {
    await createTestUser({ email: "cust@example.com" });
    const res = await request(app).post("/api/auth/admin/login").send({ email: "cust@example.com", password: TEST_PASSWORD });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe(GENERIC_INVALID);
  });

  it("rejects a disabled admin", async () => {
    await createTestUser({ email: "admin@example.com", role: "admin", status: "disabled" });
    const res = await request(app).post("/api/auth/admin/login").send({ email: "admin@example.com", password: TEST_PASSWORD });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/auth/me and token validation", () => {
  it("returns the authenticated user", async () => {
    const { token, id } = await registerAndGetToken();
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(id);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Authentication token required.");
  });

  it("returns 401 for a malformed token", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer not.a.jwt");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid or expired session token.");
  });

  it("returns 401 for a token signed with a different secret", async () => {
    const user = await createTestUser();
    const forged = jwt.sign({ ver: 0, role: "super_admin" }, "attacker-secret", {
      subject: String(user._id), issuer: "nexphone-api", jwtid: "forged-1", expiresIn: "1h",
    });
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it("returns 401 for an expired token", async () => {
    const user = await createTestUser();
    const expired = jwt.sign({ ver: 0, role: "customer" }, SECRET, {
      subject: String(user._id), issuer: "nexphone-api", jwtid: "exp-1", expiresIn: -10,
    });
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  it("rejects an unsigned token (alg: none)", async () => {
    const user = await createTestUser();
    const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const unsigned = `${b64({ alg: "none", typ: "JWT" })}.${b64({
      sub: String(user._id), ver: 0, role: "customer", jti: "none-1", iss: "nexphone-api",
      exp: Math.floor(Date.now() / 1000) + 3600,
    })}.`;
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${unsigned}`);
    expect(res.status).toBe(401);
  });

  it("rejects tokens in the legacy format (id/email/tier claims)", async () => {
    const user = await createTestUser();
    const legacy = jwt.sign({ id: String(user._id), email: user.email, tier: "Regular" }, SECRET, { expiresIn: "7d" });
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${legacy}`);
    expect(res.status).toBe(401);
  });

  it("rejects a token whose user was deleted", async () => {
    const { token, id } = await registerAndGetToken();
    await User.deleteOne({ _id: id });
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(401);
  });

  it("blocks an already-issued token once the account is disabled", async () => {
    const { token, id } = await registerAndGetToken();
    await User.updateOne({ _id: id }, { status: "disabled" });
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ACCOUNT_DISABLED");
  });

  it("rejects a token whose sub is not a valid id (e.g. a legacy 'cust-001')", async () => {
    const bad = jwt.sign({ ver: 0, role: "customer" }, SECRET, {
      subject: "cust-001", issuer: "nexphone-api", jwtid: "x", expiresIn: "1h",
    });
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${bad}`);
    expect(res.status).toBe(401);
  });
});

describe("authorization (role-based access)", () => {
  it("returns 401 with no token", async () => {
    expect((await request(guarded).get("/admin-only")).status).toBe(401);
  });

  it("returns 403 for a customer token", async () => {
    const { token } = await registerAndGetToken();
    expect((await request(guarded).get("/admin-only").set("Authorization", `Bearer ${token}`)).status).toBe(403);
  });

  it("returns 200 for admin and super_admin tokens", async () => {
    for (const role of ["admin", "super_admin"] as const) {
      await createTestUser({ email: `${role}@example.com`, role });
      const login = await request(app).post("/api/auth/admin/login").send({ email: `${role}@example.com`, password: TEST_PASSWORD });
      const res = await request(guarded).get("/admin-only").set("Authorization", `Bearer ${login.body.token}`);
      expect(res.status).toBe(200);
    }
  });

  it("uses the role stored in the database, not the one in the token", async () => {
    const admin = await createTestUser({ email: "demoted@example.com", role: "admin" });
    const login = await request(app).post("/api/auth/admin/login").send({ email: "demoted@example.com", password: TEST_PASSWORD });
    await User.updateOne({ _id: admin._id }, { role: "customer" });
    const res = await request(guarded).get("/admin-only").set("Authorization", `Bearer ${login.body.token}`);
    expect(res.status).toBe(403);
  });
});

describe("POST /api/auth/logout", () => {
  it("revokes the presented token but not the user's other sessions", async () => {
    await createTestUser({ email: "multi@example.com" });
    const login = () => request(app).post("/api/auth/login").send({ email: "multi@example.com", password: TEST_PASSWORD });
    const a = (await login()).body.token as string;
    const b = (await login()).body.token as string;

    const out = await request(app).post("/api/auth/logout").set("Authorization", `Bearer ${a}`);
    expect(out.status).toBe(200);
    expect(out.body).toEqual({ success: true, message: "Logged out successfully" });

    expect((await request(app).get("/api/auth/me").set("Authorization", `Bearer ${a}`)).status).toBe(401);
    expect((await request(app).get("/api/auth/me").set("Authorization", `Bearer ${b}`)).status).toBe(200);
  });

  it("still succeeds without a token or with a garbage token", async () => {
    expect((await request(app).post("/api/auth/logout")).status).toBe(200);
    expect((await request(app).post("/api/auth/logout").set("Authorization", "Bearer junk")).status).toBe(200);
  });
});

describe("forgot / reset password", () => {
  const forgot = (email: string) => request(app).post("/api/auth/forgot-password").send({ email });
  const reset = (body: object) => request(app).post("/api/auth/reset-password").send(body);

  /** Issues a code; re-requests if it happens to equal the retired demo code. */
  async function issueCode(email: string): Promise<string> {
    for (let i = 0; i < 5; i++) {
      const res = await forgot(email);
      if (res.body.code !== "849201") return res.body.code as string;
    }
    throw new Error("could not obtain a non-demo code");
  }

  it("answers identically for known and unknown emails", async () => {
    await createTestUser({ email: "known@example.com" });
    const known = await forgot("known@example.com");
    const unknown = await forgot("unknown@example.com");
    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(unknown.body.message).toBe(known.body.message);
    expect(unknown.body.success).toBe(true);
  });

  it("does not hand out the fixed demo code for unknown emails", async () => {
    const unknown = await forgot("unknown@example.com");
    expect(unknown.body.code).toBeUndefined();
  });

  it("stores only a hash of the code, never the code", async () => {
    await createTestUser({ email: "known@example.com" });
    const code = await issueCode("known@example.com");
    const stored = await User.findOne({ email: "known@example.com" }).select("+passwordResetCodeHash");
    expect(stored?.passwordResetCodeHash).toBeTruthy();
    expect(stored?.passwordResetCodeHash).not.toContain(code);
  });

  it("resets the password with a valid code, and the code is single-use", async () => {
    await createTestUser({ email: "known@example.com" });
    const code = await issueCode("known@example.com");

    const ok = await reset({ email: "known@example.com", code, newPassword: "BrandNewPass1!" });
    expect(ok.status).toBe(200);
    expect(ok.body.success).toBe(true);

    const withNew = await request(app).post("/api/auth/login").send({ email: "known@example.com", password: "BrandNewPass1!" });
    const withOld = await request(app).post("/api/auth/login").send({ email: "known@example.com", password: TEST_PASSWORD });
    expect(withNew.status).toBe(200);
    expect(withOld.status).toBe(401);

    const again = await reset({ email: "known@example.com", code, newPassword: "AnotherPass22!" });
    expect(again.status).toBe(400);
  });

  it("signs out every existing session after a reset", async () => {
    await createTestUser({ email: "known@example.com" });
    const login = await request(app).post("/api/auth/login").send({ email: "known@example.com", password: TEST_PASSWORD });
    const code = await issueCode("known@example.com");
    await reset({ email: "known@example.com", code, newPassword: "BrandNewPass1!" });

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${login.body.token}`);
    expect(res.status).toBe(401);
  });

  it("rejects the retired demo code 849201", async () => {
    await createTestUser({ email: "known@example.com" });
    await issueCode("known@example.com");
    const res = await reset({ email: "known@example.com", code: "849201", newPassword: "BrandNewPass1!" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid or expired recovery code. Please request a new code.");

    const unchanged = await request(app).post("/api/auth/login").send({ email: "known@example.com", password: TEST_PASSWORD });
    expect(unchanged.status).toBe(200);
  });

  it("rejects 849201 for an account that never requested a reset", async () => {
    await createTestUser({ email: "never@example.com" });
    const res = await reset({ email: "never@example.com", code: "849201", newPassword: "BrandNewPass1!" });
    expect(res.status).toBe(400);
  });

  it("rejects an expired code", async () => {
    const user = await createTestUser({ email: "known@example.com" });
    const code = await issueCode("known@example.com");
    await User.updateOne({ _id: user._id }, { passwordResetExpiresAt: new Date(Date.now() - 1000) });
    const res = await reset({ email: "known@example.com", code, newPassword: "BrandNewPass1!" });
    expect(res.status).toBe(400);
  });

  it("invalidates the code after 5 wrong guesses, even if the right code follows", async () => {
    await createTestUser({ email: "known@example.com" });
    const code = await issueCode("known@example.com");
    const wrong = code === "123456" ? "654321" : "123456";

    for (let i = 0; i < 5; i++) {
      expect((await reset({ email: "known@example.com", code: wrong, newPassword: "BrandNewPass1!" })).status).toBe(400);
    }
    const late = await reset({ email: "known@example.com", code, newPassword: "BrandNewPass1!" });
    expect(late.status).toBe(400);
  });

  it("rejects a short new password and a malformed code", async () => {
    await createTestUser({ email: "known@example.com" });
    const code = await issueCode("known@example.com");
    expect((await reset({ email: "known@example.com", code, newPassword: "short" })).status).toBe(400);
    expect((await reset({ email: "known@example.com", code: "12ab", newPassword: "BrandNewPass1!" })).status).toBe(400);
  });

  it("returns 400 when fields are missing", async () => {
    const res = await reset({ email: "known@example.com" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email, recovery code, and new password are required.");
  });

  it("does not issue codes for staff accounts via the customer flow", async () => {
    await createTestUser({ email: "boss@example.com", role: "admin" });
    const res = await forgot("boss@example.com");
    expect(res.body.code).toBeUndefined();
  });
});

describe("POST /api/auth/change-password", () => {
  const change = (token: string | null, body: object) => {
    const r = request(app).post("/api/auth/change-password");
    if (token) r.set("Authorization", `Bearer ${token}`);
    return r.send(body);
  };

  it("requires authentication", async () => {
    expect((await change(null, { currentPassword: TEST_PASSWORD, newPassword: "BrandNewPass1!" })).status).toBe(401);
  });

  it("rejects a wrong current password", async () => {
    const { token } = await registerAndGetToken();
    const res = await change(token, { currentPassword: "WrongPass123", newPassword: "BrandNewPass1!" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Current password is incorrect.");
  });

  it("rejects a new password equal to the current one", async () => {
    const { token } = await registerAndGetToken();
    const res = await change(token, { currentPassword: TEST_PASSWORD, newPassword: TEST_PASSWORD });
    expect(res.status).toBe(400);
  });

  it("rejects a mismatched confirmation and a too-short new password", async () => {
    const { token } = await registerAndGetToken();
    expect((await change(token, { currentPassword: TEST_PASSWORD, newPassword: "BrandNewPass1!", confirmPassword: "Other" })).status).toBe(400);
    expect((await change(token, { currentPassword: TEST_PASSWORD, newPassword: "short" })).status).toBe(400);
  });

  it("changes the password, signs out old sessions, and returns a working fresh token", async () => {
    const { token: oldToken } = await registerAndGetToken("reg@example.com");
    const res = await change(oldToken, { currentPassword: TEST_PASSWORD, newPassword: "BrandNewPass1!", confirmPassword: "BrandNewPass1!" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    expect((await request(app).get("/api/auth/me").set("Authorization", `Bearer ${oldToken}`)).status).toBe(401);
    expect((await request(app).get("/api/auth/me").set("Authorization", `Bearer ${res.body.token}`)).status).toBe(200);

    const withOld = await request(app).post("/api/auth/login").send({ email: "reg@example.com", password: TEST_PASSWORD });
    const withNew = await request(app).post("/api/auth/login").send({ email: "reg@example.com", password: "BrandNewPass1!" });
    expect(withOld.status).toBe(401);
    expect(withNew.status).toBe(200);
  });
});

describe("regression: response contracts and untouched endpoints", () => {
  it("keeps the register/login/me user fields the web app reads", async () => {
    const reg = await request(app).post("/api/auth/register").send(validRegistration);
    const contract = ["id", "customerNumber", "name", "email", "phone", "tier", "status", "createdAt"];
    for (const key of contract) expect(reg.body.user, `register.user.${key}`).toHaveProperty(key);

    const login = await request(app).post("/api/auth/login").send({ email: "ada@example.com", password: TEST_PASSWORD });
    for (const key of contract) expect(login.body.user, `login.user.${key}`).toHaveProperty(key);

    const me = await request(app).get("/auth/me").set("Authorization", `Bearer ${login.body.token}`);
    for (const key of contract) expect(me.body.user, `me.user.${key}`).toHaveProperty(key);
  });

  it("still serves the not-yet-migrated catalog endpoints", async () => {
    const products = await request(app).get("/api/products");
    expect(products.status).toBe(200);
    expect(Array.isArray(products.body)).toBe(true);

    const health = await request(app).get("/api/health");
    expect(health.status).toBe(200);
  });

  it("answers unknown routes with a JSON 404", async () => {
    const res = await request(app).get("/api/definitely-not-a-route");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("ROUTE_NOT_FOUND");
  });

  it("sets security headers", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

describe("database availability", () => {
  it("answers 503 (not a hang) when MongoDB is disconnected", async () => {
    await mongoose.disconnect();
    try {
      const res = await request(app).post("/api/auth/login").send({ email: "a@example.com", password: "x" });
      expect(res.status).toBe(503);
      expect(res.body.code).toBe("DB_UNAVAILABLE");
    } finally {
      // afterAll → stopTestDb handles teardown; nothing to restore for later tests (this block is last).
    }
  });
});
