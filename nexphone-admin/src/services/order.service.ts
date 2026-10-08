import type {
  Order,
  OrderMetrics,
  OrderStatus,
  PaymentStatus,
  UpdateOrderStatusPayload,
  CancelOrderPayload,
} from "@/types/order";
import { appConfig } from "@/config/env";

// Fallback in-memory dataset to ensure zero-downtime offline resilience
const FALLBACK_ORDERS: Order[] = [
  {
    id: "NX-ORD-9042",
    orderNumber: "NX-ORD-9042",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    status: "delivered",
    customer: {
      id: "cust-001",
      name: "Alex Vance",
      email: "a.vance@blackmesa.io",
      phone: "+1 (206) 555-0194",
      company: "Black Mesa Aerospace",
      shippingAddress: {
        street: "742 Evergreen Terrace",
        city: "Seattle",
        state: "WA",
        zipCode: "98101",
        country: "United States",
      },
    },
    items: [
      {
        id: "item-001",
        productId: "prod-001",
        productName: "NexPhone Pro Max X",
        sku: "NX-PRO-MAX-512-SG",
        variantCapacity: "512GB",
        variantRam: "16GB LPDDR5X",
        colorName: "Titanium Space Gray",
        colorHex: "#2b2d42",
        quantity: 1,
        unitPrice: 1299,
        totalPrice: 1299,
      },
    ],
    subtotal: 1299,
    tax: 110.42,
    shippingFee: 0,
    discount: 0,
    totalAmount: 1409.42,
    payment: {
      status: "paid",
      method: "stripe",
      methodLabel: "Stripe •••• 4242",
      transactionId: "ch_3MvY8k2eZvKYlo2C192",
      paidAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
      amount: 1409.42,
      currency: "USD",
    },
    shipping: {
      carrier: "FedEx",
      service: "FedEx Priority Overnight",
      trackingNumber: "TRK-9821-4821",
      trackingUrl: "https://fedex.com/track?trk=TRK-9821-4821",
      estimatedDelivery: "Delivered",
      shippedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      deliveredAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    timeline: [
      {
        id: "tl-01",
        status: "pending",
        label: "Order Placed",
        description: "Customer completed checkout via NexPhone Web Store",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        actor: "System",
      },
      {
        id: "tl-02",
        status: "confirmed",
        label: "Payment Verified",
        description: "Payment confirmed via Stripe Gateway",
        timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        actor: "Stripe Gateway",
      },
      {
        id: "tl-03",
        status: "processing",
        label: "Allocated at US-West Hub",
        description: "Order batched for dispatch at SFO Central Hub",
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        actor: "Warehouse Dispatch",
      },
      {
        id: "tl-04",
        status: "delivered",
        label: "Delivered & Signed",
        description: "Package received and signed by recipient",
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        actor: "FedEx Courier",
      },
    ],
  },
  {
    id: "NX-ORD-9041",
    orderNumber: "NX-ORD-9041",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "processing",
    customer: {
      id: "cust-002",
      name: "Sophia Tanaka",
      email: "s.tanaka@cyberdyne.co.jp",
      phone: "+81 3 5555 0188",
      company: "Cyberdyne Systems Tokyo",
      shippingAddress: {
        street: "2-11-3 Roppongi Hills Mori Tower",
        city: "Minato-ku",
        state: "Tokyo",
        zipCode: "106-6108",
        country: "Japan",
      },
    },
    items: [
      {
        id: "item-002",
        productId: "prod-002",
        productName: "NexPhone Enterprise Edge Fleet Pack",
        sku: "NX-ENT-EDGE-5PK",
        variantCapacity: "256GB ECC",
        variantRam: "16GB RAM",
        colorName: "Obsidian Black",
        colorHex: "#0f172a",
        quantity: 5,
        unitPrice: 1099,
        totalPrice: 5495,
      },
    ],
    subtotal: 5495,
    tax: 439.6,
    shippingFee: 150,
    discount: 250,
    totalAmount: 5834.6,
    payment: {
      status: "paid",
      method: "corporate_wire",
      methodLabel: "Corporate Wire Transfer",
      transactionId: "WIRE-JP-901844",
      paidAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      amount: 5834.6,
      currency: "USD",
    },
    shipping: {
      carrier: "DHL",
      service: "DHL Global Express Worldwide",
      trackingNumber: "DHL-8419-0021",
      trackingUrl: "https://dhl.com/track?id=DHL-8419-0021",
      estimatedDelivery: "2 Business Days",
    },
    timeline: [
      {
        id: "tl-11",
        status: "pending",
        label: "Purchase Order Initiated",
        description: "Enterprise bulk order received for 5 hardware units",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        actor: "Enterprise Portal",
      },
      {
        id: "tl-12",
        status: "confirmed",
        label: "Wire Cleared",
        description: "Corporate treasury confirmed receipt of funds",
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        actor: "Finance Ops",
      },
      {
        id: "tl-13",
        status: "processing",
        label: "Custom Hardware Provisioning",
        description: "Flashing custom enterprise cryptographic certificates",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        actor: "APAC Tech Ops",
      },
    ],
  },
  {
    id: "NX-ORD-9040",
    orderNumber: "NX-ORD-9040",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    status: "shipped",
    customer: {
      id: "cust-003",
      name: "Marcus Sterling",
      email: "m.sterling@acmeholdings.com",
      phone: "+44 20 7946 0912",
      company: "Acme Capital Holdings",
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
        id: "item-003",
        productId: "prod-001",
        productName: "NexPhone Pro Max X",
        sku: "NX-PRO-MAX-256-SL",
        variantCapacity: "256GB",
        variantRam: "12GB LPDDR5X",
        colorName: "Silver Frost",
        colorHex: "#e2e8f0",
        quantity: 2,
        unitPrice: 1099,
        totalPrice: 2198,
      },
    ],
    subtotal: 2198,
    tax: 439.6,
    shippingFee: 45,
    discount: 0,
    totalAmount: 2682.6,
    payment: {
      status: "paid",
      method: "apple_pay",
      methodLabel: "Apple Pay (Mastercard •••• 9102)",
      transactionId: "AP-MC-0029318",
      paidAt: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
      amount: 2682.6,
      currency: "USD",
    },
    shipping: {
      carrier: "UPS",
      service: "UPS Worldwide Saver",
      trackingNumber: "TRK-4412-9901",
      trackingUrl: "https://ups.com/track?id=TRK-4412-9901",
      estimatedDelivery: "Tomorrow by 12:00 PM",
      shippedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    timeline: [
      {
        id: "tl-21",
        status: "pending",
        label: "Order Created",
        description: "Customer purchased 2 units of NexPhone Pro Max X",
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        actor: "System",
      },
      {
        id: "tl-22",
        status: "confirmed",
        label: "Order Approved",
        description: "Payment verified via Apple Pay",
        timestamp: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
        actor: "System Admin",
      },
      {
        id: "tl-23",
        status: "shipped",
        label: "In Transit with Carrier",
        description: "Parcel dispatched from Frankfurt Central Hub",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        actor: "UPS Courier",
      },
    ],
  },
  {
    id: "NX-ORD-9039",
    orderNumber: "NX-ORD-9039",
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: "delivered",
    customer: {
      id: "cust-004",
      name: "Elena Rostova",
      email: "e.rostova@berlin-tech.de",
      phone: "+49 30 89012345",
      company: "Berlin Quantum Labs",
      shippingAddress: {
        street: "Friedrichstraße 180",
        city: "Berlin",
        state: "Berlin",
        zipCode: "10117",
        country: "Germany",
      },
    },
    items: [
      {
        id: "item-004",
        productId: "prod-004",
        productName: "NexPhone Lite",
        sku: "NX-LITE-128-MB",
        variantCapacity: "128GB",
        variantRam: "8GB LPDDR5",
        colorName: "Midnight Blue",
        colorHex: "#1e3a8a",
        quantity: 1,
        unitPrice: 599,
        totalPrice: 599,
      },
    ],
    subtotal: 599,
    tax: 113.81,
    shippingFee: 0,
    discount: 0,
    totalAmount: 712.81,
    payment: {
      status: "paid",
      method: "stripe",
      methodLabel: "Stripe •••• 8821",
      transactionId: "ch_3NzK81992",
      paidAt: new Date(Date.now() - 1000 * 60 * 295).toISOString(),
      amount: 712.81,
      currency: "USD",
    },
    shipping: {
      carrier: "DHL",
      service: "DHL Express Domestic",
      trackingNumber: "TRK-1209-7712",
      trackingUrl: "https://dhl.com/track?id=TRK-1209-7712",
      estimatedDelivery: "Delivered",
      shippedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      deliveredAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    timeline: [
      {
        id: "tl-31",
        status: "pending",
        label: "Order Received",
        description: "Retail checkout completed",
        timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        actor: "System",
      },
      {
        id: "tl-32",
        status: "delivered",
        label: "Delivered",
        description: "Handed over to customer",
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        actor: "DHL Courier",
      },
    ],
  },
  {
    id: "NX-ORD-9038",
    orderNumber: "NX-ORD-9038",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: "pending",
    customer: {
      id: "cust-005",
      name: "David Chen",
      email: "d.chen@apexvoip.sg",
      phone: "+65 6789 0123",
      company: "Apex Telecom Singapore",
      shippingAddress: {
        street: "10 Marina Boulevard, Marina Bay Financial Centre",
        city: "Singapore",
        state: "Central",
        zipCode: "018983",
        country: "Singapore",
      },
    },
    items: [
      {
        id: "item-005",
        productId: "prod-003",
        productName: "NexPhone Enterprise Desk Base Station",
        sku: "NX-DESK-BASE-V2",
        variantCapacity: "Standard Edition",
        variantRam: "Gigabit PoE+",
        colorName: "Matte Slate",
        colorHex: "#334155",
        quantity: 3,
        unitPrice: 499,
        totalPrice: 1497,
      },
    ],
    subtotal: 1497,
    tax: 119.76,
    shippingFee: 65,
    discount: 0,
    totalAmount: 1681.76,
    payment: {
      status: "pending",
      method: "purchase_order",
      methodLabel: "Purchase Order #8812 (Net 30)",
      transactionId: "PO-8812-PENDING",
      amount: 1681.76,
      currency: "USD",
    },
    shipping: {
      carrier: "SingPost",
      service: "Speedpost Priority International",
      estimatedDelivery: "Pending Dispatch",
    },
    timeline: [
      {
        id: "tl-41",
        status: "pending",
        label: "Awaiting Admin Confirmation",
        description: "Enterprise purchase order submitted. Requires account verification.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
        actor: "System",
      },
    ],
    notes: "Customer requested commercial invoice sent to accounts@apexvoip.sg",
  },
  {
    id: "NX-ORD-9037",
    orderNumber: "NX-ORD-9037",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    status: "confirmed",
    customer: {
      id: "cust-006",
      name: "Sarah Connor",
      email: "s.connor@skyfleet.org",
      phone: "+1 (512) 555-0812",
      company: "Skyfleet Research",
      shippingAddress: {
        street: "8800 Technology Blvd",
        city: "Austin",
        state: "TX",
        zipCode: "78759",
        country: "United States",
      },
    },
    items: [
      {
        id: "item-006",
        productId: "prod-001",
        productName: "NexPhone Pro Max X",
        sku: "NX-PRO-MAX-1TB-TI",
        variantCapacity: "1TB",
        variantRam: "16GB LPDDR5X",
        colorName: "Titanium Gold",
        colorHex: "#d4af37",
        quantity: 1,
        unitPrice: 1499,
        totalPrice: 1499,
      },
    ],
    subtotal: 1499,
    tax: 123.67,
    shippingFee: 0,
    discount: 0,
    totalAmount: 1622.67,
    payment: {
      status: "paid",
      method: "stripe",
      methodLabel: "Stripe •••• 9011",
      transactionId: "ch_3Klo881023",
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 17).toISOString(),
      amount: 1622.67,
      currency: "USD",
    },
    shipping: {
      carrier: "FedEx",
      service: "FedEx Standard Overnight",
      estimatedDelivery: "Tomorrow",
    },
    timeline: [
      {
        id: "tl-51",
        status: "pending",
        label: "Order Created",
        description: "Customer ordered 1TB Flagship Titanium",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        actor: "System",
      },
      {
        id: "tl-52",
        status: "confirmed",
        label: "Confirmed by Logistics",
        description: "Stock allocated from Fremont Hub, pending packing",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
        actor: "Logistics Admin",
      },
    ],
  },
  {
    id: "NX-ORD-9036",
    orderNumber: "NX-ORD-9036",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    status: "cancelled",
    cancelReason: "Customer requested cancellation prior to packaging",
    customer: {
      id: "cust-007",
      name: "Robert Thorne",
      email: "r.thorne@thornegroup.ca",
      phone: "+1 (416) 555-0391",
      company: "The Thorne Financial Group",
      shippingAddress: {
        street: "100 King Street West",
        city: "Toronto",
        state: "ON",
        zipCode: "M5X 1A9",
        country: "Canada",
      },
    },
    items: [
      {
        id: "item-007",
        productId: "prod-003",
        productName: "NexPhone Titanium Fold",
        sku: "NX-FOLD-512-TI",
        variantCapacity: "512GB",
        variantRam: "16GB LPDDR5X",
        colorName: "Titanium Shadow",
        colorHex: "#1e293b",
        quantity: 1,
        unitPrice: 1999,
        totalPrice: 1999,
      },
    ],
    subtotal: 1999,
    tax: 259.87,
    shippingFee: 40,
    discount: 100,
    totalAmount: 2198.87,
    payment: {
      status: "refunded",
      method: "credit_card",
      methodLabel: "Mastercard •••• 5519",
      transactionId: "TXN-REFUNDED-0912",
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
      amount: 2198.87,
      currency: "USD",
    },
    shipping: {
      carrier: "Canada Post",
      service: "Xpresspost International",
    },
    timeline: [
      {
        id: "tl-61",
        status: "pending",
        label: "Order Placed",
        description: "Foldable flagship ordered with priority courier",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
        actor: "System",
      },
      {
        id: "tl-62",
        status: "cancelled",
        label: "Order Cancelled & Refunded",
        description: "Customer requested cancellation; full refund processed.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        actor: "Support Staff (Emma L.)",
      },
    ],
  },
  {
    id: "NX-ORD-9035",
    orderNumber: "NX-ORD-9035",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    status: "pending",
    customer: {
      id: "cust-008",
      name: "Liam O'Connor",
      email: "liam.oc@dublin-iot.ie",
      phone: "+353 1 496 0192",
      company: "Dublin IoT Innovations",
      shippingAddress: {
        street: "Grand Canal Square, Docklands",
        city: "Dublin",
        state: "Leinster",
        zipCode: "D02 P820",
        country: "Ireland",
      },
    },
    items: [
      {
        id: "item-008",
        productId: "prod-001",
        productName: "NexPhone Pro Max X",
        sku: "NX-PRO-MAX-256-SG",
        variantCapacity: "256GB",
        variantRam: "12GB LPDDR5X",
        colorName: "Titanium Space Gray",
        colorHex: "#2b2d42",
        quantity: 1,
        unitPrice: 1199,
        totalPrice: 1199,
      },
    ],
    subtotal: 1199,
    tax: 275.77,
    shippingFee: 25,
    discount: 0,
    totalAmount: 1499.77,
    payment: {
      status: "pending",
      method: "corporate_wire",
      methodLabel: "Bank Wire (IBAN IE29...)",
      amount: 1499.77,
      currency: "EUR",
    },
    shipping: {
      carrier: "An Post",
      service: "Express Tracked International",
      estimatedDelivery: "Pending Confirmation",
    },
    timeline: [
      {
        id: "tl-71",
        status: "pending",
        label: "Awaiting Confirmation",
        description: "New enterprise order pending payment review",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        actor: "System",
      },
    ],
  },
  {
    id: "NX-ORD-9034",
    orderNumber: "NX-ORD-9034",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "shipped",
    customer: {
      id: "cust-009",
      name: "Chloe Dubois",
      email: "c.dubois@paristech.fr",
      phone: "+33 1 42 68 55 00",
      company: "Paris Cloud Services",
      shippingAddress: {
        street: "14 Rue Royale",
        city: "Paris",
        state: "Île-de-France",
        zipCode: "75008",
        country: "France",
      },
    },
    items: [
      {
        id: "item-009",
        productId: "prod-002",
        productName: "NexPhone Enterprise Secure",
        sku: "NX-ENT-SEC-512",
        variantCapacity: "512GB",
        variantRam: "16GB ECC",
        colorName: "Graphite",
        colorHex: "#1e293b",
        quantity: 1,
        unitPrice: 1399,
        totalPrice: 1399,
      },
    ],
    subtotal: 1399,
    tax: 279.8,
    shippingFee: 0,
    discount: 0,
    totalAmount: 1678.8,
    payment: {
      status: "paid",
      method: "stripe",
      methodLabel: "Visa •••• 1049",
      transactionId: "ch_3Pla9912093",
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
      amount: 1678.8,
      currency: "EUR",
    },
    shipping: {
      carrier: "Chronopost",
      service: "Chronopost 13 Express",
      trackingNumber: "CP-9901-8841-FR",
      trackingUrl: "https://chronopost.fr/tracking?id=CP-9901-8841-FR",
      estimatedDelivery: "In Transit",
      shippedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    timeline: [
      {
        id: "tl-81",
        status: "pending",
        label: "Order Placed",
        description: "Enterprise Secure device purchase",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        actor: "System",
      },
      {
        id: "tl-82",
        status: "shipped",
        label: "Dispatched from EU Central Hub",
        description: "Parcel in transit with Chronopost",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        actor: "Logistics Hub (FRA)",
      },
    ],
  },
];

let localOrdersCache: Order[] = [...FALLBACK_ORDERS];

export interface OrderFilterParams {
  readonly search?: string;
  readonly status?: "all" | OrderStatus;
  readonly paymentStatus?: "all" | PaymentStatus;
}

class OrderService {
  /**
   * Fetch all orders with optional server-side filtering
   */
  async fetchOrders(filters?: OrderFilterParams): Promise<Order[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status && filters.status !== "all") params.append("status", filters.status);
      if (filters?.paymentStatus && filters.paymentStatus !== "all") {
        params.append("paymentStatus", filters.paymentStatus);
      }

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`${appConfig.apiUrl}/orders${queryString}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch orders: ${res.statusText}`);
      }

      const data: Order[] = await res.json();
      localOrdersCache = data;
      return data;
    } catch {
      // Offline fallback: filter local cache
      return this.applyLocalFilters(localOrdersCache, filters);
    }
  }

  /**
   * Fetch a single order by ID
   */
  async fetchOrderById(id: string): Promise<Order | null> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/orders/${encodeURIComponent(id)}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Order ${id} not found`);
      }

      return (await res.json()) as Order;
    } catch {
      return localOrdersCache.find((o) => o.id === id || o.orderNumber === id) ?? null;
    }
  }

  /**
   * Confirm a pending order
   */
  async confirmOrder(id: string, performedBy?: string): Promise<Order> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/orders/${encodeURIComponent(id)}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ performedBy }),
      });

      if (!res.ok) {
        throw new Error(`Failed to confirm order ${id}`);
      }

      const updated: Order = await res.json();
      localOrdersCache = localOrdersCache.map((o) => (o.id === updated.id ? updated : o));
      return updated;
    } catch {
      // Fallback local update
      const now = new Date().toISOString();
      const current = localOrdersCache.find((o) => o.id === id);
      if (!current) throw new Error("Order not found");

      const updated: Order = {
        ...current,
        status: "confirmed",
        updatedAt: now,
        timeline: [
          {
            id: `tl-${Date.now().toString(36)}`,
            status: "confirmed",
            label: "Order Confirmed",
            description: "Order confirmed by administration. Stock reserved for fulfillment.",
            timestamp: now,
            actor: performedBy || "System Admin",
          },
          ...current.timeline,
        ],
      };

      localOrdersCache = localOrdersCache.map((o) => (o.id === id ? updated : o));
      return updated;
    }
  }

  /**
   * Update order lifecycle status (Processing, Shipped, Delivered)
   */
  async updateOrderStatus(id: string, payload: UpdateOrderStatusPayload): Promise<Order> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/orders/${encodeURIComponent(id)}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to update status for order ${id}`);
      }

      const updated: Order = await res.json();
      localOrdersCache = localOrdersCache.map((o) => (o.id === updated.id ? updated : o));
      return updated;
    } catch {
      // Fallback local update
      const now = new Date().toISOString();
      const current = localOrdersCache.find((o) => o.id === id);
      if (!current) throw new Error("Order not found");

      const statusLabels: Record<string, string> = {
        confirmed: "Order Confirmed",
        processing: "Processing & Warehousing",
        shipped: "Shipped & Dispatched",
        delivered: "Delivered to Customer",
        cancelled: "Order Cancelled",
      };

      const updated: Order = {
        ...current,
        status: payload.status,
        shipping: {
          ...current.shipping,
          ...(payload.carrier ? { carrier: payload.carrier } : {}),
          ...(payload.trackingNumber
            ? {
                trackingNumber: payload.trackingNumber,
                trackingUrl: `https://www.google.com/search?q=${encodeURIComponent(payload.trackingNumber)}`,
              }
            : {}),
          ...(payload.status === "shipped" && !current.shipping.shippedAt ? { shippedAt: now } : {}),
          ...(payload.status === "delivered" && !current.shipping.deliveredAt
            ? { deliveredAt: now, estimatedDelivery: "Delivered" }
            : {}),
        },
        updatedAt: now,
        timeline: [
          {
            id: `tl-${Date.now().toString(36)}`,
            status: payload.status,
            label: statusLabels[payload.status] || `Status updated to ${payload.status}`,
            description:
              payload.note ||
              (payload.trackingNumber
                ? `Tracking assigned: ${payload.trackingNumber} (${payload.carrier || "Courier"})`
                : `Order moved to ${payload.status}`),
            timestamp: now,
            actor: payload.performedBy || "Operations Team",
          },
          ...current.timeline,
        ],
      };

      localOrdersCache = localOrdersCache.map((o) => (o.id === id ? updated : o));
      return updated;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(id: string, payload: CancelOrderPayload): Promise<Order> {
    try {
      const res = await fetch(`${appConfig.apiUrl}/orders/${encodeURIComponent(id)}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to cancel order ${id}`);
      }

      const updated: Order = await res.json();
      localOrdersCache = localOrdersCache.map((o) => (o.id === updated.id ? updated : o));
      return updated;
    } catch {
      // Fallback local cancel
      const now = new Date().toISOString();
      const current = localOrdersCache.find((o) => o.id === id);
      if (!current) throw new Error("Order not found");

      const newPaymentStatus =
        payload.refundPayment || current.payment.status === "paid" ? "refunded" : current.payment.status;

      const updated: Order = {
        ...current,
        status: "cancelled",
        cancelReason: payload.reason,
        updatedAt: now,
        payment: {
          ...current.payment,
          status: newPaymentStatus,
          transactionId:
            newPaymentStatus === "refunded"
              ? `REF-${Date.now().toString(36).toUpperCase()}`
              : current.payment.transactionId,
        },
        timeline: [
          {
            id: `tl-${Date.now().toString(36)}`,
            status: "cancelled",
            label: "Order Cancelled",
            description: `Reason: ${payload.reason}${payload.note ? ` • Note: ${payload.note}` : ""}${
              newPaymentStatus === "refunded" ? " • Payment refunded" : ""
            }`,
            timestamp: now,
            actor: payload.performedBy || "Admin Staff",
          },
          ...current.timeline,
        ],
      };

      localOrdersCache = localOrdersCache.map((o) => (o.id === id ? updated : o));
      return updated;
    }
  }

  /**
   * Filter orders locally in memory
   */
  applyLocalFilters(orders: readonly Order[], filters?: OrderFilterParams): Order[] {
    let result = [...orders];

    if (filters?.status && filters.status !== "all") {
      result = result.filter((o) => o.status === filters.status);
    }

    if (filters?.paymentStatus && filters.paymentStatus !== "all") {
      result = result.filter((o) => o.payment.status === filters.paymentStatus);
    }

    if (filters?.search && filters.search.trim() !== "") {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.customer.shippingAddress.country.toLowerCase().includes(q) ||
          o.items.some(
            (item) => item.productName.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q)
          )
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Calculate aggregated KPIs
   */
  calculateMetrics(orders: readonly Order[]): OrderMetrics {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const confirmedOrders = orders.filter((o) => o.status === "confirmed").length;
    const processingOrders = orders.filter((o) => o.status === "processing").length;
    const shippedOrders = orders.filter((o) => o.status === "shipped").length;
    const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
    const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const activeCount = totalOrders - cancelledOrders;
    const avgOrderValue = activeCount > 0 ? totalRevenue / activeCount : 0;
    const paidOrdersCount = orders.filter((o) => o.payment.status === "paid").length;
    const pendingPaymentCount = orders.filter((o) => o.payment.status === "pending").length;

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      avgOrderValue,
      paidOrdersCount,
      pendingPaymentCount,
    };
  }
}

export const orderService = new OrderService();
