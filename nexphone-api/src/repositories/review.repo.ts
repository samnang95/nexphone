import {
  Review,
  type ReviewDocument,
  type ReviewReport,
  type ReviewModerationEntry,
  type ReviewStatus,
} from "../models/review.model";
import { ReviewRecord, reviewsStore } from "../data/reviews.data";
import { isDatabaseConnected } from "../config/database";

export interface ReviewQueryFilters {
  search?: string;
  status?: string;
  rating?: string | number;
  reportedOnly?: string | boolean;
  productId?: string;
  customerId?: string;
  sortBy?: "rating_desc" | "rating_asc" | "reports_desc" | "helpful_desc" | "recent" | string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface RatingDistributionBreakdown {
  count: number;
  percentage: number;
}

export interface ProductRatingSummary {
  averageRating: number;
  totalReviews: number;
  verifiedCount: number;
  ratingDistribution: {
    5: RatingDistributionBreakdown;
    4: RatingDistributionBreakdown;
    3: RatingDistributionBreakdown;
    2: RatingDistributionBreakdown;
    1: RatingDistributionBreakdown;
  };
}

let seeded = false;
export async function ensureReviewsSeeded(): Promise<void> {
  if (seeded || !isDatabaseConnected()) return;
  try {
    const count = await Review.countDocuments();
    if (count === 0) {
      await Review.insertMany(reviewsStore);
      console.log(`⭐ [Reviews Repo] Auto-seeded ${reviewsStore.length} reviews to MongoDB.`);
    }
    seeded = true;
  } catch (error) {
    console.warn("⚠️  [Reviews Repo] Could not auto-seed reviews to MongoDB:", (error as Error).message);
  }
}

export const reviewRepository = {
  async find(
    filters: ReviewQueryFilters = {},
    pagination?: PaginationOptions
  ): Promise<{ reviews: ReviewRecord[]; total: number }> {
    await ensureReviewsSeeded();

    if (isDatabaseConnected()) {
      return this.findMongo(filters, pagination);
    }
    return this.findInMemory(filters, pagination);
  },

  async findByProductId(
    productId: string,
    options: {
      status?: string;
      rating?: number | string;
      sortBy?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    reviews: ReviewRecord[];
    total: number;
    summary: ProductRatingSummary;
  }> {
    await ensureReviewsSeeded();

    const targetProductId = productId.trim();
    const aliasMap: Record<string, string> = {
      p1: "prod-001",
      p2: "prod-002",
      p3: "prod-003",
      p4: "prod-004",
      "prod-001": "p1",
      "prod-002": "p2",
      "prod-003": "p3",
      "prod-004": "p4",
    };
    const targetIds = [targetProductId, aliasMap[targetProductId.toLowerCase()]].filter(Boolean) as string[];
    const status = options.status || "published";

    // 1. Gather all published reviews for this product to calculate distribution & summary
    let allProductReviews: ReviewRecord[] = [];
    if (isDatabaseConnected()) {
      const docs = await Review.find({ productId: { $in: targetIds }, status: "published" }).lean();
      allProductReviews = docs as unknown as ReviewRecord[];
    } else {
      allProductReviews = reviewsStore.filter(
        (r) => targetIds.includes(r.productId) && r.status === "published"
      );
    }

    const totalReviews = allProductReviews.length;
    const verifiedCount = allProductReviews.filter((r) => r.isVerifiedPurchase).length;
    const averageRating =
      totalReviews > 0
        ? Number((allProductReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
        : 5.0;

    let c1 = 0;
    let c2 = 0;
    let c3 = 0;
    let c4 = 0;
    let c5 = 0;

    for (const r of allProductReviews) {
      if (r.rating === 5) c5++;
      else if (r.rating === 4) c4++;
      else if (r.rating === 3) c3++;
      else if (r.rating === 2) c2++;
      else if (r.rating === 1) c1++;
    }

    const ratingDistribution = {
      5: {
        count: c5,
        percentage: totalReviews > 0 ? Math.round((c5 / totalReviews) * 100) : 0,
      },
      4: {
        count: c4,
        percentage: totalReviews > 0 ? Math.round((c4 / totalReviews) * 100) : 0,
      },
      3: {
        count: c3,
        percentage: totalReviews > 0 ? Math.round((c3 / totalReviews) * 100) : 0,
      },
      2: {
        count: c2,
        percentage: totalReviews > 0 ? Math.round((c2 / totalReviews) * 100) : 0,
      },
      1: {
        count: c1,
        percentage: totalReviews > 0 ? Math.round((c1 / totalReviews) * 100) : 0,
      },
    };

    const summary: ProductRatingSummary = {
      averageRating,
      totalReviews,
      verifiedCount,
      ratingDistribution,
    };

    // 2. Query filtered & sorted paginated list
    const queryFilters: ReviewQueryFilters = {
      productId: targetProductId,
      status,
      rating: options.rating,
      sortBy: options.sortBy,
    };

    const pagination =
      options.page && options.limit
        ? { page: options.page, limit: options.limit }
        : undefined;

    const result = await this.find(queryFilters, pagination);
    return {
      reviews: result.reviews,
      total: result.total,
      summary,
    };
  },

  async findByIdOrNumber(idOrNumber: string): Promise<ReviewRecord | null> {
    await ensureReviewsSeeded();
    const clean = idOrNumber.trim();

    if (isDatabaseConnected()) {
      const doc = await Review.findOne({
        $or: [{ id: clean }, { reviewNumber: clean }],
      }).lean();
      return (doc as unknown as ReviewRecord) || null;
    }

    return reviewsStore.find((r) => r.id === clean || r.reviewNumber === clean) || null;
  },

  async create(data: Partial<ReviewRecord>): Promise<ReviewRecord> {
    await ensureReviewsSeeded();
    const now = new Date().toISOString();
    const id = data.id || `rev-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
    const reviewNumber =
      data.reviewNumber || `REV-${Math.floor(9000 + Math.random() * 1000)}`;

    const newRecord: ReviewRecord = {
      id,
      reviewNumber,
      productId: data.productId || "",
      productName: data.productName || "NexPhone Device",
      productSku: data.productSku || "",
      productBrand: data.productBrand || "NexPhone Labs",
      productImage: data.productImage,
      customerId: data.customerId || "cust-anonymous",
      customerName: data.customerName || "Anonymous User",
      customerEmail: data.customerEmail || "anonymous@example.com",
      customerAvatarUrl: data.customerAvatarUrl,
      rating: Math.max(1, Math.min(5, Number(data.rating) || 5)),
      title: data.title || "",
      comment: data.comment || "",
      isVerifiedPurchase: Boolean(data.isVerifiedPurchase),
      helpfulVotes: Number(data.helpfulVotes) || 0,
      unhelpfulVotes: Number(data.unhelpfulVotes) || 0,
      status: data.status || "published",
      isReported: Boolean(data.isReported),
      reportsCount: Number(data.reportsCount) || 0,
      reports: data.reports || [],
      moderationHistory: data.moderationHistory || [],
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };

    reviewsStore.unshift(newRecord);

    if (isDatabaseConnected()) {
      const doc = await Review.create(newRecord);
      return doc.toObject() as unknown as ReviewRecord;
    }

    return newRecord;
  },

  async update(idOrNumber: string, updates: Partial<ReviewRecord>): Promise<ReviewRecord | null> {
    await ensureReviewsSeeded();
    const clean = idOrNumber.trim();
    const now = new Date().toISOString();

    if (isDatabaseConnected()) {
      const updated = await Review.findOneAndUpdate(
        { $or: [{ id: clean }, { reviewNumber: clean }] },
        { $set: { ...updates, updatedAt: now } },
        { returnDocument: "after", runValidators: true }
      ).lean();

      if (updated) {
        const memIdx = reviewsStore.findIndex((r) => r.id === updated.id || r.reviewNumber === updated.reviewNumber);
        if (memIdx !== -1) {
          reviewsStore[memIdx] = updated as unknown as ReviewRecord;
        }
        return updated as unknown as ReviewRecord;
      }
    }

    const index = reviewsStore.findIndex((r) => r.id === clean || r.reviewNumber === clean);
    if (index === -1) return null;

    const current = reviewsStore[index]!;
    const updated: ReviewRecord = {
      ...current,
      ...updates,
      id: current.id,
      reviewNumber: current.reviewNumber,
      updatedAt: now,
    };

    reviewsStore[index] = updated;
    return updated;
  },

  async delete(idOrNumber: string): Promise<boolean> {
    await ensureReviewsSeeded();
    const clean = idOrNumber.trim();

    if (isDatabaseConnected()) {
      const res = await Review.deleteOne({
        $or: [{ id: clean }, { reviewNumber: clean }],
      });
      const memIdx = reviewsStore.findIndex((r) => r.id === clean || r.reviewNumber === clean);
      if (memIdx !== -1) reviewsStore.splice(memIdx, 1);
      return res.deletedCount > 0;
    }

    const index = reviewsStore.findIndex((r) => r.id === clean || r.reviewNumber === clean);
    if (index === -1) return false;
    reviewsStore.splice(index, 1);
    return true;
  },

  async addReport(idOrNumber: string, report: ReviewReport): Promise<ReviewRecord | null> {
    await ensureReviewsSeeded();
    const review = await this.findByIdOrNumber(idOrNumber);
    if (!review) return null;

    const currentReports = review.reports || [];
    const updatedReports = [...currentReports, report];
    const newReportsCount = (review.reportsCount || 0) + 1;

    return this.update(idOrNumber, {
      reports: updatedReports,
      reportsCount: newReportsCount,
      isReported: true,
      status: "flagged",
    });
  },

  async dismissReport(
    idOrNumber: string,
    moderationEntry: ReviewModerationEntry
  ): Promise<ReviewRecord | null> {
    await ensureReviewsSeeded();
    const review = await this.findByIdOrNumber(idOrNumber);
    if (!review) return null;

    const currentHistory = review.moderationHistory || [];
    return this.update(idOrNumber, {
      status: "published",
      isReported: false,
      reportsCount: 0,
      moderationHistory: [...currentHistory, moderationEntry],
    });
  },

  async updateStatus(
    idOrNumber: string,
    status: ReviewStatus,
    moderationEntry: ReviewModerationEntry
  ): Promise<ReviewRecord | null> {
    await ensureReviewsSeeded();
    const review = await this.findByIdOrNumber(idOrNumber);
    if (!review) return null;

    const currentHistory = review.moderationHistory || [];
    return this.update(idOrNumber, {
      status,
      isReported: status === "flagged",
      moderationHistory: [...currentHistory, moderationEntry],
    });
  },

  async vote(idOrNumber: string, isHelpful: boolean): Promise<ReviewRecord | null> {
    await ensureReviewsSeeded();
    const review = await this.findByIdOrNumber(idOrNumber);
    if (!review) return null;

    if (isHelpful) {
      return this.update(idOrNumber, {
        helpfulVotes: (review.helpfulVotes || 0) + 1,
      });
    } else {
      return this.update(idOrNumber, {
        unhelpfulVotes: (review.unhelpfulVotes || 0) + 1,
      });
    }
  },

  async getMetrics(): Promise<{
    totalReviews: number;
    averageRating: number;
    publishedCount: number;
    reportedCount: number;
    rejectedCount: number;
    verifiedPurchaseRate: number;
    ratingDistribution: Record<number, number>;
  }> {
    await ensureReviewsSeeded();

    let list: ReviewRecord[] = [];
    if (isDatabaseConnected()) {
      const docs = await Review.find().lean();
      list = docs as unknown as ReviewRecord[];
    } else {
      list = [...reviewsStore];
    }

    const totalReviews = list.length;
    const publishedCount = list.filter((r) => r.status === "published").length;
    const reportedCount = list.filter((r) => r.isReported && r.status !== "rejected").length;
    const rejectedCount = list.filter((r) => r.status === "rejected").length;

    const validRatings = list.filter((r) => r.status !== "rejected");
    const averageRating =
      validRatings.length > 0
        ? Number((validRatings.reduce((acc, r) => acc + r.rating, 0) / validRatings.length).toFixed(1))
        : 5.0;

    const verifiedCount = list.filter((r) => r.isVerifiedPurchase).length;
    const verifiedPurchaseRate = totalReviews > 0 ? Math.round((verifiedCount / totalReviews) * 100) : 100;

    const ratingDistribution: Record<number, number> = {
      5: list.filter((r) => r.rating === 5).length,
      4: list.filter((r) => r.rating === 4).length,
      3: list.filter((r) => r.rating === 3).length,
      2: list.filter((r) => r.rating === 2).length,
      1: list.filter((r) => r.rating === 1).length,
    };

    return {
      totalReviews,
      averageRating,
      publishedCount,
      reportedCount,
      rejectedCount,
      verifiedPurchaseRate,
      ratingDistribution,
    };
  },

  async findMongo(
    filters: ReviewQueryFilters,
    pagination?: PaginationOptions
  ): Promise<{ reviews: ReviewRecord[]; total: number }> {
    const query: Record<string, any> = {};

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim();
      const regex = new RegExp(q, "i");
      query.$or = [
        { reviewNumber: regex },
        { customerName: regex },
        { customerEmail: regex },
        { productName: regex },
        { productSku: regex },
        { title: regex },
        { comment: regex },
      ];
    }

    if (filters.status && filters.status !== "all") {
      query.status = filters.status;
    }

    if (filters.productId && filters.productId.trim()) {
      const pId = filters.productId.trim();
      const aliasMap: Record<string, string> = {
        p1: "prod-001",
        p2: "prod-002",
        p3: "prod-003",
        p4: "prod-004",
        "prod-001": "p1",
        "prod-002": "p2",
        "prod-003": "p3",
        "prod-004": "p4",
      };
      const targetIds = [pId, aliasMap[pId.toLowerCase()]].filter(Boolean);
      query.productId = { $in: targetIds };
    }

    if (filters.customerId && filters.customerId.trim()) {
      query.customerId = filters.customerId.trim();
    }

    if (filters.rating !== undefined && filters.rating !== "all") {
      const num = Number(filters.rating);
      if (!isNaN(num)) query.rating = num;
    }

    if (filters.reportedOnly === "true" || filters.reportedOnly === true) {
      query.isReported = true;
      query.status = { $ne: "rejected" };
    }

    const sortObj: Record<string, 1 | -1> = {};
    switch (filters.sortBy) {
      case "rating_desc":
        sortObj.rating = -1;
        break;
      case "rating_asc":
        sortObj.rating = 1;
        break;
      case "reports_desc":
        sortObj.reportsCount = -1;
        break;
      case "helpful_desc":
        sortObj.helpfulVotes = -1;
        break;
      case "recent":
      default:
        sortObj.createdAt = -1;
        break;
    }

    const total = await Review.countDocuments(query);
    let mQuery = Review.find(query).sort(sortObj);

    if (pagination) {
      mQuery = mQuery.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }

    const docs = await mQuery.lean();
    return {
      reviews: docs as unknown as ReviewRecord[],
      total,
    };
  },

  findInMemory(
    filters: ReviewQueryFilters,
    pagination?: PaginationOptions
  ): { reviews: ReviewRecord[]; total: number } {
    let results = [...reviewsStore];

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      results = results.filter(
        (r) =>
          r.reviewNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.customerEmail.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          (r.productSku && r.productSku.toLowerCase().includes(q)) ||
          r.title.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== "all") {
      results = results.filter((r) => r.status === filters.status);
    }

    if (filters.productId && filters.productId.trim()) {
      const pId = filters.productId.trim();
      const aliasMap: Record<string, string> = {
        p1: "prod-001",
        p2: "prod-002",
        p3: "prod-003",
        p4: "prod-004",
        "prod-001": "p1",
        "prod-002": "p2",
        "prod-003": "p3",
        "prod-004": "p4",
      };
      const targetIds = [pId, aliasMap[pId.toLowerCase()]].filter(Boolean);
      results = results.filter((r) => targetIds.includes(r.productId));
    }

    if (filters.customerId && filters.customerId.trim()) {
      results = results.filter((r) => r.customerId === filters.customerId?.trim());
    }

    if (filters.rating !== undefined && filters.rating !== "all") {
      const numRating = Number(filters.rating);
      if (!isNaN(numRating)) {
        results = results.filter((r) => r.rating === numRating);
      }
    }

    if (filters.reportedOnly === "true" || filters.reportedOnly === true) {
      results = results.filter((r) => r.isReported && r.status !== "rejected");
    }

    switch (filters.sortBy) {
      case "rating_desc":
        results.sort((a, b) => b.rating - a.rating);
        break;
      case "rating_asc":
        results.sort((a, b) => a.rating - b.rating);
        break;
      case "reports_desc":
        results.sort((a, b) => b.reportsCount - a.reportsCount);
        break;
      case "helpful_desc":
        results.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
        break;
      case "recent":
      default:
        results.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    const total = results.length;
    if (pagination) {
      const start = (pagination.page - 1) * pagination.limit;
      results = results.slice(start, start + pagination.limit);
    }

    return { reviews: results, total };
  },
};
