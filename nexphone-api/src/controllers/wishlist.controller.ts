import type { Request, Response } from "express";
import { wishlistService } from "../services/wishlist.service";

function getClientIdentity(req: Request): { userId?: string; sessionId?: string } {
  const userId = req.auth?.user?._id ? String(req.auth.user._id) : undefined;
  const sessionId =
    (req.headers["x-session-id"] as string) ||
    (req.cookies?.sessionId as string) ||
    (req.query.sessionId as string) ||
    (req.body?.sessionId as string) ||
    (userId ? undefined : "guest-default");

  return { userId, sessionId };
}

export async function getWishlist(req: Request, res: Response): Promise<void> {
  const { userId, sessionId } = getClientIdentity(req);
  const wishlist = await wishlistService.getWishlist(userId, sessionId);
  res.json(wishlist);
}

export async function addToWishlist(req: Request, res: Response): Promise<void> {
  const { userId, sessionId } = getClientIdentity(req);
  const wishlist = await wishlistService.addToWishlist(req.body, userId, sessionId);
  res.status(200).json(wishlist);
}

export async function removeFromWishlist(req: Request, res: Response): Promise<void> {
  const { userId, sessionId } = getClientIdentity(req);
  const productId = String(req.params.productId || "");
  const wishlist = await wishlistService.removeFromWishlist(productId, userId, sessionId);
  res.json(wishlist);
}

export async function clearWishlist(req: Request, res: Response): Promise<void> {
  const { userId, sessionId } = getClientIdentity(req);
  const wishlist = await wishlistService.clearWishlist(userId, sessionId);
  res.json(wishlist);
}

export async function checkWishlist(req: Request, res: Response): Promise<void> {
  const { userId, sessionId } = getClientIdentity(req);
  const productId = String(req.params.productId || "");
  const result = await wishlistService.isInWishlist(productId, userId, sessionId);
  res.json(result);
}

export async function toggleWishlist(req: Request, res: Response): Promise<void> {
  const { userId, sessionId } = getClientIdentity(req);
  const result = await wishlistService.toggleWishlist(req.body, userId, sessionId);
  res.json(result);
}
