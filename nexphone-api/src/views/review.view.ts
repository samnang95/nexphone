import type { ReviewRecord } from "../data/reviews.data";
import type { ProductRatingSummary } from "../repositories/review.repo";

export interface SerializedReview {
  id: string;
  reviewNumber: string;
  productId: string;
  productName: string;
  productSku?: string;
  productBrand?: string;
  productImage?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatarUrl?: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  unhelpfulVotes: number;
  status: "published" | "pending" | "flagged" | "rejected";
  isReported: boolean;
  reportsCount: number;
  reports?: any[];
  moderationHistory?: any[];
  createdAt: string;
  updatedAt: string;
}

export function serializeReview(r: any): SerializedReview {
  return {
    id: r.id || r._id?.toString(),
    reviewNumber: r.reviewNumber,
    productId: r.productId,
    productName: r.productName,
    productSku: r.productSku || "",
    productBrand: r.productBrand || "",
    productImage: r.productImage,
    customerId: r.customerId,
    customerName: r.customerName,
    customerEmail: r.customerEmail,
    customerAvatarUrl: r.customerAvatarUrl,
    rating: Number(r.rating) || 5,
    title: r.title,
    comment: r.comment,
    isVerifiedPurchase: Boolean(r.isVerifiedPurchase),
    helpfulVotes: Number(r.helpfulVotes) || 0,
    unhelpfulVotes: Number(r.unhelpfulVotes) || 0,
    status: r.status || "published",
    isReported: Boolean(r.isReported),
    reportsCount: Number(r.reportsCount) || 0,
    reports: r.reports || [],
    moderationHistory: r.moderationHistory || [],
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export function serializeProductReviews(
  productId: string,
  productName: string,
  summary: ProductRatingSummary,
  reviews: ReviewRecord[],
  pagination?: { page: number; limit: number; total: number }
) {
  const page = pagination ? Number(pagination.page) : 1;
  const limit = pagination ? Number(pagination.limit) : reviews.length;
  const total = pagination ? Number(pagination.total) : reviews.length;
  const totalPages = Math.ceil(total / (limit || 1)) || 1;

  return {
    productId,
    productName,
    summary,
    reviews: reviews.map(serializeReview),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export function serializeReviewMetrics(metrics: {
  totalReviews: number;
  averageRating: number;
  publishedCount: number;
  reportedCount: number;
  rejectedCount: number;
  verifiedPurchaseRate: number;
  ratingDistribution: Record<number, number>;
}) {
  return {
    totalReviews: metrics.totalReviews,
    averageRating: metrics.averageRating,
    publishedCount: metrics.publishedCount,
    reportedCount: metrics.reportedCount,
    rejectedCount: metrics.rejectedCount,
    verifiedPurchaseRate: metrics.verifiedPurchaseRate,
    ratingDistribution: metrics.ratingDistribution,
  };
}
