import { Router } from "express";
import { optionalAuthenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createReviewSchema,
  updateReviewSchema,
  reportReviewSchema,
  moderateReviewSchema,
  dismissReportSchema,
  deleteReviewSchema,
  voteReviewSchema,
  queryReviewSchema,
} from "../validators/review.validator";
import * as controller from "../controllers/review.controller";

export const reviewsRouter = Router();

// ==========================================
// 1. Get Product Reviews (Must stay before :id routes)
// ==========================================
reviewsRouter.get(["/api/reviews/product/:productId", "/reviews/product/:productId"], optionalAuthenticate, controller.getProductReviews);

// ==========================================
// 2. Metrics & Dashboard Analytics (Admin)
// ==========================================
reviewsRouter.get(["/api/reviews-metrics", "/reviews-metrics", "/api/reviews/metrics", "/reviews/metrics"], optionalAuthenticate, controller.getReviewMetrics);

// ==========================================
// 3. Report Inappropriate Review
// ==========================================
reviewsRouter.post(["/api/reviews/:id/report", "/reviews/:id/report"], optionalAuthenticate, validate({ body: reportReviewSchema }), controller.reportReview);

// ==========================================
// 4. Dismiss Flag / Report (Admin)
// ==========================================
reviewsRouter.post(["/api/reviews/:id/dismiss-report", "/reviews/:id/dismiss-report"], optionalAuthenticate, validate({ body: dismissReportSchema }), controller.dismissReport);

// ==========================================
// 5. Moderate Review Status (Admin)
// ==========================================
reviewsRouter.patch(["/api/reviews/:id/status", "/reviews/:id/status"], optionalAuthenticate, validate({ body: moderateReviewSchema }), controller.moderateReview);
reviewsRouter.put(["/api/reviews/:id/status", "/reviews/:id/status"], optionalAuthenticate, validate({ body: moderateReviewSchema }), controller.moderateReview);

// ==========================================
// 6. Helpful / Unhelpful Vote
// ==========================================
reviewsRouter.post(["/api/reviews/:id/vote", "/reviews/:id/vote"], optionalAuthenticate, validate({ body: voteReviewSchema }), controller.voteReview);

// ==========================================
// 7. Update Own Review (or Admin edit)
// ==========================================
reviewsRouter.put(["/api/reviews/:id", "/reviews/:id"], optionalAuthenticate, validate({ body: updateReviewSchema }), controller.updateOwnReview);
reviewsRouter.patch(["/api/reviews/:id", "/reviews/:id"], optionalAuthenticate, validate({ body: updateReviewSchema }), controller.updateOwnReview);

// ==========================================
// 8. Delete Own Review (or Admin rejection/deletion)
// ==========================================
reviewsRouter.delete(["/api/reviews/:id", "/reviews/:id"], optionalAuthenticate, validate({ body: deleteReviewSchema }), controller.deleteOwnReview);

// ==========================================
// 9. Single Review by ID
// ==========================================
reviewsRouter.get(["/api/reviews/:id", "/reviews/:id"], optionalAuthenticate, controller.getReviewById);

// ==========================================
// 10. Reviews Collection: List All & Create
// ==========================================
reviewsRouter.get(["/api/reviews", "/reviews"], optionalAuthenticate, validate({ query: queryReviewSchema }), controller.listReviews);
reviewsRouter.post(["/api/reviews", "/reviews"], optionalAuthenticate, validate({ body: createReviewSchema }), controller.createReview);
