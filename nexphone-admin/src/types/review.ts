export type ReviewStatus = "published" | "pending" | "flagged" | "rejected";

export type ReportReason =
  | "offensive_language"
  | "hate_speech"
  | "spam_promotion"
  | "fake_review"
  | "competitor_defamation"
  | "off_topic"
  | "personal_data"
  | "other";

export interface ReviewReport {
  id: string;
  reporterName: string;
  reporterEmail?: string;
  reason: ReportReason;
  comment?: string;
  reportedAt: string;
}

export interface ReviewModeration {
  moderatedBy: string;
  moderatedAt: string;
  action: "approved" | "dismissed_flag" | "rejected" | "deleted";
  reason?: string;
  note?: string;
}

export interface Review {
  id: string;
  reviewNumber: string;
  productId: string;
  productName: string;
  productSku: string;
  productBrand: string;
  productImage?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatarUrl?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  unhelpfulVotes: number;
  status: ReviewStatus;
  isReported: boolean;
  reportsCount: number;
  reports?: ReviewReport[];
  moderationHistory?: ReviewModeration[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFilterParams {
  search?: string;
  status?: ReviewStatus | "all";
  rating?: number | "all";
  reportedOnly?: boolean;
  productBrand?: string | "all";
  sortBy?: "recent" | "rating_desc" | "rating_asc" | "reports_desc" | "helpful_desc";
}

export interface ReviewSummaryMetrics {
  totalReviews: number;
  averageRating: number;
  publishedCount: number;
  reportedCount: number;
  rejectedCount: number;
  verifiedPurchaseRate: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface DeleteReviewPayload {
  reviewId: string;
  reason: string;
  moderationNote?: string;
  moderatedBy?: string;
}

export interface ModerateReportPayload {
  reviewId: string;
  action: "dismiss_report" | "reject_review";
  reason?: string;
  moderationNote?: string;
  moderatedBy?: string;
}
