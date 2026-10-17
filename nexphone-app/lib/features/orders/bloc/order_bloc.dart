import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/orders/entities/order_entity.dart';
import '../../../domain/orders/entities/order_filter_type.dart';
import '../../../domain/orders/usecases/cancel_order_usecase.dart';
import '../../../domain/orders/usecases/get_orders_usecase.dart';
import '../../../domain/orders/usecases/rate_order_usecase.dart';
import 'order_event.dart';
import 'order_state.dart';

class OrderBloc extends Bloc<OrderEvent, OrderState> {
  final GetOrdersUseCase getOrdersUseCase;
  final CancelOrderUseCase cancelOrderUseCase;
  final RateOrderUseCase rateOrderUseCase;

  OrderBloc({
    required this.getOrdersUseCase,
    required this.cancelOrderUseCase,
    required this.rateOrderUseCase,
  }) : super(const OrderInitial()) {
    on<OrdersRequested>(_onOrdersRequested);
    on<OrderRefreshed>(_onOrderRefreshed);
    on<OrderFilterChanged>(_onOrderFilterChanged);
    on<OrderSearchChanged>(_onOrderSearchChanged);
    on<OrderSearchCleared>(_onOrderSearchCleared);
    on<OrderSearchToggled>(_onOrderSearchToggled);
    on<OrderCancelled>(_onOrderCancelled);
    on<OrderRatingSubmitted>(_onOrderRatingSubmitted);
    on<OrderPaymentCompleted>(_onOrderPaymentCompleted);
    on<OrderReordered>(_onOrderReordered);
  }

  Future<void> _onOrdersRequested(
    OrdersRequested event,
    Emitter<OrderState> emit,
  ) async {
    emit(const OrderLoading());
    await _loadOrders(emit);
  }

  Future<void> _onOrderRefreshed(
    OrderRefreshed event,
    Emitter<OrderState> emit,
  ) async {
    await _loadOrders(emit);
  }

  Future<void> _loadOrders(Emitter<OrderState> emit) async {
    try {
      final orders = await getOrdersUseCase(null);
      final counts = _computeCounts(orders);
      final filtered = _filterOrders(
        orders: orders,
        filter: OrderFilterType.all,
        query: '',
      );

      emit(OrderLoaded(
        allOrders: orders,
        filteredOrders: filtered,
        selectedFilter: OrderFilterType.all,
        searchQuery: '',
        isSearchExpanded: true,
        counts: counts,
      ));
    } catch (e) {
      emit(OrderFailure(e.toString()));
    }
  }

  void _onOrderFilterChanged(
    OrderFilterChanged event,
    Emitter<OrderState> emit,
  ) {
    if (state is OrderLoaded) {
      final current = state as OrderLoaded;
      final filtered = _filterOrders(
        orders: current.allOrders,
        filter: event.filter,
        query: current.searchQuery,
      );
      emit(current.copyWith(
        selectedFilter: event.filter,
        filteredOrders: filtered,
      ));
    }
  }

  void _onOrderSearchChanged(
    OrderSearchChanged event,
    Emitter<OrderState> emit,
  ) {
    if (state is OrderLoaded) {
      final current = state as OrderLoaded;
      final filtered = _filterOrders(
        orders: current.allOrders,
        filter: current.selectedFilter,
        query: event.query,
      );
      emit(current.copyWith(
        searchQuery: event.query,
        filteredOrders: filtered,
      ));
    }
  }

  void _onOrderSearchCleared(
    OrderSearchCleared event,
    Emitter<OrderState> emit,
  ) {
    if (state is OrderLoaded) {
      final current = state as OrderLoaded;
      final filtered = _filterOrders(
        orders: current.allOrders,
        filter: current.selectedFilter,
        query: '',
      );
      emit(current.copyWith(
        searchQuery: '',
        filteredOrders: filtered,
      ));
    }
  }

  void _onOrderSearchToggled(
    OrderSearchToggled event,
    Emitter<OrderState> emit,
  ) {
    if (state is OrderLoaded) {
      final current = state as OrderLoaded;
      final nextExpanded = !current.isSearchExpanded;
      final nextQuery = nextExpanded ? current.searchQuery : '';
      final filtered = _filterOrders(
        orders: current.allOrders,
        filter: current.selectedFilter,
        query: nextQuery,
      );
      emit(current.copyWith(
        isSearchExpanded: nextExpanded,
        searchQuery: nextQuery,
        filteredOrders: filtered,
      ));
    }
  }

  Future<void> _onOrderCancelled(
    OrderCancelled event,
    Emitter<OrderState> emit,
  ) async {
    if (state is OrderLoaded) {
      final current = state as OrderLoaded;
      try {
        final updatedOrder = await cancelOrderUseCase(event.orderId);
        final updatedAll = current.allOrders.map((o) {
          return (o.id == event.orderId || o.orderNumber == event.orderId) ? updatedOrder : o;
        }).toList();

        final counts = _computeCounts(updatedAll);
        final filtered = _filterOrders(
          orders: updatedAll,
          filter: current.selectedFilter,
          query: current.searchQuery,
        );

        emit(current.copyWith(
          allOrders: updatedAll,
          filteredOrders: filtered,
          counts: counts,
          message: 'Order ${event.orderId} was cancelled successfully',
        ));
      } catch (e) {
        emit(current.copyWith(message: 'Failed to cancel order: $e'));
      }
    }
  }

  Future<void> _onOrderRatingSubmitted(
    OrderRatingSubmitted event,
    Emitter<OrderState> emit,
  ) async {
    if (state is OrderLoaded) {
      final current = state as OrderLoaded;
      try {
        final updatedOrder = await rateOrderUseCase(RateOrderParams(
          orderId: event.orderId,
          rating: event.rating,
          review: event.review,
        ));
        final updatedAll = current.allOrders.map((o) {
          return (o.id == event.orderId || o.orderNumber == event.orderId) ? updatedOrder : o;
        }).toList();

        final filtered = _filterOrders(
          orders: updatedAll,
          filter: current.selectedFilter,
          query: current.searchQuery,
        );

        emit(current.copyWith(
          allOrders: updatedAll,
          filteredOrders: filtered,
          message: 'Thank you! Rating saved successfully.',
        ));
      } catch (e) {
        emit(current.copyWith(message: 'Failed to submit rating: $e'));
      }
    }
  }

  void _onOrderPaymentCompleted(
    OrderPaymentCompleted event,
    Emitter<OrderState> emit,
  ) {
    if (state is OrderLoaded) {
      final current = state as OrderLoaded;
      final updatedAll = current.allOrders.map((o) {
        if (o.id == event.orderId || o.orderNumber == event.orderId) {
          return o.copyWith(
            status: OrderStatus.shipped,
            statusLabel: 'Shipped • On the Way',
            khqrNotice: null,
            deliveryEstimate: 'Tomorrow, Oct 25 by 1:00 PM',
            paymentMethodLabel: 'Paid via Bakong KHQR',
            paymentAmountText: '\$${o.totalAmount.toStringAsFixed(2)}',
          );
        }
        return o;
      }).toList();

      final counts = _computeCounts(updatedAll);
      final filtered = _filterOrders(
        orders: updatedAll,
        filter: current.selectedFilter,
        query: current.searchQuery,
      );

      emit(current.copyWith(
        allOrders: updatedAll,
        filteredOrders: filtered,
        counts: counts,
        message: 'Payment confirmed! Order #${event.orderId} is now being processed.',
      ));
    }
  }

  void _onOrderReordered(
    OrderReordered event,
    Emitter<OrderState> emit,
  ) {
    if (state is OrderLoaded) {
      final current = state as OrderLoaded;
      emit(current.copyWith(
        message: 'Added ${event.order.primaryItem.productName} to Cart',
      ));
    }
  }

  Map<OrderFilterType, int> _computeCounts(List<OrderEntity> orders) {
    return {
      OrderFilterType.all: orders.length,
      OrderFilterType.pending: orders.where((o) => o.status.isPending).length,
      OrderFilterType.shipped: orders.where((o) => o.status.isShipped).length,
      OrderFilterType.delivered: orders.where((o) => o.status.isDelivered).length,
      OrderFilterType.cancelled: orders.where((o) => o.status.isCancelled).length,
    };
  }

  List<OrderEntity> _filterOrders({
    required List<OrderEntity> orders,
    required OrderFilterType filter,
    required String query,
  }) {
    Iterable<OrderEntity> result = orders;

    if (filter != OrderFilterType.all) {
      result = result.where((o) {
        switch (filter) {
          case OrderFilterType.pending:
            return o.status.isPending;
          case OrderFilterType.shipped:
            return o.status.isShipped;
          case OrderFilterType.delivered:
            return o.status.isDelivered;
          case OrderFilterType.cancelled:
            return o.status.isCancelled;
          case OrderFilterType.all:
            return true;
        }
      });
    }

    if (query.trim().isNotEmpty) {
      final q = query.trim().toLowerCase();
      result = result.where((o) {
        final numMatch = o.orderNumber.toLowerCase().contains(q);
        final itemMatch = o.items.any((item) => item.productName.toLowerCase().contains(q));
        final statusMatch = o.statusLabel.toLowerCase().contains(q);
        return numMatch || itemMatch || statusMatch;
      });
    }

    return result.toList();
  }
}
