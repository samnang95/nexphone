import jwt, { type SignOptions } from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { config } from "../../config/env";
import type { UserDocument, UserRole } from "../users/user.model";

const ISSUER = "nexphone-api";

export interface AccessTokenPayload {
  sub: string;
  ver: number;
  role: UserRole;
  jti: string;
  exp: number;
  iat: number;
  iss: string;
}

export function signAccessToken(user: UserDocument): string {
  return jwt.sign({ ver: user.tokenVersion, role: user.role }, config.jwtSecret, {
    algorithm: "HS256",
    issuer: ISSUER,
    subject: String(user._id),
    jwtid: randomUUID(),
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  });
}

/** Throws if the token is malformed, expired, signed with another key/algorithm, or has an unexpected shape. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"], issuer: ISSUER });
  if (
    typeof decoded === "string" ||
    typeof decoded.sub !== "string" ||
    typeof decoded.jti !== "string" ||
    typeof decoded.ver !== "number"
  ) {
    throw new Error("Malformed access token payload");
  }
  return decoded as unknown as AccessTokenPayload;
}
