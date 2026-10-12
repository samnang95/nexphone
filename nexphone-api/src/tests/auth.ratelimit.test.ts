import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

// Must run before any module reads the config (imports are hoisted above normal statements).
vi.hoisted(() => {
  process.env.AUTH_RATE_LIMIT_MAX = "3";
  // Lets each test act as a distinct client via X-Forwarded-For (also exercises the TRUST_PROXY path).
  process.env.TRUST_PROXY = "1";
});

import { app } from "../app";
import { clearTestDb, createTestUser, startTestDb, stopTestDb, TEST_PASSWORD } from "./helpers/db";

beforeAll(startTestDb);
afterAll(stopTestDb);
beforeEach(clearTestDb);

let nextIp = 10;
/** A fresh client IP per test, so counters from one test never affect another. */
const newClient = () => `203.0.113.${nextIp++}`;

describe("rate limiting on sensitive auth endpoints (limit = 3 per window)", () => {
  it("blocks the 4th failed login with 429", async () => {
    const ip = newClient();
    await createTestUser({ email: "victim@example.com" });
    const attempt = () =>
      request(app).post("/api/auth/login").set("X-Forwarded-For", ip).send({ email: "victim@example.com", password: "WrongPass123" });

    for (let i = 0; i < 3; i++) expect((await attempt()).status).toBe(401);

    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body.code).toBe("RATE_LIMITED");
    expect(blocked.headers["ratelimit"] ?? blocked.headers["ratelimit-policy"]).toBeTruthy();
  });

  it("does not let a locked-out client log in even with the right password", async () => {
    const ip = newClient();
    await createTestUser({ email: "victim2@example.com" });
    for (let i = 0; i < 3; i++) {
      await request(app).post("/api/auth/login").set("X-Forwarded-For", ip).send({ email: "victim2@example.com", password: "WrongPass123" });
    }
    const res = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", ip)
      .send({ email: "victim2@example.com", password: TEST_PASSWORD });
    expect(res.status).toBe(429);
  });

  it("does not affect other clients", async () => {
    const attacker = newClient();
    const bystander = newClient();
    await createTestUser({ email: "victim3@example.com" });
    for (let i = 0; i < 4; i++) {
      await request(app).post("/api/auth/login").set("X-Forwarded-For", attacker).send({ email: "victim3@example.com", password: "WrongPass123" });
    }
    const res = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", bystander)
      .send({ email: "victim3@example.com", password: TEST_PASSWORD });
    expect(res.status).toBe(200);
  });

  it("does not count successful logins against the budget", async () => {
    const ip = newClient();
    await createTestUser({ email: "legit@example.com" });
    for (let i = 0; i < 6; i++) {
      const res = await request(app).post("/api/auth/login").set("X-Forwarded-For", ip).send({ email: "legit@example.com", password: TEST_PASSWORD });
      expect(res.status).toBe(200);
    }
  });

  it("limits register, forgot-password and reset-password", async () => {
    const endpoints: Array<[string, object]> = [
      ["/api/auth/register", { name: "A", email: "bad", password: "x" }],
      ["/api/auth/forgot-password", { email: "a@example.com" }],
      ["/api/auth/reset-password", { email: "a@example.com", code: "111111", newPassword: "LongEnough1!" }],
    ];
    for (const [path, body] of endpoints) {
      const ip = newClient();
      for (let i = 0; i < 3; i++) {
        expect((await request(app).post(path).set("X-Forwarded-For", ip).send(body)).status, path).not.toBe(429);
      }
      expect((await request(app).post(path).set("X-Forwarded-For", ip).send(body)).status, path).toBe(429);
    }
  });

  it("limits the admin login separately from the customer login", async () => {
    const ip = newClient();
    const adminAttempt = () =>
      request(app).post("/api/auth/admin/login").set("X-Forwarded-For", ip).send({ email: "nobody@example.com", password: "WrongPass123" });
    for (let i = 0; i < 3; i++) expect((await adminAttempt()).status).toBe(401);
    expect((await adminAttempt()).status).toBe(429);

    // Same client, customer endpoint: its own counter is untouched.
    const customer = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", ip)
      .send({ email: "nobody@example.com", password: "WrongPass123" });
    expect(customer.status).toBe(401);
  });
});
