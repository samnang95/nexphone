import '../../../domain/orders/entities/order_entity.dart';
import '../../../domain/orders/entities/order_item_entity.dart';
import '../../../domain/orders/entities/order_timeline_step_entity.dart';

class OrderItemModel extends OrderItemEntity {
  const OrderItemModel({
    required super.id,
    required super.productName,
    required super.subtitle,
    required super.unitPrice,
    super.originalPrice,
    required super.quantity,
    super.imageUrl,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: json['id']?.toString() ?? '',
      productName: json['productName']?.toString() ?? json['name']?.toString() ?? '',
      subtitle: json['subtitle']?.toString() ??
          (json['variantCapacity'] != null ? '${json['variantCapacity']} • ${json['colorName'] ?? ''}' : ''),
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0.0,
      originalPrice: (json['originalPrice'] as num?)?.toDouble(),
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      imageUrl: json['imageUrl']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'productName': productName,
        'subtitle': subtitle,
        'unitPrice': unitPrice,
        'originalPrice': originalPrice,
        'quantity': quantity,
        'imageUrl': imageUrl,
      };
}

class OrderTimelineStepModel extends OrderTimelineStepEntity {
  const OrderTimelineStepModel({
    required super.title,
    required super.description,
    required super.time,
    required super.isCompleted,
    super.isCurrent,
  });

  factory OrderTimelineStepModel.fromJson(Map<String, dynamic> json) {
    return OrderTimelineStepModel(
      title: json['title']?.toString() ?? json['label']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      time: json['time']?.toString() ?? json['timestamp']?.toString() ?? '',
      isCompleted: json['isCompleted'] == true,
      isCurrent: json['isCurrent'] == true,
    );
  }
}

class OrderModel extends OrderEntity {
  const OrderModel({
    required super.id,
    required super.orderNumber,
    required super.dateFormatted,
    required super.status,
    required super.statusLabel,
    super.deliveryEstimate,
    required super.items,
    super.subtotal,
    super.shippingFee,
    super.tax,
    super.discount,
    required super.totalAmount,
    super.paymentMethodLabel,
    super.paymentAmountText,
    super.khqrNotice,
    super.userRating,
    super.refundNotice,
    super.shippingAddress,
    super.trackingNumber,
    super.carrier,
    super.timeline,
  });

  static OrderStatus _parseStatus(String? status) {
    switch (status?.toLowerCase()) {
      case 'pending':
        return OrderStatus.pending;
      case 'shipped':
        return OrderStatus.shipped;
      case 'delivered':
        return OrderStatus.delivered;
      case 'cancelled':
      case 'refunded':
        return OrderStatus.cancelled;
      default:
        return OrderStatus.pending;
    }
  }

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'];
    final itemsList = rawItems is List
        ? rawItems.whereType<Map<String, dynamic>>().map(OrderItemModel.fromJson).toList()
        : <OrderItemEntity>[];

    final rawTimeline = json['timeline'];
    final timelineList = rawTimeline is List
        ? rawTimeline.whereType<Map<String, dynamic>>().map(OrderTimelineStepModel.fromJson).toList()
        : <OrderTimelineStepEntity>[];

    final statusStr = json['status']?.toString();
    final status = _parseStatus(statusStr);

    return OrderModel(
      id: json['id']?.toString() ?? '',
      orderNumber: json['orderNumber']?.toString() ?? '',
      dateFormatted: json['dateFormatted']?.toString() ?? json['createdAt']?.toString() ?? '',
      status: status,
      statusLabel: json['statusLabel']?.toString() ??
          (status == OrderStatus.shipped
              ? 'Shipped • On the Way'
              : status == OrderStatus.pending
                  ? 'Payment Pending'
                  : status == OrderStatus.cancelled
                      ? 'Cancelled & Refunded'
                      : 'Delivered'),
      deliveryEstimate: json['deliveryEstimate']?.toString(),
      items: itemsList,
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      shippingFee: (json['shippingFee'] as num?)?.toDouble() ?? 0.0,
      tax: (json['tax'] as num?)?.toDouble() ?? 0.0,
      discount: (json['discount'] as num?)?.toDouble() ?? 0.0,
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? (json['total'] as num?)?.toDouble() ?? 0.0,
      paymentMethodLabel: json['paymentMethodLabel']?.toString(),
      paymentAmountText: json['paymentAmountText']?.toString(),
      khqrNotice: json['khqrNotice']?.toString(),
      userRating: (json['userRating'] as num?)?.toDouble(),
      refundNotice: json['refundNotice']?.toString(),
      shippingAddress: json['shippingAddress']?.toString(),
      trackingNumber: json['trackingNumber']?.toString(),
      carrier: json['carrier']?.toString(),
      timeline: timelineList,
    );
  }
}
