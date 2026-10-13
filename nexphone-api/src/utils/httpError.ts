/**
 * Error with an HTTP status. Thrown from services/controllers and rendered by the
 * central error handler as `{ error, code?, details? }` (the `error` string keeps
 * compatibility with the existing frontends, which read `data.error`).
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "HttpError";
  }

  static badRequest(message: string, code = "BAD_REQUEST", details?: unknown) {
    return new HttpError(400, message, code, details);
  }
  static unauthorized(message = "Authentication required.", code = "UNAUTHORIZED") {
    return new HttpError(401, message, code);
  }
  static forbidden(message = "Insufficient permissions.", code = "FORBIDDEN") {
    return new HttpError(403, message, code);
  }
  static notFound(message = "Resource not found.", code = "NOT_FOUND") {
    return new HttpError(404, message, code);
  }
  static conflict(message: string, code = "CONFLICT") {
    return new HttpError(409, message, code);
  }
  static internal(message = "Internal server error.", code = "INTERNAL_SERVER_ERROR", details?: unknown) {
    return new HttpError(500, message, code, details);
  }
}
