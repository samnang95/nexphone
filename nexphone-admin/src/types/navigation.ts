export interface NavItem {
  readonly title: string;
  readonly href: string;
  readonly badge?: string | number;
}

export interface NavSection {
  readonly title: string;
  readonly items: readonly NavItem[];
}
