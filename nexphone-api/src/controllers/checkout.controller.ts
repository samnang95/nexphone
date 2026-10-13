import type { Request, Response } from "express";
import { checkoutService } from "../services/checkout.service";

/**
 * 1. Create Checkout Session / Order
 */
export async function createCheckoutSession(req: Request, res: Response): Promise<void> {
  const sessionId = (req.headers["x-session-id"] as string) || req.body.sessionId;
  const userId = req.auth?.user?.id;
  const result = await checkoutService.createCheckoutSession(req.body, { userId, sessionId });
  res.status(201).json(result);
}

/**
 * 2. Validate Delivery Address
 */
export async function validateDeliveryAddress(req: Request, res: Response): Promise<void> {
  const result = await checkoutService.validateDeliveryAddress(req.body);
  res.json(result);
}

/**
 * 3. Calculate Shipping Fee
 */
export async function calculateShippingFee(req: Request, res: Response): Promise<void> {
  const result = await checkoutService.calculateShippingFee(req.body);
  res.json(result);
}

/**
 * 4. Calculate Discount
 */
export async function calculateDiscount(req: Request, res: Response): Promise<void> {
  const result = await checkoutService.calculateDiscount(req.body);
  res.json(result);
}

/**
 * 5. Calculate Final Total
 */
export async function calculateFinalTotal(req: Request, res: Response): Promise<void> {
  const result = await checkoutService.calculateFinalTotal(req.body);
  res.json(result);
}

/**
 * 6. Create Payment
 */
export async function createPayment(req: Request, res: Response): Promise<void> {
  const orderId = req.params.id || req.body.orderId;
  const result = await checkoutService.createPayment({
    ...req.body,
    orderId,
  });
  res.json(result);
}

/**
 * 7. Verify Payment
 */
export async function verifyPayment(req: Request, res: Response): Promise<void> {
  const orderId = req.params.id || req.body.orderId;
  const result = await checkoutService.verifyPayment({
    ...req.body,
    orderId: orderId || req.body.orderId,
  });
  res.json(result);
}

/**
 * 8. Get Payment Status
 */
export async function getPaymentStatus(req: Request, res: Response): Promise<void> {
  const idOrTxn = String(req.params.transactionId || req.params.orderId || req.params.id || "");
  const result = await checkoutService.getPaymentStatus(idOrTxn);
  res.json(result);
}

/**
 * 9. Handle Payment Webhooks
 */
export async function handlePaymentWebhook(req: Request, res: Response): Promise<void> {
  const result = await checkoutService.handlePaymentWebhook({
    event: req.body.event || req.body.type || "unknown",
    data: req.body.data?.object || req.body.data || req.body,
    signature: req.headers["stripe-signature"] as string,
  });
  res.json(result);
}
