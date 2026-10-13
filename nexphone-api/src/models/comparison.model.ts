import type { PhoneSpecifications, ProductDocument } from "./product.model";

export interface ComparisonSpecRow {
  key: string;
  label: string;
  category: string;
  values: Record<string, string>;
  isDifferent: boolean;
}

export interface ComparisonSpecCategory {
  categoryKey: string;
  categoryTitle: string;
  rows: ComparisonSpecRow[];
}

export interface ComparisonProductCard {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  brand: string;
  series: string;
  imageUrl: string;
  basePrice: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  colorsCount: number;
  storageCount: number;
  startingStorage: string;
  startingRam: string;
  colors: Array<{
    id: string;
    name: string;
    hex: string;
    imageUrl?: string;
  }>;
  storageOptions: Array<{
    id: string;
    capacity: string;
    ram: string;
    price: number;
    sku: string;
    stock: number;
  }>;
}

export interface PhoneComparisonResult {
  comparisonCount: number;
  productIds: string[];
  products: ComparisonProductCard[];
  totalDifferences: number;
  differingFields: string[];
  specifications: ComparisonSpecCategory[];
}
