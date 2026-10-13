import { Order, type OrderDocument, type OrderStatus, type PaymentStatus } from "../models/order.model";
import { OrderRecord, ordersStore } from "../data/orders.data";
import { isDatabaseConnected } from "../config/database";

export interface OrderQueryFilters {
  status?: string;
  paymentStatus?: string;
  search?: string;
  userId?: string;
  customerEmail?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

let seeded = false;
export async function ensureOrdersSeeded(): Promise<void> {
  if (seeded || !isDatabaseConnected()) return;
  try {
    const count = await Order.countDocuments();
    if (count === 0) {
      await Order.insertMany(ordersStore);
      console.log(`📦 [Orders Repo] Auto-seeded ${ordersStore.length} orders to MongoDB.`);
    }
    seeded = true;
  } catch (error) {
    console.warn("⚠️  [Orders Repo] Could not auto-seed orders to MongoDB:", (error as Error).message);
  }
}

export const orderRepository = {
  async find(
    filters: OrderQueryFilters = {},
    pagination?: PaginationOptions
  ): Promise<{ orders: any[]; total: number }> {
    await ensureOrdersSeeded();

    if (isDatabaseConnected()) {
      return this.findMongo(filters, pagination);
    }
    return this.findInMemory(filters, pagination);
  },

  async findByIdOrNumber(idOrNumber: string): Promise<any | null> {
    await ensureOrdersSeeded();
    const clean = idOrNumber.trim();

    if (isDatabaseConnected()) {
      return Order.findOne({
        $or: [{ id: clean }, { orderNumber: clean }],
      }).lean();
    }

    return ordersStore.find((o) => o.id === clean || o.orderNumber === clean) || null;
  },

  async findByTransactionId(transactionId: string): Promise<any | null> {
    await ensureOrdersSeeded();
    const clean = transactionId.trim();

    if (isDatabaseConnected()) {
      return Order.findOne({ "payment.transactionId": clean }).lean();
    }

    return ordersStore.find((o) => o.payment.transactionId === clean) || null;
  },

  async findBySessionId(sessionId: string): Promise<any | null> {
    await ensureOrdersSeeded();
    const clean = sessionId.trim();
    if (isDatabaseConnected()) {
      return Order.findOne({ sessionId: clean }).lean();
    }

    return (ordersStore as any[]).find((o) => o.sessionId === clean) || null;
  },

  async create(orderData: Partial<OrderRecord>): Promise<any> {
    await ensureOrdersSeeded();
    const now = new Date().toISOString();
    const orderNumber = orderData.orderNumber || `NX-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = orderData.id || orderNumber;
    const newRecord: any = {
      ...orderData,
      id,
      orderNumber,
      createdAt: orderData.createdAt || now,
      updatedAt: now,
      status: orderData.status || "pending",
      subtotal: Number(orderData.subtotal) || 0,
      tax: Number(orderData.tax) || 0,
      shippingFee: Number(orderData.shippingFee) || 0,
      discount: Number(orderData.discount) || 0,
      totalAmount: Number(orderData.totalAmount) || 0,
      payment: {
        status: orderData.payment?.status || "pending",
        method: orderData.payment?.method || "credit_card",
        methodLabel: orderData.payment?.methodLabel || "Encrypted Credit Card",
        transactionId: orderData.payment?.transactionId || `TXN-${Date.now()}`,
        amount: Number(orderData.payment?.amount) || Number(orderData.totalAmount) || 0,
        currency: orderData.payment?.currency || "USD",
        ...orderData.payment,
      },
      shipping: {
        carrier: orderData.shipping?.carrier || "NexExpress Armored Courier",
        service: orderData.shipping?.service || "Standard Armored Courier",
        estimatedDelivery: orderData.shipping?.estimatedDelivery || "2-3 Business Days",
        trackingNumber: orderData.shipping?.trackingNumber || `NX-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
        ...orderData.shipping,
      },
      timeline: orderData.timeline || [
        {
          id: `tl-${Date.now().toString(36)}`,
          status: orderData.status || "pending",
          label: "Order Created",
          description: "Customer initialized checkout session",
          timestamp: now,
          actor: "Checkout Gateway",
        },
      ],
    };

    ordersStore.unshift(newRecord);

    if (isDatabaseConnected()) {
      const doc = await Order.create(newRecord);
      return doc.toObject();
    }

    return newRecord;
  },

  async update(idOrNumber: string, updates: Partial<OrderRecord>): Promise<any | null> {
    await ensureOrdersSeeded();
    const clean = idOrNumber.trim();
    const now = new Date().toISOString();

    const inMemoryIndex = ordersStore.findIndex(
      (o) => o.id === clean || o.orderNumber === clean
    );

    let updatedRecord: any = null;
    if (inMemoryIndex !== -1) {
      const current = ordersStore[inMemoryIndex]!;
      updatedRecord = {
        ...current,
        ...updates,
        updatedAt: now,
      };
      ordersStore[inMemoryIndex] = updatedRecord;
    }

    if (isDatabaseConnected()) {
      const doc = await Order.findOneAndUpdate(
        { $or: [{ id: clean }, { orderNumber: clean }] },
        { ...updates, updatedAt: now },
        { new: true, lean: true }
      );
      return doc || updatedRecord;
    }

    return updatedRecord;
  },

  async updatePayment(
    idOrTxn: string,
    paymentUpdates: {
      status: PaymentStatus;
      transactionId?: string;
      paidAt?: string;
      failureReason?: string;
    },
    orderStatus?: OrderStatus,
    timelineEvent?: { label: string; description: string; actor: string }
  ): Promise<any | null> {
    await ensureOrdersSeeded();
    const clean = idOrTxn.trim();
    const now = new Date().toISOString();

    const inMemoryIndex = ordersStore.findIndex(
      (o) => o.id === clean || o.orderNumber === clean || o.payment.transactionId === clean
    );

    let updatedRecord: any = null;
    if (inMemoryIndex !== -1) {
      const current = ordersStore[inMemoryIndex]!;
      const timeline = [...(current.timeline || [])];
      if (timelineEvent) {
        timeline.unshift({
          id: `tl-${Date.now().toString(36)}`,
          status: orderStatus || current.status,
          label: timelineEvent.label,
          description: timelineEvent.description,
          timestamp: now,
          actor: timelineEvent.actor,
        });
      }

      updatedRecord = {
        ...current,
        status: orderStatus || current.status,
        payment: {
          ...current.payment,
          ...paymentUpdates,
        },
        timeline,
        updatedAt: now,
      };
      ordersStore[inMemoryIndex] = updatedRecord;
    }

    if (isDatabaseConnected()) {
      const updateDoc: any = {
        $set: {
          "payment.status": paymentUpdates.status,
          updatedAt: now,
        },
      };
      if (paymentUpdates.transactionId) updateDoc.$set["payment.transactionId"] = paymentUpdates.transactionId;
      if (paymentUpdates.paidAt) updateDoc.$set["payment.paidAt"] = paymentUpdates.paidAt;
      if (paymentUpdates.failureReason) updateDoc.$set["payment.failureReason"] = paymentUpdates.failureReason;
      if (orderStatus) updateDoc.$set.status = orderStatus;

      if (timelineEvent) {
        updateDoc.$push = {
          timeline: {
            $each: [
              {
                id: `tl-${Date.now().toString(36)}`,
                status: orderStatus || "pending",
                label: timelineEvent.label,
                description: timelineEvent.description,
                timestamp: now,
                actor: timelineEvent.actor,
              },
            ],
            $position: 0,
          },
        };
      }

      const doc = await Order.findOneAndUpdate(
        {
          $or: [{ id: clean }, { orderNumber: clean }, { "payment.transactionId": clean }],
        },
        updateDoc,
        { new: true, lean: true }
      );
      return doc || updatedRecord;
    }

    return updatedRecord;
  },

  async getMetrics(): Promise<any> {
    await ensureOrdersSeeded();
    let records: any[] = ordersStore;

    if (isDatabaseConnected()) {
      records = await Order.find({}).lean();
    }

    const totalOrders = records.length;
    const pendingOrders = records.filter((o) => o.status === "pending").length;
    const confirmedOrders = records.filter((o) => o.status === "confirmed").length;
    const processingOrders = records.filter((o) => o.status === "processing").length;
    const shippedOrders = records.filter((o) => o.status === "shipped").length;
    const deliveredOrders = records.filter((o) => o.status === "delivered").length;
    const cancelledOrders = records.filter((o) => o.status === "cancelled").length;
    const totalRevenue = records
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / (totalOrders - cancelledOrders || 1)) : 0;
    const paidOrdersCount = records.filter((o) => o.payment.status === "paid").length;
    const pendingPaymentCount = records.filter((o) => o.payment.status === "pending").length;

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
  },

  // In-memory filter helper
  findInMemory(
    filters: OrderQueryFilters,
    pagination?: PaginationOptions
  ): { orders: any[]; total: number } {
    let result = [...ordersStore];

    if (filters.status && filters.status !== "all") {
      result = result.filter((o) => o.status === filters.status);
    }

    if (filters.paymentStatus && filters.paymentStatus !== "all") {
      result = result.filter((o) => o.payment.status === filters.paymentStatus);
    }

    if (filters.userId) {
      result = result.filter((o: any) => o.userId === filters.userId || o.customer?.id === filters.userId);
    }

    if (filters.customerEmail) {
      result = result.filter((o) => o.customer.email.toLowerCase() === filters.customerEmail!.toLowerCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.customer.shippingAddress.country.toLowerCase().includes(q) ||
          o.items.some(
            (item) =>
              item.productName.toLowerCase().includes(q) ||
              item.sku.toLowerCase().includes(q)
          )
      );
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = result.length;
    if (pagination) {
      const start = (pagination.page - 1) * pagination.limit;
      result = result.slice(start, start + pagination.limit);
    }

    return { orders: result, total };
  },

  async findMongo(
    filters: OrderQueryFilters,
    pagination?: PaginationOptions
  ): Promise<{ orders: OrderDocument[]; total: number }> {
    const query: any = {};

    if (filters.status && filters.status !== "all") query.status = filters.status;
    if (filters.paymentStatus && filters.paymentStatus !== "all") query["payment.status"] = filters.paymentStatus;
    if (filters.userId) {
      query.$or = [{ userId: filters.userId }, { "customer.id": filters.userId }];
    }
    if (filters.customerEmail) {
      query["customer.email"] = new RegExp(`^${filters.customerEmail}$`, "i");
    }

    if (filters.search) {
      const q = filters.search.trim();
      query.$or = [
        { id: { $regex: q, $options: "i" } },
        { orderNumber: { $regex: q, $options: "i" } },
        { "customer.name": { $regex: q, $options: "i" } },
        { "customer.email": { $regex: q, $options: "i" } },
        { "items.productName": { $regex: q, $options: "i" } },
        { "items.sku": { $regex: q, $options: "i" } },
      ];
    }

    const total = await Order.countDocuments(query);
    let q = Order.find(query).sort({ createdAt: -1 });

    if (pagination) {
      q = q.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }

    const orders = await q.lean();
    return { orders: orders as any[], total };
  },
};
