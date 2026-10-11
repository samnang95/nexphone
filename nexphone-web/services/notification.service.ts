import type {
  AppNotification,
  NewNotification,
  NotificationCategory,
  NotificationPreferences,
} from "@/types/notification";

const NOTIFICATIONS_KEY = "nexphone_notifications_v1";
const PREFERENCES_KEY = "nexphone_notification_prefs_v1";
export const NOTIFICATIONS_CHANGED_EVENT = "nexphone-notifications-changed";
const MAX_STORED = 100;

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  order: { enabled: true, email: true, push: true },
  promotion: { enabled: true, email: true, push: false },
  new_phone: { enabled: true, email: false, push: true },
};

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Demo content shown the first time the inbox is opened on this device. */
function buildSeed(): AppNotification[] {
  const at = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();
  return [
    {
      id: "seed-order-9040",
      category: "order",
      title: "Your order is out for delivery",
      message: "FedEx Priority has loaded your NexPhone Pro Max X onto the courier van. Expected today by 6:00 PM.",
      createdAt: at(45 * MINUTE),
      read: false,
      href: "/orders/NX-ORD-9040",
      ctaLabel: "Track order",
      tag: "NX-ORD-9040",
    },
    {
      id: "seed-order-9042",
      category: "order",
      title: "Order confirmed & allocated",
      message: "Payment captured and your 512GB Titanium Space Gray unit has been reserved at the Fremont hub.",
      createdAt: at(2 * HOUR),
      read: false,
      href: "/orders/NX-ORD-9042",
      ctaLabel: "View order",
      tag: "NX-ORD-9042",
    },
    {
      id: "seed-promo-freeship",
      category: "promotion",
      title: "Free armored shipping this weekend",
      message: "Use code FREESHIP at checkout for complimentary armored courier delivery on any flagship.",
      createdAt: at(5 * HOUR),
      read: false,
      href: "/products",
      ctaLabel: "Shop now",
      tag: "FREESHIP",
    },
    {
      id: "seed-newphone-fold",
      category: "new_phone",
      title: "NexPhone Titanium Fold is here",
      message: "A zero-gap flex hinge and an 8.02-inch seamless inner display. Configure yours in Astral Obsidian or Champagne Pearl.",
      createdAt: at(1 * DAY),
      read: false,
      href: "/products/nexphone-titanium-fold",
      ctaLabel: "Explore the Fold",
      tag: "New",
    },
    {
      id: "seed-order-9039",
      category: "order",
      title: "Order delivered",
      message: "Your NexPhone Lite was delivered and signed for by E. Rostova. Enjoy your new handset!",
      createdAt: at(1 * DAY + 2 * HOUR),
      read: true,
      href: "/orders/NX-ORD-9039",
      ctaLabel: "View receipt",
      tag: "NX-ORD-9039",
    },
    {
      id: "seed-promo-nex10",
      category: "promotion",
      title: "10% off your next device",
      message: "Thanks for being part of the enclave. Apply NEX10 in your cart for 10% off.",
      createdAt: at(3 * DAY),
      read: true,
      href: "/cart",
      ctaLabel: "Go to cart",
      tag: "NEX10",
    },
    {
      id: "seed-newphone-lite",
      category: "new_phone",
      title: "NexPhone Lite adds Mint Emerald",
      message: "The lightweight aero frame now comes in a fresh Mint Emerald finish, starting at $599.",
      createdAt: at(5 * DAY),
      read: true,
      href: "/products/nexphone-lite",
      ctaLabel: "See the Lite",
      tag: "New finish",
    },
  ];
}

export const SAMPLE_NOTIFICATIONS: Record<NotificationCategory, NewNotification> = {
  order: {
    category: "order",
    title: "Order status updated",
    message: "This is a sample order update. Real updates appear here when your order moves to a new stage.",
    href: "/orders",
    ctaLabel: "View orders",
    tag: "Sample",
  },
  promotion: {
    category: "promotion",
    title: "Limited-time titanium voucher",
    message: "This is a sample promotion. Use TITANIUM100 for $100 off a qualifying flagship.",
    href: "/products",
    ctaLabel: "Shop now",
    tag: "TITANIUM100",
  },
  new_phone: {
    category: "new_phone",
    title: "A new NexPhone just dropped",
    message: "This is a sample launch alert. You'll hear about new handsets and finishes first.",
    href: "/products",
    ctaLabel: "Browse phones",
    tag: "New",
  },
};

function dispatchChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT));
}

export const notificationService = {
  read(): AppNotification[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_KEY);
      if (raw === null) {
        const seeded = buildSeed();
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(seeded));
        return seeded;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as AppNotification[]) : [];
    } catch {
      return [];
    }
  },

  write(list: AppNotification[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list.slice(0, MAX_STORED)));
    } catch (e) {
      console.error("Failed to persist notifications", e);
    }
  },

  readPreferences(): NotificationPreferences {
    if (typeof window === "undefined") return DEFAULT_PREFERENCES;
    try {
      const raw = localStorage.getItem(PREFERENCES_KEY);
      if (!raw) return DEFAULT_PREFERENCES;
      const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
      return {
        order: { ...DEFAULT_PREFERENCES.order, ...parsed.order },
        promotion: { ...DEFAULT_PREFERENCES.promotion, ...parsed.promotion },
        new_phone: { ...DEFAULT_PREFERENCES.new_phone, ...parsed.new_phone },
      };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  },

  writePreferences(prefs: NotificationPreferences): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.error("Failed to persist notification preferences", e);
    }
  },

  /**
   * Adds a notification unless the user switched that category off.
   * Safe to call from non-React code (e.g. order.service); subscribers are notified via a window event.
   */
  push(input: NewNotification): AppNotification | null {
    if (typeof window === "undefined") return null;
    if (!this.readPreferences()[input.category].enabled) return null;

    const created: AppNotification = {
      ...input,
      id: `ntf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.write([created, ...this.read()]);
    dispatchChanged();
    return created;
  },
};

export function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < MINUTE) return "Just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default notificationService;
