import { ROUTES } from "./paths";
import type { RouteMeta, NavRouteSection, BreadcrumbItem } from "./types";

export const ROUTE_REGISTRY: Record<string, RouteMeta> = {
  home: {
    key: "home",
    path: ROUTES.HOME,
    title: "System Overview",
    description: "Real-time fleet metrics, infrastructure health, and hardware telemetry.",
    category: "Core",
    iconName: "layout-dashboard",
  },
  login: {
    key: "login",
    path: ROUTES.AUTH.LOGIN,
    title: "Admin Sign In",
    description: "Secure administrative access to NexPhone infrastructure console.",
    category: "System",
    iconName: "lock",
  },
  forgotPassword: {
    key: "forgotPassword",
    path: ROUTES.AUTH.FORGOT_PASSWORD,
    title: "Forgot Password",
    description: "Request an administrative password reset verification code.",
    category: "System",
    iconName: "key",
  },
  resetPassword: {
    key: "resetPassword",
    path: ROUTES.AUTH.RESET_PASSWORD,
    title: "Reset Password",
    description: "Set a new administrative security credential.",
    category: "System",
    iconName: "shield-check",
  },
  profile: {
    key: "profile",
    path: ROUTES.PROFILE,
    title: "Admin Profile",
    description: "Personal credentials, session security, and access tokens.",
    category: "System",
    iconName: "user",
  },
  products: {
    key: "products",
    path: ROUTES.PRODUCTS.ROOT,
    title: "Product Management",
    description: "Manage commercial phones, hardware specifications, color/storage variants, and 3D digital twins.",
    category: "Core",
    badge: "Catalog",
    iconName: "package",
  },
  brands: {
    key: "brands",
    path: ROUTES.BRANDS.ROOT,
    title: "Brand Management",
    description: "Manage registered hardware manufacturers, OEM partners, flagship specifications, and enterprise tiers.",
    category: "Core",
    badge: "Registry",
    iconName: "award",
  },
  devices: {
    key: "devices",
    path: ROUTES.DEVICES.ROOT,
    title: "Connected Devices",
    description: "Manage registered hardware fleet and monitor status in real-time.",
    category: "Core",
    badge: "Live",
    iconName: "smartphone",
  },
  deviceDetail: {
    key: "deviceDetail",
    path: "/devices/[id]",
    title: "Device Diagnostics",
    description: "Granular hardware telemetry, VoIP metrics, and remote maintenance.",
    category: "Core",
    isDynamic: true,
    iconName: "cpu",
  },
  telemetry: {
    key: "telemetry",
    path: ROUTES.TELEMETRY,
    title: "Telemetry & Logs",
    description: "Real-time signal diagnostics, SIP latency, and cluster audit events.",
    category: "Operations",
    badge: "Active",
    iconName: "activity",
  },
  firmware: {
    key: "firmware",
    path: ROUTES.FIRMWARE,
    title: "Firmware OTA",
    description: "Over-the-air firmware deployment, channel releases, and staged rollouts.",
    category: "Operations",
    iconName: "cloud-upload",
  },
  analytics: {
    key: "analytics",
    path: ROUTES.ANALYTICS,
    title: "Fleet Analytics",
    description: "Hardware performance benchmarks, VoIP packet health, and call traffic.",
    category: "Fleet",
    iconName: "bar-chart-3",
  },
  settings: {
    key: "settings",
    path: ROUTES.SETTINGS,
    title: "Cluster Settings",
    description: "Admin console preferences, API endpoints, webhooks, and security policies.",
    category: "System",
    iconName: "settings",
  },
} as const;

export const ADMIN_NAV_SECTIONS: readonly NavRouteSection[] = [
  {
    title: "Core",
    items: [
      { title: "Overview", href: ROUTES.HOME, iconName: "layout-dashboard" },
      { title: "Product Catalog", href: ROUTES.PRODUCTS.ROOT, badge: "Catalog", iconName: "package" },
      { title: "Brand Partners", href: ROUTES.BRANDS.ROOT, badge: "Fleet", iconName: "award" },
      { title: "Connected Devices", href: ROUTES.DEVICES.ROOT, badge: "Live", iconName: "smartphone" },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Telemetry & Logs", href: ROUTES.TELEMETRY, badge: "Live", iconName: "activity" },
      { title: "Firmware OTA", href: ROUTES.FIRMWARE, iconName: "cloud-upload" },
      { title: "Fleet Analytics", href: ROUTES.ANALYTICS, iconName: "bar-chart-3" },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Admin Profile", href: ROUTES.PROFILE, iconName: "user" },
      { title: "Cluster Settings", href: ROUTES.SETTINGS, iconName: "settings" },
    ],
  },
] as const;

/**
 * Returns dynamic breadcrumbs based on current pathname.
 */
export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const baseSegment = pathname.split("?")[0] ?? "";
  const cleanPath = baseSegment.replace(/\/+$/, "") || "/";
  const crumbs: BreadcrumbItem[] = [{ label: "Admin", href: ROUTES.HOME }];

  if (cleanPath === ROUTES.HOME) {
    return [{ label: "Overview", href: ROUTES.HOME, isCurrent: true }];
  }

  const segments = cleanPath.split("/").filter(Boolean);
  let accumulatedPath = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (!segment) continue;
    accumulatedPath += `/${segment}`;
    const isCurrent = i === segments.length - 1;

    if (segment === "products") {
      crumbs.push({ label: "Product Management", href: ROUTES.PRODUCTS.ROOT, isCurrent });
    } else if (segment === "brands") {
      crumbs.push({ label: "Brand Management", href: ROUTES.BRANDS.ROOT, isCurrent });
    } else if (segment === "devices") {
      crumbs.push({ label: "Connected Devices", href: ROUTES.DEVICES.ROOT, isCurrent });
    } else if (i > 0 && segments[i - 1] === "devices") {
      crumbs.push({ label: `Device (${segment})`, href: accumulatedPath, isCurrent });
    } else if (segment === "telemetry") {
      crumbs.push({ label: "Telemetry & Logs", href: ROUTES.TELEMETRY, isCurrent });
    } else if (segment === "firmware") {
      crumbs.push({ label: "Firmware OTA", href: ROUTES.FIRMWARE, isCurrent });
    } else if (segment === "analytics") {
      crumbs.push({ label: "Fleet Analytics", href: ROUTES.ANALYTICS, isCurrent });
    } else if (segment === "settings") {
      crumbs.push({ label: "Cluster Settings", href: ROUTES.SETTINGS, isCurrent });
    } else if (segment === "profile") {
      crumbs.push({ label: "Admin Profile", href: ROUTES.PROFILE, isCurrent });
    } else if (segment === "login") {
      crumbs.push({ label: "Sign In", href: ROUTES.AUTH.LOGIN, isCurrent });
    } else if (segment === "forgot-password") {
      crumbs.push({ label: "Forgot Password", href: ROUTES.AUTH.FORGOT_PASSWORD, isCurrent });
    } else if (segment === "reset-password") {
      crumbs.push({ label: "Reset Password", href: ROUTES.AUTH.RESET_PASSWORD, isCurrent });
    } else {
      const formatted = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      crumbs.push({ label: formatted, href: accumulatedPath, isCurrent });
    }
  }

  return crumbs;
}
