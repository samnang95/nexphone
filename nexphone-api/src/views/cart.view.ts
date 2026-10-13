import type { CartDocument, CartItemRecord, AppliedPromoRecord } from "../models/cart.model";

export interface CartTotalsView {
  totalItems: number;
  subtotal: number;
  shipping: number;
  baseShipping: number;
  discount: number;
  estimatedTax: number;
  total: number;
}

export interface CartResponseView extends CartTotalsView {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItemRecord[];
  appliedPromo: AppliedPromoRecord | null;
  updatedAt: string;
}

export function calculateCartTotals(
  items: CartItemRecord[],
  appliedPromo?: AppliedPromoRecord | null,
  taxRate: number = 0
): CartTotalsView {
  const totalItems = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const subtotal = items.reduce((acc, item) => acc + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0), 0);

  // Armored courier is free for orders over $1,000, or $35 base
  const baseShipping = subtotal >= 1000 || subtotal === 0 ? 0 : 35;
  const isFreeShippingPromo = appliedPromo?.type === "shipping";
  const shipping = isFreeShippingPromo ? 0 : baseShipping;

  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === "percentage") {
      discount = Math.round((subtotal * appliedPromo.amount) / 100);
    } else if (appliedPromo.type === "fixed") {
      discount = Math.min(subtotal, appliedPromo.amount);
    } else if (appliedPromo.type === "shipping") {
      discount = baseShipping;
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - (appliedPromo?.type === "shipping" ? 0 : discount));
  const estimatedTax = taxRate > 0 ? Math.round(discountedSubtotal * taxRate) : 0;
  const total = discountedSubtotal + shipping + estimatedTax;

  return {
    totalItems,
    subtotal,
    shipping,
    baseShipping,
    discount,
    estimatedTax,
    total,
  };
}

export function serializeCart(doc: CartDocument | any): CartResponseView {
  const cart = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  const items: CartItemRecord[] = (cart?.items || []).map((item: any) => ({
    id: item.id || `${item.productId}-${item.color?.id}-${item.storage?.id}`,
    productId: item.productId,
    productName: item.productName,
    productSlug: item.productSlug,
    productImage: item.productImage || "",
    series: item.series || "",
    color: {
      id: item.color?.id || "",
      name: item.color?.name || "",
      hex: item.color?.hex || "",
      imageUrl: item.color?.imageUrl,
      inStock: item.color?.inStock ?? true,
    },
    storage: {
      id: item.storage?.id || "",
      capacity: item.storage?.capacity || "",
      ram: item.storage?.ram || "",
      sku: item.storage?.sku || "",
      price: item.storage?.price,
      stock: item.storage?.stock,
    },
    unitPrice: Number(item.unitPrice) || 0,
    quantity: Number(item.quantity) || 1,
  }));

  const appliedPromo: AppliedPromoRecord | null = cart?.appliedPromo
    ? {
        code: cart.appliedPromo.code,
        type: cart.appliedPromo.type,
        amount: Number(cart.appliedPromo.amount),
        label: cart.appliedPromo.label,
      }
    : null;

  const totals = calculateCartTotals(items, appliedPromo);

  return {
    id: cart?.id || String(cart?._id || "cart-default"),
    userId: cart?.userId,
    sessionId: cart?.sessionId,
    items,
    appliedPromo,
    ...totals,
    updatedAt: cart?.updatedAt instanceof Date ? cart.updatedAt.toISOString() : (cart?.updatedAt || new Date().toISOString()),
  };
}