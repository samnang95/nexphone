import { Router, type Request, type Response } from "express";
import { OrderRecord, ordersStore } from "./orders.data";

export const ordersRouter = Router();

// Orders List with Filtering
ordersRouter.get("/api/orders", (req: Request, res: Response) => {
  const { search, status, paymentStatus } = req.query;
  let result = [...ordersStore];

  if (status && typeof status === "string" && status !== "all") {
    result = result.filter((o) => o.status === status);
  }

  if (paymentStatus && typeof paymentStatus === "string" && paymentStatus !== "all") {
    result = result.filter((o) => o.payment.status === paymentStatus);
  }

  if (search && typeof search === "string" && search.trim() !== "") {
    const q = search.toLowerCase().trim();
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

  // Sort descending by creation date
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(result);
});

// Create New Order
ordersRouter.post("/api/orders", (req: Request, res: Response) => {
  const body = req.body || {};
  const orderNumber = `NX-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder = {
    id: orderNumber,
    orderNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "processing",
    customer: body.customer || {
      name: "Enclave Customer",
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
    items: body.items || [],
    subtotal: body.subtotal || 0,
    discount: body.discount || 0,
    shippingFee: body.shippingFee || 0,
    tax: body.tax || 0,
    total: body.total || 0,
    payment: body.payment || {
      method: "credit_card",
      status: "paid",
      transactionId: `TXN-${Date.now()}`,
    },
    shipping: body.shipping || {
      carrier: "NexExpress Armored Courier",
      trackingNumber: `NX-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      estimatedDelivery: "2-3 Business Days",
    },
    timeline: [
      {
        id: `tl-${Date.now()}`,
        status: "processing",
        label: "Encrypted Order Placed",
        description: "Order received and hardware allocation reserved via Secure Enclave",
        timestamp: new Date().toISOString(),
        actor: "System",
      },
    ],
  };

  ordersStore.unshift(newOrder as any);
  res.status(201).json(newOrder);
});

// Single Order Detail
ordersRouter.get("/api/orders/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const order = ordersStore.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    res.status(404).json({ error: "Order not found", id });
    return;
  }
  res.json(order);
});

// Confirm Order
ordersRouter.post("/api/orders/:id/confirm", (req: Request, res: Response) => {
  const { id } = req.params;
  const { performedBy } = req.body || {};
  const index = ordersStore.findIndex((o) => o.id === id || o.orderNumber === id);
  const current = ordersStore[index];

  if (index === -1 || !current) {
    res.status(404).json({ error: "Order not found", id });
    return;
  }

  const now = new Date().toISOString();
  const updated: OrderRecord = {
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

  ordersStore[index] = updated;
  res.json(updated);
});

// Update Order Status (Confirmed -> Processing -> Shipped -> Delivered)
ordersRouter.put("/api/orders/:id/status", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, carrier, trackingNumber, note, performedBy } = req.body || {};
  const index = ordersStore.findIndex((o) => o.id === id || o.orderNumber === id);
  const current = ordersStore[index];

  if (index === -1 || !current) {
    res.status(404).json({ error: "Order not found", id });
    return;
  }

  const now = new Date().toISOString();
  const updatedShipping = {
    ...current.shipping,
    ...(carrier ? { carrier } : {}),
    ...(trackingNumber ? { trackingNumber, trackingUrl: `https://www.google.com/search?q=${encodeURIComponent(trackingNumber)}` } : {}),
    ...(status === "shipped" && !current.shipping.shippedAt ? { shippedAt: now } : {}),
    ...(status === "delivered" && !current.shipping.deliveredAt ? { deliveredAt: now, estimatedDelivery: "Delivered" } : {}),
  };

  const statusLabels: Record<string, string> = {
    confirmed: "Order Confirmed",
    processing: "Processing & Warehousing",
    shipped: "Shipped & Dispatched",
    delivered: "Delivered to Customer",
    cancelled: "Order Cancelled",
  };

  const updated: OrderRecord = {
    ...current,
    status,
    shipping: updatedShipping,
    updatedAt: now,
    timeline: [
      {
        id: `tl-${Date.now().toString(36)}`,
        status,
        label: statusLabels[status] || `Status updated to ${status}`,
        description: note || (trackingNumber ? `Shipment tracking assigned: ${trackingNumber} (${carrier || "Carrier"})` : `Order status transitioned to ${status}`),
        timestamp: now,
        actor: performedBy || "Operations Team",
      },
      ...current.timeline,
    ],
  };

  ordersStore[index] = updated;
  res.json(updated);
});

// Cancel Order
ordersRouter.post("/api/orders/:id/cancel", (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason, note, refundPayment, performedBy } = req.body || {};
  const index = ordersStore.findIndex((o) => o.id === id || o.orderNumber === id);
  const current = ordersStore[index];

  if (index === -1 || !current) {
    res.status(404).json({ error: "Order not found", id });
    return;
  }

  const now = new Date().toISOString();
  const newPaymentStatus = refundPayment || current.payment.status === "paid" ? "refunded" : current.payment.status;

  const updated: OrderRecord = {
    ...current,
    status: "cancelled",
    cancelReason: reason || "Administrative cancellation",
    updatedAt: now,
    payment: {
      ...current.payment,
      status: newPaymentStatus,
      transactionId: newPaymentStatus === "refunded" ? `REF-${Date.now().toString(36).toUpperCase()}` : current.payment.transactionId,
    },
    timeline: [
      {
        id: `tl-${Date.now().toString(36)}`,
        status: "cancelled",
        label: "Order Cancelled",
        description: `Reason: ${reason || "Cancelled by admin"}${note ? ` • Note: ${note}` : ""}${newPaymentStatus === "refunded" ? " • Payment marked as refunded" : ""}`,
        timestamp: now,
        actor: performedBy || "Admin Staff",
      },
      ...current.timeline,
    ],
  };

  ordersStore[index] = updated;
  res.json(updated);
});

// Order Summary Metrics
ordersRouter.get("/api/orders-metrics", (_req: Request, res: Response) => {
  const totalOrders = ordersStore.length;
  const pendingOrders = ordersStore.filter((o) => o.status === "pending").length;
  const confirmedOrders = ordersStore.filter((o) => o.status === "confirmed").length;
  const processingOrders = ordersStore.filter((o) => o.status === "processing").length;
  const shippedOrders = ordersStore.filter((o) => o.status === "shipped").length;
  const deliveredOrders = ordersStore.filter((o) => o.status === "delivered").length;
  const cancelledOrders = ordersStore.filter((o) => o.status === "cancelled").length;
  const totalRevenue = ordersStore
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / (totalOrders - cancelledOrders || 1) : 0;
  const paidOrdersCount = ordersStore.filter((o) => o.payment.status === "paid").length;
  const pendingPaymentCount = ordersStore.filter((o) => o.payment.status === "pending").length;

  res.json({
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
  });
});
