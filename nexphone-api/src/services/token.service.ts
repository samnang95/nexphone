import jwt, { type SignOptions } from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { config } from "../config/env";
import type { UserDocument, UserRole } from "../models/user.model";

const ISSUER = "nexphone-api";

export interface AccessTokenPayload {
  sub: string;
  ver: number;
  role: UserRole;
  jti: string;
  exp: number;
  iat: number;
  iss: string;
  type?: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  ver: number;
  jti: string;
  exp: number;
  iat: number;
  iss: string;
  type: "refresh";
}

export function signAccessToken(user: UserDocument): string {
  return jwt.sign(
    { ver: user.tokenVersion, role: user.role, type: "access" },
    config.jwtSecret,
    {
      algorithm: "HS256",
      issuer: ISSUER,
      subject: String(user._id),
      jwtid: randomUUID(),
      expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
    }
  );
}

export function signRefreshToken(user: UserDocument): string {
  return jwt.sign(
    { ver: user.tokenVersion, type: "refresh" },
    config.jwtSecret,
    {
      algorithm: "HS256",
      issuer: ISSUER,
      subject: String(user._id),
      jwtid: randomUUID(),
      expiresIn: "30d",
    }
  );
}

export function issueTokenPair(user: UserDocument) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  return {
    accessToken,
    refreshToken,
    token: accessToken,
  };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"], issuer: ISSUER });
  if (
    typeof decoded === "string" ||
    typeof decoded.sub !== "string" ||
    typeof decoded.jti !== "string" ||
    typeof decoded.ver !== "number" ||
    (decoded as { type?: string }).type === "refresh"
  ) {
    throw new Error("Malformed access token payload");
  }
  return decoded as unknown as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"], issuer: ISSUER });
  if (
    typeof decoded === "string" ||
    typeof decoded.sub !== "string" ||
    typeof decoded.jti !== "string" ||
    typeof decoded.ver !== "number" ||
    (decoded as { type?: string }).type !== "refresh"
  ) {
    throw new Error("Malformed refresh token payload");
  }
  return decoded as unknown as RefreshTokenPayload;
}