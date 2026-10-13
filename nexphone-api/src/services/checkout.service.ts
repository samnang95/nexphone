import { orderRepository } from "../repositories/order.repo";
import { cartRepository } from "../repositories/cart.repo";
import { productRepository } from "../repositories/product.repo";
import { promotionService } from "./promotion.service";
import {
  serializeAddressValidation,
  serializeShippingCalculation,
  serializeCheckoutTotals,
  serializeOrder,
  serializePaymentStatus,
  type AddressValidationView,
  type ShippingCalculationView,
  type CheckoutTotalsView,
} from "../views/checkout.view";
import { HttpError } from "../utils/httpError";
import type {
  AddressInput,
  CalculateShippingInput,
  CalculateDiscountInput,
  CalculateTotalInput,
  CreateCheckoutSessionInput,
  CreatePaymentInput,
  VerifyPaymentInput,
  PaymentWebhookInput,
} from "../validators/checkout.validator";

export const checkoutService = {
  /**
   * 1. Validate Delivery Address
   */
  async validateDeliveryAddress(address: AddressInput): Promise<AddressValidationView> {
    if (!address.street || address.street.trim().length < 3) {
      throw HttpError.badRequest("Street address is too short or invalid.");
    }
    if (!address.city || address.city.trim().length < 2) {
      throw HttpError.badRequest("City name is required.");
    }
    if (!address.state || address.state.trim().length < 2) {
      throw HttpError.badRequest("State or Province is required.");
    }
    if (!address.zipCode || address.zipCode.trim().length < 3) {
      throw HttpError.badRequest("Postal / Zip code is required.");
    }

    return serializeAddressValidation(address);
  },

  /**
   * 2. Calculate Shipping Fee
   */
  async calculateShippingFee(input: CalculateShippingInput): Promise<ShippingCalculationView> {
    let promoHasFreeShipping = false;

    if (input.promoCode) {
      try {
        const promoRes = await promotionService.validateCoupon({
          code: input.promoCode,
          cartTotal: input.subtotal,
        });
        if (promoRes.discountType === "free_shipping") {
          promoHasFreeShipping = true;
        }
      } catch {
        // Continue with standard calculation if coupon is invalid or not applicable
      }
    }

    return serializeShippingCalculation(
      Number(input.subtotal) || 0,
      input.shippingMethod || "standard",
      promoHasFreeShipping
    );
  },

  /**
   * 3. Calculate Discount
   */
  async calculateDiscount(input: CalculateDiscountInput): Promise<any> {
    const res = await promotionService.validateCoupon({
      code: input.code,
      cartTotal: input.subtotal || 0,
      items: input.items,
    });

    return {
      valid: res.valid,
      promoCode: res.code,
      discountType: res.discountType,
      discountValue: res.discountValue,
      discountAmount: res.discountAmount,
      cartTotal: res.cartTotal,
      finalTotal: res.finalTotal,
      message: res.message,
    };
  },

  /**
   * 4. Calculate Final Total
   */
  async calculateFinalTotal(input: CalculateTotalInput): Promise<CheckoutTotalsView & { breakdown: any }> {
    const subtotal = Number(input.subtotal) || 0;
    let discount = 0;
    let promoDetails: any = null;

    if (input.promoCode) {
      try {
        const promoRes = await promotionService.validateCoupon({
          code: input.promoCode,
          cartTotal: subtotal,
        });
        discount = promoRes.discountAmount;
        promoDetails = promoRes;
      } catch {
        // Ignore invalid promo in total estimate
      }
    }

    const shippingRes = await this.calculateShippingFee({
      subtotal,
      shippingMethod: input.shippingMethod,
      promoCode: input.promoCode,
      address: input.address,
    });

    const taxRate = input.taxRate !== undefined ? Number(input.taxRate) : 0.08;
    const totals = serializeCheckoutTotals(subtotal, discount, shippingRes.shippingFee, taxRate);

    return {
      ...totals,
      breakdown: {
        shippingMethod: shippingRes.selectedMethod,
        qualifiesForFreeShipping: shippingRes.qualifiesForFreeShipping,
        appliedPromo: promoDetails ? { code: promoDetails.code, discountAmount: discount } : null,
      },
    };
  },

  /**
   * 5. Create Checkout Session / Order
   */
  async createCheckoutSession(
    input: CreateCheckoutSessionInput,
    context: { userId?: string; sessionId?: string } = {}
  ): Promise<any> {
    // 1. Resolve Items: from input or active cart
    let orderItems: any[] = [];

    if (Array.isArray(input.items) && input.items.length > 0) {
      for (const item of input.items) {
        let productName = item.productName || "NexPhone Hardware";
        let unitPrice = Number(item.unitPrice) || 0;
        let sku = item.sku || `NX-${item.productId}`;

        if (!item.productName || unitPrice === 0) {
          const product = await productRepository.findByIdOrSlug(item.productId);
          if (product) {
            productName = product.name;
            unitPrice = Number(product.basePrice) || 0;
            if (product.storageOptions && product.storageOptions[0]) {
              sku = product.storageOptions[0].sku || sku;
            }
          }
        }

        orderItems.push({
          id: item.id || `item-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
          productId: item.productId,
          productName,
          sku,
          variantCapacity: item.variantCapacity,
          variantRam: item.variantRam,
          colorName: item.colorName,
          colorHex: item.colorHex,
          quantity: item.quantity,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
        });
      }
    } else {
      // Pull from session or user cart
      const existingCart = await cartRepository.findCart(context.userId, context.sessionId);
      if (!existingCart || !existingCart.items || existingCart.items.length === 0) {
        throw HttpError.badRequest("Cart is empty. Please add items to cart before initiating checkout.");
      }

      orderItems = existingCart.items.map((item: any) => ({
        id: item.id || `item-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
        productId: item.productId,
        productName: item.productName || "NexPhone Hardware",
        sku: item.storage?.sku || `NX-${item.productId}`,
        variantCapacity: item.storage?.capacity,
        variantRam: item.storage?.ram,
        colorName: item.color?.name,
        colorHex: item.color?.hex,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: (item.unitPrice || 0) * (item.quantity || 1),
      }));
    }

    // 2. Validate Shipping Address
    await this.validateDeliveryAddress(input.customer.shippingAddress);

    // 3. Calculate Totals
    const subtotal = orderItems.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
    const totalsSummary = await this.calculateFinalTotal({
      subtotal,
      shippingMethod: input.shippingMethod,
      promoCode: input.promoCode,
      address: input.customer.shippingAddress,
    });

    // 4. Create Order & Session
    const orderNumber = `NX-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const sessionId = `cs_test_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
    const transactionId = `TXN-${Date.now()}`;
    const clientSecret = `pi_sec_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    const newOrder = await orderRepository.create({
      id: orderNumber,
      orderNumber,
      sessionId,
      userId: context.userId,
      status: "pending",
      customer: {
        id: context.userId || input.customer.id || undefined,
        name: input.customer.name,
        email: input.customer.email,
        phone: input.customer.phone,
        company: input.customer.company,
        shippingAddress: {
          street: input.customer.shippingAddress.street,
          city: input.customer.shippingAddress.city,
          state: input.customer.shippingAddress.state,
          zipCode: input.customer.shippingAddress.zipCode,
          country: input.customer.shippingAddress.country || "United States",
        },
        billingAddress: input.customer.billingAddress
          ? {
              street: input.customer.billingAddress.street,
              city: input.customer.billingAddress.city,
              state: input.customer.billingAddress.state,
              zipCode: input.customer.billingAddress.zipCode,
              country: input.customer.billingAddress.country || "United States",
            }
          : {
              street: input.customer.shippingAddress.street,
              city: input.customer.shippingAddress.city,
              state: input.customer.shippingAddress.state,
              zipCode: input.customer.shippingAddress.zipCode,
              country: input.customer.shippingAddress.country || "United States",
            },
      },
      items: orderItems,
      subtotal: totalsSummary.subtotal,
      discount: totalsSummary.discount,
      shippingFee: totalsSummary.shippingFee,
      tax: totalsSummary.tax,
      totalAmount: totalsSummary.total,
      appliedPromo: totalsSummary.breakdown.appliedPromo,
      payment: {
        status: "pending",
        method: input.paymentMethod || "credit_card",
        methodLabel: "Encrypted Credit Card (NexShield Payment Gateway)",
        transactionId,
        clientSecret,
        amount: totalsSummary.total,
        currency: "USD",
      },
      shipping: {
        carrier: "NexExpress Armored Courier",
        service: input.shippingMethod === "express" ? "Priority Overnight" : "Standard Armored Courier",
        estimatedDelivery: input.shippingMethod === "express" ? "Next Business Day" : "2-3 Business Days",
        trackingNumber: `NX-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      },
      timeline: [
        {
          id: `tl-${Date.now().toString(36)}`,
          status: "pending",
          label: "Checkout Session Initialized",
          description: "Customer initialized checkout session; cryptographic allocation reserved",
          timestamp: new Date().toISOString(),
          actor: "Checkout Gateway",
        },
      ],
    });

    // 5. If user had an active cart session, clear cart items so it's ready for next shopping
    if (context.userId || context.sessionId) {
      try {
        const cart = await cartRepository.findCart(context.userId, context.sessionId);
        if (cart) {
          cart.items = [];
          cart.appliedPromo = null;
          await cartRepository.saveCart(cart);
        }
      } catch {
        // Safe fallback
      }
    }

    return {
      success: true,
      sessionId,
      orderNumber: newOrder.orderNumber,
      orderId: newOrder.id,
      clientSecret,
      transactionId,
      totals: totalsSummary,
      order: serializeOrder(newOrder),
    };
  },

  /**
   * 6. Create Payment
   */
  async createPayment(input: CreatePaymentInput): Promise<any> {
    let order: any = null;

    if (input.orderId) {
      order = await orderRepository.findByIdOrNumber(input.orderId);
    } else if (input.transactionId) {
      order = await orderRepository.findByTransactionId(input.transactionId);
    }

    if (!order) {
      throw HttpError.notFound("Order not found for payment processing.");
    }

    if (order.payment?.status === "paid") {
      throw HttpError.badRequest(`Order ${order.orderNumber} is already paid.`);
    }

    const transactionId = input.transactionId || order.payment?.transactionId || `TXN-${Date.now()}`;
    const clientSecret = order.payment?.clientSecret || `pi_sec_${Date.now().toString(36)}`;
    const method = input.paymentMethod || order.payment?.method || "credit_card";

    const updated = await orderRepository.update(order.id, {
      payment: {
        ...order.payment,
        method,
        transactionId,
        clientSecret,
        status: "pending",
      },
    });

    return {
      success: true,
      orderId: updated.id,
      orderNumber: updated.orderNumber,
      transactionId,
      clientSecret,
      amount: updated.totalAmount,
      currency: updated.payment?.currency || "USD",
      paymentMethod: method,
      status: "pending",
    };
  },

  /**
   * 7. Verify Payment
   */
  async verifyPayment(input: VerifyPaymentInput): Promise<any> {
    let order: any = null;

    if (input.orderId) {
      order = await orderRepository.findByIdOrNumber(input.orderId);
    } else if (input.transactionId) {
      order = await orderRepository.findByTransactionId(input.transactionId);
    } else if (input.paymentIntentId) {
      order = await orderRepository.findByTransactionId(input.paymentIntentId);
    }

    if (!order) {
      throw HttpError.notFound("Payment transaction or order not found for verification.");
    }

    const isSuccess = input.status !== "failed";
    const paymentStatus = isSuccess ? "paid" : "failed";
    const orderStatus = isSuccess ? "confirmed" : order.status;
    const now = new Date().toISOString();

    const updated = await orderRepository.updatePayment(
      order.id,
      {
        status: paymentStatus,
        paidAt: isSuccess ? now : undefined,
        failureReason: input.failureReason,
      },
      orderStatus,
      {
        label: isSuccess ? "Payment Captured & Verified" : "Payment Verification Failed",
        description: isSuccess
          ? `Cryptographic charge verification confirmed for $${order.totalAmount}`
          : `Payment failed: ${input.failureReason || "Declined by issuing authority"}`,
        actor: "NexPayment Gateway Engine",
      }
    );

    return {
      success: isSuccess,
      verified: isSuccess,
      status: paymentStatus,
      orderId: updated.id,
      orderNumber: updated.orderNumber,
      order: serializeOrder(updated),
    };
  },

  /**
   * 8. Get Payment Status
   */
  async getPaymentStatus(idOrTxn: string): Promise<any> {
    const order =
      (await orderRepository.findByIdOrNumber(idOrTxn)) ||
      (await orderRepository.findByTransactionId(idOrTxn));

    if (!order) {
      throw HttpError.notFound(`Payment record not found for: "${idOrTxn}"`);
    }

    return serializePaymentStatus(order);
  },

  /**
   * 9. Handle Payment Webhook
   */
  async handlePaymentWebhook(input: PaymentWebhookInput): Promise<any> {
    const event = input.event;
    const data: any = input.data || {};
    const txnId: string | undefined = data.id ? String(data.id) : data.transactionId ? String(data.transactionId) : data.paymentIntentId ? String(data.paymentIntentId) : undefined;
    const orderNumber: string | undefined = data.orderNumber ? String(data.orderNumber) : data.metadata?.orderNumber ? String(data.metadata.orderNumber) : undefined;

    let order = null;
    if (orderNumber) {
      order = await orderRepository.findByIdOrNumber(orderNumber);
    } else if (txnId) {
      order = await orderRepository.findByTransactionId(txnId);
    }

    if (order) {
      if (event === "payment_intent.succeeded" || event === "charge.succeeded") {
        await orderRepository.updatePayment(
          order.id,
          { status: "paid", paidAt: new Date().toISOString() },
          "confirmed",
          {
            label: "Webhook: Payment Captured",
            description: `Payment intent ${txnId || "N/A"} captured successfully via webhook notification`,
            actor: "Webhook Dispatcher",
          }
        );
      } else if (event === "payment_intent.payment_failed") {
        await orderRepository.updatePayment(
          order.id,
          { status: "failed", failureReason: String(data.failureReason || "Webhook failure notification") },
          order.status,
          {
            label: "Webhook: Payment Declined",
            description: `Payment intent failed via webhook: ${data.failureReason || "Card declined"}`,
            actor: "Webhook Dispatcher",
          }
        );
      } else if (event === "charge.refunded") {
        await orderRepository.updatePayment(
          order.id,
          { status: "refunded" },
          "cancelled",
          {
            label: "Webhook: Payment Refunded",
            description: `Refund processed via webhook notification for charge ${txnId}`,
            actor: "Webhook Dispatcher",
          }
        );
      }
    }

    return {
      received: true,
      event,
      processed: Boolean(order),
      orderNumber: order?.orderNumber,
    };
  },
};
