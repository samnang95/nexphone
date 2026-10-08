export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "paid" | "pending" | "refunded" | "failed";

export type PaymentMethodType =
  | "credit_card"
  | "stripe"
  | "apple_pay"
  | "corporate_wire"
  | "purchase_order";

export interface OrderItem {
  readonly id: string;
  readonly productId: string;
  readonly productName: string;
  readonly sku: string;
  readonly variantCapacity?: string;
  readonly variantRam?: string;
  readonly colorName?: string;
  readonly colorHex?: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly totalPrice: number;
}

export interface OrderCustomerAddress {
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly zipCode: string;
  readonly country: string;
}

export interface OrderCustomer {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly company?: string;
  readonly shippingAddress: OrderCustomerAddress;
  readonly billingAddress?: OrderCustomerAddress;
}

export interface OrderPayment {
  readonly status: PaymentStatus;
  readonly method: PaymentMethodType;
  readonly methodLabel: string;
  readonly transactionId?: string;
  readonly paidAt?: string;
  readonly amount: number;
  readonly currency: string;
}

export interface OrderShipping {
  readonly carrier: string;
  readonly service: string;
  readonly trackingNumber?: string;
  readonly trackingUrl?: string;
  readonly estimatedDelivery?: string;
  readonly shippedAt?: string;
  readonly deliveredAt?: string;
}

export interface OrderTimelineEvent {
  readonly id: string;
  readonly status: OrderStatus;
  readonly label: string;
  readonly description: string;
  readonly timestamp: string;
  readonly actor: string;
}

export interface Order {
  readonly id: string;
  readonly orderNumber: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly status: OrderStatus;
  readonly customer: OrderCustomer;
  readonly items: readonly OrderItem[];
  readonly subtotal: number;
  readonly tax: number;
  readonly shippingFee: number;
  readonly discount: number;
  readonly totalAmount: number;
  readonly payment: OrderPayment;
  readonly shipping: OrderShipping;
  readonly timeline: readonly OrderTimelineEvent[];
  readonly notes?: string;
  readonly cancelReason?: string;
}

export interface OrderMetrics {
  readonly totalOrders: number;
  readonly pendingOrders: number;
  readonly confirmedOrders: number;
  readonly processingOrders: number;
  readonly shippedOrders: number;
  readonly deliveredOrders: number;
  readonly cancelledOrders: number;
  readonly totalRevenue: number;
  readonly avgOrderValue: number;
  readonly paidOrdersCount: number;
  readonly pendingPaymentCount: number;
}

export interface UpdateOrderStatusPayload {
  readonly status: OrderStatus;
  readonly carrier?: string;
  readonly trackingNumber?: string;
  readonly note?: string;
  readonly performedBy?: string;
}

export interface CancelOrderPayload {
  readonly reason: string;
  readonly note?: string;
  readonly refundPayment?: boolean;
  readonly performedBy?: string;
}
