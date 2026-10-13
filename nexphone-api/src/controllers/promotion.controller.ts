import type { Request, Response } from "express";
import { promotionService } from "../services/promotion.service";

/**
 * 1. Get Active Promotions
 */
export async function getActivePromotions(_req: Request, res: Response): Promise<void> {
  const result = await promotionService.getActivePromotions();
  res.json(result);
}

/**
 * 2. Get Promotion Details
 */
export async function getPromotionDetails(req: Request, res: Response): Promise<void> {
  const idOrCode = String(req.params.id || req.params.code || "");
  const result = await promotionService.getPromotionDetails(idOrCode, req.auth?.user);
  res.json(result);
}

/**
 * 3. Validate Coupon
 */
export async function validateCoupon(req: Request, res: Response): Promise<void> {
  const result = await promotionService.validateCoupon(req.body);
  res.json(result);
}

/**
 * 4. Apply Coupon
 */
export async function applyCoupon(req: Request, res: Response): Promise<void> {
  const sessionId = (req.headers["x-session-id"] as string) || req.body.sessionId;
  const userId = req.auth?.user?.id;
  const result = await promotionService.applyCoupon(req.body, { userId, sessionId });
  res.json(result);
}

/**
 * 5. Create Coupon (Admin)
 */
export async function createCoupon(req: Request, res: Response): Promise<void> {
  const result = await promotionService.createCoupon(req.body, req.auth?.user);
  res.status(201).json(result);
}

/**
 * 6. Update Coupon (Admin)
 */
export async function updateCoupon(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await promotionService.updateCoupon(id, req.body, req.auth?.user);
  res.json(result);
}

/**
 * 7. Delete Coupon (Admin)
 */
export async function deleteCoupon(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await promotionService.deleteCoupon(id, req.auth?.user);
  res.json(result);
}

/**
 * Query All Promotions (Admin / Public with search)
 */
export async function getAllPromotions(req: Request, res: Response): Promise<void> {
  const result = await promotionService.getAllPromotions(req.query as any, req.auth?.user);
  // Maintain backward-compatibility: if client requests plain array without pagination params, return array
  if (!req.query.page && !req.query.limit) {
    res.json(result.promotions);
    return;
  }
  res.json(result);
}

/**
 * Toggle Status (Admin)
 */
export async function togglePromotionStatus(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const { status } = req.body || {};
  const result = await promotionService.toggleStatus(id, status, req.auth?.user);
  res.json(result);
}

/**
 * Metrics (Admin)
 */
export async function getPromotionMetrics(_req: Request, res: Response): Promise<void> {
  const metrics = await promotionService.getMetrics();
  res.json(metrics);
}
