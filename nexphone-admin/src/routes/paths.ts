export const ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/login",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
  },
  PRODUCTS: {
    ROOT: "/products",
    DETAIL: (id: string | number) => `/products/${encodeURIComponent(String(id))}`,
  },
  BRANDS: {
    ROOT: "/brands",
    DETAIL: (id: string | number) => `/brands/${encodeURIComponent(String(id))}`,
  },
  INVENTORY: {
    ROOT: "/inventory",
    DETAIL: (id: string | number) => `/inventory/${encodeURIComponent(String(id))}`,
  },
  ORDERS: {
    ROOT: "/orders",
    DETAIL: (id: string | number) => `/orders/${encodeURIComponent(String(id))}`,
  },
  CUSTOMERS: {
    ROOT: "/customers",
    DETAIL: (id: string | number) => `/customers/${encodeURIComponent(String(id))}`,
  },
  PROFILE: "/profile",
  DEVICES: {
    ROOT: "/devices",
    DETAIL: (id: string | number) => `/devices/${encodeURIComponent(String(id))}`,
  },
  TELEMETRY: "/telemetry",
  FIRMWARE: "/firmware",
  ANALYTICS: "/analytics",
  SETTINGS: "/settings",
} as const;

export type AppRoutes = typeof ROUTES;
