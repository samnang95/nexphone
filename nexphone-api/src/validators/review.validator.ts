import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required").optional(),
  rating: z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  title: z.string().min(2, "Review title must be at least 2 characters").max(150),
  comment: z.string().min(5, "Review comment must be at least 5 characters").max(3000),
  customerName: z.string().min(2).max(100).optional(),
  customerEmail: z.string().email().optional(),
  customerAvatarUrl: z.string().url().optional(),
  customerId: z.string().optional(),
  isVerifiedPurchase: z.boolean().optional(),
});

export const updateReviewSchema = z
  .object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    title: z.string().min(2).max(150).optional(),
    comment: z.string().min(5).max(3000).optional(),
    // Also allow moderation fields if admin updates through this endpoint
    status: z.enum(["published", "pending", "flagged", "rejected"]).optional(),
    reason: z.string().optional(),
    note: z.string().optional(),
    moderatedBy: z.string().optional(),
  })
  .refine(
    (data) =>
      data.rating !== undefined ||
      data.title !== undefined ||
      data.comment !== undefined ||
      data.status !== undefined,
    { message: "At least one field to update must be provided" }
  );

export const reportReviewSchema = z.object({
  reason: z.string().min(2, "Reason is required").max(100),
  comment: z.string().max(1000).optional(),
  reporterName: z.string().max(100).optional(),
  reporterEmail: z.string().email().optional(),
});

export const moderateReviewSchema = z.object({
  status: z.enum(["published", "pending", "flagged", "rejected"]),
  reason: z.string().optional(),
  note: z.string().optional(),
  moderatedBy: z.string().optional(),
});

export const dismissReportSchema = z.object({
  note: z.string().optional(),
  moderatedBy: z.string().optional(),
});

export const deleteReviewSchema = z.object({
  reason: z.string().optional(),
  moderationNote: z.string().optional(),
  moderatedBy: z.string().optional(),
});

export const voteReviewSchema = z.object({
  isHelpful: z.coerce.boolean().default(true),
});

export const queryReviewSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  rating: z.string().optional(),
  reportedOnly: z.string().optional(),
  productId: z.string().optional(),
  customerId: z.string().optional(),
  sortBy: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
