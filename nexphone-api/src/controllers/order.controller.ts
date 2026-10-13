import type { Request, Response } from "express";
import { orderService } from "../services/order.service";

/**
 * 1. Create Order
 */
export async function createOrder(req: Request, res: Response): Promise<void> {
  const sessionId = (req.headers["x-session-id"] as string) || req.body.sessionId;
  const userId = req.auth?.user?.id;
  const result = await orderService.createOrder(req.body, { userId, sessionId });
  res.status(201).json(result);
}

/**
 * 2. Get My Orders
 */
export async function getMyOrders(req: Request, res: Response): Promise<void> {
  const userId = req.auth?.user?.id;
  const email = req.auth?.user?.email || (req.query.email as string);
  const result = await orderService.getMyOrders(userId, email, req.query as any);
  res.json(result);
}

/**
 * 3. Get Order Details
 */
export async function getOrderDetails(req: Request, res: Response): Promise<void> {
  const idOrNumber = String(req.params.id || req.params.orderNumber || "");
  const userId = req.auth?.user?.id;
  const email = req.auth?.user?.email;
  const isAdmin = req.auth?.user?.role === "admin" || req.auth?.user?.role === "super_admin";
  const result = await orderService.getOrderDetails(idOrNumber, { userId, email, isAdmin });
  res.json(result);
}

/**
 * 4. Cancel Order
 */
export async function cancelOrder(req: Request, res: Response): Promise<void> {
  const idOrNumber = String(req.params.id || "");
  const userId = req.auth?.user?.id;
  const email = req.auth?.user?.email;
  const isAdmin = req.auth?.user?.role === "admin" || req.auth?.user?.role === "super_admin";
  const result = await orderService.cancelOrder(idOrNumber, req.body, { userId, email, isAdmin });
  res.json(result);
}

/**
 * 5. Track Order Status
 */
export async function trackOrderStatus(req: Request, res: Response): Promise<void> {
  const idOrNumber = String(req.params.id || req.params.orderNumber || "");
  const result = await orderService.trackOrderStatus(idOrNumber);
  res.json(result);
}

/**
 * 6. Get All Orders (Admin / Public with search)
 */
export async function getAllOrders(req: Request, res: Response): Promise<void> {
  const result = await orderService.getAllOrders(req.query as any, req.auth?.user);
  // Maintain backward-compatibility: return plain array if no pagination params are specified
  if (!req.query.page && !req.query.limit) {
    res.json(result.orders);
    return;
  }
  res.json(result);
}

/**
 * 7. Update Order Status (Admin)
 */
export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  const idOrNumber = String(req.params.id || "");
  const result = await orderService.updateOrderStatus(idOrNumber, req.body, req.auth?.user);
  res.json(result);
}

/**
 * 8. Confirm Order (Admin)
 */
export async function confirmOrder(req: Request, res: Response): Promise<void> {
  const idOrNumber = String(req.params.id || "");
  const result = await orderService.confirmOrRejectOrder(
    idOrNumber,
    { action: "confirm", ...req.body },
    req.auth?.user
  );
  res.json(result);
}

/**
 * 8b. Reject Order (Admin)
 */
export async function rejectOrder(req: Request, res: Response): Promise<void> {
  const idOrNumber = String(req.params.id || "");
  const result = await orderService.confirmOrRejectOrder(
    idOrNumber,
    { action: "reject", ...req.body },
    req.auth?.user
  );
  res.json(result);
}

/**
 * 8c. Decision (Confirm / Reject) Order (Admin)
 */
export async function decisionOrder(req: Request, res: Response): Promise<void> {
  const idOrNumber = String(req.params.id || "");
  const result = await orderService.confirmOrRejectOrder(idOrNumber, req.body, req.auth?.user);
  res.json(result);
}

/**
 * Order Metrics (Admin)
 */
export async function getOrdersMetrics(_req: Request, res: Response): Promise<void> {
  const metrics = await orderService.getMetrics();
  res.json(metrics);
}
