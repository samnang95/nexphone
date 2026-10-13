import {
  notificationRepository,
  type NotificationQueryFilters,
} from "../repositories/notification.repo";
import { orderRepository } from "../repositories/order.repo";
import { HttpError } from "../utils/httpError";
import {
  serializeNotification,
  serializeUserNotifications,
} from "../views/notification.view";
import type { NotificationRecord } from "../data/notifications.data";

export interface NotificationAuthContext {
  user?: {
    id?: string;
    email?: string;
    fullName?: string;
    name?: string;
    role?: string;
    tier?: string;
    [key: string]: any;
  };
  isAdmin?: boolean;
}

export const notificationService = {
  /**
   * 1. Get My Notifications (User In-App Inbox)
   */
  async getMyNotifications(
    authContext: NotificationAuthContext,
    query: {
      type?: string;
      status?: string;
      unreadOnly?: boolean;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const user = authContext.user;
    const userId = user?.id;
    const email = user?.email;
    const userTier = user?.tier || "Regular";

    let hasOrders = false;
    if (userId || email) {
      try {
        const { total } = await orderRepository.find({
          userId,
          customerEmail: email,
        });
        hasOrders = total > 0;
      } catch {
        // Fallback gracefully
      }
    }

    const { notifications, total, unreadCount } =
      await notificationRepository.findForUser(userId, email, {
        type: query.type,
        status: query.status,
        unreadOnly: query.unreadOnly,
        userTier,
        hasOrders,
        page: query.page,
        limit: query.limit,
      });

    return serializeUserNotifications(
      notifications,
      total,
      unreadCount,
      query.page && query.limit ? { page: query.page, limit: query.limit } : undefined,
      userId
    );
  },

  /**
   * 2. Mark Notification as Read
   */
  async markNotificationAsRead(id: string, authContext: NotificationAuthContext = {}) {
    const notif = await notificationRepository.findById(id);
    if (!notif) {
      throw HttpError.notFound(`Notification with ID '${id}' not found`, "NOTIFICATION_NOT_FOUND");
    }

    const updated = await notificationRepository.markAsRead(id, authContext.user?.id);
    return {
      message: "Notification marked as read",
      notification: serializeNotification(updated || notif, authContext.user?.id),
    };
  },

  /**
   * 3. Mark All as Read
   */
  async markAllAsRead(authContext: NotificationAuthContext = {}) {
    const userId = authContext.user?.id;
    const email = authContext.user?.email;

    const count = await notificationRepository.markAllAsRead(userId, email);
    return {
      message: "All notifications marked as read",
      count,
    };
  },

  /**
   * 4. Delete Notification
   */
  async deleteNotification(id: string, authContext: NotificationAuthContext = {}) {
    const notif = await notificationRepository.findById(id);
    if (!notif) {
      throw HttpError.notFound(`Notification with ID '${id}' not found`, "NOTIFICATION_NOT_FOUND");
    }

    const user = authContext.user;
    const isAdmin =
      authContext.isAdmin || user?.role === "admin" || user?.role === "super_admin";

    // Non-admin can only delete their directly addressed notifications
    if (user && !isAdmin && notif.recipientId && notif.recipientId !== user.id) {
      throw HttpError.forbidden("You are not authorized to delete this notification.", "FORBIDDEN");
    }

    const deleted = await notificationRepository.delete(id);
    return {
      message: "Notification deleted",
      item: serializeNotification(deleted || notif),
    };
  },

  /**
   * 5. Send Notification (Admin Broadcast or Targeted)
   */
  async sendNotification(
    payload: {
      title: string;
      body: string;
      type?: "order" | "promotional" | "announcement" | "system" | "custom";
      channels?: ("push" | "email" | "sms" | "in_app")[];
      targetAudience?: "all" | "enterprise_vip" | "order_customers" | "active_devices" | "custom_segment";
      recipientId?: string;
      recipientEmail?: string;
      actionUrl?: string;
      scheduleTime?: string | null;
      metadata?: any;
    },
    _authContext: NotificationAuthContext = {}
  ) {
    const isScheduled = Boolean(payload.scheduleTime);
    const now = new Date().toISOString();

    let recipientCount = 1;
    if (payload.recipientId || payload.recipientEmail) {
      recipientCount = 1;
    } else if (payload.targetAudience === "all") {
      recipientCount = 28400;
    } else if (payload.targetAudience === "enterprise_vip") {
      recipientCount = 3200;
    } else if (payload.targetAudience === "order_customers") {
      recipientCount = 4850;
    } else if (payload.targetAudience === "active_devices") {
      recipientCount = 12600;
    } else {
      recipientCount = 850;
    }

    const newRecord: Partial<NotificationRecord> = {
      title: payload.title.trim(),
      body: payload.body.trim(),
      type: payload.type || "custom",
      channels:
        Array.isArray(payload.channels) && payload.channels.length > 0
          ? payload.channels
          : ["push"],
      targetAudience: payload.targetAudience || "all",
      recipientId: payload.recipientId,
      recipientEmail: payload.recipientEmail,
      status: isScheduled ? "scheduled" : "sent",
      scheduledAt: isScheduled && payload.scheduleTime ? new Date(payload.scheduleTime).toISOString() : null,
      sentAt: isScheduled ? null : now,
      recipientCount,
      deliveryRate: isScheduled ? 0 : 99.4,
      openRate: isScheduled ? 0 : Number((35 + Math.random() * 20).toFixed(1)),
      clickRate: isScheduled ? 0 : Number((10 + Math.random() * 15).toFixed(1)),
      actionUrl: payload.actionUrl ? payload.actionUrl.trim() : undefined,
      metadata: payload.metadata || {},
    };

    const created = await notificationRepository.create(newRecord);
    return serializeNotification(created);
  },

  /**
   * 6. Send Order Updates
   */
  async sendOrderUpdate(
    payload: {
      orderId: string;
      event?: string;
      title?: string;
      body?: string;
      trackingNumber?: string;
      carrier?: string;
      channels?: ("push" | "email" | "sms" | "in_app")[];
      recipientEmail?: string;
      recipientId?: string;
    },
    authContext: NotificationAuthContext = {}
  ) {
    if (!payload.orderId || !payload.orderId.trim()) {
      throw HttpError.badRequest("Order ID is required", "ORDER_ID_REQUIRED");
    }
    const cleanOrderId = payload.orderId.trim();
    const order = await orderRepository.findByIdOrNumber(cleanOrderId);

    const orderNumber = order ? order.orderNumber : cleanOrderId;
    const recipientEmail =
      payload.recipientEmail || order?.customer?.email || authContext.user?.email;
    const recipientId =
      payload.recipientId || order?.userId || order?.customer?.id || authContext.user?.id;
    const customerName = order?.customer?.name || "Valued Customer";
    const trackingNumber =
      payload.trackingNumber || order?.shipping?.trackingNumber || "TRK-NX-EXP";
    const carrier = payload.carrier || order?.shipping?.carrier || "NexExpress Courier";

    let title = payload.title;
    let body = payload.body;

    if (!title || !body) {
      const event = payload.event || (order?.status ? `order_${order.status}` : "order_shipped");
      const triggers = await notificationRepository.getTriggers();
      const trigger = triggers.find((t) => t.event === event);

      if (trigger) {
        title =
          title ||
          trigger.defaultTemplateTitle
            .replace("{order_id}", orderNumber)
            .replace("{tracking_number}", trackingNumber);

        body =
          body ||
          trigger.defaultTemplateBody
            .replace("{customer_name}", customerName)
            .replace("{order_id}", orderNumber)
            .replace("{tracking_number}", trackingNumber)
            .replace("{carrier}", carrier)
            .replace("{amount}", `$${order?.totalAmount || 0}`);
      } else {
        title = title || `Order Update: #${orderNumber}`;
        body =
          body ||
          `Your order #${orderNumber} has been updated. Carrier: ${carrier} (Tracking: ${trackingNumber}).`;
      }
    }

    const notification = await this.sendNotification(
      {
        title,
        body,
        type: "order",
        channels: payload.channels || ["push", "email"],
        targetAudience: "order_customers",
        recipientId,
        recipientEmail,
        actionUrl: `/orders/${orderNumber}`,
        metadata: {
          orderId: orderNumber,
          trackingNumber,
          carrier,
          status: order?.status || "updated",
        },
      },
      authContext
    );

    return notification;
  },

  /**
   * 7. Send Promotion Announcements
   */
  async sendPromotionAnnouncement(
    payload: {
      title: string;
      body: string;
      promoCode?: string;
      discountText?: string;
      actionUrl?: string;
      targetAudience?: "all" | "enterprise_vip" | "order_customers" | "active_devices" | "custom_segment";
      channels?: ("push" | "email" | "sms" | "in_app")[];
      scheduleTime?: string;
    },
    authContext: NotificationAuthContext = {}
  ) {
    const actionUrl =
      payload.actionUrl ||
      (payload.promoCode ? `/promotions?code=${payload.promoCode}` : "/promotions");

    const metadata: any = {};
    if (payload.promoCode) metadata.promoCode = payload.promoCode;
    if (payload.discountText) metadata.badge = payload.discountText;

    const notification = await this.sendNotification(
      {
        title: payload.title,
        body: payload.body,
        type: "promotional",
        channels: payload.channels || ["push", "in_app"],
        targetAudience: payload.targetAudience || "all",
        actionUrl,
        scheduleTime: payload.scheduleTime,
        metadata,
      },
      authContext
    );

    return notification;
  },

  /**
   * 8. Resend Notification
   */
  async resendNotification(id: string) {
    const found = await notificationRepository.findById(id);
    if (!found) {
      throw HttpError.notFound(`Notification with ID '${id}' not found`, "NOTIFICATION_NOT_FOUND");
    }

    const now = new Date().toISOString();
    const resentRecord: Partial<NotificationRecord> = {
      ...found,
      id: undefined,
      status: "sent",
      sentAt: now,
      scheduledAt: null,
      deliveryRate: 99.5,
      openRate: Number((35 + Math.random() * 20).toFixed(1)),
      clickRate: Number((10 + Math.random() * 15).toFixed(1)),
      createdAt: now,
      updatedAt: now,
    };

    const created = await notificationRepository.create(resentRecord);
    return serializeNotification(created);
  },

  /**
   * 9. Update Notification (Draft / Scheduled)
   */
  async updateNotification(id: string, payload: any) {
    const existing = await notificationRepository.findById(id);
    if (!existing) {
      throw HttpError.notFound(`Notification with ID '${id}' not found`, "NOTIFICATION_NOT_FOUND");
    }

    const updates: Partial<NotificationRecord> = {};
    if (payload.title !== undefined) updates.title = payload.title.trim();
    if (payload.body !== undefined) updates.body = payload.body.trim();
    if (payload.channels !== undefined) updates.channels = payload.channels;
    if (payload.targetAudience !== undefined) updates.targetAudience = payload.targetAudience;
    if (payload.actionUrl !== undefined) updates.actionUrl = payload.actionUrl;
    if (payload.metadata !== undefined) updates.metadata = payload.metadata;
    if (payload.status !== undefined) updates.status = payload.status;
    if (payload.scheduleTime !== undefined) {
      updates.scheduledAt = payload.scheduleTime ? new Date(payload.scheduleTime).toISOString() : null;
    }

    const updated = await notificationRepository.update(id, updates);
    return serializeNotification(updated || existing);
  },

  /**
   * 10. List All Notifications (Admin & Search)
   */
  async listAllNotifications(query: NotificationQueryFilters & { page?: number; limit?: number }) {
    const pagination =
      query.page && query.limit
        ? { page: Number(query.page), limit: Number(query.limit) }
        : undefined;

    const { notifications, total } = await notificationRepository.find(query, pagination);

    // If explicit pagination requested, return paginated object; otherwise return list for legacy compatibility
    if (pagination) {
      return {
        notifications: notifications.map((n) => serializeNotification(n)),
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit),
        },
      };
    }

    return notifications.map((n) => serializeNotification(n));
  },

  /**
   * 11. Trigger Automations
   */
  async getTriggers() {
    return notificationRepository.getTriggers();
  },

  async updateTrigger(id: string, updates: any) {
    const updated = await notificationRepository.updateTrigger(id, updates);
    if (!updated) {
      throw HttpError.notFound(`Trigger with ID '${id}' not found`, "TRIGGER_NOT_FOUND");
    }
    return updated;
  },

  /**
   * 12. Notification Metrics
   */
  async getMetrics() {
    return notificationRepository.getMetrics();
  },
};
