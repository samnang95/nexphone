import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveJwtSecret } from "../config/env";

describe("resolveJwtSecret", () => {
  const original = process.env.JWT_SECRET;
  afterEach(() => {
    if (original === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = original;
  });

  it("refuses to start staging and prod without JWT_SECRET", () => {
    delete process.env.JWT_SECRET;
    expect(() => resolveJwtSecret("staging")).toThrow(/JWT_SECRET must be set/);
    expect(() => resolveJwtSecret("prod")).toThrow(/JWT_SECRET must be set/);
  });

  it("treats a blank secret as missing", () => {
    process.env.JWT_SECRET = "   ";
    expect(() => resolveJwtSecret("prod")).toThrow();
  });

  it("keeps the local-only fallback in dev", () => {
    delete process.env.JWT_SECRET;
    expect(resolveJwtSecret("dev")).toContain("fallback");
  });

  it("uses the configured secret when present", () => {
    process.env.JWT_SECRET = "a-real-secret";
    expect(resolveJwtSecret("prod")).toBe("a-real-secret");
  });

  it("warns (but starts) when a non-dev secret still looks like a placeholder", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    process.env.JWT_SECRET = "change_me_in_production";
    expect(resolveJwtSecret("prod")).toBe("change_me_in_production");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("placeholder"));
    warn.mockRestore();
  });
});

describe("connectDatabase failure policy", () => {
  const unreachable = "mongodb://127.0.0.1:1/nexphone_unreachable";

  async function loadWith(overrides: Record<string, unknown>) {
    vi.resetModules();
    vi.doMock("../config/env", () => ({
      config: { isDev: false, flavor: "prod", allowStandaloneMode: false, mongodbUri: unreachable, ...overrides },
    }));
    return import("../config/database.js");
  }

  it("rejects in staging/prod so the process can exit instead of serving volatile data", async () => {
    const { connectDatabase } = await loadWith({});
    await expect(connectDatabase()).rejects.toThrow(/Refusing to start in prod without a database/);
  });

  it("only warns in dev", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { connectDatabase } = await loadWith({ isDev: true, flavor: "dev" });
    await expect(connectDatabase()).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("standalone mock mode"));
    warn.mockRestore();
  });

  it("honours the explicit ALLOW_STANDALONE_MODE opt-out", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { connectDatabase } = await loadWith({ allowStandaloneMode: true });
    await expect(connectDatabase()).resolves.toBeUndefined();
    warn.mockRestore();
  });
});
