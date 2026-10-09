export interface CartItem {
  id: string; // Unique combination: `${productId}-${colorId}-${storageId}`
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  series: string;
  color: {
    id: string;
    name: string;
    hex: string;
  };
  storage: {
    id: string;
    capacity: string;
    ram: string;
    sku: string;
  };
  unitPrice: number;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}
