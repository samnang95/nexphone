import type { Request, Response } from "express";
import { notificationService } from "../services/notification.service";

/**
 * 1. Get My Notifications (Customer Inbox)
 * GET /api/notifications/my-notifications
 * GET /api/notifications/me
 */
export async function getMyNotifications(req: Request, res: Response): Promise<void> {
  const user = req.auth?.user;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const result = await notificationService.getMyNotifications(
    { user, isAdmin },
    req.query as any
  );
  res.json(result);
}

/**
 * 2. Mark Notification as Read
 * PATCH /api/notifications/:id/read
 * PUT /api/notifications/:id/read
 * POST /api/notifications/:id/read
 */
export async function markNotificationAsRead(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const user = req.auth?.user;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const result = await notificationService.markNotificationAsRead(id, { user, isAdmin });
  res.json(result);
}

/**
 * 3. Mark All as Read
 * POST /api/notifications/read-all
 * PUT /api/notifications/read-all
 * PATCH /api/notifications/read-all
 */
export async function markAllAsRead(req: Request, res: Response): Promise<void> {
  const user = req.auth?.user;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const result = await notificationService.markAllAsRead({ user, isAdmin });
  res.json(result);
}

/**
 * 4. Delete Notification
 * DELETE /api/notifications/:id
 */
export async function deleteNotification(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const user = req.auth?.user;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const result = await notificationService.deleteNotification(id, { user, isAdmin });
  res.json(result);
}

/**
 * 5. Send Notification (Admin)
 * POST /api/notifications/send
 * POST /api/notifications
 */
export async function sendNotification(req: Request, res: Response): Promise<void> {
  const user = req.auth?.user;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const result = await notificationService.sendNotification(req.body, { user, isAdmin });
  res.status(201).json(result);
}

/**
 * 6. Send Order Updates
 * POST /api/notifications/orders/:orderId/update
 * POST /api/notifications/send-order-update
 */
export async function sendOrderUpdate(req: Request, res: Response): Promise<void> {
  const orderId = String(req.params.orderId || req.body.orderId || "");
  const user = req.auth?.user;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const result = await notificationService.sendOrderUpdate(
    { ...req.body, orderId },
    { user, isAdmin }
  );
  res.status(201).json(result);
}

/**
 * 7. Send Promotion Announcements
 * POST /api/notifications/promotions/announce
 * POST /api/notifications/send-promotion
 */
export async function sendPromotionAnnouncement(req: Request, res: Response): Promise<void> {
  const user = req.auth?.user;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const result = await notificationService.sendPromotionAnnouncement(req.body, { user, isAdmin });
  res.status(201).json(result);
}

/**
 * 8. Resend Notification
 * POST /api/notifications/:id/resend
 */
export async function resendNotification(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await notificationService.resendNotification(id);
  res.status(201).json(result);
}

/**
 * 9. Update Notification (Draft / Scheduled)
 * PUT /api/notifications/:id
 * PATCH /api/notifications/:id
 */
export async function updateNotification(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await notificationService.updateNotification(id, req.body);
  res.json(result);
}

/**
 * 10. List All Notifications (Admin & Search)
 * GET /api/notifications
 */
export async function listAllNotifications(req: Request, res: Response): Promise<void> {
  const result = await notificationService.listAllNotifications(req.query as any);
  res.json(result);
}

/**
 * 11. Trigger Automations (Admin)
 * GET /api/notifications/triggers
 * PUT /api/notifications/triggers/:id
 */
export async function getTriggers(_req: Request, res: Response): Promise<void> {
  const result = await notificationService.getTriggers();
  res.json(result);
}

export async function updateTrigger(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await notificationService.updateTrigger(id, req.body);
  res.json(result);
}

/**
 * 12. Notification Metrics (Admin)
 * GET /api/notifications/metrics
 */
export async function getMetrics(_req: Request, res: Response): Promise<void> {
  const result = await notificationService.getMetrics();
  res.json(result);
}
