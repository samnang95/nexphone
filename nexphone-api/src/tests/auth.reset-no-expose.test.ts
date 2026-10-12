import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.hoisted(() => {
  // Same switch an operator would flip: the reset code must never appear in a response when disabled.
  process.env.EXPOSE_RESET_CODE_IN_DEV = "false";
});

import { app } from "../app";
import { User } from "../modules/users/user.model";
import { clearTestDb, createTestUser, startTestDb, stopTestDb, TEST_PASSWORD } from "./helpers/db";

beforeAll(startTestDb);
afterAll(stopTestDb);
beforeEach(clearTestDb);

describe("password reset when the code is not exposed (production-like)", () => {
  it("never returns the code, for known or unknown emails", async () => {
    await createTestUser({ email: "known@example.com" });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const known = await request(app).post("/api/auth/forgot-password").send({ email: "known@example.com" });
    const unknown = await request(app).post("/api/auth/forgot-password").send({ email: "unknown@example.com" });

    expect(known.status).toBe(200);
    expect(known.body).not.toHaveProperty("code");
    expect(unknown.body).not.toHaveProperty("code");
    expect(known.body).toEqual(unknown.body); // byte-identical, so no account enumeration
    warn.mockRestore();
  });

  it("still creates a hashed code server-side and logs that nothing was delivered", async () => {
    await createTestUser({ email: "known@example.com" });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await request(app).post("/api/auth/forgot-password").send({ email: "known@example.com" });

    const stored = await User.findOne({ email: "known@example.com" }).select("+passwordResetCodeHash +passwordResetExpiresAt");
    expect(stored?.passwordResetCodeHash).toBeTruthy();
    expect(stored!.passwordResetExpiresAt!.getTime()).toBeGreaterThan(Date.now());
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no email provider is configured"));
    warn.mockRestore();
  });

  it("cannot be reset with a guessed code, including the retired 849201", async () => {
    await createTestUser({ email: "known@example.com" });
    await request(app).post("/api/auth/forgot-password").send({ email: "known@example.com" });

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ email: "known@example.com", code: "849201", newPassword: "BrandNewPass1!" });
    expect(res.status).toBe(400);

    const login = await request(app).post("/api/auth/login").send({ email: "known@example.com", password: TEST_PASSWORD });
    expect(login.status).toBe(200);
  });
});
