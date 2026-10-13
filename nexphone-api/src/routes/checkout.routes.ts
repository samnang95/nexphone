import { Router } from "express";
import { optionalAuthenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  validateAddressSchema,
  calculateShippingSchema,
  calculateDiscountSchema,
  calculateTotalSchema,
  createCheckoutSessionSchema,
  createPaymentSchema,
  verifyPaymentSchema,
  paymentWebhookSchema,
} from "../validators/checkout.validator";
import * as controller from "../controllers/checkout.controller";

export const checkoutRouter = Router();

// ==========================================
// 1. Validate Delivery Address
// ==========================================
checkoutRouter.post(
  ["/validate-address", "/address/validate"],
  optionalAuthenticate,
  validate({ body: validateAddressSchema }),
  controller.validateDeliveryAddress
);

// ==========================================
// 2. Calculate Shipping Fee
// ==========================================
checkoutRouter.post(
  ["/shipping-fee", "/calculate-shipping"],
  optionalAuthenticate,
  validate({ body: calculateShippingSchema }),
  controller.calculateShippingFee
);

// ==========================================
// 3. Calculate Discount
// ==========================================
checkoutRouter.post(
  ["/discount", "/calculate-discount"],
  optionalAuthenticate,
  validate({ body: calculateDiscountSchema }),
  controller.calculateDiscount
);

// ==========================================
// 4. Calculate Final Total
// ==========================================
checkoutRouter.post(
  ["/calculate-total", "/summary"],
  optionalAuthenticate,
  validate({ body: calculateTotalSchema }),
  controller.calculateFinalTotal
);

// ==========================================
// 5. Handle Payment Webhooks
// (Must be declared before parameterized paths)
// ==========================================
checkoutRouter.post(
  ["/webhook", "/webhooks"],
  validate({ body: paymentWebhookSchema }),
  controller.handlePaymentWebhook
);

// ==========================================
// 6. Verify Payment
// ==========================================
checkoutRouter.post(
  ["/payment/verify", "/verify-payment"],
  optionalAuthenticate,
  validate({ body: verifyPaymentSchema }),
  controller.verifyPayment
);

// ==========================================
// 7. Create Payment
// ==========================================
checkoutRouter.post(
  ["/payment", "/payment/create"],
  optionalAuthenticate,
  validate({ body: createPaymentSchema }),
  controller.createPayment
);

checkoutRouter.post(
  "/:id/pay",
  optionalAuthenticate,
  validate({ body: createPaymentSchema }),
  controller.createPayment
);

// ==========================================
// 8. Get Payment Status
// ==========================================
checkoutRouter.get(
  ["/payment/:transactionId/status", "/payment/:transactionId", "/:orderId/payment-status"],
  optionalAuthenticate,
  controller.getPaymentStatus
);

// ==========================================
// 9. Create Checkout Session / Order
// ==========================================
checkoutRouter.post(
  ["/session", "/"],
  optionalAuthenticate,
  validate({ body: createCheckoutSessionSchema }),
  controller.createCheckoutSession
);
