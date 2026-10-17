import 'package:equatable/equatable.dart';
import '../../../domain/orders/entities/order_entity.dart';
import '../../../domain/orders/entities/order_filter_type.dart';

abstract class OrderEvent extends Equatable {
  const OrderEvent();

  @override
  List<Object?> get props => [];
}

class OrdersRequested extends OrderEvent {
  const OrdersRequested();
}

class OrderRefreshed extends OrderEvent {
  const OrderRefreshed();
}

class OrderFilterChanged extends OrderEvent {
  final OrderFilterType filter;

  const OrderFilterChanged(this.filter);

  @override
  List<Object?> get props => [filter];
}

class OrderSearchChanged extends OrderEvent {
  final String query;

  const OrderSearchChanged(this.query);

  @override
  List<Object?> get props => [query];
}

class OrderSearchCleared extends OrderEvent {
  const OrderSearchCleared();
}

class OrderSearchToggled extends OrderEvent {
  const OrderSearchToggled();
}

class OrderCancelled extends OrderEvent {
  final String orderId;

  const OrderCancelled(this.orderId);

  @override
  List<Object?> get props => [orderId];
}

class OrderRatingSubmitted extends OrderEvent {
  final String orderId;
  final double rating;
  final String? review;

  const OrderRatingSubmitted({
    required this.orderId,
    required this.rating,
    this.review,
  });

  @override
  List<Object?> get props => [orderId, rating, review];
}

class OrderPaymentCompleted extends OrderEvent {
  final String orderId;

  const OrderPaymentCompleted(this.orderId);

  @override
  List<Object?> get props => [orderId];
}

class OrderReordered extends OrderEvent {
  final OrderEntity order;

  const OrderReordered(this.order);

  @override
  List<Object?> get props => [order];
}
