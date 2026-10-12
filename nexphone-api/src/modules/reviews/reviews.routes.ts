import { Router, type Request, type Response } from "express";
import { ReviewRecord, reviewsStore } from "./reviews.data";

export const reviewsRouter = Router();

// GET /api/reviews
reviewsRouter.get("/api/reviews", (req: Request, res: Response) => {
  const {
    search = "",
    status = "all",
    rating = "all",
    reportedOnly = "false",
    sortBy = "recent",
  } = req.query as Record<string, string>;

  let results = [...reviewsStore];

  // Search filter
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    results = results.filter(
      (r) =>
        r.reviewNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerEmail.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.productSku.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q)
    );
  }

  // Status filter
  if (status !== "all") {
    results = results.filter((r) => r.status === status);
  }

  // Rating filter
  if (rating !== "all") {
    const numRating = Number(rating);
    if (!isNaN(numRating)) {
      results = results.filter((r) => r.rating === numRating);
    }
  }

  // Reported only filter
  if (reportedOnly === "true") {
    results = results.filter((r) => r.isReported && r.status !== "rejected");
  }

  // Sorting
  if (sortBy === "rating_desc") {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "rating_asc") {
    results.sort((a, b) => a.rating - b.rating);
  } else if (sortBy === "reports_desc") {
    results.sort((a, b) => b.reportsCount - a.reportsCount);
  } else if (sortBy === "helpful_desc") {
    results.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
  } else {
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(results);
});

// GET /api/reviews/:id
reviewsRouter.get("/api/reviews/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const review = reviewsStore.find((r) => r.id === id || r.reviewNumber === id);
  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }
  res.json(review);
});

// DELETE /api/reviews/:id (Delete/Reject inappropriate review)
reviewsRouter.delete("/api/reviews/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason = "Inappropriate content", moderationNote, moderatedBy = "Admin Moderator" } = req.body || {};

  const index = reviewsStore.findIndex((r) => r.id === id || r.reviewNumber === id);
  if (index === -1) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  const current = reviewsStore[index]!;
  const now = new Date().toISOString();

  const moderationEntry = {
    moderatedBy,
    moderatedAt: now,
    action: "deleted" as const,
    reason,
    note: moderationNote,
  };

  const updated: ReviewRecord = {
    ...current,
    status: "rejected",
    isReported: false,
    moderationHistory: [...(current.moderationHistory || []), moderationEntry],
    updatedAt: now,
  };

  reviewsStore[index] = updated;
  res.json({ message: "Review deleted successfully", review: updated });
});

// PATCH /api/reviews/:id/status (Change status: published, flagged, rejected)
reviewsRouter.patch("/api/reviews/:id/status", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reason, note, moderatedBy = "Admin Moderator" } = req.body || {};

  const index = reviewsStore.findIndex((r) => r.id === id || r.reviewNumber === id);
  if (index === -1) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  const current = reviewsStore[index]!;
  const now = new Date().toISOString();

  const moderationEntry = {
    moderatedBy,
    moderatedAt: now,
    action: (status === "published" ? "approved" : status === "rejected" ? "rejected" : "dismissed_flag") as any,
    reason,
    note,
  };

  const updated: ReviewRecord = {
    ...current,
    status,
    isReported: status === "flagged",
    moderationHistory: [...(current.moderationHistory || []), moderationEntry],
    updatedAt: now,
  };

  reviewsStore[index] = updated;
  res.json(updated);
});

// POST /api/reviews/:id/dismiss-report (Dismiss flagged report and keep published)
reviewsRouter.post("/api/reviews/:id/dismiss-report", (req: Request, res: Response) => {
  const { id } = req.params;
  const { note, moderatedBy = "Admin Moderator" } = req.body || {};

  const index = reviewsStore.findIndex((r) => r.id === id || r.reviewNumber === id);
  if (index === -1) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  const current = reviewsStore[index]!;
  const now = new Date().toISOString();

  const moderationEntry = {
    moderatedBy,
    moderatedAt: now,
    action: "dismissed_flag" as const,
    reason: "Report reviewed and dismissed as compliant with policy",
    note,
  };

  const updated: ReviewRecord = {
    ...current,
    status: "published",
    isReported: false,
    reportsCount: 0,
    moderationHistory: [...(current.moderationHistory || []), moderationEntry],
    updatedAt: now,
  };

  reviewsStore[index] = updated;
  res.json({ message: "Report dismissed, review restored to published", review: updated });
});

// GET /api/reviews-metrics
reviewsRouter.get("/api/reviews-metrics", (_req: Request, res: Response) => {
  const totalReviews = reviewsStore.length;
  const publishedCount = reviewsStore.filter((r) => r.status === "published").length;
  const reportedCount = reviewsStore.filter((r) => r.isReported && r.status !== "rejected").length;
  const rejectedCount = reviewsStore.filter((r) => r.status === "rejected").length;

  const validRatings = reviewsStore.filter((r) => r.status !== "rejected");
  const averageRating =
    validRatings.length > 0
      ? Number((validRatings.reduce((acc, r) => acc + r.rating, 0) / validRatings.length).toFixed(1))
      : 5.0;

  const verifiedCount = reviewsStore.filter((r) => r.isVerifiedPurchase).length;
  const verifiedPurchaseRate = totalReviews > 0 ? Math.round((verifiedCount / totalReviews) * 100) : 100;

  const ratingDistribution = {
    5: reviewsStore.filter((r) => r.rating === 5).length,
    4: reviewsStore.filter((r) => r.rating === 4).length,
    3: reviewsStore.filter((r) => r.rating === 3).length,
    2: reviewsStore.filter((r) => r.rating === 2).length,
    1: reviewsStore.filter((r) => r.rating === 1).length,
  };

  res.json({
    totalReviews,
    averageRating,
    publishedCount,
    reportedCount,
    rejectedCount,
    verifiedPurchaseRate,
    ratingDistribution,
  });
});
