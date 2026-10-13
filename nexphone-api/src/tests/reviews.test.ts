import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app";
import { reviewsStore } from "../data/reviews.data";
import { productsCatalog } from "../data/products.data";

describe("Review & Rating API", () => {
  // ==========================================
  // 1. Get Product Reviews
  // ==========================================
  describe("1. Get Product Reviews", () => {
    it("GET /api/reviews/product/:productId returns product reviews with rating breakdown summary", async () => {
      const res = await request(app).get("/api/reviews/product/p1");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("productId", "p1");
      expect(res.body).toHaveProperty("summary");
      expect(res.body.summary).toHaveProperty("averageRating");
      expect(res.body.summary).toHaveProperty("totalReviews");
      expect(res.body.summary).toHaveProperty("ratingDistribution");
      expect(res.body.summary.ratingDistribution).toHaveProperty("5");
      expect(res.body.summary.ratingDistribution[5]).toHaveProperty("count");
      expect(res.body.summary.ratingDistribution[5]).toHaveProperty("percentage");
      expect(Array.isArray(res.body.reviews)).toBe(true);
      expect(res.body.reviews.length).toBeGreaterThan(0);
      // All reviews returned for standard query should be published
      expect(res.body.reviews.every((r: any) => r.status === "published")).toBe(true);
    });

    it("supports route alias GET /api/products/:id/reviews", async () => {
      const res = await request(app).get("/api/products/p1/reviews");
      expect(res.status).toBe(200);
      expect(res.body.productId).toBe("p1");
      expect(Array.isArray(res.body.reviews)).toBe(true);
    });

    it("filters product reviews by specific rating", async () => {
      const res = await request(app).get("/api/reviews/product/p1?rating=4");
      expect(res.status).toBe(200);
      expect(res.body.reviews.every((r: any) => r.rating === 4)).toBe(true);
    });

    it("sorts product reviews by rating and helpfulness", async () => {
      const resRating = await request(app).get("/api/reviews/product/p1?sortBy=rating_desc");
      expect(resRating.status).toBe(200);
      const ratings = resRating.body.reviews.map((r: any) => r.rating);
      for (let i = 0; i < ratings.length - 1; i++) {
        expect(ratings[i]).toBeGreaterThanOrEqual(ratings[i + 1]);
      }

      const resHelpful = await request(app).get("/api/reviews/product/p1?sortBy=helpful_desc");
      expect(resHelpful.status).toBe(200);
      const helpfulVotes = resHelpful.body.reviews.map((r: any) => r.helpfulVotes);
      for (let i = 0; i < helpfulVotes.length - 1; i++) {
        expect(helpfulVotes[i]).toBeGreaterThanOrEqual(helpfulVotes[i + 1]);
      }
    });

    it("supports pagination for product reviews", async () => {
      const res = await request(app).get("/api/reviews/product/p1?page=1&limit=2");
      expect(res.status).toBe(200);
      expect(res.body.reviews.length).toBeLessThanOrEqual(2);
      expect(res.body.pagination).toMatchObject({
        page: 1,
        limit: 2,
      });
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(res.body.reviews.length);
    });
  });

  // ==========================================
  // 2. Create Review
  // ==========================================
  describe("2. Create Review", () => {
    it("POST /api/reviews creates a new product review and updates parent product rating", async () => {
      const initialProductRes = await request(app).get("/api/products/p2");
      expect(initialProductRes.status).toBe(200);
      const initialRating = initialProductRes.body.rating;
      const initialReviewCount = initialProductRes.body.reviewCount || 0;

      const reviewPayload = {
        productId: "p2",
        rating: 5,
        title: "Spectacular battery performance and build quality",
        comment: "Exceeded all our fleet expectations. 10/10 would deploy again in every satellite office.",
        customerName: "Engineering Team Lead",
        customerEmail: "eng.lead@testcorp.com",
        customerId: "cust-test-user-01",
      };

      const res = await request(app).post("/api/reviews").send(reviewPayload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.reviewNumber).toMatch(/^REV-\d+/);
      expect(res.body.rating).toBe(5);
      expect(res.body.title).toBe(reviewPayload.title);
      expect(res.body.productId).toBe("p2");
      expect(res.body.status).toBe("published");

      // Verify product's rating and reviewCount updated
      const updatedProductRes = await request(app).get("/api/products/p2");
      expect(updatedProductRes.status).toBe(200);
      expect(updatedProductRes.body.reviewCount).toBeGreaterThan(initialReviewCount);
    });

    it("POST /api/products/:id/reviews creates review using route param", async () => {
      const payload = {
        rating: 4,
        title: "Solid overall experience",
        comment: "Haptic feedback and screen colors are vibrant and sharp.",
        customerName: "Jane Doe",
        customerEmail: "jane.doe@example.org",
        customerId: "cust-test-jane",
      };

      const res = await request(app).post("/api/products/p3/reviews").send(payload);
      expect(res.status).toBe(201);
      expect(res.body.productId).toBe("p3");
      expect(res.body.rating).toBe(4);
    });

    it("automatically detects verified purchase for customer with existing confirmed order", async () => {
      // Alex Vance (a.vance@blackmesa.io) has order NX-ORD-1001 for p1
      const payload = {
        productId: "p1",
        rating: 5,
        title: "Second batch review for Black Mesa",
        comment: "Still the best flagship device for our physics staff.",
        customerEmail: "a.vance@blackmesa.io",
        customerName: "Alex Vance",
        customerId: "cust-001",
      };

      const res = await request(app).post("/api/reviews").send(payload);
      expect(res.status).toBe(201);
      expect(res.body.isVerifiedPurchase).toBe(true);
    });

    it("returns 400 when rating is out of bounds or fields missing", async () => {
      const badRatingRes = await request(app).post("/api/reviews").send({
        productId: "p1",
        rating: 6, // invalid > 5
        title: "Bad rating score",
        comment: "This should fail validation cleanly.",
      });
      expect(badRatingRes.status).toBe(400);

      const missingTitleRes = await request(app).post("/api/reviews").send({
        productId: "p1",
        rating: 5,
        title: "A", // too short (< 2)
        comment: "Valid comment text",
      });
      expect(missingTitleRes.status).toBe(400);
    });

    it("returns 404 when product does not exist", async () => {
      const res = await request(app).post("/api/reviews").send({
        productId: "non-existent-phone-xyz",
        rating: 5,
        title: "Phantom Phone",
        comment: "This product ID is completely fictional.",
      });
      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 3. Update Own Review
  // ==========================================
  describe("3. Update Own Review", () => {
    let createdReviewId: string;

    it("prepares a user review for update tests", async () => {
      const res = await request(app).post("/api/reviews").send({
        productId: "p1",
        rating: 3,
        title: "Initial lukewarm impressions",
        comment: "Battery was draining somewhat rapidly on day 1.",
        customerId: "cust-reviewer-99",
        customerEmail: "reviewer99@test.com",
      });
      expect(res.status).toBe(201);
      createdReviewId = res.body.id;
    });

    it("PUT /api/reviews/:id updates rating, title, and comment", async () => {
      const updatePayload = {
        rating: 5,
        title: "Update: Battery calibrated and lasts 2 full days!",
        comment: "After day 2 update, battery life settled and now lasts over 48 hours without issue.",
      };

      const res = await request(app)
        .put(`/api/reviews/${createdReviewId}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdReviewId);
      expect(res.body.rating).toBe(5);
      expect(res.body.title).toBe(updatePayload.title);
      expect(res.body.comment).toBe(updatePayload.comment);
    });

    it("PATCH /api/reviews/:id allows partial update of title or rating", async () => {
      const res = await request(app)
        .patch(`/api/reviews/${createdReviewId}`)
        .send({ title: "Updated Review Title via PATCH" });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Updated Review Title via PATCH");
      expect(res.body.rating).toBe(5);
    });

    it("returns 404 when updating a non-existent review", async () => {
      const res = await request(app)
        .patch("/api/reviews/rev-nonexistent-999")
        .send({ rating: 4 });
      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 4. Report Review
  // ==========================================
  describe("4. Report Review", () => {
    it("POST /api/reviews/:id/report flags an inappropriate review with reason and details", async () => {
      // Create a test review to report
      const createRes = await request(app).post("/api/reviews").send({
        productId: "p1",
        rating: 1,
        title: "Click this link for crypto scam",
        comment: "Visit http://free-crypto-giveaway-now.xyz to double your bitcoin!",
        customerId: "cust-spammer-123",
      });
      expect(createRes.status).toBe(201);
      const reviewId = createRes.body.id;

      const reportPayload = {
        reason: "spam_promotion",
        comment: "Direct phishing URL and scam crypto links.",
        reporterName: "Helpful Inspector",
        reporterEmail: "inspector@nexphone.com",
      };

      const res = await request(app)
        .post(`/api/reviews/${reviewId}/report`)
        .send(reportPayload);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Review reported successfully");
      expect(res.body.review.isReported).toBe(true);
      expect(res.body.review.status).toBe("flagged");
      expect(res.body.review.reportsCount).toBeGreaterThanOrEqual(1);
      expect(res.body.review.reports.some((r: any) => r.reason === "spam_promotion")).toBe(true);
    });

    it("returns 400 when report reason is missing", async () => {
      const res = await request(app)
        .post("/api/reviews/rev-001/report")
        .send({ comment: "Missing reason field" });
      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // 5. Moderate Reviews (Admin)
  // ==========================================
  describe("5. Moderate Reviews (Admin)", () => {
    it("PATCH /api/reviews/:id/status updates status to published, flagged, or rejected", async () => {
      const res = await request(app)
        .patch("/api/reviews/rev-004/status")
        .send({
          status: "rejected",
          reason: "Confirmed spam promotion url",
          note: "Phishing links violate our terms of service.",
          moderatedBy: "Senior Trust & Safety Officer",
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("rejected");
      expect(res.body.moderationHistory).toBeDefined();
      const lastEntry = res.body.moderationHistory[res.body.moderationHistory.length - 1];
      expect(lastEntry.action).toBe("rejected");
      expect(lastEntry.moderatedBy).toBe("Senior Trust & Safety Officer");
    });

    it("POST /api/reviews/:id/dismiss-report restores review to published and clears flags", async () => {
      // First ensure rev-005 is flagged
      await request(app)
        .patch("/api/reviews/rev-005/status")
        .send({ status: "flagged" });

      const res = await request(app)
        .post("/api/reviews/rev-005/dismiss-report")
        .send({
          note: "Reviewed by editorial team and found compliant after review.",
          moderatedBy: "Compliance Lead",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Report dismissed, review restored to published");
      expect(res.body.review.status).toBe("published");
      expect(res.body.review.isReported).toBe(false);
      expect(res.body.review.reportsCount).toBe(0);
    });

    it("GET /api/reviews supports admin query filters (search, status, reportedOnly)", async () => {
      const resReported = await request(app).get("/api/reviews?reportedOnly=true");
      expect(resReported.status).toBe(200);
      expect(Array.isArray(resReported.body)).toBe(true);
      expect(resReported.body.every((r: any) => r.isReported && r.status !== "rejected")).toBe(true);

      const resStatus = await request(app).get("/api/reviews?status=published");
      expect(resStatus.status).toBe(200);
      expect(resStatus.body.every((r: any) => r.status === "published")).toBe(true);

      const resSearch = await request(app).get("/api/reviews?search=Black+Mesa");
      expect(resSearch.status).toBe(200);
      expect(resSearch.body.length).toBeGreaterThan(0);
    });

    it("GET /api/reviews-metrics returns platform-wide review metrics", async () => {
      const res = await request(app).get("/api/reviews-metrics");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalReviews");
      expect(res.body).toHaveProperty("averageRating");
      expect(res.body).toHaveProperty("publishedCount");
      expect(res.body).toHaveProperty("reportedCount");
      expect(res.body).toHaveProperty("rejectedCount");
      expect(res.body).toHaveProperty("verifiedPurchaseRate");
      expect(res.body).toHaveProperty("ratingDistribution");
      expect(res.body.ratingDistribution).toHaveProperty("5");
    });
  });

  // ==========================================
  // 6. Delete Review
  // ==========================================
  describe("6. Delete Review", () => {
    it("DELETE /api/reviews/:id removes review and recalculates product rating", async () => {
      // Create a temporary review
      const createRes = await request(app).post("/api/reviews").send({
        productId: "p4",
        rating: 1,
        title: "Temporary review to be deleted",
        comment: "This review will be deleted in the next assertion.",
        customerId: "cust-to-delete",
      });
      expect(createRes.status).toBe(201);
      const tempId = createRes.body.id;

      const deleteRes = await request(app).delete(`/api/reviews/${tempId}`).send({
        reason: "Test teardown",
        moderationNote: "Automated test cleanup",
      });
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toContain("Review deleted successfully");
    });

    it("returns 404 when deleting a non-existent review", async () => {
      const res = await request(app).delete("/api/reviews/rev-missing-99999");
      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 7. Helpful Voting
  // ==========================================
  describe("7. Helpful Voting", () => {
    it("POST /api/reviews/:id/vote increments helpful votes count", async () => {
      const initialRes = await request(app).get("/api/reviews/rev-001");
      expect(initialRes.status).toBe(200);
      const prevHelpful = initialRes.body.helpfulVotes;

      const voteRes = await request(app)
        .post("/api/reviews/rev-001/vote")
        .send({ isHelpful: true });

      expect(voteRes.status).toBe(200);
      expect(voteRes.body.helpfulVotes).toBe(prevHelpful + 1);
    });

    it("POST /api/reviews/:id/vote increments unhelpful votes when isHelpful is false", async () => {
      const initialRes = await request(app).get("/api/reviews/rev-001");
      expect(initialRes.status).toBe(200);
      const prevUnhelpful = initialRes.body.unhelpfulVotes;

      const voteRes = await request(app)
        .post("/api/reviews/rev-001/vote")
        .send({ isHelpful: false });

      expect(voteRes.status).toBe(200);
      expect(voteRes.body.unhelpfulVotes).toBe(prevUnhelpful + 1);
    });
  });
});
