import type { Request, Response } from "express";
import { cartService } from "../services/cart.service";

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

/**
 * 1. Get Cart
 */
export async function getCart(req: Request, res: Response): Promise<void> {
  const { userId, sessionId } = getClientIdentity(req);
  const cart = await cartService.getCart(userId, sessionId);
  res.json(cart);
}

/**
 * 2. Add to Cart
 */
export async function addToCart(req: Request, res: Response): Promise<void> {
  const { userId, sessionId } = getClientIdentity(req);
  const cart = await cartService.addToCart(req.body, userId, sessionId);
  res.status(200).json(cart);
}

/**
 * 3. Update Cart Item Quantity
 */
export async function updateCartItemQuantity(req: Request, res: Response): Promise<void> {
  const { userId, sessionId } = getClientIdentity(req);
  const itemId = String(req.params.itemId || "");
  const cart = await cartService.updateItemQuantity(itemId, req.body, userId, sessionId);
  res.json(cart);
}

/**
 * 4. Remove Cart Item
 */
export async function removeCartItem(req: Request, res: Response): Promise<void> {
  const { userId, sessionId } = getClientIdentity(req);
  const itemId = String(req.params.itemId || "");
  const cart = await cartService.removeItem(itemId, userId, sessionId);
  res.json(cart);
}

/**
 * 5. Clear Cart
 */
export async function clearCart(req: Request, res: Response): Promise<void> {
  const { userId, sessionId } = getClientIdentity(req);
  const cart = await cartService.clearCart(userId, sessionId);
  res.json(cart);
}

/**
 * 6. Calculate Subtotal and Total
 */
export async function calculateTotals(req: Request, res: Response): Promise<void> {
  const { userId, sessionId } = getClientIdentity(req);
  const totals = await cartService.calculateTotals(req.body, userId, sessionId);
  res.json({
    success: true,
    ...totals,
  });
}

/**
 * Apply Promo Code
 */
export async function applyPromoCode(req: Request, res: Response): Promise<void> {
  const { userId, sessionId } = getClientIdentity(req);
  const { code } = req.body;
  const cart = await cartService.applyPromoCode(code, userId, sessionId);
  res.json({
    success: true,
    message: `Promo code "${code.toUpperCase()}" applied successfully.`,
    cart,
  });
}

/**
 * Remove Promo Code
 */
export async function removePromoCode(req: Request, res: Response): Promise<void> {
  const { userId, sessionId } = getClientIdentity(req);
  const cart = await cartService.removePromoCode(userId, sessionId);
  res.json({
    success: true,
    message: "Promo code removed successfully.",
    cart,
  });
}
