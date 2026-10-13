import type { NotificationRecord } from "../data/notifications.data";

export interface SerializedNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  channels: string[];
  targetAudience: string;
  recipientId?: string;
  recipientEmail?: string;
  status: string;
  isRead: boolean;
  readAt?: string | null;
  scheduledAt?: string | null;
  sentAt?: string | null;
  recipientCount: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  actionUrl?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export function serializeNotification(n: any, currentUserId?: string): SerializedNotification {
  const isRead =
    currentUserId && n.readBy && Array.isArray(n.readBy)
      ? Boolean(n.isRead || n.readBy.includes(currentUserId))
      : Boolean(n.isRead);

  return {
    id: n.id || n._id?.toString(),
    title: n.title,
    body: n.body,
    type: n.type || "custom",
    channels: n.channels || ["push"],
    targetAudience: n.targetAudience || "all",
    recipientId: n.recipientId,
    recipientEmail: n.recipientEmail,
    status: n.status || "sent",
    isRead,
    readAt: n.readAt || null,
    scheduledAt: n.scheduledAt || null,
    sentAt: n.sentAt || null,
    recipientCount: Number(n.recipientCount) || 1,
    deliveryRate: Number(n.deliveryRate) || 0,
    openRate: Number(n.openRate) || 0,
    clickRate: Number(n.clickRate) || 0,
    actionUrl: n.actionUrl,
    metadata: n.metadata || {},
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  };
}

export function serializeUserNotifications(
  notifications: NotificationRecord[],
  total: number,
  unreadCount: number,
  pagination?: { page: number; limit: number },
  currentUserId?: string
) {
  const page = pagination ? Number(pagination.page) : 1;
  const limit = pagination ? Number(pagination.limit) : notifications.length;
  const totalPages = Math.ceil(total / (limit || 1)) || 1;

  return {
    notifications: notifications.map((n) => serializeNotification(n, currentUserId)),
    unreadCount,
    total,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}
