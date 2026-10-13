import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { clearTestDb, startTestDb, stopTestDb, TEST_PASSWORD } from "./helpers/db";

beforeAll(startTestDb);
afterAll(stopTestDb);
beforeEach(clearTestDb);

async function registerCustomer(email = "uploader@example.com", name = "Test Uploader") {
  const res = await request(app).post("/api/auth/register").send({
    name,
    email,
    password: TEST_PASSWORD,
    phone: "+1 (555) 010-9999",
  });
  return {
    token: res.body.token as string,
    user: res.body.user,
  };
}

describe("Media / Upload API", () => {
  it("rejects unauthenticated upload requests with 401", async () => {
    const endpoints = [
      "/api/upload/image",
      "/api/upload/avatar",
      "/api/user/avatar/upload",
    ];

    for (const path of endpoints) {
      const res = await request(app).post(path);
      expect(res.status).toBe(401);
      expect(res.body.code).toBe("TOKEN_REQUIRED");
    }
  });

  it("returns 400 when no file is uploaded", async () => {
    const { token } = await registerCustomer();

    const res = await request(app)
      .post("/api/upload/image")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("NO_FILE_PROVIDED");
  });

  it("returns 400 when no avatar is uploaded to /api/user/avatar/upload", async () => {
    const { token } = await registerCustomer();

    const res = await request(app)
      .post("/api/user/avatar/upload")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("NO_IMAGE_PROVIDED");
  });
});
