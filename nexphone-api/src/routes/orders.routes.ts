import { Router } from "express";
import { optionalAuthenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  confirmRejectOrderSchema,
  cancelOrderSchema,
  queryOrderSchema,
} from "../validators/order.validator";
import * as controller from "../controllers/order.controller";

export const ordersRouter = Router();

// ==========================================
// 1. Get My Orders (Customer Order History)
// ==========================================
ordersRouter.get(
  ["/api/orders/my-orders", "/orders/my-orders", "/api/orders/me", "/orders/me"],
  optionalAuthenticate,
  controller.getMyOrders
);

// ==========================================
// 2. Metrics & Dashboard Analytics (Admin)
// ==========================================
ordersRouter.get(
  ["/api/orders-metrics", "/orders-metrics", "/api/orders/metrics", "/orders/metrics"],
  optionalAuthenticate,
  controller.getOrdersMetrics
);

// ==========================================
// 3. Track Order Status
// ==========================================
ordersRouter.get(
  [
    "/api/orders/:id/track",
    "/orders/:id/track",
    "/api/orders/track/:orderNumber",
    "/orders/track/:orderNumber",
  ],
  optionalAuthenticate,
  controller.trackOrderStatus
);

// ==========================================
// 4. Confirm / Reject Order (Admin)
// ==========================================
ordersRouter.post(
  ["/api/orders/:id/confirm", "/orders/:id/confirm"],
  optionalAuthenticate,
  controller.confirmOrder
);

ordersRouter.post(
  ["/api/orders/:id/reject", "/orders/:id/reject"],
  optionalAuthenticate,
  controller.rejectOrder
);

ordersRouter.post(
  ["/api/orders/:id/decision", "/orders/:id/decision"],
  optionalAuthenticate,
  validate({ body: confirmRejectOrderSchema }),
  controller.decisionOrder
);

// ==========================================
// 5. Update Order Status (Admin)
// ==========================================
ordersRouter.put(
  ["/api/orders/:id/status", "/orders/:id/status"],
  optionalAuthenticate,
  validate({ body: updateOrderStatusSchema }),
  controller.updateOrderStatus
);

ordersRouter.patch(
  ["/api/orders/:id/status", "/orders/:id/status"],
  optionalAuthenticate,
  validate({ body: updateOrderStatusSchema }),
  controller.updateOrderStatus
);

// ==========================================
// 6. Cancel Order (Customer / Admin)
// ==========================================
ordersRouter.post(
  ["/api/orders/:id/cancel", "/orders/:id/cancel"],
  optionalAuthenticate,
  validate({ body: cancelOrderSchema }),
  controller.cancelOrder
);

// ==========================================
// 7. Order Details (Must stay after static sub-paths)
// ==========================================
ordersRouter.get(
  ["/api/orders/:id", "/orders/:id"],
  optionalAuthenticate,
  controller.getOrderDetails
);

// ==========================================
// 8. Order Collection: Query All Orders & Create Order
// ==========================================
ordersRouter.get(
  ["/api/orders", "/orders"],
  optionalAuthenticate,
  validate({ query: queryOrderSchema }),
  controller.getAllOrders
);

ordersRouter.post(
  ["/api/orders", "/orders"],
  optionalAuthenticate,
  validate({ body: createOrderSchema }),
  controller.createOrder
);
