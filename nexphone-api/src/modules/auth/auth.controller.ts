import type { Request, Response } from "express";
import {
  verifyAccessToken,
  verifyRefreshToken,
  type AccessTokenPayload,
  type RefreshTokenPayload,
} from "./token.service";
import * as authService from "./auth.service";

/** Logout must never fail the client, so a missing/invalid token is simply ignored. */
function tryReadToken(req: Request): AccessTokenPayload | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  try {
    return verifyAccessToken(header.slice(7).trim());
  } catch {
    return null;
  }
}

function tryReadRefreshToken(req: Request): RefreshTokenPayload | null {
  const token = req.body?.refreshToken;
  if (!token || typeof token !== "string") return null;
  try {
    return verifyRefreshToken(token.trim());
  } catch {
    return null;
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  res.status(201).json(await authService.register(req.body));
}

export async function login(req: Request, res: Response): Promise<void> {
  res.json(await authService.login(req.body, "customer"));
}

export async function adminLogin(req: Request, res: Response): Promise<void> {
  res.json(await authService.login(req.body, "admin"));
}

export async function logout(req: Request, res: Response): Promise<void> {
  await authService.logout(tryReadToken(req), tryReadRefreshToken(req));
  res.json({ success: true, message: "Logged out successfully" });
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  res.json(await authService.refreshToken(req.body.refreshToken));
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  res.json(await authService.forgotPassword(req.body.email));
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  res.json(await authService.resetPassword(req.body));
}

export function me(req: Request, res: Response): void {
  res.json({ user: authService.serializeAuthUser(req.auth!.user) });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  res.json(await authService.changePassword(req.auth!.user._id, req.body));
}
