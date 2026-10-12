import type { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import { HttpError } from "../utils/httpError";
import { verifyAccessToken, type AccessTokenPayload } from "../modules/auth/token.service";
import { RevokedToken } from "../modules/auth/revokedToken.model";
import { User, type UserDocument, type UserRole } from "../modules/users/user.model";

export interface AuthContext {
  user: UserDocument;
  token: AccessTokenPayload;
}

function extractBearer(header: string | undefined): string | null {
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}

/**
 * Requires a valid access token. The user is re-loaded on every request so that
 * disabling an account, changing its password, or logging out takes effect immediately.
 */
export const authenticate: RequestHandler = async (req, _res, next) => {
  const raw = extractBearer(req.headers.authorization);
  if (!raw) {
    throw HttpError.unauthorized("Authentication token required.", "TOKEN_REQUIRED");
  }

  let payload: AccessTokenPayload;
  try {
    payload = verifyAccessToken(raw);
  } catch {
    throw HttpError.unauthorized("Invalid or expired session token.", "TOKEN_INVALID");
  }

  if (!isValidObjectId(payload.sub)) {
    throw HttpError.unauthorized("Invalid or expired session token.", "TOKEN_INVALID");
  }

  const [user, revoked] = await Promise.all([
    User.findById(payload.sub),
    RevokedToken.exists({ jti: payload.jti }),
  ]);

  if (!user || revoked || user.tokenVersion !== payload.ver) {
    throw HttpError.unauthorized("Invalid or expired session token.", "TOKEN_INVALID");
  }
  if (user.status === "disabled") {
    throw HttpError.forbidden("This account has been suspended.", "ACCOUNT_DISABLED");
  }

  req.auth = { user, token: payload };
  next();
};

/** Must run after `authenticate`. Role comes from the database, never from the token claim. */
export const authorize =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    const role = req.auth?.user.role;
    if (!role) throw HttpError.unauthorized("Authentication token required.", "TOKEN_REQUIRED");
    if (!roles.includes(role)) throw HttpError.forbidden("Insufficient permissions.", "FORBIDDEN");
    next();
  };

export const requireAdmin = authorize("admin", "super_admin");
