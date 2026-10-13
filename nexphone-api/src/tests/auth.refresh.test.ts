import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import express from "express";
import { app } from "../app";
import { authenticate, authorize, requireAdmin, requireCustomer } from "../middleware/auth";
import { errorHandler } from "../middleware/errorHandler";
import { User } from "../modules/users/user.model";
import { clearTestDb, createTestUser, startTestDb, stopTestDb, TEST_PASSWORD } from "./helpers/db";

// Test app for role-based authorization verification
const rbacApp = express();
rbacApp.get("/admin-only", authenticate, requireAdmin, (_req, res) => {
  res.json({ success: true, message: "Welcome Admin" });
});
rbacApp.get("/customer-only", authenticate, requireCustomer, (_req, res) => {
  res.json({ success: true, message: "Welcome Customer" });
});
rbacApp.get("/any-auth", authenticate, authorize("customer", "admin", "super_admin"), (_req, res) => {
  res.json({ success: true, message: "Welcome Authorized User" });
});
rbacApp.use(errorHandler);

beforeAll(startTestDb);
afterAll(stopTestDb);
beforeEach(clearTestDb);

describe("Feature 1: Authentication & Refresh Token API", () => {
  const customerCreds = {
    name: "John Doe",
    email: "john@example.com",
    password: TEST_PASSWORD,
  };

  it("register returns both accessToken and refreshToken alongside token and user", async () => {
    const res = await request(app).post("/api/auth/register").send(customerCreds);

    expect(res.status).toBe(201);
    expect(typeof res.body.token).toBe("string");
    expect(typeof res.body.accessToken).toBe("string");
    expect(typeof res.body.refreshToken).toBe("string");
    expect(res.body.token).toBe(res.body.accessToken);
    expect(res.body.user.email).toBe("john@example.com");
    expect(res.body.user.role).toBe("customer");
  });

  it("login returns both accessToken and refreshToken", async () => {
    await request(app).post("/api/auth/register").send(customerCreds);

    const res = await request(app).post("/api/auth/login").send({
      email: customerCreds.email,
      password: customerCreds.password,
    });

    expect(res.status).toBe(200);
    expect(typeof res.body.accessToken).toBe("string");
    expect(typeof res.body.refreshToken).toBe("string");
    expect(res.body.token).toBe(res.body.accessToken);
  });

  it("POST /api/auth/refresh-token exchanges a valid refresh token for a new token pair", async () => {
    const regRes = await request(app).post("/api/auth/register").send(customerCreds);
    const originalRefreshToken = regRes.body.refreshToken;

    const refreshRes = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: originalRefreshToken });

    expect(refreshRes.status).toBe(200);
    expect(typeof refreshRes.body.accessToken).toBe("string");
    expect(typeof refreshRes.body.refreshToken).toBe("string");
    expect(refreshRes.body.user.email).toBe("john@example.com");

    // The new access token must be valid for /me
    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${refreshRes.body.accessToken}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe("john@example.com");
  });

  it("rotates refresh token: old refresh token cannot be reused", async () => {
    const regRes = await request(app).post("/api/auth/register").send(customerCreds);
    const originalRefreshToken = regRes.body.refreshToken;

    // First refresh succeeds
    const firstRefresh = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: originalRefreshToken });
    expect(firstRefresh.status).toBe(200);

    // Replay attack / reusing old refresh token must be rejected with 401
    const replayRes = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: originalRefreshToken });
    expect(replayRes.status).toBe(401);
    expect(replayRes.body.error).toContain("Invalid or expired refresh token");
  });

  it("rejects refresh-token when refreshToken is missing or invalid", async () => {
    const resEmpty = await request(app).post("/api/auth/refresh-token").send({});
    expect(resEmpty.status).toBe(400);

    const resMalformed = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: "invalid.jwt.token" });
    expect(resMalformed.status).toBe(401);
  });

  it("rejects refresh token when user account is suspended/disabled", async () => {
    const regRes = await request(app).post("/api/auth/register").send(customerCreds);
    const refreshToken = regRes.body.refreshToken;

    // Suspend user
    await User.updateOne({ email: customerCreds.email }, { status: "disabled", disabledReason: "Fraud" });

    const refreshRes = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken });
    expect(refreshRes.status).toBe(403);
    expect(refreshRes.body.error).toContain("suspended");
  });

  it("logout revokes both access and refresh tokens", async () => {
    const regRes = await request(app).post("/api/auth/register").send(customerCreds);
    const { accessToken, refreshToken } = regRes.body;

    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ refreshToken });

    expect(logoutRes.status).toBe(200);

    // Access token is revoked
    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(meRes.status).toBe(401);

    // Refresh token is revoked
    const refreshRes = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken });
    expect(refreshRes.status).toBe(401);
  });
});

describe("Feature 1: Role-Based Authorization", () => {
  it("allows customer to access customer-only route, forbids access to admin-only route", async () => {
    const customer = await createTestUser({ email: "customer@nexphone.io", role: "customer" });
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "customer@nexphone.io",
      password: TEST_PASSWORD,
    });
    const token = loginRes.body.accessToken;

    const allowed = await request(rbacApp)
      .get("/customer-only")
      .set("Authorization", `Bearer ${token}`);
    expect(allowed.status).toBe(200);
    expect(allowed.body.message).toBe("Welcome Customer");

    const forbidden = await request(rbacApp)
      .get("/admin-only")
      .set("Authorization", `Bearer ${token}`);
    expect(forbidden.status).toBe(403);
    expect(forbidden.body.error).toBe("Insufficient permissions.");
  });

  it("allows admin to access admin-only route, forbids access to customer-only route", async () => {
    await createTestUser({ email: "admin@nexphone.io", role: "admin" });
    const loginRes = await request(app).post("/api/auth/admin/login").send({
      email: "admin@nexphone.io",
      password: TEST_PASSWORD,
    });
    const token = loginRes.body.accessToken;

    const allowed = await request(rbacApp)
      .get("/admin-only")
      .set("Authorization", `Bearer ${token}`);
    expect(allowed.status).toBe(200);
    expect(allowed.body.message).toBe("Welcome Admin");

    const forbidden = await request(rbacApp)
      .get("/customer-only")
      .set("Authorization", `Bearer ${token}`);
    expect(forbidden.status).toBe(403);
    expect(forbidden.body.error).toBe("Insufficient permissions.");
  });

  it("denies access without token", async () => {
    const res = await request(rbacApp).get("/admin-only");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Authentication token required.");
  });
});
