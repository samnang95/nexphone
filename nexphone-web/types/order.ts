import type { CartItem } from "./cart";

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
}

export interface DeliveryAddress {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  instructions?: string;
}

export type PaymentMethodType = "credit_card" | "nex_credit" | "crypto" | "apple_pay";

export interface PaymentDetails {
  method: PaymentMethodType;
  cardLast4?: string;
  cardBrand?: string;
  cardholderName?: string;
  cryptoCurrency?: "USDC" | "BTC" | "ETH";
  installmentsMonths?: number;
  monthlyAmount?: number;
  status: "paid" | "authorized" | "pending";
  transactionId: string;
}

export interface ShippingOption {
  id: "standard" | "priority";
  name: string;
  price: number;
  estimatedDelivery: string;
  description: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  series: string;
  colorName: string;
  colorHex: string;
  variantCapacity: string;
  variantRam: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderTimelineEvent {
  id: string;
  status: "pending" | "processing" | "confirmed" | "shipped" | "delivered" | "cancelled";
  label: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "processing" | "confirmed" | "shipped" | "delivered" | "cancelled";
  customer: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    shippingAddress: DeliveryAddress;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  shippingFee: number;
  tax: number;
  total: number;
  payment: PaymentDetails;
  shipping: {
    carrier: string;
    trackingNumber: string;
    estimatedDelivery: string;
    service?: string;
  };
  timeline: OrderTimelineEvent[];
}

export interface PlaceOrderPayload {
  customer: CustomerInfo;
  deliveryAddress: DeliveryAddress;
  shippingOption: ShippingOption;
  payment: {
    method: PaymentMethodType;
    cardNumber?: string;
    cardholderName?: string;
    cardExpiry?: string;
    cardCvv?: string;
    cryptoCurrency?: "USDC" | "BTC" | "ETH";
  };
  items: CartItem[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  shippingFee: number;
  tax: number;
  total: number;
}
