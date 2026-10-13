import { Router, type Request, type Response } from "express";
import { NotificationRecord, OrderNotificationTriggerRecord, notificationsStore, orderNotificationTriggersStore } from "../data/notifications.data";

export const notificationsRouter = Router();

// --- Notifications REST APIs ---
notificationsRouter.get("/api/notifications", (req: Request, res: Response) => {
  const type = req.query.type ? String(req.query.type) : undefined;
  const status = req.query.status ? String(req.query.status) : undefined;
  const search = req.query.search ? String(req.query.search).toLowerCase() : undefined;

  let results = [...notificationsStore];

  if (type && type !== "all") {
    results = results.filter((n) => n.type === type);
  }
  if (status && status !== "all") {
    results = results.filter((n) => n.status === status);
  }
  if (search) {
    results = results.filter(
      (n) =>
        n.title.toLowerCase().includes(search) ||
        n.body.toLowerCase().includes(search) ||
        (n.metadata?.orderId && n.metadata.orderId.toLowerCase().includes(search)) ||
        (n.metadata?.promoCode && n.metadata.promoCode.toLowerCase().includes(search))
    );
  }

  // Sort by most recent
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(results);
});

notificationsRouter.post("/api/notifications/send", (req: Request, res: Response) => {
  const body = req.body || {};
  if (!body.title || !body.body) {
    res.status(400).json({ error: "Notification title and body are required." });
    return;
  }

  const isScheduled = Boolean(body.scheduleTime);
  const now = new Date().toISOString();

  // Audience size calculation mockup
  let recipientCount = 1;
  if (body.targetAudience === "all") recipientCount = 28400;
  else if (body.targetAudience === "enterprise_vip") recipientCount = 3200;
  else if (body.targetAudience === "order_customers") recipientCount = 4850;
  else if (body.targetAudience === "active_devices") recipientCount = 12600;
  else recipientCount = 850;

  const newRecord: NotificationRecord = {
    id: `notif-${Date.now().toString(36)}`,
    title: String(body.title).trim(),
    body: String(body.body).trim(),
    type: body.type || "custom",
    channels: Array.isArray(body.channels) && body.channels.length > 0 ? body.channels : ["push"],
    targetAudience: body.targetAudience || "all",
    status: isScheduled ? "scheduled" : "sent",
    scheduledAt: isScheduled ? new Date(body.scheduleTime).toISOString() : null,
    sentAt: isScheduled ? null : now,
    recipientCount,
    deliveryRate: isScheduled ? 0 : 99.4,
    openRate: isScheduled ? 0 : Number((35 + Math.random() * 20).toFixed(1)),
    clickRate: isScheduled ? 0 : Number((10 + Math.random() * 15).toFixed(1)),
    actionUrl: body.actionUrl ? String(body.actionUrl).trim() : undefined,
    metadata: body.metadata,
    createdAt: now,
    updatedAt: now,
  };

  notificationsStore.unshift(newRecord);
  res.status(201).json(newRecord);
});

notificationsRouter.put("/api/notifications/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const index = notificationsStore.findIndex((n) => n.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  const current = notificationsStore[index]!;
  const body = req.body || {};
  const updated: NotificationRecord = {
    ...current,
    title: body.title !== undefined ? String(body.title).trim() : current.title,
    body: body.body !== undefined ? String(body.body).trim() : current.body,
    channels: body.channels || current.channels,
    targetAudience: body.targetAudience || current.targetAudience,
    actionUrl: body.actionUrl !== undefined ? body.actionUrl : current.actionUrl,
    metadata: body.metadata !== undefined ? body.metadata : current.metadata,
    status: body.status || current.status,
    scheduledAt: body.scheduleTime !== undefined ? (body.scheduleTime ? new Date(body.scheduleTime).toISOString() : null) : current.scheduledAt,
    updatedAt: new Date().toISOString(),
  };

  notificationsStore[index] = updated;
  res.json(updated);
});

notificationsRouter.delete("/api/notifications/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const index = notificationsStore.findIndex((n) => n.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  const [deleted] = notificationsStore.splice(index, 1);
  res.json({ message: "Notification deleted", item: deleted });
});

notificationsRouter.post("/api/notifications/:id/resend", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const found = notificationsStore.find((n) => n.id === id);
  if (!found) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  const now = new Date().toISOString();
  const resentRecord: NotificationRecord = {
    ...found,
    id: `notif-${Date.now().toString(36)}`,
    status: "sent",
    sentAt: now,
    scheduledAt: null,
    deliveryRate: 99.5,
    openRate: Number((35 + Math.random() * 20).toFixed(1)),
    clickRate: Number((10 + Math.random() * 15).toFixed(1)),
    createdAt: now,
    updatedAt: now,
  };

  notificationsStore.unshift(resentRecord);
  res.status(201).json(resentRecord);
});

// --- Order Notification Trigger Automation APIs ---
notificationsRouter.get("/api/notifications/triggers", (_req: Request, res: Response) => {
  res.json(orderNotificationTriggersStore);
});

notificationsRouter.put("/api/notifications/triggers/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const index = orderNotificationTriggersStore.findIndex((t) => t.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Trigger not found" });
    return;
  }

  const current = orderNotificationTriggersStore[index]!;
  const body = req.body || {};
  const updated: OrderNotificationTriggerRecord = {
    ...current,
    enabled: body.enabled !== undefined ? Boolean(body.enabled) : current.enabled,
    channels: body.channels || current.channels,
    defaultTemplateTitle: body.defaultTemplateTitle || current.defaultTemplateTitle,
    defaultTemplateBody: body.defaultTemplateBody || current.defaultTemplateBody,
  };

  orderNotificationTriggersStore[index] = updated;
  res.json(updated);
});

// --- Summary Metrics API ---
notificationsRouter.get("/api/notifications/metrics", (_req: Request, res: Response) => {
  const sentNotifications = notificationsStore.filter((n) => n.status === "sent");
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

  const totalOrderAlerts = notificationsStore.filter((n) => n.type === "order").length;
  const totalPromotionalSent = notificationsStore.filter((n) => n.type === "promotional").length;
  const totalAnnouncementsSent = notificationsStore.filter((n) => n.type === "announcement").length;
  const activeAutomationsCount = orderNotificationTriggersStore.filter((t) => t.enabled).length;

  res.json({
    totalSent,
    avgDeliveryRate,
    avgOpenRate,
    avgClickRate,
    totalOrderAlerts,
    totalPromotionalSent,
    totalAnnouncementsSent,
    activeAutomationsCount,
  });
});
