"use client";

import { useEffect, useState, useCallback } from "react";
import type {
  AdminNotification,
  OrderNotificationTrigger,
  NotificationSummaryMetrics,
  NotificationTab,
  SendNotificationPayload,
  UpdateTriggerPayload,
} from "@/types/notification";
import { NotificationService } from "@/services/notification.service";
import { NotificationKPIs } from "@/components/notifications/NotificationKPIs";
import { NotificationTable } from "@/components/notifications/NotificationTable";
import { OrderNotificationRules } from "@/components/notifications/OrderNotificationRules";
import { DeviceNotificationPreview } from "@/components/notifications/DeviceNotificationPreview";
import { SendNotificationModal } from "@/components/notifications/SendNotificationModal";
import { NotificationDetailModal } from "@/components/notifications/NotificationDetailModal";
import { DeleteNotificationModal } from "@/components/notifications/DeleteNotificationModal";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotificationTab>("overview");
  const [isLoading, setIsLoading] = useState(true);

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [triggers, setTriggers] = useState<OrderNotificationTrigger[]>([]);
  const [metrics, setMetrics] = useState<NotificationSummaryMetrics>({
    totalSent: 0,
    avgDeliveryRate: 99.4,
    avgOpenRate: 42.5,
    avgClickRate: 15.8,
    totalOrderAlerts: 0,
    totalPromotionalSent: 0,
    totalAnnouncementsSent: 0,
    activeAutomationsCount: 0,
  });

  // Modal States
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<AdminNotification | null>(null);
  const [inspectingNotification, setInspectingNotification] = useState<AdminNotification | null>(null);
  const [deletingNotification, setDeletingNotification] = useState<AdminNotification | null>(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = useCallback((text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const [notifs, trigs, mets] = await Promise.all([
        NotificationService.getNotifications(),
        NotificationService.getTriggers(),
        NotificationService.getMetrics(),
      ]);
      setNotifications(notifs);
      setTriggers(trigs);
      setMetrics(mets);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      showToast("Unable to reach backend API. Using offline notifications cache.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let isSubscribed = true;
    async function init() {
      try {
        const [notifs, trigs, mets] = await Promise.all([
          NotificationService.getNotifications(),
          NotificationService.getTriggers(),
          NotificationService.getMetrics(),
        ]);
        if (isSubscribed) {
          setNotifications(notifs);
          setTriggers(trigs);
          setMetrics(mets);
        }
      } catch (err) {
        console.error("Initial notification load failed:", err);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }
    init();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Handlers
  const handleOpenSendModal = () => {
    setEditingNotification(null);
    setIsSendModalOpen(true);
  };

  const handleEditNotification = (item: AdminNotification) => {
    setEditingNotification(item);
    setIsSendModalOpen(true);
  };

  const handleSendNotification = async (payload: SendNotificationPayload) => {
    setIsActionSubmitting(true);
    try {
      if (editingNotification) {
        await NotificationService.updateNotification(editingNotification.id, payload);
        showToast("Scheduled notification updated.");
      } else {
        await NotificationService.sendNotification(payload);
        showToast(
          payload.scheduleTime
            ? "Notification scheduled successfully."
            : "Notification broadcast dispatched immediately."
        );
      }
      await refreshAll();
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleResendNotification = async (item: AdminNotification) => {
    try {
      await NotificationService.resendNotification(item.id);
      showToast(`Resent broadcast "${item.title}".`);
      await refreshAll();
    } catch {
      showToast("Failed to resend notification.", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingNotification) return;
    setIsActionSubmitting(true);
    try {
      await NotificationService.deleteNotification(deletingNotification.id);
      showToast("Notification deleted from logs.");
      setDeletingNotification(null);
      await refreshAll();
    } catch {
      showToast("Failed to delete notification.", "error");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleUpdateTrigger = async (id: string, updates: UpdateTriggerPayload) => {
    try {
      await NotificationService.updateTrigger(id, updates);
      showToast("Order notification trigger rule updated.");
      await refreshAll();
    } catch {
      showToast("Failed to update trigger rule.", "error");
    }
  };

  const handleSendTestNotification = async (
    title: string,
    body: string,
    type: "order" | "promotional" | "announcement"
  ) => {
    try {
      await NotificationService.sendNotification({
        title,
        body,
        type,
        channels: ["push", "in_app"],
        targetAudience: "all",
      });
      showToast(`Simulated push: "${title}"`);
      await refreshAll();
    } catch {
      showToast("Failed to trigger simulation.", "error");
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/95 px-4 py-3 text-xs shadow-2xl backdrop-blur-xl animate-slideDown">
          <span
            className={`h-2 w-2 rounded-full ${
              toastMessage.type === "success"
                ? "bg-emerald-400"
                : toastMessage.type === "error"
                ? "bg-rose-500"
                : "bg-cyan-400"
            }`}
          />
          <span className="font-semibold text-white">{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Engagement</span>
            <span>/</span>
            <span className="text-indigo-400">Notification Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Notification Management & Messaging Hub
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Send customer push notifications, manage automated order dispatch alerts, promotional flash sales, and new product announcements.
          </p>
        </div>

        {/* Global Refresh Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refreshAll()}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <svg
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards & Tabs */}
      <NotificationKPIs
        metrics={metrics}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSendClick={handleOpenSendModal}
      />

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Action Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab("order")}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-emerald-500/50 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">📦</span>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                    {metrics.totalOrderAlerts} Dispatched
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Order Notifications & Triggers
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage automated order confirmation, shipment tracking, out-for-delivery, and completed receipts.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 mt-4 flex items-center gap-1">
                View Order Alerts →
              </span>
            </div>

            <div
              onClick={() => setActiveTab("promotional")}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-indigo-500/50 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">⚡</span>
                  <span className="rounded-full bg-indigo-500/10 text-indigo-400 px-2 py-0.5 text-[10px] font-bold">
                    {metrics.totalPromotionalSent} Campaigns
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                  Promotional Sales & Coupons
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Broadcast limited-time flash discount codes, VIP enterprise fleet upgrades, and seasonal events.
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-400 mt-4 flex items-center gap-1">
                View Promotions →
              </span>
            </div>

            <div
              onClick={() => setActiveTab("announcements")}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-cyan-500/50 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">🚀</span>
                  <span className="rounded-full bg-cyan-500/10 text-cyan-400 px-2 py-0.5 text-[10px] font-bold">
                    {metrics.totalAnnouncementsSent} Launches
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                  New Product Announcements
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Announce new hardware premieres, foldable pre-orders, and global satellite connectivity features.
                </p>
              </div>
              <span className="text-xs font-semibold text-cyan-400 mt-4 flex items-center gap-1">
                View Announcements →
              </span>
            </div>
          </div>

          {/* Recent Broadcasts Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Recent Customer Broadcasts</h2>
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                View Full Log ↗
              </button>
            </div>
            <NotificationTable
              notifications={notifications.slice(0, 5)}
              onInspect={setInspectingNotification}
              onEdit={handleEditNotification}
              onDelete={setDeletingNotification}
              onResend={handleResendNotification}
              onSendNew={handleOpenSendModal}
            />
          </div>

          {/* Quick Lockscreen Simulator Preview */}
          <div className="pt-2">
            <DeviceNotificationPreview
              notifications={notifications}
              onSendTestNotification={handleSendTestNotification}
            />
          </div>
        </div>
      )}

      {activeTab === "all" && (
        <NotificationTable
          notifications={notifications}
          onInspect={setInspectingNotification}
          onEdit={handleEditNotification}
          onDelete={setDeletingNotification}
          onResend={handleResendNotification}
          onSendNew={handleOpenSendModal}
        />
      )}

      {activeTab === "order" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Order Status Notifications Log</h2>
              <p className="text-xs text-slate-400">
                Shipment confirmations, courier dispatch tracking, and delivery receipts sent to buyers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("triggers")}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Configure Trigger Automations ⚙️
            </button>
          </div>
          <NotificationTable
            notifications={notifications.filter((n) => n.type === "order")}
            onInspect={setInspectingNotification}
            onEdit={handleEditNotification}
            onDelete={setDeletingNotification}
            onResend={handleResendNotification}
            onSendNew={handleOpenSendModal}
          />
        </div>
      )}

      {activeTab === "promotional" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Promotional & Campaign Broadcasts</h2>
              <p className="text-xs text-slate-400">
                Discount codes, flash sales, and trade-in incentives dispatched to customers.
              </p>
            </div>
          </div>
          <NotificationTable
            notifications={notifications.filter((n) => n.type === "promotional")}
            onInspect={setInspectingNotification}
            onEdit={handleEditNotification}
            onDelete={setDeletingNotification}
            onResend={handleResendNotification}
            onSendNew={handleOpenSendModal}
          />
        </div>
      )}

      {activeTab === "announcements" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">New Product Announcements</h2>
              <p className="text-xs text-slate-400">
                Hardware releases, pre-order queues, and flagship product premiere alerts.
              </p>
            </div>
          </div>
          <NotificationTable
            notifications={notifications.filter((n) => n.type === "announcement")}
            onInspect={setInspectingNotification}
            onEdit={handleEditNotification}
            onDelete={setDeletingNotification}
            onResend={handleResendNotification}
            onSendNew={handleOpenSendModal}
          />
        </div>
      )}

      {activeTab === "triggers" && (
        <OrderNotificationRules
          triggers={triggers}
          onUpdateTrigger={handleUpdateTrigger}
        />
      )}

      {activeTab === "preview" && (
        <DeviceNotificationPreview
          notifications={notifications}
          onSendTestNotification={handleSendTestNotification}
        />
      )}

      {/* Modals */}
      <SendNotificationModal
        isOpen={isSendModalOpen}
        initialNotification={editingNotification}
        onClose={() => setIsSendModalOpen(false)}
        onSubmit={handleSendNotification}
        isSubmitting={isActionSubmitting}
      />

      <NotificationDetailModal
        isOpen={Boolean(inspectingNotification)}
        notification={inspectingNotification}
        onClose={() => setInspectingNotification(null)}
        onResend={handleResendNotification}
      />

      <DeleteNotificationModal
        isOpen={Boolean(deletingNotification)}
        notificationTitle={deletingNotification?.title ?? ""}
        onClose={() => setDeletingNotification(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isActionSubmitting}
      />
    </div>
  );
}
