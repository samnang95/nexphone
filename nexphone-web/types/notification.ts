export type NotificationCategory = "order" | "promotion" | "new_phone";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  href?: string;
  ctaLabel?: string;
  /** Short badge, e.g. an order number or promo code */
  tag?: string;
}

export type NewNotification = Omit<AppNotification, "id" | "createdAt" | "read">;

export interface CategoryPreference {
  /** Master switch: when off, no notifications of this category are delivered. */
  enabled: boolean;
  email: boolean;
  push: boolean;
}

export type NotificationPreferences = Record<NotificationCategory, CategoryPreference>;

export type NotificationFilter = "all" | "unread" | NotificationCategory;
