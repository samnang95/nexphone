export type WebRouteCategory = "Store" | "Catalog" | "Account" | "Auth" | "Company";

export interface WebRouteMeta {
  readonly key: string;
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly category: WebRouteCategory;
  readonly badge?: string;
  readonly iconName?: string;
  readonly isProtected?: boolean;
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
  readonly external?: boolean;
}

export interface NavRouteSection {
  readonly title: string;
  readonly items: readonly NavRouteItem[];
}
