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
