import rateLimit, { type Options } from "express-rate-limit";
import { config } from "../config/env";

export function createRateLimiter(overrides: Partial<Options> = {}) {
  return rateLimit({
    windowMs: config.authRateLimitWindowMs,
    limit: config.authRateLimitMax,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many attempts. Please try again later.", code: "RATE_LIMITED" },
    ...overrides,
  });
}
