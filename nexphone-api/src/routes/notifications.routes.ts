import { Router } from "express";
import { optionalAuthenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  sendNotificationSchema,
  updateNotificationSchema,
  sendOrderUpdateSchema,
  sendPromotionAnnouncementSchema,
  queryNotificationSchema,
  updateTriggerSchema,
} from "../validators/notification.validator";
import * as controller from "../controllers/notification.controller";

export const notificationsRouter = Router();

// ==========================================
// 1. Customer In-App Notifications
// ==========================================
notificationsRouter.get(["/api/notifications/my-notifications", "/notifications/my-notifications", "/api/notifications/me", "/notifications/me"], optionalAuthenticate, controller.getMyNotifications);
notificationsRouter.post(["/api/notifications/read-all", "/notifications/read-all"], optionalAuthenticate, controller.markAllAsRead);
notificationsRouter.put(["/api/notifications/read-all", "/notifications/read-all"], optionalAuthenticate, controller.markAllAsRead);
notificationsRouter.patch(["/api/notifications/read-all", "/notifications/read-all"], optionalAuthenticate, controller.markAllAsRead);

// ==========================================
// 2. Metrics & Dashboard Analytics (Admin)
// ==========================================
notificationsRouter.get(["/api/notifications/metrics", "/notifications/metrics", "/api/notifications-metrics", "/notifications-metrics"], optionalAuthenticate, controller.getMetrics);

// ==========================================
// 3. Automation Triggers (Admin)
// ==========================================
notificationsRouter.get(["/api/notifications/triggers", "/notifications/triggers"], optionalAuthenticate, controller.getTriggers);
notificationsRouter.put(["/api/notifications/triggers/:id", "/notifications/triggers/:id"], optionalAuthenticate, validate({ body: updateTriggerSchema }), controller.updateTrigger);

// ==========================================
// 4. Send Order Updates & Promotion Announcements
// ==========================================
notificationsRouter.post(["/api/notifications/orders/:orderId/update", "/notifications/orders/:orderId/update", "/api/notifications/send-order-update", "/notifications/send-order-update"], optionalAuthenticate, validate({ body: sendOrderUpdateSchema }), controller.sendOrderUpdate);
notificationsRouter.post(["/api/notifications/promotions/announce", "/notifications/promotions/announce", "/api/notifications/send-promotion", "/notifications/send-promotion"], optionalAuthenticate, validate({ body: sendPromotionAnnouncementSchema }), controller.sendPromotionAnnouncement);

// ==========================================
// 5. Send Notification (Admin)
// ==========================================
notificationsRouter.post(["/api/notifications/send", "/notifications/send"], optionalAuthenticate, validate({ body: sendNotificationSchema }), controller.sendNotification);

// ==========================================
// 6. Notification Specific Action Endpoints (:id subpaths)
// ==========================================
notificationsRouter.patch(["/api/notifications/:id/read", "/notifications/:id/read"], optionalAuthenticate, controller.markNotificationAsRead);
notificationsRouter.put(["/api/notifications/:id/read", "/notifications/:id/read"], optionalAuthenticate, controller.markNotificationAsRead);
notificationsRouter.post(["/api/notifications/:id/read", "/notifications/:id/read"], optionalAuthenticate, controller.markNotificationAsRead);
notificationsRouter.post(["/api/notifications/:id/resend", "/notifications/:id/resend"], optionalAuthenticate, controller.resendNotification);

// ==========================================
// 7. Notification Item CRUD
// ==========================================
notificationsRouter.put(["/api/notifications/:id", "/notifications/:id"], optionalAuthenticate, validate({ body: updateNotificationSchema }), controller.updateNotification);
notificationsRouter.patch(["/api/notifications/:id", "/notifications/:id"], optionalAuthenticate, validate({ body: updateNotificationSchema }), controller.updateNotification);
notificationsRouter.delete(["/api/notifications/:id", "/notifications/:id"], optionalAuthenticate, controller.deleteNotification);

// ==========================================
// 8. Notifications Collection: List All & Create
// ==========================================
notificationsRouter.get(["/api/notifications", "/notifications"], optionalAuthenticate, validate({ query: queryNotificationSchema }), controller.listAllNotifications);
notificationsRouter.post(["/api/notifications", "/notifications"], optionalAuthenticate, validate({ body: sendNotificationSchema }), controller.sendNotification);
