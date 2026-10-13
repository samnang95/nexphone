import type { Request, Response } from "express";
import { reviewService } from "../services/review.service";

/**
 * 1. Get Product Reviews
 * GET /api/reviews/product/:productId
 * GET /api/products/:id/reviews
 */
export async function getProductReviews(req: Request, res: Response): Promise<void> {
  const productId = String(req.params.productId || req.params.id || "");
  const result = await reviewService.getProductReviews(productId, req.query as any);
  res.json(result);
}

/**
 * 2. Create Review
 * POST /api/reviews
 * POST /api/products/:id/reviews
 */
export async function createReview(req: Request, res: Response): Promise<void> {
  const productId = String(req.params.id || req.params.productId || req.body.productId || "");
  const user = req.auth?.user;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const result = await reviewService.createReview(
    { ...req.body, productId },
    { user, isAdmin }
  );
  res.status(201).json(result);
}

/**
 * 3. Update Own Review
 * PUT /api/reviews/:id
 * PATCH /api/reviews/:id
 */
export async function updateOwnReview(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const user = req.auth?.user;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const result = await reviewService.updateOwnReview(id, req.body, { user, isAdmin });
  res.json(result);
}

/**
 * 4. Delete Own Review (Customer hard delete or Admin moderation delete)
 * DELETE /api/reviews/:id
 */
export async function deleteOwnReview(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const user = req.auth?.user;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const result = await reviewService.deleteOwnReview(id, req.body || {}, { user, isAdmin });
  res.json(result);
}

/**
 * 5. Report Review
 * POST /api/reviews/:id/report
 */
export async function reportReview(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const user = req.auth?.user;
  const result = await reviewService.reportReview(id, req.body, { user });
  res.json(result);
}

/**
 * 6. Moderate Reviews (Admin) - Update Status
 * PATCH /api/reviews/:id/status
 */
export async function moderateReview(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const user = req.auth?.user;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const result = await reviewService.moderateReview(id, req.body, { user, isAdmin });
  res.json(result);
}

/**
 * 7. Moderate Reviews (Admin) - Dismiss Flag / Report
 * POST /api/reviews/:id/dismiss-report
 */
export async function dismissReport(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const user = req.auth?.user;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const result = await reviewService.dismissReport(id, req.body, { user, isAdmin });
  res.json(result);
}

/**
 * 8. Vote Helpful / Unhelpful
 * POST /api/reviews/:id/vote
 */
export async function voteReview(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const isHelpful = req.body?.isHelpful !== false;
  const result = await reviewService.voteReview(id, isHelpful);
  res.json(result);
}

/**
 * 9. Get Single Review
 * GET /api/reviews/:id
 */
export async function getReviewById(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await reviewService.getReviewById(id);
  res.json(result);
}

/**
 * 10. List All Reviews (Admin & Catalog Search)
 * GET /api/reviews
 */
export async function listReviews(req: Request, res: Response): Promise<void> {
  const result = await reviewService.listReviews(req.query as any);
  res.json(result);
}

/**
 * 11. Review Metrics (Admin Overview)
 * GET /api/reviews-metrics
 * GET /api/reviews/metrics
 */
export async function getReviewMetrics(_req: Request, res: Response): Promise<void> {
  const result = await reviewService.getMetrics();
  res.json(result);
}
