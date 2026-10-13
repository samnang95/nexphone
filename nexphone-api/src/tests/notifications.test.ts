import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app";
import { notificationsStore } from "../data/notifications.data";

describe("Notification API", () => {
  // ==========================================
  // 1. Get My Notifications
  // ==========================================
  describe("1. Get My Notifications", () => {
    it("GET /api/notifications/my-notifications returns customer notifications with unread count", async () => {
      const res = await request(app).get("/api/notifications/my-notifications");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("notifications");
      expect(Array.isArray(res.body.notifications)).toBe(true);
      expect(res.body).toHaveProperty("unreadCount");
      expect(typeof res.body.unreadCount).toBe("number");
      expect(res.body).toHaveProperty("total");
      expect(res.body).toHaveProperty("pagination");
      expect(res.body.pagination).toHaveProperty("page", 1);
    });

    it("supports route alias GET /api/notifications/me", async () => {
      const res = await request(app).get("/api/notifications/me");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.notifications)).toBe(true);
    });

    it("filters notifications by type", async () => {
      const res = await request(app).get("/api/notifications/my-notifications?type=order");
      expect(res.status).toBe(200);
      expect(res.body.notifications.every((n: any) => n.type === "order")).toBe(true);
    });

    it("supports unreadOnly filter", async () => {
      const res = await request(app).get("/api/notifications/my-notifications?unreadOnly=true");
      expect(res.status).toBe(200);
      expect(res.body.notifications.every((n: any) => n.isRead === false)).toBe(true);
    });

    it("supports pagination query parameters", async () => {
      const res = await request(app).get("/api/notifications/my-notifications?page=1&limit=2");
      expect(res.status).toBe(200);
      expect(res.body.notifications.length).toBeLessThanOrEqual(2);
      expect(res.body.pagination.limit).toBe(2);
    });
  });

  // ==========================================
  // 2. Mark Notification as Read
  // ==========================================
  describe("2. Mark Notification as Read", () => {
    let testNotifId: string;

    it("creates a test notification for read tests", async () => {
      const res = await request(app).post("/api/notifications/send").send({
        title: "Test Notification For Read",
        body: "Please read this test alert.",
        type: "system",
      });
      expect(res.status).toBe(201);
      testNotifId = res.body.id;
    });

    it("PATCH /api/notifications/:id/read marks notification as read", async () => {
      const res = await request(app).patch(`/api/notifications/${testNotifId}/read`);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain("marked as read");
      expect(res.body.notification.isRead).toBe(true);
      expect(res.body.notification.readAt).toBeDefined();
    });

    it("supports route alias PUT /api/notifications/:id/read", async () => {
      const res = await request(app).put(`/api/notifications/${testNotifId}/read`);
      expect(res.status).toBe(200);
      expect(res.body.notification.isRead).toBe(true);
    });

    it("returns 404 when marking a non-existent notification as read", async () => {
      const res = await request(app).patch("/api/notifications/notif-missing-999/read");
      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 3. Mark All as Read
  // ==========================================
  describe("3. Mark All as Read", () => {
    it("POST /api/notifications/read-all marks all notifications as read", async () => {
      const res = await request(app).post("/api/notifications/read-all");
      expect(res.status).toBe(200);
      expect(res.body.message).toContain("All notifications marked as read");
      expect(typeof res.body.count).toBe("number");

      // Verify unread count is now 0 for this caller
      const checkRes = await request(app).get("/api/notifications/my-notifications");
      expect(checkRes.status).toBe(200);
      expect(checkRes.body.unreadCount).toBe(0);
    });
  });

  // ==========================================
  // 4. Delete Notification
  // ==========================================
  describe("4. Delete Notification", () => {
    it("DELETE /api/notifications/:id removes a notification", async () => {
      const createRes = await request(app).post("/api/notifications/send").send({
        title: "Ephemeral Alert to be deleted",
        body: "This should be deleted immediately.",
        type: "system",
      });
      expect(createRes.status).toBe(201);
      const tempId = createRes.body.id;

      const deleteRes = await request(app).delete(`/api/notifications/${tempId}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toContain("deleted");
      expect(deleteRes.body.item.id).toBe(tempId);
    });

    it("returns 404 when deleting a non-existent notification", async () => {
      const res = await request(app).delete("/api/notifications/notif-missing-xyz");
      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 5. Send Notification (Admin)
  // ==========================================
  describe("5. Send Notification (Admin)", () => {
    it("POST /api/notifications/send broadcasts a notification to audience", async () => {
      const payload = {
        title: "📡 Firmware Security Update 3.4.1",
        body: "Security patches and satellite link optimizations are rolling out now.",
        type: "system",
        channels: ["push", "in_app"],
        targetAudience: "all",
        actionUrl: "/settings/security",
      };

      const res = await request(app).post("/api/notifications/send").send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.title).toBe(payload.title);
      expect(res.body.body).toBe(payload.body);
      expect(res.body.status).toBe("sent");
      expect(res.body.recipientCount).toBeGreaterThan(1000);
    });

    it("supports scheduled notifications with future scheduleTime", async () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString();
      const payload = {
        title: "⏰ Scheduled System Maintenance",
        body: "Scheduled gateway upgrade this weekend at 02:00 UTC.",
        type: "system",
        scheduleTime: futureDate,
      };

      const res = await request(app).post("/api/notifications/send").send(payload);
      expect(res.status).toBe(201);
      expect(res.body.status).toBe("scheduled");
      expect(res.body.scheduledAt).toBeDefined();
    });

    it("returns 400 when title or body is missing", async () => {
      const res = await request(app).post("/api/notifications/send").send({
        type: "custom",
      });
      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // 6. Send Order Updates
  // ==========================================
  describe("6. Send Order Updates", () => {
    it("POST /api/notifications/orders/:orderId/update creates order tracking alert", async () => {
      const payload = {
        event: "order_shipped",
        trackingNumber: "TRK-EXP-9921",
        carrier: "NexExpress Armored Courier",
        channels: ["push", "email"],
      };

      const res = await request(app)
        .post("/api/notifications/orders/NX-ORD-9042/update")
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.type).toBe("order");
      expect(res.body.metadata.orderId).toBe("NX-ORD-9042");
      expect(res.body.actionUrl).toBe("/orders/NX-ORD-9042");
      expect(res.body.title).toContain("On The Way");
    });

    it("supports alias route POST /api/notifications/send-order-update", async () => {
      const payload = {
        orderId: "NX-ORD-9041",
        event: "order_delivered",
      };

      const res = await request(app)
        .post("/api/notifications/send-order-update")
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.type).toBe("order");
      expect(res.body.metadata.orderId).toBe("NX-ORD-9041");
    });
  });

  // ==========================================
  // 7. Send Promotion Announcements
  // ==========================================
  describe("7. Send Promotion Announcements", () => {
    it("POST /api/notifications/promotions/announce broadcasts promo code alert", async () => {
      const payload = {
        title: "🎉 VIP Weekend: 25% Off Titanium Editions",
        body: "Unlock 25% off all Ultra and Fold models this weekend with code TITANIUM25.",
        promoCode: "TITANIUM25",
        discountText: "25% OFF",
        targetAudience: "all",
      };

      const res = await request(app)
        .post("/api/notifications/promotions/announce")
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.type).toBe("promotional");
      expect(res.body.metadata.promoCode).toBe("TITANIUM25");
      expect(res.body.metadata.badge).toBe("25% OFF");
      expect(res.body.actionUrl).toContain("TITANIUM25");
    });

    it("supports alias route POST /api/notifications/send-promotion", async () => {
      const payload = {
        title: "⚡ Flash Deal Announced",
        body: "Limited quantity enterprise packs on sale.",
        promoCode: "FLASH50",
      };

      const res = await request(app)
        .post("/api/notifications/send-promotion")
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.type).toBe("promotional");
      expect(res.body.metadata.promoCode).toBe("FLASH50");
    });
  });

  // ==========================================
  // 8. Triggers, Resend & Metrics
  // ==========================================
  describe("8. Triggers, Resend & Metrics", () => {
    it("GET /api/notifications/triggers returns automated trigger configurations", async () => {
      const res = await request(app).get("/api/notifications/triggers");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("event");
      expect(res.body[0]).toHaveProperty("enabled");
    });

    it("PUT /api/notifications/triggers/:id updates trigger parameters", async () => {
      const res = await request(app)
        .put("/api/notifications/triggers/trig-001")
        .send({ enabled: false });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe("trig-001");
      expect(res.body.enabled).toBe(false);

      // Re-enable for subsequent runs
      await request(app)
        .put("/api/notifications/triggers/trig-001")
        .send({ enabled: true });
    });

    it("POST /api/notifications/:id/resend clones and resends a notification", async () => {
      const res = await request(app).post("/api/notifications/notif-anc-001/resend");
      expect(res.status).toBe(201);
      expect(res.body.title).toContain("Unveiling NexPhone Fold Ultra");
      expect(res.body.status).toBe("sent");
    });

    it("GET /api/notifications/metrics returns summary notification analytics", async () => {
      const res = await request(app).get("/api/notifications/metrics");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalSent");
      expect(res.body).toHaveProperty("avgDeliveryRate");
      expect(res.body).toHaveProperty("avgOpenRate");
      expect(res.body).toHaveProperty("avgClickRate");
      expect(res.body).toHaveProperty("totalOrderAlerts");
      expect(res.body).toHaveProperty("totalPromotionalSent");
    });
  });
});
