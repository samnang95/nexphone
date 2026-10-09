import { appConfig } from "@/app/config/env";
import type { Order, PlaceOrderPayload, OrderItem } from "@/types/order";

const API_BASE = appConfig.apiUrl.replace(/\/api\/?$/, "");
const LOCAL_ORDERS_KEY = "nexphone_user_orders_v1";

function getLocalOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrder(order: Order) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalOrders();
    const updated = [order, ...current.filter((o) => o.id !== order.id)];
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save order to localStorage", e);
  }
}

export const orderService = {
  async placeOrder(payload: PlaceOrderPayload): Promise<Order> {
    const orderNumber = `NX-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `NX-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const txnId = `TXN-ENCLAVE-${Date.now().toString(36).toUpperCase()}`;

    const orderItems: OrderItem[] = payload.items.map((ci) => ({
      id: ci.id,
      productId: ci.productId,
      productName: ci.productName,
      productSlug: ci.productSlug,
      productImage: ci.productImage,
      series: ci.series,
      colorName: ci.color.name,
      colorHex: ci.color.hex,
      variantCapacity: ci.storage.capacity,
      variantRam: ci.storage.ram,
      sku: ci.storage.sku,
      unitPrice: ci.unitPrice,
      quantity: ci.quantity,
      totalPrice: ci.unitPrice * ci.quantity,
    }));

    const cardLast4 = payload.payment.cardNumber
      ? payload.payment.cardNumber.replace(/\s+/g, "").slice(-4)
      : "4242";

    const newOrder: Order = {
      id: orderNumber,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "processing",
      customer: {
        name: payload.customer.name,
        email: payload.customer.email,
        phone: payload.customer.phone,
        company: payload.customer.company,
        shippingAddress: payload.deliveryAddress,
      },
      items: orderItems,
      subtotal: payload.subtotal,
      discount: payload.discount,
      promoCode: payload.promoCode,
      shippingFee: payload.shippingFee,
      tax: payload.tax,
      total: payload.total,
      payment: {
        method: payload.payment.method,
        cardLast4: payload.payment.method === "credit_card" ? cardLast4 : undefined,
        cardBrand: payload.payment.method === "credit_card" ? "Visa Secure" : undefined,
        cardholderName: payload.payment.cardholderName || payload.customer.name,
        cryptoCurrency: payload.payment.cryptoCurrency,
        installmentsMonths: payload.payment.method === "nex_credit" ? 24 : undefined,
        monthlyAmount: payload.payment.method === "nex_credit" ? payload.total / 24 : undefined,
        status: "paid",
        transactionId: txnId,
      },
      shipping: {
        carrier: payload.shippingOption.name,
        trackingNumber,
        estimatedDelivery: payload.shippingOption.estimatedDelivery,
        service: payload.shippingOption.description,
      },
      timeline: [
        {
          id: `tl-${Date.now()}-1`,
          status: "processing",
          label: "Encrypted Order Authorized",
          description: "Hardware allocation registered in cryptographic vault",
          timestamp: new Date().toISOString(),
          actor: "Client Enclave",
        },
        {
          id: `tl-${Date.now()}-2`,
          status: "confirmed",
          label: "Serial Number Reserved",
          description: "Hardware batch allocated at central staging hub",
          timestamp: new Date().toISOString(),
          actor: "Logistics Hub (Fremont)",
        },
      ],
    };

    // Try sending to remote API
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });
      if (res.ok) {
        const data = await res.json();
        saveLocalOrder(data);
        return data;
      }
    } catch (e) {
      console.warn("API request failed, persisting order locally", e);
    }

    // Always fallback to locally preserved order
    saveLocalOrder(newOrder);
    return newOrder;
  },

  async getOrderById(id: string): Promise<Order | null> {
    // 1. Check local storage first
    const local = getLocalOrders().find((o) => o.id === id || o.orderNumber === id);
    if (local) return local;

    // 2. Fetch from backend API
    try {
      const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore network errors
    }

    return null;
  },

  async getRecentOrders(): Promise<Order[]> {
    const local = getLocalOrders();
    try {
      const res = await fetch(`${API_BASE}/api/orders`, { cache: "no-store" });
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote)) {
          // Merge unique by ID
          const combined = [...local];
          remote.forEach((r: Order) => {
            if (!combined.some((c) => c.id === r.id)) {
              combined.push(r);
            }
          });
          return combined;
        }
      }
    } catch {
      // fallback
    }
    return local;
  },
};

export default orderService;
