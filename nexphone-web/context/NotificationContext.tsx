"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AppNotification,
  NotificationCategory,
  NotificationPreferences,
  CategoryPreference,
} from "@/types/notification";
import {
  DEFAULT_PREFERENCES,
  NOTIFICATIONS_CHANGED_EVENT,
  notificationService,
} from "@/services/notification.service";

interface NotificationContextType {
  notifications: AppNotification[];
  preferences: NotificationPreferences;
  unreadCount: number;
  isInitialized: boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clearAll: () => void;
  updatePreference: (category: NotificationCategory, patch: Partial<CategoryPreference>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = () => {
      if (!isMounted) return;
      setNotifications(notificationService.read());
      setPreferences(notificationService.readPreferences());
      setIsInitialized(true);
    };

    Promise.resolve().then(load);
    // Fires for pushes from non-React code (orders) and for changes made in other tabs.
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, load);
    window.addEventListener("storage", load);

    return () => {
      isMounted = false;
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  // Storage is the source of truth: read, transform, write, then mirror into state.
  const commit = useCallback((transform: (list: AppNotification[]) => AppNotification[]) => {
    const next = transform(notificationService.read());
    notificationService.write(next);
    setNotifications(next);
  }, []);

  const markRead = useCallback(
    (id: string) => commit((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n))),
    [commit]
  );

  const markAllRead = useCallback(
    () => commit((list) => list.map((n) => (n.read ? n : { ...n, read: true }))),
    [commit]
  );

  const remove = useCallback(
    (id: string) => commit((list) => list.filter((n) => n.id !== id)),
    [commit]
  );

  const clearAll = useCallback(() => commit(() => []), [commit]);

  const updatePreference = useCallback(
    (category: NotificationCategory, patch: Partial<CategoryPreference>) => {
      const current = notificationService.readPreferences();
      const next: NotificationPreferences = {
        ...current,
        [category]: { ...current[category], ...patch },
      };
      notificationService.writePreferences(next);
      setPreferences(next);
    },
    []
  );

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        preferences,
        unreadCount,
        isInitialized,
        markRead,
        markAllRead,
        remove,
        clearAll,
        updatePreference,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
