import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";

describe("Checkout & Payment API", () => {
  const sampleAddress = {
    street: "1 Infinite Loop, Suite 400",
    city: "Cupertino",
    state: "CA",
    zipCode: "95014",
    country: "United States",
  };

  const sampleCustomer = {
    name: "Dr. Alexander Vance",
    email: "avance@blackmesa-research.gov",
    phone: "+1 (555) 019-2834",
    company: "Black Mesa Systems",
    shippingAddress: sampleAddress,
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

  // ==========================================
  // 1. Validate Delivery Address
  // ==========================================
  describe("1. Validate Delivery Address", () => {
    it("POST /api/checkout/validate-address verifies domestic delivery address", async () => {
      const res = await request(app)
        .post("/api/checkout/validate-address")
        .send(sampleAddress);

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.deliverable).toBe(true);
      expect(res.body.shippingZone).toBe("domestic");
      expect(res.body.standardizedAddress.city).toBe("Cupertino");
      expect(res.body.standardizedAddress.state).toBe("CA");
      expect(res.body.standardizedAddress.zipCode).toBe("95014");
    });

    it("supports route alias POST /api/checkout/address/validate", async () => {
      const res = await request(app)
        .post("/api/checkout/address/validate")
        .send(sampleAddress);

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
    });

    it("returns 400 when required address components are missing", async () => {
      const res = await request(app)
        .post("/api/checkout/validate-address")
        .send({
          street: "1 Infinite Loop",
          // missing city, state, zipCode
        });

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // 2. Calculate Shipping Fee
  // ==========================================
  describe("2. Calculate Shipping Fee", () => {
    it("charges standard $35 armored courier fee for subtotal under $1,000", async () => {
      const res = await request(app)
        .post("/api/checkout/shipping-fee")
        .send({
          subtotal: 599,
          shippingMethod: "standard",
        });

      expect(res.status).toBe(200);
      expect(res.body.shippingFee).toBe(35);
      expect(res.body.qualifiesForFreeShipping).toBe(false);
      expect(res.body.availableMethods).toHaveLength(3);
    });

    it("waives standard shipping fee for orders exceeding $1,000 threshold", async () => {
      const res = await request(app)
        .post("/api/checkout/shipping-fee")
        .send({
          subtotal: 1199,
          shippingMethod: "standard",
        });

      expect(res.status).toBe(200);
      expect(res.body.shippingFee).toBe(0);
      expect(res.body.qualifiesForFreeShipping).toBe(true);
    });

    it("calculates expedited courier rates", async () => {
      const res = await request(app)
        .post("/api/checkout/shipping-fee")
        .send({
          subtotal: 500,
          shippingMethod: "express",
        });

      expect(res.status).toBe(200);
      expect(res.body.shippingFee).toBe(65);
      expect(res.body.selectedMethod).toBe("express");
    });
  });

  // ==========================================
  // 3. Calculate Discount
  // ==========================================
  describe("3. Calculate Discount", () => {
    it("POST /api/checkout/discount validates and calculates promotional savings", async () => {
      const res = await request(app)
        .post("/api/checkout/discount")
        .send({
          code: "NEXLAUNCH20",
          subtotal: 1000,
        });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.promoCode).toBe("NEXLAUNCH20");
      expect(res.body.discountAmount).toBe(200);
      expect(res.body.finalTotal).toBe(800);
    });
  });

  // ==========================================
  // 4. Calculate Final Total
  // ==========================================
  describe("4. Calculate Final Total", () => {
    it("POST /api/checkout/calculate-total computes subtotal, discount, shipping, tax and final total", async () => {
      const res = await request(app)
        .post("/api/checkout/calculate-total")
        .send({
          subtotal: 1200,
          promoCode: "NEXLAUNCH20", // 20% = $240 discount, discounted subtotal = $960
          shippingMethod: "express", // $30 with qualified subtotal
          taxRate: 0.08, // 8% of $960 = $76.80
        });

      expect(res.status).toBe(200);
      expect(res.body.subtotal).toBe(1200);
      expect(res.body.discount).toBe(240);
      expect(res.body.shippingFee).toBe(30);
      expect(res.body.tax).toBe(76.8);
      expect(res.body.total).toBe(1066.8);
    });
  });

  // ==========================================
  // 5. Create Checkout Session / Order
  // ==========================================
  describe("5. Create Checkout Session / Order", () => {
    it("POST /api/checkout/session creates a checkout session with explicit items", async () => {
      const res = await request(app)
        .post("/api/checkout/session")
        .send({
          customer: sampleCustomer,
          items: sampleItems,
          shippingMethod: "standard",
          promoCode: "NEXLAUNCH20",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("sessionId");
      expect(res.body).toHaveProperty("orderNumber");
      expect(res.body).toHaveProperty("clientSecret");
      expect(res.body).toHaveProperty("transactionId");
      expect(res.body.order.status).toBe("pending");
      expect(res.body.order.payment.status).toBe("pending");
      expect(res.body.order.items).toHaveLength(1);
    });

    it("POST /api/checkout creates checkout session directly from active cart session", async () => {
      const sessionId = "checkout-test-cart-session-123";

      // 1. Add item to cart
      await request(app)
        .post("/api/cart/items")
        .set("x-session-id", sessionId)
        .send({
          productId: "prod-001",
          color: { id: "c1", name: "Space Gray", hex: "#333" },
          storage: { id: "s1", capacity: "256GB", ram: "12GB", sku: "NX-PRO-256", price: 1199 },
          quantity: 1,
        });

      // 2. Checkout without passing items in payload (auto-pulls from session cart)
      const res = await request(app)
        .post("/api/checkout")
        .set("x-session-id", sessionId)
        .send({
          customer: sampleCustomer,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.order.items).toHaveLength(1);
      expect(res.body.order.items[0].productId).toBe("prod-001");

      // 3. Cart should now be cleared
      const cartRes = await request(app)
        .get("/api/cart")
        .set("x-session-id", sessionId);
      expect(cartRes.body.totalItems).toBe(0);
    });

    it("returns 400 when cart is empty and no items are provided", async () => {
      const res = await request(app)
        .post("/api/checkout/session")
        .send({
          customer: sampleCustomer,
          items: [],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/cart is empty/i);
    });
  });

  // ==========================================
  // 6. Create Payment & Verify Payment
  // ==========================================
  describe("6. Payment Lifecycle (Create, Verify, Status)", () => {
    let orderNumber: string;
    let transactionId: string;

    it("initializes payment intent for pending order", async () => {
      // 1. Create order
      const orderRes = await request(app)
        .post("/api/checkout/session")
        .send({
          customer: sampleCustomer,
          items: sampleItems,
        });
      expect(orderRes.status).toBe(201);
      orderNumber = orderRes.body.orderNumber;
      transactionId = orderRes.body.transactionId;

      // 2. Create payment
      const payRes = await request(app)
        .post("/api/checkout/payment")
        .send({
          orderId: orderNumber,
          paymentMethod: "stripe",
        });

      expect(payRes.status).toBe(200);
      expect(payRes.body.success).toBe(true);
      expect(payRes.body.orderNumber).toBe(orderNumber);
      expect(payRes.body.paymentMethod).toBe("stripe");
      expect(payRes.body.status).toBe("pending");
    });

    it("POST /api/checkout/payment/verify confirms successful payment and marks order confirmed", async () => {
      const res = await request(app)
        .post("/api/checkout/payment/verify")
        .send({
          orderId: orderNumber,
          transactionId,
          status: "paid",
        });

      expect(res.status).toBe(200);
      expect(res.body.verified).toBe(true);
      expect(res.body.status).toBe("paid");
      expect(res.body.order.status).toBe("confirmed");
      expect(res.body.order.payment.status).toBe("paid");
      expect(res.body.order.payment.paidAt).toBeDefined();
    });

    it("GET /api/checkout/payment/:transactionId/status retrieves real-time payment status", async () => {
      const res = await request(app).get(`/api/checkout/payment/${transactionId}/status`);
      expect(res.status).toBe(200);
      expect(res.body.orderNumber).toBe(orderNumber);
      expect(res.body.status).toBe("paid");
      expect(res.body.amount).toBeGreaterThan(0);
      expect(res.body.receiptUrl).toMatch(/receipts/);
    });

    it("supports route alias GET /api/checkout/:orderId/payment-status", async () => {
      const res = await request(app).get(`/api/checkout/${orderNumber}/payment-status`);
      expect(res.status).toBe(200);
      expect(res.body.orderNumber).toBe(orderNumber);
      expect(res.body.status).toBe("paid");
    });
  });

  // ==========================================
  // 7. Payment Webhooks
  // ==========================================
  describe("7. Payment Webhooks", () => {
    it("POST /api/checkout/webhook processes payment_intent.succeeded event", async () => {
      // 1. Create a fresh order
      const orderRes = await request(app)
        .post("/api/checkout/session")
        .send({
          customer: sampleCustomer,
          items: sampleItems,
        });
      const orderNumber = orderRes.body.orderNumber;
      const transactionId = orderRes.body.transactionId;

      // 2. Dispatch simulated webhook event
      const res = await request(app)
        .post("/api/checkout/webhook")
        .send({
          event: "payment_intent.succeeded",
          data: {
            id: transactionId,
            orderNumber,
            amount: 1199,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);
      expect(res.body.processed).toBe(true);

      // 3. Verify order is now paid
      const statusRes = await request(app).get(`/api/checkout/${orderNumber}/payment-status`);
      expect(statusRes.body.status).toBe("paid");
    });

    it("POST /api/checkout/webhook processes payment_intent.payment_failed event", async () => {
      const orderRes = await request(app)
        .post("/api/checkout/session")
        .send({
          customer: sampleCustomer,
          items: sampleItems,
        });
      const orderNumber = orderRes.body.orderNumber;

      const res = await request(app)
        .post("/api/checkout/webhook")
        .send({
          event: "payment_intent.payment_failed",
          data: {
            orderNumber,
            failureReason: "Insufficient cryptographic funds in corporate vault",
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.processed).toBe(true);

      const statusRes = await request(app).get(`/api/checkout/${orderNumber}/payment-status`);
      expect(statusRes.body.status).toBe("failed");
      expect(statusRes.body.failureReason).toMatch(/insufficient cryptographic funds/i);
    });
  });
});
