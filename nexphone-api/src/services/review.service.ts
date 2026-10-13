import { reviewRepository, type ReviewQueryFilters } from "../repositories/review.repo";
import { productRepository } from "../repositories/product.repo";
import { orderRepository } from "../repositories/order.repo";
import { HttpError } from "../utils/httpError";
import {
  serializeReview,
  serializeProductReviews,
  serializeReviewMetrics,
} from "../views/review.view";
import type { ReviewRecord } from "../data/reviews.data";

export interface ReviewAuthContext {
  user?: {
    id?: string;
    email?: string;
    fullName?: string;
    name?: string;
    role?: string;
    avatarUrl?: string | null;
    [key: string]: any;
  };
  isAdmin?: boolean;
}

export const reviewService = {
  /**
   * Recalculates and synchronizes parent product's rating & reviewCount
   */
  async syncProductRating(productId: string): Promise<void> {
    try {
      const cleanId = productId.trim();
      const product = await productRepository.findByIdOrSlug(cleanId);
      if (!product) return;

      const { reviews } = await reviewRepository.find({
        productId: product.id,
        status: "published",
      });

      const count = reviews.length;
      const avg =
        count > 0
          ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
          : 5.0;

      await productRepository.update(product.id, {
        rating: avg,
        reviewCount: count,
      });
    } catch (err) {
      console.warn("⚠️  [Review Service] Could not sync product rating:", (err as Error).message);
    }
  },

  /**
   * 1. Get Product Reviews with Rating Breakdown
   */
  async getProductReviews(
    productId: string,
    query: {
      status?: string;
      rating?: string | number;
      sortBy?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const product = await productRepository.findByIdOrSlug(productId);
    const targetId = product ? product.id : productId;
    const productName = product ? product.name : "NexPhone Device";

    const pageNum = query.page ? Number(query.page) : undefined;
    const limitNum = query.limit ? Number(query.limit) : undefined;

    const { reviews, total, summary } = await reviewRepository.findByProductId(
      targetId,
      {
        status: query.status || "published",
        rating: query.rating,
        sortBy: query.sortBy,
        page: pageNum,
        limit: limitNum,
      }
    );

    return serializeProductReviews(
      productId,
      productName,
      summary,
      reviews,
      pageNum && limitNum ? { page: pageNum, limit: limitNum, total } : undefined
    );
  },

  /**
   * 2. Create Review (with verified purchase checking)
   */
  async createReview(
    payload: {
      productId: string;
      rating: number;
      title: string;
      comment: string;
      customerName?: string;
      customerEmail?: string;
      customerAvatarUrl?: string;
      isVerifiedPurchase?: boolean;
    },
    authContext: ReviewAuthContext = {}
  ) {
    if (!payload.productId || !payload.productId.trim()) {
      throw HttpError.badRequest("Product ID is required", "PRODUCT_REQUIRED");
    }
    const cleanProductId = payload.productId.trim();
    const product = await productRepository.findByIdOrSlug(cleanProductId);
    if (!product) {
      throw HttpError.notFound(`Product with ID '${cleanProductId}' not found`, "PRODUCT_NOT_FOUND");
    }

    const user = authContext.user;
    const customerId =
      user?.id || (user as any)?._id?.toString() || (payload as any).customerId || "cust-anonymous";
    const customerName =
      user?.fullName || user?.name || payload.customerName || "Verified Customer";
    const customerEmail = user?.email || payload.customerEmail || "customer@example.com";
    const customerAvatarUrl = user?.avatarUrl || payload.customerAvatarUrl;

    // Check Verified Purchase Status
    let isVerifiedPurchase = Boolean(payload.isVerifiedPurchase);
    if (!isVerifiedPurchase && (user?.id || user?.email || payload.customerEmail)) {
      try {
        const { orders } = await orderRepository.find({
          userId: user?.id,
          customerEmail: user?.email || payload.customerEmail,
        });

        const hasPurchased = orders.some((ord) => {
          const validStatus = ["confirmed", "processing", "shipped", "delivered"].includes(ord.status) ||
            ord.payment?.status === "paid";
          if (!validStatus) return false;

          return ord.items?.some(
            (item: any) =>
              item.productId === product.id ||
              item.productId === product.slug ||
              (item.sku && product.sku && item.sku === product.sku)
          );
        });

        if (hasPurchased) {
          isVerifiedPurchase = true;
        }
      } catch (err) {
        // Fallback gracefully if order query fails
      }
    }

    const reviewData: Partial<ReviewRecord> = {
      productId: cleanProductId,
      productName: product.name,
      productSku: product.sku || "",
      productBrand: product.brand || "NexPhone Labs",
      productImage: product.imageUrl || (product.images && product.images[0]) || "",
      customerId,
      customerName,
      customerEmail,
      customerAvatarUrl,
      rating: payload.rating,
      title: payload.title,
      comment: payload.comment,
      isVerifiedPurchase,
      helpfulVotes: 0,
      unhelpfulVotes: 0,
      status: "published",
      isReported: false,
      reportsCount: 0,
      reports: [],
      moderationHistory: [],
    };

    const created = await reviewRepository.create(reviewData);

    // Synchronize product's rating and review count
    await this.syncProductRating(product.id);

    return serializeReview(created);
  },

  /**
   * 3. Update Own Review
   */
  async updateOwnReview(
    idOrNumber: string,
    payload: {
      rating?: number;
      title?: string;
      comment?: string;
      status?: "published" | "pending" | "flagged" | "rejected";
      reason?: string;
      note?: string;
      moderatedBy?: string;
    },
    authContext: ReviewAuthContext = {}
  ) {
    const existing = await reviewRepository.findByIdOrNumber(idOrNumber);
    if (!existing) {
      throw HttpError.notFound(`Review with ID '${idOrNumber}' not found`, "REVIEW_NOT_FOUND");
    }

    const user = authContext.user;
    const isAdmin =
      authContext.isAdmin ||
      user?.role === "admin" ||
      user?.role === "super_admin" ||
      (!user && Boolean(payload.status || payload.moderatedBy));

    // Ownership verification
    if (user && !isAdmin) {
      const isOwner =
        existing.customerId === user.id ||
        (existing.customerEmail &&
          user.email &&
          existing.customerEmail.toLowerCase() === user.email.toLowerCase());

      if (!isOwner) {
        throw HttpError.forbidden("You are not authorized to update this review.", "FORBIDDEN");
      }
    }

    const updates: Partial<ReviewRecord> = {};
    if (payload.rating !== undefined) updates.rating = payload.rating;
    if (payload.title !== undefined) updates.title = payload.title;
    if (payload.comment !== undefined) updates.comment = payload.comment;

    // Admin status/moderation changes if submitted here
    if (isAdmin && payload.status) {
      updates.status = payload.status;
      updates.isReported = payload.status === "flagged";
      const now = new Date().toISOString();
      const entry = {
        moderatedBy: payload.moderatedBy || user?.name || "Admin Moderator",
        moderatedAt: now,
        action:
          payload.status === "published"
            ? ("approved" as const)
            : payload.status === "rejected"
            ? ("rejected" as const)
            : ("dismissed_flag" as const),
        reason: payload.reason,
        note: payload.note,
      };
      updates.moderationHistory = [...(existing.moderationHistory || []), entry];
    }

    const updated = await reviewRepository.update(existing.id, updates);

    // If rating changed or status changed, sync product rating
    if (payload.rating !== undefined || (isAdmin && payload.status !== undefined)) {
      await this.syncProductRating(existing.productId);
    }

    return serializeReview(updated || existing);
  },

  /**
   * 4. Delete Own Review (Customer or Admin)
   */
  async deleteOwnReview(
    idOrNumber: string,
    payload: {
      reason?: string;
      moderationNote?: string;
      moderatedBy?: string;
    } = {},
    authContext: ReviewAuthContext = {}
  ) {
    const existing = await reviewRepository.findByIdOrNumber(idOrNumber);
    if (!existing) {
      throw HttpError.notFound(`Review with ID '${idOrNumber}' not found`, "REVIEW_NOT_FOUND");
    }

    const user = authContext.user;
    const isAdmin =
      authContext.isAdmin ||
      user?.role === "admin" ||
      user?.role === "super_admin" ||
      (!user && Boolean(payload.reason || payload.moderatedBy));

    if (user && !isAdmin) {
      const isOwner =
        existing.customerId === user.id ||
        (existing.customerEmail &&
          user.email &&
          existing.customerEmail.toLowerCase() === user.email.toLowerCase());

      if (!isOwner) {
        throw HttpError.forbidden("You are not authorized to delete this review.", "FORBIDDEN");
      }

      // Customer hard deletes their own review
      await reviewRepository.delete(existing.id);
      await this.syncProductRating(existing.productId);
      return { message: "Review deleted successfully", id: existing.id };
    }

    // Admin deletion follows legacy soft-delete moderation pattern (sets status='rejected')
    const now = new Date().toISOString();
    const moderationEntry = {
      moderatedBy: payload.moderatedBy || user?.name || "Admin Moderator",
      moderatedAt: now,
      action: "deleted" as const,
      reason: payload.reason || "Inappropriate content",
      note: payload.moderationNote,
    };

    const updated = await reviewRepository.update(existing.id, {
      status: "rejected",
      isReported: false,
      moderationHistory: [...(existing.moderationHistory || []), moderationEntry],
    });

    await this.syncProductRating(existing.productId);

    return {
      message: "Review deleted successfully",
      review: serializeReview(updated || existing),
    };
  },

  /**
   * 5. Report Review
   */
  async reportReview(
    idOrNumber: string,
    payload: {
      reason: string;
      comment?: string;
      reporterName?: string;
      reporterEmail?: string;
    },
    authContext: ReviewAuthContext = {}
  ) {
    const existing = await reviewRepository.findByIdOrNumber(idOrNumber);
    if (!existing) {
      throw HttpError.notFound(`Review with ID '${idOrNumber}' not found`, "REVIEW_NOT_FOUND");
    }

    const user = authContext.user;
    const report = {
      id: `rep-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      reporterId: user?.id,
      reporterName: payload.reporterName || user?.name || user?.fullName || "Community Member",
      reporterEmail: payload.reporterEmail || user?.email,
      reason: payload.reason,
      comment: payload.comment,
      reportedAt: new Date().toISOString(),
    };

    const updated = await reviewRepository.addReport(existing.id, report);

    return {
      message: "Review reported successfully",
      review: serializeReview(updated || existing),
    };
  },

  /**
   * 6. Moderate Reviews (Admin) - Update Status
   */
  async moderateReview(
    idOrNumber: string,
    payload: {
      status: "published" | "pending" | "flagged" | "rejected";
      reason?: string;
      note?: string;
      moderatedBy?: string;
    },
    authContext: ReviewAuthContext = {}
  ) {
    const existing = await reviewRepository.findByIdOrNumber(idOrNumber);
    if (!existing) {
      throw HttpError.notFound(`Review with ID '${idOrNumber}' not found`, "REVIEW_NOT_FOUND");
    }

    const now = new Date().toISOString();
    const action =
      payload.status === "published"
        ? ("approved" as const)
        : payload.status === "rejected"
        ? ("rejected" as const)
        : ("dismissed_flag" as const);

    const moderationEntry = {
      moderatedBy: payload.moderatedBy || authContext.user?.name || "Admin Moderator",
      moderatedAt: now,
      action,
      reason: payload.reason,
      note: payload.note,
    };

    const updated = await reviewRepository.updateStatus(
      existing.id,
      payload.status,
      moderationEntry
    );

    await this.syncProductRating(existing.productId);

    return serializeReview(updated || existing);
  },

  /**
   * 7. Moderate Reviews (Admin) - Dismiss Report
   */
  async dismissReport(
    idOrNumber: string,
    payload: {
      note?: string;
      moderatedBy?: string;
    } = {},
    authContext: ReviewAuthContext = {}
  ) {
    const existing = await reviewRepository.findByIdOrNumber(idOrNumber);
    if (!existing) {
      throw HttpError.notFound(`Review with ID '${idOrNumber}' not found`, "REVIEW_NOT_FOUND");
    }

    const now = new Date().toISOString();
    const moderationEntry = {
      moderatedBy: payload.moderatedBy || authContext.user?.name || "Admin Moderator",
      moderatedAt: now,
      action: "dismissed_flag" as const,
      reason: "Report reviewed and dismissed as compliant with policy",
      note: payload.note,
    };

    const updated = await reviewRepository.dismissReport(existing.id, moderationEntry);

    await this.syncProductRating(existing.productId);

    return {
      message: "Report dismissed, review restored to published",
      review: serializeReview(updated || existing),
    };
  },

  /**
   * 8. Helpful Voting
   */
  async voteReview(idOrNumber: string, isHelpful: boolean) {
    const existing = await reviewRepository.findByIdOrNumber(idOrNumber);
    if (!existing) {
      throw HttpError.notFound(`Review with ID '${idOrNumber}' not found`, "REVIEW_NOT_FOUND");
    }

    const updated = await reviewRepository.vote(existing.id, isHelpful);
    return serializeReview(updated || existing);
  },

  /**
   * 9. Get Single Review
   */
  async getReviewById(idOrNumber: string) {
    const existing = await reviewRepository.findByIdOrNumber(idOrNumber);
    if (!existing) {
      throw HttpError.notFound(`Review with ID '${idOrNumber}' not found`, "REVIEW_NOT_FOUND");
    }
    return serializeReview(existing);
  },

  /**
   * 10. List All Reviews (Admin & Catalog Search)
   */
  async listReviews(query: ReviewQueryFilters & { page?: number; limit?: number }) {
    const pagination =
      query.page && query.limit
        ? { page: Number(query.page), limit: Number(query.limit) }
        : undefined;

    const { reviews, total } = await reviewRepository.find(query, pagination);

    // If explicit pagination requested, return object with pagination; otherwise return list for legacy compatibility
    if (pagination) {
      return {
        reviews: reviews.map(serializeReview),
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit),
        },
      };
    }

    return reviews.map(serializeReview);
  },

  /**
   * 11. Review Metrics (Overview statistics)
   */
  async getMetrics() {
    const metrics = await reviewRepository.getMetrics();
    return serializeReviewMetrics(metrics);
  },
};
