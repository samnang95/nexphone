import {
  Notification,
  OrderNotificationTrigger,
  type NotificationDocument,
  type OrderNotificationTriggerDocument,
} from "../models/notification.model";
import {
  NotificationRecord,
  OrderNotificationTriggerRecord,
  notificationsStore,
  orderNotificationTriggersStore,
} from "../data/notifications.data";
import { isDatabaseConnected } from "../config/database";

export interface NotificationQueryFilters {
  search?: string;
  type?: string;
  status?: string;
  targetAudience?: string;
  recipientId?: string;
  recipientEmail?: string;
  isRead?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

let seeded = false;
export async function ensureNotificationsSeeded(): Promise<void> {
  if (seeded || !isDatabaseConnected()) return;
  try {
    const count = await Notification.countDocuments();
    if (count === 0) {
      await Notification.insertMany(notificationsStore);
      console.log(`🔔 [Notification Repo] Auto-seeded ${notificationsStore.length} notifications to MongoDB.`);
    }
    const triggerCount = await OrderNotificationTrigger.countDocuments();
    if (triggerCount === 0) {
      await OrderNotificationTrigger.insertMany(orderNotificationTriggersStore);
      console.log(`⚡ [Notification Repo] Auto-seeded ${orderNotificationTriggersStore.length} triggers to MongoDB.`);
    }
    seeded = true;
  } catch (error) {
    console.warn("⚠️  [Notification Repo] Could not auto-seed notifications to MongoDB:", (error as Error).message);
  }
}

export const notificationRepository = {
  async find(
    filters: NotificationQueryFilters = {},
    pagination?: PaginationOptions
  ): Promise<{ notifications: NotificationRecord[]; total: number }> {
    await ensureNotificationsSeeded();

    if (isDatabaseConnected()) {
      return this.findMongo(filters, pagination);
    }
    return this.findInMemory(filters, pagination);
  },

  async findForUser(
    userId?: string,
    email?: string,
    options: {
      type?: string;
      status?: string;
      unreadOnly?: boolean;
      userTier?: string;
      hasOrders?: boolean;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    notifications: NotificationRecord[];
    total: number;
    unreadCount: number;
  }> {
    await ensureNotificationsSeeded();

    const allowedAudiences: string[] = ["all"];
    if (options.userTier && ["Pro", "VIP", "Enterprise"].includes(options.userTier)) {
      allowedAudiences.push("enterprise_vip");
    }
    if (options.hasOrders || userId || email) {
      allowedAudiences.push("order_customers");
    }

    let all: NotificationRecord[] = [];
    if (isDatabaseConnected()) {
      const orClauses: any[] = [{ targetAudience: { $in: allowedAudiences } }];
      if (userId) orClauses.push({ recipientId: userId });
      if (email) orClauses.push({ recipientEmail: email.toLowerCase() });

      const query: any = { $or: orClauses };
      if (options.type && options.type !== "all") query.type = options.type;
      if (options.status && options.status !== "all") query.status = options.status;

      const docs = await Notification.find(query).sort({ createdAt: -1 }).lean();
      all = docs as unknown as NotificationRecord[];
    } else {
      all = notificationsStore.filter((n) => {
        const matchesUser =
          (userId && n.recipientId === userId) ||
          (email && n.recipientEmail?.toLowerCase() === email.toLowerCase()) ||
          allowedAudiences.includes(n.targetAudience);

        if (!matchesUser) return false;
        if (options.type && options.type !== "all" && n.type !== options.type) return false;
        if (options.status && options.status !== "all" && n.status !== options.status) return false;
        return true;
      });
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Helper to evaluate read status for this user
    const isItemRead = (n: NotificationRecord): boolean => {
      if (n.recipientId && userId && n.recipientId === userId) return Boolean(n.isRead);
      if (n.isRead) return true;
      if (userId && n.readBy && n.readBy.includes(userId)) return true;
      return false;
    };

    const unreadCount = all.filter((n) => !isItemRead(n)).length;

    let filtered = all;
    if (options.unreadOnly) {
      filtered = all.filter((n) => !isItemRead(n));
    }

    const total = filtered.length;
    let paginated = filtered;
    if (options.page && options.limit) {
      const start = (Number(options.page) - 1) * Number(options.limit);
      paginated = filtered.slice(start, start + Number(options.limit));
    }

    // Annotate isRead specifically for this user
    const decorated = paginated.map((n) => ({
      ...n,
      isRead: isItemRead(n),
    }));

    return {
      notifications: decorated,
      total,
      unreadCount,
    };
  },

  async findById(id: string): Promise<NotificationRecord | null> {
    await ensureNotificationsSeeded();
    const clean = id.trim();

    if (isDatabaseConnected()) {
      const doc = await Notification.findOne({ id: clean }).lean();
      return (doc as unknown as NotificationRecord) || null;
    }

    return notificationsStore.find((n) => n.id === clean) || null;
  },

  async create(data: Partial<NotificationRecord>): Promise<NotificationRecord> {
    await ensureNotificationsSeeded();
    const now = new Date().toISOString();
    const id = data.id || `notif-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;

    const newRecord: NotificationRecord = {
      id,
      title: data.title || "Notification",
      body: data.body || "",
      type: data.type || "custom",
      channels: data.channels && data.channels.length > 0 ? data.channels : ["push"],
      targetAudience: data.targetAudience || "all",
      recipientId: data.recipientId,
      recipientEmail: data.recipientEmail,
      status: data.status || "sent",
      isRead: Boolean(data.isRead),
      readAt: data.readAt || null,
      readBy: data.readBy || [],
      scheduledAt: data.scheduledAt || null,
      sentAt: data.sentAt !== undefined ? data.sentAt : (data.status === "scheduled" ? null : now),
      recipientCount: data.recipientCount !== undefined ? data.recipientCount : 1,
      deliveryRate: data.deliveryRate !== undefined ? data.deliveryRate : 100,
      openRate: data.openRate !== undefined ? data.openRate : 0,
      clickRate: data.clickRate !== undefined ? data.clickRate : 0,
      actionUrl: data.actionUrl,
      metadata: data.metadata || {},
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };

    notificationsStore.unshift(newRecord);

    if (isDatabaseConnected()) {
      const doc = await Notification.create(newRecord);
      return doc.toObject() as unknown as NotificationRecord;
    }

    return newRecord;
  },

  async update(id: string, updates: Partial<NotificationRecord>): Promise<NotificationRecord | null> {
    await ensureNotificationsSeeded();
    const clean = id.trim();
    const now = new Date().toISOString();

    if (isDatabaseConnected()) {
      const updated = await Notification.findOneAndUpdate(
        { id: clean },
        { $set: { ...updates, updatedAt: now } },
        { returnDocument: "after", runValidators: true }
      ).lean();

      if (updated) {
        const memIdx = notificationsStore.findIndex((n) => n.id === clean);
        if (memIdx !== -1) {
          notificationsStore[memIdx] = updated as unknown as NotificationRecord;
        }
        return updated as unknown as NotificationRecord;
      }
    }

    const index = notificationsStore.findIndex((n) => n.id === clean);
    if (index === -1) return null;

    const current = notificationsStore[index]!;
    const updated: NotificationRecord = {
      ...current,
      ...updates,
      id: current.id,
      updatedAt: now,
    };

    notificationsStore[index] = updated;
    return updated;
  },

  async delete(id: string): Promise<NotificationRecord | null> {
    await ensureNotificationsSeeded();
    const clean = id.trim();

    if (isDatabaseConnected()) {
      const deletedDoc = await Notification.findOneAndDelete({ id: clean }).lean();
      const memIdx = notificationsStore.findIndex((n) => n.id === clean);
      if (memIdx !== -1) notificationsStore.splice(memIdx, 1);
      return (deletedDoc as unknown as NotificationRecord) || null;
    }

    const index = notificationsStore.findIndex((n) => n.id === clean);
    if (index === -1) return null;
    const [deleted] = notificationsStore.splice(index, 1);
    return deleted || null;
  },

  async markAsRead(id: string, userId?: string): Promise<NotificationRecord | null> {
    await ensureNotificationsSeeded();
    const notif = await this.findById(id);
    if (!notif) return null;

    const now = new Date().toISOString();
    const updates: Partial<NotificationRecord> = {
      readAt: now,
    };

    if (notif.recipientId && userId && notif.recipientId === userId) {
      updates.isRead = true;
    } else if (userId) {
      const currentReadBy = notif.readBy || [];
      if (!currentReadBy.includes(userId)) {
        updates.readBy = [...currentReadBy, userId];
      }
      updates.isRead = true;
    } else {
      updates.isRead = true;
    }

    return this.update(id, updates);
  },

  async markAllAsRead(userId?: string, email?: string): Promise<number> {
    await ensureNotificationsSeeded();
    const now = new Date().toISOString();
    let updatedCount = 0;

    const { notifications } = await this.findForUser(userId, email, { unreadOnly: true });

    for (const notif of notifications) {
      await this.markAsRead(notif.id, userId);
      updatedCount++;
    }

    return updatedCount;
  },

  async getTriggers(): Promise<OrderNotificationTriggerRecord[]> {
    await ensureNotificationsSeeded();
    if (isDatabaseConnected()) {
      const docs = await OrderNotificationTrigger.find().lean();
      return docs as unknown as OrderNotificationTriggerRecord[];
    }
    return orderNotificationTriggersStore;
  },

  async updateTrigger(
    id: string,
    updates: Partial<OrderNotificationTriggerRecord>
  ): Promise<OrderNotificationTriggerRecord | null> {
    await ensureNotificationsSeeded();
    const clean = id.trim();

    if (isDatabaseConnected()) {
      const doc = await OrderNotificationTrigger.findOneAndUpdate(
        { id: clean },
        { $set: updates },
        { returnDocument: "after" }
      ).lean();
      if (doc) {
        const memIdx = orderNotificationTriggersStore.findIndex((t) => t.id === clean);
        if (memIdx !== -1) {
          orderNotificationTriggersStore[memIdx] = doc as unknown as OrderNotificationTriggerRecord;
        }
        return doc as unknown as OrderNotificationTriggerRecord;
      }
    }

    const index = orderNotificationTriggersStore.findIndex((t) => t.id === clean);
    if (index === -1) return null;

    const current = orderNotificationTriggersStore[index]!;
    const updated = { ...current, ...updates, id: current.id };
    orderNotificationTriggersStore[index] = updated;
    return updated;
  },

  async getMetrics() {
    await ensureNotificationsSeeded();

    let list: NotificationRecord[] = [];
    let triggers: OrderNotificationTriggerRecord[] = [];

    if (isDatabaseConnected()) {
      const [nDocs, tDocs] = await Promise.all([
        Notification.find().lean(),
        OrderNotificationTrigger.find().lean(),
      ]);
      list = nDocs as unknown as NotificationRecord[];
      triggers = tDocs as unknown as OrderNotificationTriggerRecord[];
    } else {
      list = [...notificationsStore];
      triggers = [...orderNotificationTriggersStore];
    }

    const sentNotifications = list.filter((n) => n.status === "sent");
    const totalSent = sentNotifications.length;

    const avgDeliveryRate =
      totalSent > 0
        ? Number((sentNotifications.reduce((acc, n) => acc + (n.deliveryRate || 0), 0) / totalSent).toFixed(1))
        : 99.4;

    const avgOpenRate =
      totalSent > 0
        ? Number((sentNotifications.reduce((acc, n) => acc + (n.openRate || 0), 0) / totalSent).toFixed(1))
        : 42.5;

    const avgClickRate =
      totalSent > 0
        ? Number((sentNotifications.reduce((acc, n) => acc + (n.clickRate || 0), 0) / totalSent).toFixed(1))
        : 15.8;

    const totalOrderAlerts = list.filter((n) => n.type === "order").length;
    const totalPromotionalSent = list.filter((n) => n.type === "promotional").length;
    const totalAnnouncementsSent = list.filter((n) => n.type === "announcement").length;
    const activeAutomationsCount = triggers.filter((t) => t.enabled).length;

    return {
      totalSent,
      avgDeliveryRate,
      avgOpenRate,
      avgClickRate,
      totalOrderAlerts,
      totalPromotionalSent,
      totalAnnouncementsSent,
      activeAutomationsCount,
    };
  },

  async findMongo(
    filters: NotificationQueryFilters,
    pagination?: PaginationOptions
  ): Promise<{ notifications: NotificationRecord[]; total: number }> {
    const query: Record<string, any> = {};

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim();
      const regex = new RegExp(q, "i");
      query.$or = [
        { title: regex },
        { body: regex },
        { "metadata.orderId": regex },
        { "metadata.promoCode": regex },
      ];
    }

    if (filters.type && filters.type !== "all") query.type = filters.type;
    if (filters.status && filters.status !== "all") query.status = filters.status;
    if (filters.targetAudience && filters.targetAudience !== "all") query.targetAudience = filters.targetAudience;
    if (filters.recipientId) query.recipientId = filters.recipientId;
    if (filters.recipientEmail) query.recipientEmail = filters.recipientEmail.toLowerCase();
    if (filters.isRead !== undefined) query.isRead = filters.isRead;

    const total = await Notification.countDocuments(query);
    let mQuery = Notification.find(query).sort({ createdAt: -1 });

    if (pagination) {
      mQuery = mQuery.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }

    const docs = await mQuery.lean();
    return {
      notifications: docs as unknown as NotificationRecord[],
      total,
    };
  },

  findInMemory(
    filters: NotificationQueryFilters,
    pagination?: PaginationOptions
  ): { notifications: NotificationRecord[]; total: number } {
    let results = [...notificationsStore];

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      results = results.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q) ||
          (n.metadata?.orderId && n.metadata.orderId.toLowerCase().includes(q)) ||
          (n.metadata?.promoCode && n.metadata.promoCode.toLowerCase().includes(q))
      );
    }

    if (filters.type && filters.type !== "all") {
      results = results.filter((n) => n.type === filters.type);
    }
    if (filters.status && filters.status !== "all") {
      results = results.filter((n) => n.status === filters.status);
    }
    if (filters.targetAudience && filters.targetAudience !== "all") {
      results = results.filter((n) => n.targetAudience === filters.targetAudience);
    }
    if (filters.recipientId) {
      results = results.filter((n) => n.recipientId === filters.recipientId);
    }
    if (filters.recipientEmail) {
      results = results.filter(
        (n) => n.recipientEmail?.toLowerCase() === filters.recipientEmail?.toLowerCase()
      );
    }
    if (filters.isRead !== undefined) {
      results = results.filter((n) => Boolean(n.isRead) === filters.isRead);
    }

    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = results.length;
    if (pagination) {
      const start = (pagination.page - 1) * pagination.limit;
      results = results.slice(start, start + pagination.limit);
    }

    return { notifications: results, total };
  },
};
