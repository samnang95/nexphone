import rateLimit, { type Options } from "express-rate-limit";
import { config } from "../config/env";

/**
 * Rate limiter for sensitive endpoints. Each call creates an independent counter,
 * so login, register, and password-reset attempts are limited separately.
 *
 * Counters are kept in process memory and keyed by client IP. Behind a reverse proxy,
 * set TRUST_PROXY so the real client IP is used. For multi-instance deployments,
 * switch to a shared store (e.g. Redis).
 */
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
