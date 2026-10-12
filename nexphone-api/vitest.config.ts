import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./src/tests/setup.ts"],
    // First run may download a mongod binary for mongodb-memory-server.
    hookTimeout: 120_000,
    testTimeout: 30_000,
  },
});
