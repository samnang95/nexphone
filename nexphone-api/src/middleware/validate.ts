import type { RequestHandler } from "express";
import type { ZodType } from "zod";

interface Schemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

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
