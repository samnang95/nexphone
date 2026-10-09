export const ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
  },
  PRODUCTS: {
    ROOT: "/products",
    DETAIL: (idOrSlug: string | number) => `/products/${encodeURIComponent(String(idOrSlug))}`,
    SERIES: (series: string) => `/products?series=${encodeURIComponent(series)}`,
  },
  EXPERIENCE_3D: "/viewer",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDERS: {
    ROOT: "/orders",
    DETAIL: (id: string | number) => `/orders/${encodeURIComponent(String(id))}`,
  },
  ACCOUNT: {
    ROOT: "/account",
    PROFILE: "/account/profile",
    ORDERS: "/account/orders",
    SECURITY: "/account/security",
    SETTINGS: "/account/settings",
  },
  COMPANY: {
    ABOUT: "/about",
    SUPPORT: "/support",
    PRIVACY: "/privacy",
    TERMS: "/terms",
  },
} as const;

export type RoutePath = typeof ROUTES;
