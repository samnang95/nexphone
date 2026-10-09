export interface WishlistItem {
  productId: string;
  productName: string;
  productSlug?: string;
  productImage?: string;
  series: string;
  subtitle: string;
  basePrice: number;
  compareAtPrice?: number;
  rating: number;
  inStock: boolean;
  selectedColor?: {
    id?: string;
    name: string;
    hex: string;
    imageUrl?: string;
  };
  selectedStorage?: {
    id?: string;
    capacity: string;
    ram: string;
    sku?: string;
    price?: number;
  };
  addedAt?: string;
}

export interface WishlistContextType {
  items: WishlistItem[];
  totalWishlist: number;
  addItem: (product: WishlistItem) => void;
  removeItem: (productId: string) => void;
  toggleWishlist: (product: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  moveToCart: (productId: string) => void;
  moveAllToCart: () => void;
}
