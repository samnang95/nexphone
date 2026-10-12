import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Error as MongooseError } from "mongoose";
import { config } from "../config/env";
import { isDatabaseConnected } from "../config/database";
import { HttpError } from "../utils/httpError";

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: "Route not found.", code: "ROUTE_NOT_FOUND", path: req.path });
}

interface BodyParserError extends Error {
  status?: number;
  type?: string;
}

/**
 * Central error handler. Always answers JSON shaped `{ error, code?, details? }`.
 * Never leaks stack traces or internal messages for unexpected errors.
 */
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, code: err.code, details: err.details });
    return;
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    res.status(400).json({
      error: details[0]?.message ?? "Invalid request.",
      code: "VALIDATION_ERROR",
      details,
    });
    return;
  }

  const e = err as BodyParserError & { code?: number };

  // body-parser (malformed JSON / payload too large)
  if (e.type === "entity.parse.failed") {
    res.status(400).json({ error: "Request body is not valid JSON.", code: "INVALID_JSON" });
    return;
  }
  if (e.type === "entity.too.large") {
    res.status(413).json({ error: "Request body is too large.", code: "PAYLOAD_TOO_LARGE" });
    return;
  }

  // CORS rejection thrown by the cors() origin callback
  if (typeof e.message === "string" && e.message.startsWith("CORS blocked")) {
    res.status(403).json({ error: "Origin not allowed.", code: "CORS_BLOCKED" });
    return;
  }

  // Mongoose / MongoDB
  if (err instanceof MongooseError.ValidationError) {
    res.status(400).json({ error: "Validation failed.", code: "VALIDATION_ERROR", details: Object.keys(err.errors) });
    return;
  }
  if (err instanceof MongooseError.CastError) {
    res.status(400).json({ error: "Invalid identifier.", code: "INVALID_ID" });
    return;
  }
  if (e.code === 11000) {
    res.status(409).json({ error: "A record with this value already exists.", code: "DUPLICATE" });
    return;
  }
  if (!isDatabaseConnected() && /bufferCommands|buffering|before initial connection/i.test(String(e.message))) {
    res.status(503).json({ error: "Database is not available.", code: "DB_UNAVAILABLE" });
    return;
  }

  console.error(`❌ [Error] ${req.method} ${req.originalUrl}:`, err);
  res.status(500).json({
    error: "Internal server error.",
    code: "INTERNAL_ERROR",
    ...(config.isDev && e.message ? { detail: e.message } : {}),
  });
}
