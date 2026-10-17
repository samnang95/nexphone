import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/orders/entities/order_entity.dart';
import '../../../domain/orders/entities/order_filter_type.dart';
import '../bloc/order_bloc.dart';
import '../bloc/order_event.dart';

class OrderActions {
  final BuildContext context;

  const OrderActions(this.context);

  void requestOrders() => context.read<OrderBloc>().add(const OrdersRequested());
  void refresh() => context.read<OrderBloc>().add(const OrderRefreshed());
  void toggleSearch() => context.read<OrderBloc>().add(const OrderSearchToggled());
  void search(String query) => context.read<OrderBloc>().add(OrderSearchChanged(query));
  void clearSearch() => context.read<OrderBloc>().add(const OrderSearchCleared());
  void selectFilter(OrderFilterType filter) => context.read<OrderBloc>().add(OrderFilterChanged(filter));
  void cancelOrder(String orderId) => context.read<OrderBloc>().add(OrderCancelled(orderId));
  void rateOrder({required String orderId, required double rating, String? review}) => context.read<OrderBloc>().add(OrderRatingSubmitted(orderId: orderId, rating: rating, review: review));
  void completePayment(String orderId) => context.read<OrderBloc>().add(OrderPaymentCompleted(orderId));
  void buyAgain(OrderEntity order) => context.read<OrderBloc>().add(OrderReordered(order));
}

extension OrderActionsContextExtension on BuildContext {
  OrderActions get orderActions => OrderActions(this);
}
