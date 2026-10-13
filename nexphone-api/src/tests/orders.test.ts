import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";

describe("Order API", () => {
  const customerEmail = "dr.vance@blackmesa-research.gov";
  const sampleCustomer = {
    name: "Dr. Alexander Vance",
    email: customerEmail,
    phone: "+1 (555) 019-2834",
    shippingAddress: {
      street: "1 Infinite Loop, Suite 400",
      city: "Cupertino",
      state: "CA",
      zipCode: "95014",
      country: "United States",
    },
  };

  const sampleItems = [
    {
      productId: "prod-001",
      productName: "NexPhone Pro Max X",
      sku: "NX-PRO-256",
      variantCapacity: "256GB",
      variantRam: "12GB LPDDR5X",
      colorName: "Titanium Space Gray",
      colorHex: "#4A4D52",
      quantity: 1,
      unitPrice: 1199,
    },
  ];

  let testOrderId: string;
  let testOrderNumber: string;

  // ==========================================
  // 1. Create Order
  // ==========================================
  describe("1. Create Order", () => {
    it("POST /api/orders creates a new customer order", async () => {
      const res = await request(app)
        .post("/api/orders")
        .send({
          customer: sampleCustomer,
          items: sampleItems,
          shippingMethod: "standard",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("orderNumber");
      expect(res.body.status).toBe("pending");
      expect(res.body.subtotal).toBe(1199);
      expect(res.body.customer.email).toBe(customerEmail);
      expect(res.body.items).toHaveLength(1);

      testOrderId = res.body.id;
      testOrderNumber = res.body.orderNumber;
    });

    it("returns 400 when customer contact details are missing", async () => {
      const res = await request(app)
        .post("/api/orders")
        .send({
          customer: {
            name: "Incomplete User",
            // missing email, phone, shippingAddress
          },
          items: sampleItems,
        });

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // 2. Get My Orders
  // ==========================================
  describe("2. Get My Orders", () => {
    it("GET /api/orders/my-orders returns customer order history by email", async () => {
      const res = await request(app)
        .get(`/api/orders/my-orders?email=${encodeURIComponent(customerEmail)}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("orders");
      expect(Array.isArray(res.body.orders)).toBe(true);
      expect(res.body.orders.length).toBeGreaterThan(0);
      expect(res.body.orders.some((o: any) => o.orderNumber === testOrderNumber)).toBe(true);
    });

    it("returns 401 when neither auth token nor customer email is provided", async () => {
      const res = await request(app).get("/api/orders/my-orders");
      expect(res.status).toBe(401);
    });
  });

  // ==========================================
  // 3. Get Order Details
  // ==========================================
  describe("3. Get Order Details", () => {
    it("GET /api/orders/:id returns full order details by orderNumber", async () => {
      const res = await request(app).get(`/api/orders/${testOrderNumber}`);
      expect(res.status).toBe(200);
      expect(res.body.orderNumber).toBe(testOrderNumber);
      expect(res.body.customer.name).toBe("Dr. Alexander Vance");
      expect(res.body.items).toHaveLength(1);
      expect(res.body.payment).toBeDefined();
      expect(res.body.timeline.length).toBeGreaterThan(0);
    });

    it("returns 404 for unknown order identifier", async () => {
      const res = await request(app).get("/api/orders/UNKNOWN-ORD-9999");
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/order not found/i);
    });
  });

  // ==========================================
  // 4. Track Order Status
  // ==========================================
  describe("4. Track Order Status", () => {
    it("GET /api/orders/:id/track returns shipping & milestone tracking timeline", async () => {
      const res = await request(app).get(`/api/orders/${testOrderNumber}/track`);
      expect(res.status).toBe(200);
      expect(res.body.orderNumber).toBe(testOrderNumber);
      expect(res.body.carrier).toBeDefined();
      expect(res.body.currentStage).toBeDefined();
      expect(Array.isArray(res.body.timeline)).toBe(true);
    });

    it("supports route alias GET /api/orders/track/:orderNumber", async () => {
      const res = await request(app).get(`/api/orders/track/${testOrderNumber}`);
      expect(res.status).toBe(200);
      expect(res.body.orderNumber).toBe(testOrderNumber);
    });
  });

  // ==========================================
  // 5. Confirm / Reject Order (Admin)
  // ==========================================
  describe("5. Confirm / Reject Order (Admin)", () => {
    it("POST /api/orders/:id/confirm confirms order allocation", async () => {
      const res = await request(app)
        .post(`/api/orders/${testOrderNumber}/confirm`)
        .send({ note: "Stock verified and allocated" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("confirmed");
    });

    it("POST /api/orders/:id/decision with reject action rejects order", async () => {
      // 1. Create fresh order to reject
      const createRes = await request(app)
        .post("/api/orders")
        .send({
          customer: sampleCustomer,
          items: sampleItems,
        });
      const ordNum = createRes.body.orderNumber;

      // 2. Reject it
      const res = await request(app)
        .post(`/api/orders/${ordNum}/decision`)
        .send({
          action: "reject",
          reason: "Compliance export restriction",
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("cancelled");
      expect(res.body.cancelReason).toBe("Compliance export restriction");
    });
  });

  // ==========================================
  // 6. Update Order Status (Admin)
  // ==========================================
  describe("6. Update Order Status (Admin)", () => {
    it("PUT /api/orders/:id/status updates status to shipped with tracking number", async () => {
      const trackingNumber = "NX-TRK-99887766";
      const res = await request(app)
        .put(`/api/orders/${testOrderNumber}/status`)
        .send({
          status: "shipped",
          carrier: "NexExpress Armored Courier",
          trackingNumber,
          note: "Armored transport dispatched from security depot",
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("shipped");
      expect(res.body.shipping.trackingNumber).toBe(trackingNumber);
      expect(res.body.shipping.shippedAt).toBeDefined();
    });

    it("PUT /api/orders/:id/status updates status to delivered", async () => {
      const res = await request(app)
        .put(`/api/orders/${testOrderNumber}/status`)
        .send({
          status: "delivered",
          note: "Biometric signature collected at consignee address",
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("delivered");
      expect(res.body.shipping.deliveredAt).toBeDefined();
    });
  });

  // ==========================================
  // 7. Cancel Order
  // ==========================================
  describe("7. Cancel Order", () => {
    it("returns 400 when attempting to cancel an order already delivered", async () => {
      const res = await request(app)
        .post(`/api/orders/${testOrderNumber}/cancel`)
        .send({ reason: "Changed my mind" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already delivered/i);
    });

    it("cancels a pending order successfully and records cancellation timeline", async () => {
      // 1. Create a cancellable order
      const createRes = await request(app)
        .post("/api/orders")
        .send({
          customer: sampleCustomer,
          items: sampleItems,
        });
      const ordNum = createRes.body.orderNumber;

      // 2. Cancel it
      const res = await request(app)
        .post(`/api/orders/${ordNum}/cancel`)
        .send({
          reason: "Customer ordered duplicate by accident",
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("cancelled");
      expect(res.body.cancelReason).toBe("Customer ordered duplicate by accident");
    });
  });

  // ==========================================
  // 8. Get All Orders & Metrics (Admin)
  // ==========================================
  describe("8. Get All Orders & Metrics", () => {
    it("GET /api/orders returns list of all orders", async () => {
      const res = await request(app).get("/api/orders");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("GET /api/orders supports pagination query parameters", async () => {
      const res = await request(app).get("/api/orders?page=1&limit=5");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("orders");
      expect(res.body).toHaveProperty("total");
      expect(res.body.orders.length).toBeLessThanOrEqual(5);
    });

    it("GET /api/orders-metrics returns aggregate dashboard statistics", async () => {
      const res = await request(app).get("/api/orders-metrics");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalOrders");
      expect(res.body).toHaveProperty("totalRevenue");
      expect(res.body).toHaveProperty("paidOrdersCount");
    });
  });
});
