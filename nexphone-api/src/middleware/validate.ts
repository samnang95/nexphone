import type { RequestHandler } from "express";
import type { ZodType } from "zod";

interface Schemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

/**
 * Validates request parts with zod. Failures are forwarded to the error handler as 400s.
 * - `req.body` is replaced with the parsed value (unknown keys are stripped, which also
 *   blocks mass-assignment of fields such as `role`).
 * - Express 5 makes `req.query` read-only, so parsed query/params go to `res.locals`.
 */
export function validate(schemas: Schemas): RequestHandler {
  return (req, res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body ?? {});
      if (schemas.query) res.locals.query = schemas.query.parse(req.query);
      if (schemas.params) res.locals.params = schemas.params.parse(req.params);
      next();
    } catch (err) {
      next(err);
    }
  };
}
