import type { RequestHandler } from "express";
import { isDatabaseConnected } from "../config/database";
import { HttpError } from "../utils/httpError";

/** Guards routes that persist to MongoDB; answers 503 quickly instead of hanging. */
export const requireDatabase: RequestHandler = (_req, _res, next) => {
  if (!isDatabaseConnected()) {
    next(new HttpError(503, "Service temporarily unavailable: database is not connected.", "DB_UNAVAILABLE"));
    return;
  }
  next();
};
