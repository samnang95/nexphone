import type {
  Review,
  ReviewFilterParams,
  ReviewSummaryMetrics,
  DeleteReviewPayload,
} from "@/types/review";
import { appConfig } from "@/config/env";

const FALLBACK_REVIEWS: Review[] = [
  {
    id: "rev-001",
    reviewNumber: "REV-9011",
    productId: "p1",
    productName: "NexPhone 15 Pro Max",
    productSku: "NX-PRO-MAX-512-SG",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-001",
    customerName: "Alex Vance",
    customerEmail: "a.vance@blackmesa.io",
    rating: 5,
    title: "Best enterprise grade hardware on the market",
    comment: "Deployed 20 units across our Black Mesa engineering team. VoIP call clarity is crystal clear over satellite, and the titanium chassis feels virtually indestructible. Battery lasts 2 full business days with heavy telemetry usage.",
    isVerifiedPurchase: true,
    helpfulVotes: 34,
    unhelpfulVotes: 1,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "rev-002",
    reviewNumber: "REV-9012",
    productId: "p2",
    productName: "NexPhone Enterprise Edge Fleet Pack",
    productSku: "NX-ENT-EDGE-5PK",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-002",
    customerName: "Sophia Tanaka",
    customerEmail: "s.tanaka@cyberdyne.co.jp",
    rating: 5,
    title: "Seamless fleet provisioning in Tokyo",
    comment: "The remote eSIM bulk activation took less than 4 minutes for our entire department. High-bandwidth 5G mmWave connectivity performs flawlessly in Shinjuku and Roppongi. Highly recommended for corporate fleets.",
    isVerifiedPurchase: true,
    helpfulVotes: 21,
    unhelpfulVotes: 0,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "rev-003",
    reviewNumber: "REV-9013",
    productId: "p1",
    productName: "NexPhone 15 Pro Max",
    productSku: "NX-PRO-MAX-256-SL",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-003",
    customerName: "Marcus Sterling",
    customerEmail: "m.sterling@acmeholdings.com",
    rating: 4,
    title: "Superb display, slightly heavy charging dock",
    comment: "The 120Hz ProMotion OLED screen is stunning under direct UK sunlight. The only minor gripe is that the multi-device inductive charger dock is somewhat heavy for frequent international carry-on luggage.",
    isVerifiedPurchase: true,
    helpfulVotes: 16,
    unhelpfulVotes: 2,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    id: "rev-004",
    reviewNumber: "REV-9014",
    productId: "p3",
    productName: "NexPhone Lite",
    productSku: "NX-LITE-128-MB",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-099",
    customerName: "Anonymous Spammer",
    customerEmail: "free-coupons-bot99@scamdeal.xyz",
    rating: 1,
    title: "DO NOT BUY HERE!! GET 90% OFF AT SCAMDEAL.XYZ/NEXPHONE",
    comment: "Why pay full price when you can get cheap refurbished phones and $500 gift cards by clicking http://scamdeal.xyz/nexphone-promo right now!!! Limited codes available enter code FREE90.",
    isVerifiedPurchase: false,
    helpfulVotes: 0,
    unhelpfulVotes: 48,
    status: "flagged",
    isReported: true,
    reportsCount: 6,
    reports: [
      {
        id: "rep-001",
        reporterName: "Elena Rostova",
        reporterEmail: "e.rostova@berlin-tech.de",
        reason: "spam_promotion",
        comment: "Obvious phishing and malware URL spam link.",
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
      {
        id: "rep-002",
        reporterName: "Marcus Sterling",
        reporterEmail: "m.sterling@acmeholdings.com",
        reason: "spam_promotion",
        comment: "Automated bot spam promoting suspicious coupon site.",
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      },
      {
        id: "rep-003",
        reporterName: "Alex Vance",
        reporterEmail: "a.vance@blackmesa.io",
        reason: "fake_review",
        comment: "Spam account not a verified purchaser.",
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "rev-005",
    reviewNumber: "REV-9015",
    productId: "p1",
    productName: "NexPhone 15 Pro Max",
    productSku: "NX-PRO-MAX-512-SG",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-098",
    customerName: "Raging Troll",
    customerEmail: "troll_gamer42@trashmail.com",
    rating: 1,
    title: "GARBAGE PHONE AND YOU ARE ALL STUPID IDIOTS",
    comment: "This company is run by absolute morons and clowns. Anyone who buys this should go jump in a ditch and learn a lesson. Worst phone ever made in human history, trash trash trash!",
    isVerifiedPurchase: false,
    helpfulVotes: 0,
    unhelpfulVotes: 62,
    status: "flagged",
    isReported: true,
    reportsCount: 4,
    reports: [
      {
        id: "rep-004",
        reporterName: "Lucas Meyer",
        reporterEmail: "l.meyer@zurich-quant.ch",
        reason: "offensive_language",
        comment: "Hate speech and personal insults without any product feedback.",
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      },
      {
        id: "rep-005",
        reporterName: "Chloe Dubois",
        reporterEmail: "c.dubois@lyon-biotech.fr",
        reason: "offensive_language",
        comment: "Violates community policy against harassment and abusive conduct.",
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
  },
  {
    id: "rev-006",
    reviewNumber: "REV-9016",
    productId: "p4",
    productName: "NexPhone Ultra Fold",
    productSku: "NX-FOLD-512",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-097",
    customerName: "Apex Rival Brand Rep",
    customerEmail: "pr-rival@competitortech.cn",
    rating: 1,
    title: "DO NOT BUY! Hinge snapped in half on day 1 and exploded",
    comment: "The foldable screen crease broke into sharp pieces and literally caught fire in my pocket. Buy Brand X instead, it has better chips and costs half the price. NexPhone is a danger to families.",
    isVerifiedPurchase: false,
    helpfulVotes: 1,
    unhelpfulVotes: 39,
    status: "flagged",
    isReported: true,
    reportsCount: 3,
    reports: [
      {
        id: "rep-006",
        reporterName: "Astrid Lindholm",
        reporterEmail: "astrid.l@stockholm-design.se",
        reason: "competitor_defamation",
        comment: "Fabricated safety hazard claims by competitor marketing agent.",
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
  },
  {
    id: "rev-007",
    reviewNumber: "REV-9017",
    productId: "p4",
    productName: "NexPhone Ultra Fold",
    productSku: "NX-FOLD-512",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-004",
    customerName: "Elena Rostova",
    customerEmail: "e.rostova@berlin-tech.de",
    rating: 5,
    title: "The zero-gap hinge engineering is miraculous",
    comment: "Having used foldable devices from various manufacturers over 4 years, NexPhone's zero-gap hinge and micro-polymer screen layer are completely unmatched. Split-screen multi-tasking runs without lag.",
    isVerifiedPurchase: true,
    helpfulVotes: 29,
    unhelpfulVotes: 1,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: "rev-008",
    reviewNumber: "REV-9018",
    productId: "p3",
    productName: "NexPhone Lite",
    productSku: "NX-LITE-128-MB",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-005",
    customerName: "Viktor Novak",
    customerEmail: "v.novak@prague-cyber.cz",
    rating: 4,
    title: "Terrific value for money for field personnel",
    comment: "Equipped 50 mobile technicians with the Lite edition. The IP68 water resistance held up during heavy rain testing, and the custom encryption chip provides peace of mind for sensitive telemetry logs.",
    isVerifiedPurchase: true,
    helpfulVotes: 18,
    unhelpfulVotes: 0,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "rev-009",
    reviewNumber: "REV-9019",
    productId: "p1",
    productName: "NexPhone 15 Pro Max",
    productSku: "NX-PRO-MAX-1TB-TI",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-096",
    customerName: "Doxxing Offender",
    customerEmail: "leaks_exposer@tempmail.io",
    rating: 1,
    title: "Admin personal phone number leaked here",
    comment: "This company employee lives at 123 Elm St and their direct cell number is 555-0199 call them at 3 AM to demand discounts.",
    isVerifiedPurchase: false,
    helpfulVotes: 0,
    unhelpfulVotes: 75,
    status: "rejected",
    isReported: false,
    reportsCount: 8,
    reports: [
      {
        id: "rep-007",
        reporterName: "System Guard",
        reason: "personal_data",
        comment: "Publishing personally identifiable information (PII).",
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
    ],
    moderationHistory: [
      {
        moderatedBy: "Security Lead",
        moderatedAt: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
        action: "deleted",
        reason: "Doxxing and PII violation",
        note: "Content removed immediately under emergency privacy safety policy. IP address permanently blacklisted.",
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
  },
  {
    id: "rev-010",
    reviewNumber: "REV-9020",
    productId: "p1",
    productName: "NexPhone 15 Pro Max",
    productSku: "NX-PRO-MAX-512-SG",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-016",
    customerName: "Lucas Meyer",
    customerEmail: "l.meyer@zurich-quant.ch",
    rating: 5,
    title: "Sub-millisecond biometric response and satellite link",
    comment: "Financial trading telemetry on this phone executes with lowest jitter we have measured. The secure hardware enclave allows rapid biometric authorization without cloud dependency.",
    isVerifiedPurchase: true,
    helpfulVotes: 42,
    unhelpfulVotes: 1,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
  {
    id: "rev-011",
    reviewNumber: "REV-9021",
    productId: "p2",
    productName: "NexPhone Enterprise Edge Fleet Pack",
    productSku: "NX-ENT-EDGE-5PK",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-018",
    customerName: "Hassan Al-Mansoor",
    customerEmail: "hassan@doha-ventures.qa",
    rating: 5,
    title: "Exceptional thermal dissipation in high ambient heat",
    comment: "Tested under 45°C ambient desert conditions in Qatar. No thermal throttling observed during continuous 4K video conferencing and GPS tracking.",
    isVerifiedPurchase: true,
    helpfulVotes: 31,
    unhelpfulVotes: 0,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
  },
  {
    id: "rev-012",
    reviewNumber: "REV-9022",
    productId: "p4",
    productName: "NexPhone Ultra Fold",
    productSku: "NX-FOLD-512",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-029",
    customerName: "Zara Chen",
    customerEmail: "zara.chen@melbourne-health.au",
    rating: 5,
    title: "Ideal for healthcare diagnostics and PACS viewer",
    comment: "The expansive 7.8-inch unfolded canvas allows our clinical radiologists to inspect CT scan slices with remarkable fidelity while on rounds.",
    isVerifiedPurchase: true,
    helpfulVotes: 25,
    unhelpfulVotes: 1,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: "rev-013",
    reviewNumber: "REV-9023",
    productId: "p1",
    productName: "NexPhone 15 Pro Max",
    productSku: "NX-PRO-MAX-256-SL",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-033",
    customerName: "Ananya Patel",
    customerEmail: "ananya.p@singapore-data.sg",
    rating: 4,
    title: "Impressive optics and computational photography",
    comment: "Low-light night mode and LiDAR depth capture are phenomenal. Camera software UI has minor learning curve but results speak for themselves.",
    isVerifiedPurchase: true,
    helpfulVotes: 19,
    unhelpfulVotes: 2,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(),
  },
  {
    id: "rev-014",
    reviewNumber: "REV-9024",
    productId: "p3",
    productName: "NexPhone Lite",
    productSku: "NX-LITE-128-MB",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-041",
    customerName: "Emma Watson",
    customerEmail: "e.watson@oxford-genomics.org",
    rating: 5,
    title: "Compact, durable, and highly dependable",
    comment: "Clean Android enterprise build without bloatware. Clean quarterly security updates and solid build quality make this our standard lab device.",
    isVerifiedPurchase: true,
    helpfulVotes: 15,
    unhelpfulVotes: 0,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString(),
  },
  {
    id: "rev-015",
    reviewNumber: "REV-9025",
    productId: "p1",
    productName: "NexPhone 15 Pro Max",
    productSku: "NX-PRO-MAX-512-SG",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-047",
    customerName: "Zoe Kravitz",
    customerEmail: "zoe.k@amsterdam-creative.nl",
    rating: 5,
    title: "Audio recording and stereo microphones are studio quality",
    comment: "The 3D spatial audio recording handles live concert acoustics without distortion or peaking. Exporting raw ProRes files directly over USB-C 40Gbps is a lifesaver.",
    isVerifiedPurchase: true,
    helpfulVotes: 23,
    unhelpfulVotes: 1,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
];

let localReviews: Review[] = [...FALLBACK_REVIEWS];

export const ReviewService = {
  /**
   * Fetch all reviews with optional search, status, rating, and sorting filters.
   */
  async getReviews(params: ReviewFilterParams = {}): Promise<Review[]> {
    const {
      search = "",
      status = "all",
      rating = "all",
      reportedOnly = false,
      sortBy = "recent",
    } = params;

    try {
      const q = new URLSearchParams();
      if (search) q.append("search", search);
      if (status !== "all") q.append("status", status);
      if (rating !== "all") q.append("rating", String(rating));
      if (reportedOnly) q.append("reportedOnly", "true");
      if (sortBy) q.append("sortBy", sortBy);

      const res = await fetch(`${appConfig.apiUrl}/api/reviews?${q.toString()}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      localReviews = data;
      return data;
    } catch {
      let filtered = [...localReviews];

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        filtered = filtered.filter(
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

      if (status !== "all") {
        filtered = filtered.filter((r) => r.status === status);
      }

      if (rating !== "all") {
        const num = Number(rating);
        if (!isNaN(num)) {
          filtered = filtered.filter((r) => r.rating === num);
        }
      }

      if (reportedOnly) {
        filtered = filtered.filter((r) => r.isReported && r.status !== "rejected");
      }

      if (sortBy === "rating_desc") {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === "rating_asc") {
        filtered.sort((a, b) => a.rating - b.rating);
      } else if (sortBy === "reports_desc") {
        filtered.sort((a, b) => b.reportsCount - a.reportsCount);
      } else if (sortBy === "helpful_desc") {
        filtered.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
      } else {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return filtered;
    }
  },

  /**
   * Get single review by ID
   */
  async getReviewById(id: string): Promise<Review | null> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/reviews/${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      const found = localReviews.find((r) => r.id === id || r.reviewNumber === id);
      return found ?? null;
    }
  },

  /**
   * Delete inappropriate review
   */
  async deleteReview(payload: DeleteReviewPayload): Promise<Review> {
    const { reviewId, reason, moderationNote, moderatedBy = "Admin Moderator" } = payload;

    try {
      const res = await fetch(`${appConfig.apiUrl}/api/reviews/${encodeURIComponent(reviewId)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, moderationNote, moderatedBy }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const updated = data.review || data;

      const idx = localReviews.findIndex((r) => r.id === reviewId || r.reviewNumber === reviewId);
      if (idx !== -1) {
        localReviews[idx] = updated;
      }
      return updated;
    } catch {
      const idx = localReviews.findIndex((r) => r.id === reviewId || r.reviewNumber === reviewId);
      const current = localReviews[idx];
      if (idx === -1 || !current) throw new Error("Review not found");

      const now = new Date().toISOString();
      const updated: Review = {
        ...current,
        status: "rejected",
        isReported: false,
        moderationHistory: [
          ...(current.moderationHistory || []),
          {
            moderatedBy,
            moderatedAt: now,
            action: "deleted",
            reason,
            note: moderationNote,
          },
        ],
        updatedAt: now,
      };

      localReviews[idx] = updated;
      return updated;
    }
  },

  /**
   * Dismiss reported review (keeps review live as published, clears flag)
   */
  async dismissReport(payload: { reviewId: string; note?: string; moderatedBy?: string }): Promise<Review> {
    const { reviewId, note, moderatedBy = "Admin Moderator" } = payload;

    try {
      const res = await fetch(`${appConfig.apiUrl}/api/reviews/${encodeURIComponent(reviewId)}/dismiss-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note, moderatedBy }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const updated = data.review || data;

      const idx = localReviews.findIndex((r) => r.id === reviewId || r.reviewNumber === reviewId);
      if (idx !== -1) {
        localReviews[idx] = updated;
      }
      return updated;
    } catch {
      const idx = localReviews.findIndex((r) => r.id === reviewId || r.reviewNumber === reviewId);
      const current = localReviews[idx];
      if (idx === -1 || !current) throw new Error("Review not found");

      const now = new Date().toISOString();
      const updated: Review = {
        ...current,
        status: "published",
        isReported: false,
        reportsCount: 0,
        moderationHistory: [
          ...(current.moderationHistory || []),
          {
            moderatedBy,
            moderatedAt: now,
            action: "dismissed_flag",
            reason: "Report dismissed by moderator; content compliant with policy",
            note,
          },
        ],
        updatedAt: now,
      };

      localReviews[idx] = updated;
      return updated;
    }
  },

  /**
   * Update review status
   */
  async updateStatus(
    reviewId: string,
    status: Review["status"],
    reason?: string,
    note?: string,
    moderatedBy = "Admin Moderator"
  ): Promise<Review> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/reviews/${encodeURIComponent(reviewId)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason, note, moderatedBy }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const updated = await res.json();

      const idx = localReviews.findIndex((r) => r.id === reviewId || r.reviewNumber === reviewId);
      if (idx !== -1) {
        localReviews[idx] = updated;
      }
      return updated;
    } catch {
      const idx = localReviews.findIndex((r) => r.id === reviewId || r.reviewNumber === reviewId);
      const current = localReviews[idx];
      if (idx === -1 || !current) throw new Error("Review not found");

      const now = new Date().toISOString();
      const updated: Review = {
        ...current,
        status,
        isReported: status === "flagged",
        moderationHistory: [
          ...(current.moderationHistory || []),
          {
            moderatedBy,
            moderatedAt: now,
            action: status === "published" ? "approved" : "rejected",
            reason,
            note,
          },
        ],
        updatedAt: now,
      };

      localReviews[idx] = updated;
      return updated;
    }
  },

  /**
   * Get telemetry summary metrics for reviews
   */
  async getMetrics(): Promise<ReviewSummaryMetrics> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/reviews-metrics`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      const totalReviews = localReviews.length;
      const publishedCount = localReviews.filter((r) => r.status === "published").length;
      const reportedCount = localReviews.filter((r) => r.isReported && r.status !== "rejected").length;
      const rejectedCount = localReviews.filter((r) => r.status === "rejected").length;

      const validRatings = localReviews.filter((r) => r.status !== "rejected");
      const averageRating =
        validRatings.length > 0
          ? Number((validRatings.reduce((acc, r) => acc + r.rating, 0) / validRatings.length).toFixed(1))
          : 5.0;

      const verifiedCount = localReviews.filter((r) => r.isVerifiedPurchase).length;
      const verifiedPurchaseRate = totalReviews > 0 ? Math.round((verifiedCount / totalReviews) * 100) : 100;

      const ratingDistribution = {
        5: localReviews.filter((r) => r.rating === 5).length,
        4: localReviews.filter((r) => r.rating === 4).length,
        3: localReviews.filter((r) => r.rating === 3).length,
        2: localReviews.filter((r) => r.rating === 2).length,
        1: localReviews.filter((r) => r.rating === 1).length,
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
    }
  },
};
