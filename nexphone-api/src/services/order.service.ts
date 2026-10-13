import { orderRepository, type OrderQueryFilters } from "../repositories/order.repo";
import { checkoutService } from "./checkout.service";
import {
  serializeOrderDetails,
  serializeOrderSummary,
  serializeOrderTracking,
  type OrderSummaryView,
  type OrderTrackingView,
} from "../views/order.view";
import { HttpError } from "../utils/httpError";
import type {
  CreateOrderInput,
  UpdateOrderStatusInput,
  ConfirmRejectOrderInput,
  CancelOrderInput,
  QueryOrderInput,
} from "../validators/order.validator";

export const orderService = {
  /**
   * 1. Create Order
   */
  async createOrder(
    input: CreateOrderInput,
    context: { userId?: string; sessionId?: string } = {}
  ): Promise<any> {
    const sessionRes = await checkoutService.createCheckoutSession(input, context);
    return sessionRes.order;
  },

  /**
   * 2. Get My Orders
   */
  async getMyOrders(
    userId?: string,
    email?: string,
    query: QueryOrderInput = {}
  ): Promise<{ orders: OrderSummaryView[]; total: number; page: number; limit: number }> {
    if (!userId && !email) {
      throw HttpError.unauthorized("Authentication required to view customer order history.");
    }

    const filters: OrderQueryFilters = {
      userId,
      customerEmail: email,
      status: query.status,
      paymentStatus: query.paymentStatus,
      search: query.search,
    };

    const pagination = query.page && query.limit ? { page: query.page, limit: query.limit } : undefined;
    const { orders, total } = await orderRepository.find(filters, pagination);

    return {
      orders: orders.map(serializeOrderSummary),
      total,
      page: query.page || 1,
      limit: query.limit || total,
    };
  },

  /**
   * 3. Get Order Details
   */
  async getOrderDetails(
    idOrNumber: string,
    context: { userId?: string; isAdmin?: boolean; email?: string } = {}
  ): Promise<any> {
    const order = await orderRepository.findByIdOrNumber(idOrNumber);
    if (!order) {
      throw HttpError.notFound(`Order not found: "${idOrNumber}"`);
    }

    // Access control: admins have full access; regular users can only view their own orders
    if (!context.isAdmin && context.userId) {
      const isOwner =
        order.userId === context.userId ||
        order.customer?.id === context.userId ||
        (context.email && order.customer?.email?.toLowerCase() === context.email.toLowerCase());

      if (!isOwner) {
        throw HttpError.forbidden("You do not have authorization to view this order.");
      }
    }

    return serializeOrderDetails(order);
  },

  /**
   * 4. Cancel Order
   */
  async cancelOrder(
    idOrNumber: string,
    input: CancelOrderInput = {},
    context: { userId?: string; isAdmin?: boolean; email?: string } = {}
  ): Promise<any> {
    const order = await orderRepository.findByIdOrNumber(idOrNumber);
    if (!order) {
      throw HttpError.notFound(`Order not found: "${idOrNumber}"`);
    }

    if (!context.isAdmin && context.userId) {
      const isOwner =
        order.userId === context.userId ||
        order.customer?.id === context.userId ||
        (context.email && order.customer?.email?.toLowerCase() === context.email.toLowerCase());

      if (!isOwner) {
        throw HttpError.forbidden("You do not have authorization to cancel this order.");
      }
    }

    if (order.status === "cancelled") {
      throw HttpError.badRequest(`Order ${order.orderNumber} is already cancelled.`);
    }

    if (["shipped", "delivered"].includes(order.status)) {
      throw HttpError.badRequest(
        `Cannot cancel order ${order.orderNumber} because it is already ${order.status}. Please initiate a return instead.`
      );
    }

    const now = new Date().toISOString();
    const reason = input.reason || "Customer requested cancellation";
    const shouldRefund = input.refundPayment !== false && order.payment?.status === "paid";
    const newPaymentStatus = shouldRefund ? "refunded" : order.payment?.status || "pending";

    const updated = await orderRepository.update(order.id, {
      status: "cancelled",
      cancelReason: reason,
      payment: {
        ...order.payment,
        status: newPaymentStatus,
        transactionId: shouldRefund ? `REF-${Date.now().toString(36).toUpperCase()}` : order.payment?.transactionId,
      },
      timeline: [
        {
          id: `tl-${Date.now().toString(36)}`,
          status: "cancelled",
          label: "Order Cancelled",
          description: `Reason: ${reason}${input.note ? ` • Note: ${input.note}` : ""}${shouldRefund ? " • Payment automatically marked as refunded" : ""}`,
          timestamp: now,
          actor: input.performedBy || (context.isAdmin ? "System Administrator" : "Customer"),
        },
        ...(order.timeline || []),
      ],
    });

    return serializeOrderDetails(updated);
  },

  /**
   * 5. Track Order Status
   */
  async trackOrderStatus(idOrNumber: string): Promise<OrderTrackingView> {
    const order = await orderRepository.findByIdOrNumber(idOrNumber);
    if (!order) {
      throw HttpError.notFound(`Order not found for tracking: "${idOrNumber}"`);
    }

    return serializeOrderTracking(order);
  },

  /**
   * 6. Get All Orders (Admin)
   */
  async getAllOrders(
    query: QueryOrderInput = {},
    _currentUser?: any
  ): Promise<{ orders: any[]; total: number; page: number; limit: number }> {
    const filters: OrderQueryFilters = {
      status: query.status,
      paymentStatus: query.paymentStatus,
      search: query.search,
    };

    const pagination = query.page && query.limit ? { page: query.page, limit: query.limit } : undefined;
    const { orders, total } = await orderRepository.find(filters, pagination);

    return {
      orders: orders.map(serializeOrderDetails),
      total,
      page: query.page || 1,
      limit: query.limit || total,
    };
  },

  /**
   * 7. Update Order Status (Admin)
   */
  async updateOrderStatus(
    idOrNumber: string,
    input: UpdateOrderStatusInput,
    _adminUser?: any
  ): Promise<any> {
    const order = await orderRepository.findByIdOrNumber(idOrNumber);
    if (!order) {
      throw HttpError.notFound(`Order not found: "${idOrNumber}"`);
    }

    const now = new Date().toISOString();
    const updatedShipping = {
      ...order.shipping,
      ...(input.carrier ? { carrier: input.carrier } : {}),
      ...(input.trackingNumber
        ? {
            trackingNumber: input.trackingNumber,
            trackingUrl: `https://nexphone.io/track/${encodeURIComponent(input.trackingNumber)}`,
          }
        : {}),
      ...(input.estimatedDelivery ? { estimatedDelivery: input.estimatedDelivery } : {}),
      ...(input.status === "shipped" && !order.shipping?.shippedAt ? { shippedAt: now } : {}),
      ...(input.status === "delivered" && !order.shipping?.deliveredAt ? { deliveredAt: now, estimatedDelivery: "Delivered" } : {}),
    };

    const statusLabels: Record<string, string> = {
      pending: "Order Pending Allocation",
      confirmed: "Order Confirmed",
      processing: "Processing & Warehousing",
      shipped: "Shipped & Dispatched via Armored Courier",
      delivered: "Delivered & Consigned",
      cancelled: "Order Cancelled",
    };

    const updated = await orderRepository.update(order.id, {
      status: input.status,
      shipping: updatedShipping,
      timeline: [
        {
          id: `tl-${Date.now().toString(36)}`,
          status: input.status,
          label: statusLabels[input.status] || `Status updated to ${input.status}`,
          description: input.note || (input.trackingNumber ? `Tracking assigned: ${input.trackingNumber} (${input.carrier || "Courier"})` : `Order status transitioned to ${input.status}`),
          timestamp: now,
          actor: input.performedBy || "Operations Team",
        },
        ...(order.timeline || []),
      ],
    });

    return serializeOrderDetails(updated);
  },

  /**
   * 8. Confirm or Reject Order (Admin)
   */
  async confirmOrRejectOrder(
    idOrNumber: string,
    input: ConfirmRejectOrderInput,
    _adminUser?: any
  ): Promise<any> {
    const order = await orderRepository.findByIdOrNumber(idOrNumber);
    if (!order) {
      throw HttpError.notFound(`Order not found: "${idOrNumber}"`);
    }

    const now = new Date().toISOString();

    if (input.action === "confirm") {
      const updated = await orderRepository.update(order.id, {
        status: "confirmed",
        timeline: [
          {
            id: `tl-${Date.now().toString(36)}`,
            status: "confirmed",
            label: "Order Confirmed by Admin",
            description: input.note || "Order confirmed by administration. Stock reserved for fulfillment.",
            timestamp: now,
            actor: input.performedBy || "System Admin",
          },
          ...(order.timeline || []),
        ],
      });
      return serializeOrderDetails(updated);
    } else {
      const reason = input.reason || "Rejected by administration";
      const updated = await orderRepository.update(order.id, {
        status: "cancelled",
        cancelReason: reason,
        payment: {
          ...order.payment,
          status: order.payment?.status === "paid" ? "refunded" : order.payment?.status,
        },
        timeline: [
          {
            id: `tl-${Date.now().toString(36)}`,
            status: "cancelled",
            label: "Order Rejected by Admin",
            description: `Reason: ${reason}${input.note ? ` • Note: ${input.note}` : ""}`,
            timestamp: now,
            actor: input.performedBy || "System Admin",
          },
          ...(order.timeline || []),
        ],
      });
      return serializeOrderDetails(updated);
    }
  },

  /**
   * Order Metrics (Admin)
   */
  async getMetrics(): Promise<any> {
    return orderRepository.getMetrics();
  },
};
