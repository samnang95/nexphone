export type RouteCategory = "Core" | "Operations" | "Fleet" | "System";

export interface RouteMeta {
  readonly key: string;
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly category: RouteCategory;
  readonly badge?: string;
  readonly iconName?: string;
  readonly isDynamic?: boolean;
}

export interface BreadcrumbItem {
  readonly label: string;
  readonly href: string;
  readonly isCurrent?: boolean;
}

export interface NavRouteItem {
  readonly title: string;
  readonly href: string;
  readonly badge?: string | number;
  readonly iconName?: string;
}

export interface NavRouteSection {
  readonly title: string;
  readonly items: readonly NavRouteItem[];
}
