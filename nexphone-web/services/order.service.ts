import { appConfig } from "@/app/config/env";
import type {
  Order,
  PlaceOrderPayload,
  OrderItem,
  CancelOrderPayload,
  OrderFilterStatus,
  OrderSortOption,
} from "@/types/order";
import { notificationService } from "@/services/notification.service";
import { ROUTES } from "@/routes";

function notifyOrder(order: Order, title: string, message: string) {
  notificationService.push({
    category: "order",
    title,
    message,
    href: ROUTES.ORDERS.DETAIL(order.orderNumber),
    ctaLabel: "View order",
    tag: order.orderNumber,
  });
}

function notifyPlaced(order: Order) {
  notifyOrder(
    order,
    "Order placed successfully",
    `We've received your order of $${order.total.toLocaleString()}. We'll keep you posted as it moves through fulfilment.`
  );
}

function notifyCancelled(order: Order) {
  notifyOrder(
    order,
    "Order cancelled & refunded",
    `Your order was cancelled and a full refund of $${order.total.toLocaleString()} has been initiated.`
  );
}

function notifyStatus(order: Order) {
  notifyOrder(order, `Order ${order.status}`, `Your order status changed to ${order.status}.`);
}

const API_BASE = appConfig.apiUrl.replace(/\/api\/?$/, "");
const LOCAL_ORDERS_KEY = "nexphone_user_orders_v1";

const DEFAULT_SEEDED_ORDERS: Order[] = [
  {
    id: "NX-ORD-9042",
    orderNumber: "NX-ORD-9042",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    status: "processing",
    customer: {
      name: "Alex Vance",
      email: "a.vance@blackmesa.io",
      phone: "+1 (206) 555-0192",
      company: "Black Mesa Systems",
      shippingAddress: {
        street: "1042 Quantum Way, Suite 400",
        city: "Seattle",
        state: "WA",
        zipCode: "98101",
        country: "United States",
        instructions: "Deliver to secure reception desk with biometric verification",
      },
    },
    items: [
      {
        id: "item-ord-9042-1",
        productId: "prod-001",
        productName: "NexPhone Pro Max X",
        productSlug: "nexphone-pro-max-x",
        productImage:
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
        series: "Pro Series",
        colorName: "Titanium Space Gray",
        colorHex: "#2b2d42",
        variantCapacity: "512GB",
        variantRam: "16GB LPDDR5X",
        sku: "NX-PRO-512-SG",
        unitPrice: 1399,
        quantity: 1,
        totalPrice: 1399,
      },
    ],
    subtotal: 1399,
    discount: 0,
    shippingFee: 0,
    tax: 111.92,
    total: 1510.92,
    payment: {
      method: "credit_card",
      cardLast4: "4242",
      cardBrand: "Visa Secure",
      cardholderName: "Alex Vance",
      status: "paid",
      transactionId: "TXN-SEC-9042-881A",
    },
    shipping: {
      carrier: "NexExpress Armored Courier",
      trackingNumber: "NX-TRK-88129042",
      estimatedDelivery: "Tomorrow by 2:00 PM",
      service: "Dedicated Armored Transit with Biometric Tamper Seals",
      trackingUrl: "https://nexphone.io/track/NX-TRK-88129042",
    },
    timeline: [
      {
        id: "tl-9042-1",
        status: "pending",
        label: "Encrypted Order Authorized",
        description: "Payment captured via HSM hardware security enclave.",
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        actor: "Cryptographic Enclave",
      },
      {
        id: "tl-9042-2",
        status: "processing",
        label: "Hardware Batch Allocation",
        description: "Serial number assigned in cleanroom storage. Packaging initiated.",
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        actor: "Logistics Hub (Fremont)",
      },
    ],
  },
  {
    id: "NX-ORD-9041",
    orderNumber: "NX-ORD-9041",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    status: "confirmed",
    customer: {
      name: "Sophia Tanaka",
      email: "s.tanaka@cyberdyne.co.jp",
      phone: "+81 3 5555 0149",
      company: "Cyberdyne Corp Tokyo",
      shippingAddress: {
        street: "Roppongi Hills Mori Tower 34F",
        city: "Minato-ku, Tokyo",
        state: "Tokyo",
        zipCode: "106-6134",
        country: "Japan",
        instructions: "Hold at front corporate security depot",
      },
    },
    items: [
      {
        id: "item-ord-9041-1",
        productId: "prod-002",
        productName: "NexPhone Enterprise Edge",
        productSlug: "nexphone-enterprise-edge",
        productImage:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
        series: "Enterprise",
        colorName: "Tactical Matte Black",
        colorHex: "#0f172a",
        variantCapacity: "512GB",
        variantRam: "16GB ECC LPDDR5X",
        sku: "NX-ENT-512-TMB",
        unitPrice: 1499,
        quantity: 2,
        totalPrice: 2998,
      },
    ],
    subtotal: 2998,
    discount: 150,
    promoCode: "NEXENTERPRISE",
    shippingFee: 0,
    tax: 227.84,
    total: 3075.84,
    payment: {
      method: "nex_credit",
      installmentsMonths: 24,
      monthlyAmount: 128.16,
      cardholderName: "Sophia Tanaka",
      status: "paid",
      transactionId: "TXN-CR-9041-992B",
    },
    shipping: {
      carrier: "DHL Global Express Armored",
      trackingNumber: "NX-TRK-77192041",
      estimatedDelivery: "Oct 14, 2026",
      service: "International Priority Diplomatic Courier",
      trackingUrl: "https://nexphone.io/track/NX-TRK-77192041",
    },
    timeline: [
      {
        id: "tl-9041-1",
        status: "pending",
        label: "Corporate Order Placed",
        description: "Zero-interest hardware financing verified and locked.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actor: "NexCredit Gateway",
      },
      {
        id: "tl-9041-2",
        status: "confirmed",
        label: "Enterprise Security Audit Passed",
        description: "Custom firmware zero-trust keys injected into device HSM.",
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        actor: "Enterprise Security Ops",
      },
    ],
  },
  {
    id: "NX-ORD-9040",
    orderNumber: "NX-ORD-9040",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: "shipped",
    customer: {
      name: "Marcus Sterling",
      email: "m.sterling@acmeholdings.com",
      phone: "+44 20 7946 0912",
      company: "Sterling Apex Global",
      shippingAddress: {
        street: "25 Bank Street, Canary Wharf",
        city: "London",
        state: "Greater London",
        zipCode: "E14 5JP",
        country: "United Kingdom",
      },
    },
    items: [
      {
        id: "item-ord-9040-1",
        productId: "prod-001",
        productName: "NexPhone Pro Max X",
        productSlug: "nexphone-pro-max-x",
        productImage:
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
        series: "Pro Series",
        colorName: "Silver Frost",
        colorHex: "#e2e8f0",
        variantCapacity: "256GB",
        variantRam: "12GB LPDDR5X",
        sku: "NX-PRO-256-SL",
        unitPrice: 1199,
        quantity: 1,
        totalPrice: 1199,
      },
    ],
    subtotal: 1199,
    discount: 0,
    shippingFee: 0,
    tax: 95.92,
    total: 1294.92,
    payment: {
      method: "apple_pay",
      cardholderName: "Marcus Sterling",
      status: "paid",
      transactionId: "TXN-APAY-9040-101F",
    },
    shipping: {
      carrier: "FedEx Priority Secure",
      trackingNumber: "TRK-4412-9901",
      estimatedDelivery: "Out for Delivery Today by 6:00 PM",
      service: "Express Air Worldwide with Direct Signature Required",
      trackingUrl: "https://fedex.com/tracking?id=TRK-4412-9901",
    },
    timeline: [
      {
        id: "tl-9040-1",
        status: "pending",
        label: "Encrypted Order Authorized",
        description: "Card payment processed securely via Apple Pay Enclave.",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        actor: "Apple Pay Gateway",
      },
      {
        id: "tl-9040-2",
        status: "confirmed",
        label: "Stock Allocated",
        description: "Silver Frost 256GB flagship unit reserved.",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        actor: "Inventory System",
      },
      {
        id: "tl-9040-3",
        status: "shipped",
        label: "Courier Hand-off & Dispatched",
        description: "Handed over to FedEx Priority flight FX-921 to Heathrow Hub.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actor: "Global Logistics",
      },
      {
        id: "tl-9040-4",
        status: "shipped",
        label: "Out for Delivery",
        description: "Package loaded onto courier van for delivery to Canary Wharf.",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        actor: "FedEx Local Courier",
      },
    ],
  },
  {
    id: "NX-ORD-9039",
    orderNumber: "NX-ORD-9039",
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: "delivered",
    customer: {
      name: "Elena Rostova",
      email: "e.rostova@berlin-tech.de",
      phone: "+49 30 1234 5678",
      company: "Berlin Cybernetics",
      shippingAddress: {
        street: "Friedrichstraße 42",
        city: "Berlin",
        state: "Berlin",
        zipCode: "10117",
        country: "Germany",
      },
    },
    items: [
      {
        id: "item-ord-9039-1",
        productId: "prod-004",
        productName: "NexPhone Lite",
        productSlug: "nexphone-lite",
        productImage:
          "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80",
        series: "Lite",
        colorName: "Midnight Blue",
        colorHex: "#1e293b",
        variantCapacity: "128GB",
        variantRam: "8GB LPDDR5",
        sku: "NX-LITE-128-MB",
        unitPrice: 599,
        quantity: 1,
        totalPrice: 599,
      },
    ],
    subtotal: 599,
    discount: 0,
    shippingFee: 0,
    tax: 47.92,
    total: 646.92,
    payment: {
      method: "credit_card",
      cardLast4: "8821",
      cardBrand: "Mastercard Identity Check",
      cardholderName: "Elena Rostova",
      status: "paid",
      transactionId: "TXN-MC-9039-410K",
    },
    shipping: {
      carrier: "DHL Express",
      trackingNumber: "TRK-1209-7712",
      estimatedDelivery: "Delivered Yesterday at 3:15 PM",
      service: "Standard Tracked Delivery with Signature",
      trackingUrl: "https://dhl.com/track/TRK-1209-7712",
    },
    timeline: [
      {
        id: "tl-9039-1",
        status: "pending",
        label: "Order Authorized",
        description: "Payment captured successfully.",
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        actor: "Payment Gateway",
      },
      {
        id: "tl-9039-2",
        status: "processing",
        label: "Warehousing & QA Inspection",
        description: "Quality assurance test passed for display and battery health.",
        timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
        actor: "Berlin Staging Depot",
      },
      {
        id: "tl-9039-3",
        status: "shipped",
        label: "In Transit with Courier",
        description: "Dispatched from logistics center.",
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        actor: "DHL Dispatch Hub",
      },
      {
        id: "tl-9039-4",
        status: "delivered",
        label: "Successfully Delivered",
        description: "Received and signed by recipient: E. Rostova.",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        actor: "DHL Express Courier",
      },
    ],
  },
  {
    id: "NX-ORD-9036",
    orderNumber: "NX-ORD-9036",
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 65 * 60 * 60 * 1000).toISOString(),
    status: "cancelled",
    cancelReason: "Customer requested cancellation to update delivery address and storage finish. Full cryptographic refund issued.",
    customer: {
      name: "David Chen",
      email: "d.chen@apexvoip.sg",
      phone: "+65 6789 0123",
      company: "Apex VoIP Labs",
      shippingAddress: {
        street: "1 Raffles Place, #28-00",
        city: "Singapore",
        state: "Singapore",
        zipCode: "048616",
        country: "Singapore",
      },
    },
    items: [
      {
        id: "item-ord-9036-1",
        productId: "prod-003",
        productName: "NexPhone Titanium Fold",
        productSlug: "nexphone-titanium-fold",
        productImage:
          "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80",
        series: "Foldable",
        colorName: "Astral Obsidian",
        colorHex: "#18181b",
        variantCapacity: "512GB",
        variantRam: "16GB LPDDR5X",
        sku: "NX-FOLD-512-AO",
        unitPrice: 1899,
        quantity: 1,
        totalPrice: 1899,
      },
    ],
    subtotal: 1899,
    discount: 0,
    shippingFee: 0,
    tax: 151.92,
    total: 2050.92,
    payment: {
      method: "crypto",
      cryptoCurrency: "USDC",
      status: "refunded",
      transactionId: "TXN-USDC-REF-9036",
    },
    shipping: {
      carrier: "SingPost Premier Courier",
      trackingNumber: "NX-TRK-VOIDED-9036",
      estimatedDelivery: "Shipment Cancelled",
      service: "Standard Express Courier",
    },
    timeline: [
      {
        id: "tl-9036-1",
        status: "pending",
        label: "Crypto Payment Confirmed",
        description: "2,050.92 USDC received via Ethereum Enclave contract.",
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        actor: "Web3 Smart Contract",
      },
      {
        id: "tl-9036-2",
        status: "cancelled",
        label: "Order Cancelled by Customer",
        description: "Reason: Customer requested cancellation to update delivery address and storage finish. Full cryptographic refund issued.",
        timestamp: new Date(Date.now() - 65 * 60 * 60 * 1000).toISOString(),
        actor: "Customer (Self-service Portal)",
      },
    ],
  },
];

function normalizeOrder(order: Partial<Order> & Record<string, unknown>): Order {
  const total = Number(order.total ?? order.totalAmount ?? 0);
  const subtotal = Number(order.subtotal ?? total);
  const tax = Number(order.tax ?? 0);
  const discount = Number(order.discount ?? 0);
  const shippingFee = Number(order.shippingFee ?? 0);

  return {
    ...(order as unknown as Order),
    id: (order.id as string) || (order.orderNumber as string),
    orderNumber: (order.orderNumber as string) || (order.id as string),
    subtotal,
    discount,
    shippingFee,
    tax,
    total,
    status: (order.status as Order["status"]) || "processing",
    cancelReason: order.cancelReason as string | undefined,
    customer: order.customer || {
      name: "Valued Customer",
      email: "customer@nexphone.io",
      phone: "+1 (555) 019-2834",
      shippingAddress: {
        street: "1 Infinite Loop",
        city: "Cupertino",
        state: "CA",
        zipCode: "95014",
        country: "United States",
      },
    },
    items: Array.isArray(order.items)
      ? (order.items as Array<Partial<OrderItem> & Record<string, unknown>>).map((item) => ({
          id: (item.id as string) || `item-${Date.now()}-${Math.random()}`,
          productId: item.productId || "prod-001",
          productName: item.productName || "NexPhone Flagship",
          productSlug: item.productSlug || "nexphone-pro-max-x",
          productImage:
            item.productImage ||
            "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
          series: item.series || "Pro Series",
          colorName: item.colorName || "Titanium Gray",
          colorHex: item.colorHex || "#2b2d42",
          variantCapacity: item.variantCapacity || "256GB",
          variantRam: item.variantRam || "12GB",
          sku: item.sku || "NX-DEV-001",
          unitPrice: Number(item.unitPrice || 0),
          quantity: Number(item.quantity || 1),
          totalPrice: Number(item.totalPrice || item.unitPrice || 0),
        }))
      : [],
    payment: order.payment || {
      method: "credit_card",
      status: "paid",
      transactionId: `TXN-${Date.now()}`,
    },
    shipping: order.shipping || {
      carrier: "NexExpress Armored Courier",
      trackingNumber: `NX-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      estimatedDelivery: "2-3 Business Days",
    },
    timeline: Array.isArray(order.timeline) ? order.timeline : [],
  };
}

function getLocalOrders(): Order[] {
  if (typeof window === "undefined") return DEFAULT_SEEDED_ORDERS;
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(DEFAULT_SEEDED_ORDERS));
      return DEFAULT_SEEDED_ORDERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(DEFAULT_SEEDED_ORDERS));
      return DEFAULT_SEEDED_ORDERS;
    }
    return parsed.map(normalizeOrder);
  } catch {
    return DEFAULT_SEEDED_ORDERS;
  }
}

function saveLocalOrder(order: Order) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalOrders();
    const updated = [order, ...current.filter((o) => o.id !== order.id && o.orderNumber !== order.orderNumber)];
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("nexphone-orders-changed", { detail: { orderId: order.id } }));
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
        trackingUrl: `https://nexphone.io/track/${trackingNumber}`,
      },
      timeline: [
        {
          id: `tl-${Date.now()}-1`,
          status: "pending",
          label: "Encrypted Order Authorized",
          description: "Hardware allocation registered in cryptographic vault",
          timestamp: new Date().toISOString(),
          actor: "Client Enclave",
        },
        {
          id: `tl-${Date.now()}-2`,
          status: "processing",
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
        const normalized = normalizeOrder(data);
        saveLocalOrder(normalized);
        notifyPlaced(normalized);
        return normalized;
      }
    } catch (e) {
      console.warn("API request failed, persisting order locally", e);
    }

    saveLocalOrder(newOrder);
    notifyPlaced(newOrder);
    return newOrder;
  },

  async getOrders(filters?: {
    status?: OrderFilterStatus | string;
    search?: string;
    sort?: OrderSortOption | string;
  }): Promise<Order[]> {
    const local = getLocalOrders();
    const ordersMap = new Map<string, Order>();

    // 1. Seed local orders
    local.forEach((o) => {
      ordersMap.set(o.id, o);
      if (o.orderNumber) ordersMap.set(o.orderNumber, o);
    });

    // 2. Fetch remote orders from API
    try {
      const res = await fetch(`${API_BASE}/api/orders`, { cache: "no-store" });
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote)) {
          remote.forEach((r: Partial<Order> & Record<string, unknown>) => {
            const norm = normalizeOrder(r);
            // Local record takes precedence if it exists (e.g. locally cancelled or edited)
            if (!ordersMap.has(norm.id)) {
              ordersMap.set(norm.id, norm);
            }
          });
        }
      }
    } catch {
      // offline fallback
    }

    // De-duplicate orders
    let allOrders = Array.from(new Set(Array.from(ordersMap.values())));

    // 3. Filter by Status
    if (filters?.status && filters.status !== "all") {
      const s = filters.status.toLowerCase();
      allOrders = allOrders.filter((o) => o.status.toLowerCase() === s);
    }

    // 4. Search Filter
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      allOrders = allOrders.filter((o) => {
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.shipping.trackingNumber.toLowerCase().includes(q) ||
          o.shipping.carrier.toLowerCase().includes(q) ||
          o.items.some(
            (i) =>
              i.productName.toLowerCase().includes(q) ||
              i.sku.toLowerCase().includes(q) ||
              i.variantCapacity.toLowerCase().includes(q)
          )
        );
      });
    }

    // 5. Sort
    const sort = filters?.sort || "newest";
    allOrders.sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sort === "total_desc") {
        return b.total - a.total;
      }
      if (sort === "total_asc") {
        return a.total - b.total;
      }
      // default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return allOrders;
  },

  async getRecentOrders(): Promise<Order[]> {
    return this.getOrders({ sort: "newest" });
  },

  async getOrderById(id: string): Promise<Order | null> {
    const trimmedId = id.trim();
    // 1. Check local storage first
    const local = getLocalOrders();
    const foundLocal = local.find(
      (o) =>
        o.id.toLowerCase() === trimmedId.toLowerCase() ||
        o.orderNumber.toLowerCase() === trimmedId.toLowerCase()
    );
    if (foundLocal) return foundLocal;

    // 2. Fetch from backend API
    try {
      const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(trimmedId)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const norm = normalizeOrder(data);
        saveLocalOrder(norm);
        return norm;
      }
    } catch {
      // offline fallback
    }

    return null;
  },

  async cancelOrder(id: string, payload: CancelOrderPayload): Promise<Order> {
    const trimmedId = id.trim();
    const reasonText = payload.reason + (payload.note ? ` • Note: ${payload.note}` : "");

    // 1. Try remote API call
    try {
      const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(trimmedId)}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: payload.reason,
          note: payload.note,
          refundPayment: true,
          performedBy: "Customer (Self-service)",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const norm = normalizeOrder(data);
        saveLocalOrder(norm);
        notifyCancelled(norm);
        return norm;
      }
    } catch (e) {
      console.warn("Backend cancel endpoint unreachable, cancelling order locally", e);
    }

    // 2. Local fallback update
    const current = await this.getOrderById(trimmedId);
    if (!current) {
      throw new Error(`Order ${trimmedId} not found`);
    }

    const now = new Date().toISOString();
    const updated: Order = {
      ...current,
      status: "cancelled",
      cancelReason: reasonText,
      updatedAt: now,
      payment: {
        ...current.payment,
        status: "refunded",
        transactionId: `TXN-REF-${Date.now().toString(36).toUpperCase()}`,
      },
      timeline: [
        {
          id: `tl-cancel-${Date.now()}`,
          status: "cancelled",
          label: "Order Cancelled by Customer",
          description: `Full refund initiated. Reason: ${reasonText}`,
          timestamp: now,
          actor: "Customer Portal",
        },
        ...current.timeline,
      ],
    };

    saveLocalOrder(updated);
    notifyCancelled(updated);
    return updated;
  },

  async updateOrderStatus(id: string, status: Order["status"], note?: string): Promise<Order> {
    const trimmedId = id.trim();
    try {
      const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(trimmedId)}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note, performedBy: "Enclave Ops" }),
      });
      if (res.ok) {
        const data = await res.json();
        const norm = normalizeOrder(data);
        saveLocalOrder(norm);
        notifyStatus(norm);
        return norm;
      }
    } catch (e) {
      console.warn("API update failed, updating locally", e);
    }

    const current = await this.getOrderById(trimmedId);
    if (!current) throw new Error("Order not found");

    const now = new Date().toISOString();
    const updated: Order = {
      ...current,
      status,
      updatedAt: now,
      timeline: [
        {
          id: `tl-status-${Date.now()}`,
          status,
          label: `Status Updated to ${status.toUpperCase()}`,
          description: note || `Order transitioned to ${status}`,
          timestamp: now,
          actor: "Enclave Ops",
        },
        ...current.timeline,
      ],
    };

    saveLocalOrder(updated);
    notifyStatus(updated);
    return updated;
  },
};

export default orderService;
