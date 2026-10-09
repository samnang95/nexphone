export interface CartItemColor {
  id: string;
  name: string;
  hex: string;
  imageUrl?: string;
  inStock?: boolean;
}

export interface CartItemStorage {
  id: string;
  capacity: string;
  ram: string;
  sku: string;
  price?: number;
  stock?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  series: string;
  color: CartItemColor;
  storage: CartItemStorage;
  unitPrice: number;
  quantity: number;
  availableColors?: readonly CartItemColor[];
  availableStorage?: readonly CartItemStorage[];
}

export interface PromoCodeDiscount {
  code: string;
  type: "percentage" | "fixed" | "shipping";
  amount: number; // e.g. 10 for 10%, 100 for $100
  label: string;
}

export interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  subtotal: number;
  shipping: number;
  discount: number;
  appliedPromo: PromoCodeDiscount | null;
  total: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemVariant: (
    itemId: string,
    updates: {
      color?: CartItemColor;
      storage?: CartItemStorage;
      unitPrice?: number;
    }
  ) => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}
