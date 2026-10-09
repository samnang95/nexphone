import { ROUTES } from "./paths";
import { NavRouteItem, NavRouteSection, WebRouteMeta } from "./types";

export const ROUTE_REGISTRY: Record<string, WebRouteMeta> = {
  [ROUTES.HOME]: {
    key: "home",
    path: ROUTES.HOME,
    title: "NexPhone Flagship Store",
    description: "Next-generation secure communication devices with dual cryptographic enclaves.",
    category: "Store",
  },
  [ROUTES.AUTH.LOGIN]: {
    key: "auth-login",
    path: ROUTES.AUTH.LOGIN,
    title: "NexID Sign In",
    description: "Secure cryptographic authentication for your NexPhone customer account.",
    category: "Auth",
  },
  [ROUTES.AUTH.REGISTER]: {
    key: "auth-register",
    path: ROUTES.AUTH.REGISTER,
    title: "Create NexID",
    description: "Register a verified hardware-bound customer account.",
    category: "Auth",
  },
  [ROUTES.AUTH.FORGOT_PASSWORD]: {
    key: "auth-forgot-password",
    path: ROUTES.AUTH.FORGOT_PASSWORD,
    title: "Password Recovery",
    description: "Request a 6-digit cryptographic verification code.",
    category: "Auth",
  },
  [ROUTES.AUTH.RESET_PASSWORD]: {
    key: "auth-reset-password",
    path: ROUTES.AUTH.RESET_PASSWORD,
    title: "Reset Password",
    description: "Verify your token and set a new master credential.",
    category: "Auth",
  },
  [ROUTES.PRODUCTS.ROOT]: {
    key: "products-catalog",
    path: ROUTES.PRODUCTS.ROOT,
    title: "Device Catalog",
    description: "Explore the complete NexPhone hardware lineup and dual enclave editions.",
    category: "Catalog",
  },
  [ROUTES.CART]: {
    key: "store-cart",
    path: ROUTES.CART,
    title: "Shopping Cart",
    description: "Review selected hardware editions and accessories.",
    category: "Store",
  },
  [ROUTES.CHECKOUT]: {
    key: "store-checkout",
    path: ROUTES.CHECKOUT,
    title: "Encrypted Checkout",
    description: "Finalize your order through PCI-compliant encrypted checkout.",
    category: "Store",
    isProtected: true,
  },
  [ROUTES.ORDERS.ROOT]: {
    key: "customer-orders",
    path: ROUTES.ORDERS.ROOT,
    title: "Order History",
    description: "Track shipment telemetry and hardware manufacturing statuses.",
    category: "Account",
    isProtected: true,
  },
  [ROUTES.ACCOUNT.PROFILE]: {
    key: "account-profile",
    path: ROUTES.ACCOUNT.PROFILE,
    title: "Customer Profile",
    description: "Manage personal details, company profile, and shipping addresses.",
    category: "Account",
    isProtected: true,
  },
  [ROUTES.ACCOUNT.SECURITY]: {
    key: "account-security",
    path: ROUTES.ACCOUNT.SECURITY,
    title: "Security & Keys",
    description: "Hardware token keys, biometric enrollments, and session management.",
    category: "Account",
    isProtected: true,
  },
};

/**
 * Primary header navigation links
 */
export const HEADER_NAV_ITEMS: readonly NavRouteItem[] = [
  { title: "Flagships", href: ROUTES.PRODUCTS.ROOT },
  { title: "Dual Enclave 3D", href: ROUTES.HOME },
  { title: "Pre-Order", href: ROUTES.PRODUCTS.ROOT, badge: "New" },
  { title: "Support", href: ROUTES.COMPANY.SUPPORT },
];

/**
 * Customer profile dropdown navigation items
 */
export const USER_DROPDOWN_ITEMS: readonly NavRouteItem[] = [
  { title: "Customer Profile", href: ROUTES.ACCOUNT.PROFILE, iconName: "user" },
  { title: "Orders & Pre-orders", href: ROUTES.ACCOUNT.ORDERS, iconName: "package" },
  { title: "Security & Password", href: ROUTES.ACCOUNT.SECURITY, iconName: "shield" },
];

/**
 * Footer link sections
 */
export const FOOTER_SECTIONS: readonly NavRouteSection[] = [
  {
    title: "Products & Hardware",
    items: [
      { title: "NexPhone Prime Titanium", href: ROUTES.PRODUCTS.ROOT },
      { title: "NexPhone Pro Enclave", href: ROUTES.PRODUCTS.ROOT },
      { title: "Enterprise Fleet Edition", href: ROUTES.PRODUCTS.ROOT },
      { title: "Satellite Mesh Transceiver", href: ROUTES.PRODUCTS.ROOT },
    ],
  },
  {
    title: "Customer Account",
    items: [
      { title: "NexID Sign In", href: ROUTES.AUTH.LOGIN },
      { title: "Register Account", href: ROUTES.AUTH.REGISTER },
      { title: "Order Tracking", href: ROUTES.ACCOUNT.ORDERS },
      { title: "Security Credentials", href: ROUTES.ACCOUNT.SECURITY },
    ],
  },
  {
    title: "Company & Trust",
    items: [
      { title: "About NexPhone", href: ROUTES.COMPANY.ABOUT },
      { title: "VIP Concierge Support", href: ROUTES.COMPANY.SUPPORT },
      { title: "Privacy Policy", href: ROUTES.COMPANY.PRIVACY },
      { title: "Terms of Service", href: ROUTES.COMPANY.TERMS },
    ],
  },
];

/**
 * Returns metadata for a given path
 */
export function getRouteMeta(pathname: string): WebRouteMeta | undefined {
  if (ROUTE_REGISTRY[pathname]) {
    return ROUTE_REGISTRY[pathname];
  }
  // Try matching root segment
  const baseKey = Object.keys(ROUTE_REGISTRY).find(
    (key) => key !== "/" && pathname.startsWith(key)
  );
  return baseKey ? ROUTE_REGISTRY[baseKey] : undefined;
}

/**
 * Helper to test if a route belongs to the authentication flow
 */
export function isAuthRoute(pathname: string): boolean {
  return [
    ROUTES.AUTH.LOGIN,
    ROUTES.AUTH.REGISTER,
    ROUTES.AUTH.FORGOT_PASSWORD,
    ROUTES.AUTH.RESET_PASSWORD,
  ].some((authPath) => pathname === authPath || pathname.startsWith(authPath));
}
