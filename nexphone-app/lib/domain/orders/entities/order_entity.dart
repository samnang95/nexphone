import 'package:equatable/equatable.dart';
import 'order_item_entity.dart';
import 'order_timeline_step_entity.dart';

enum OrderStatus {
  pending,
  shipped,
  delivered,
  cancelled;

  bool get isPending => this == OrderStatus.pending;
  bool get isShipped => this == OrderStatus.shipped;
  bool get isDelivered => this == OrderStatus.delivered;
  bool get isCancelled => this == OrderStatus.cancelled;
}

class OrderEntity extends Equatable {
  final String id;
  final String orderNumber;
  final String dateFormatted;
  final OrderStatus status;
  final String statusLabel;
  final String? deliveryEstimate;
  final List<OrderItemEntity> items;
  final double subtotal;
  final double shippingFee;
  final double tax;
  final double discount;
  final double totalAmount;
  final String? paymentMethodLabel;
  final String? paymentAmountText;
  final String? khqrNotice;
  final double? userRating;
  final String? refundNotice;
  final String? shippingAddress;
  final String? trackingNumber;
  final String? carrier;
  final List<OrderTimelineStepEntity> timeline;

  const OrderEntity({
    required this.id,
    required this.orderNumber,
    required this.dateFormatted,
    required this.status,
    required this.statusLabel,
    this.deliveryEstimate,
    required this.items,
    this.subtotal = 0.0,
    this.shippingFee = 0.0,
    this.tax = 0.0,
    this.discount = 0.0,
    required this.totalAmount,
    this.paymentMethodLabel,
    this.paymentAmountText,
    this.khqrNotice,
    this.userRating,
    this.refundNotice,
    this.shippingAddress,
    this.trackingNumber,
    this.carrier,
    this.timeline = const [],
  });

  OrderItemEntity get primaryItem => items.first;

  OrderEntity copyWith({
    String? id,
    String? orderNumber,
    String? dateFormatted,
    OrderStatus? status,
    String? statusLabel,
    String? deliveryEstimate,
    List<OrderItemEntity>? items,
    double? subtotal,
    double? shippingFee,
    double? tax,
    double? discount,
    double? totalAmount,
    String? paymentMethodLabel,
    String? paymentAmountText,
    String? khqrNotice,
    double? userRating,
    String? refundNotice,
    String? shippingAddress,
    String? trackingNumber,
    String? carrier,
    List<OrderTimelineStepEntity>? timeline,
  }) {
    return OrderEntity(
      id: id ?? this.id,
      orderNumber: orderNumber ?? this.orderNumber,
      dateFormatted: dateFormatted ?? this.dateFormatted,
      status: status ?? this.status,
      statusLabel: statusLabel ?? this.statusLabel,
      deliveryEstimate: deliveryEstimate ?? this.deliveryEstimate,
      items: items ?? this.items,
      subtotal: subtotal ?? this.subtotal,
      shippingFee: shippingFee ?? this.shippingFee,
      tax: tax ?? this.tax,
      discount: discount ?? this.discount,
      totalAmount: totalAmount ?? this.totalAmount,
      paymentMethodLabel: paymentMethodLabel ?? this.paymentMethodLabel,
      paymentAmountText: paymentAmountText ?? this.paymentAmountText,
      khqrNotice: khqrNotice ?? this.khqrNotice,
      userRating: userRating ?? this.userRating,
      refundNotice: refundNotice ?? this.refundNotice,
      shippingAddress: shippingAddress ?? this.shippingAddress,
      trackingNumber: trackingNumber ?? this.trackingNumber,
      carrier: carrier ?? this.carrier,
      timeline: timeline ?? this.timeline,
    );
  }

  @override
  List<Object?> get props => [
        id,
        orderNumber,
        dateFormatted,
        status,
        statusLabel,
        deliveryEstimate,
        items,
        subtotal,
        shippingFee,
        tax,
        discount,
        totalAmount,
        paymentMethodLabel,
        paymentAmountText,
        khqrNotice,
        userRating,
        refundNotice,
        shippingAddress,
        trackingNumber,
        carrier,
        timeline,
      ];
}
