import 'package:equatable/equatable.dart';
import '../../../domain/orders/entities/order_entity.dart';
import '../../../domain/orders/entities/order_filter_type.dart';

abstract class OrderState extends Equatable {
  const OrderState();

  @override
  List<Object?> get props => [];
}

class OrderInitial extends OrderState {
  const OrderInitial();
}

class OrderLoading extends OrderState {
  const OrderLoading();
}

class OrderLoaded extends OrderState {
  final List<OrderEntity> allOrders;
  final List<OrderEntity> filteredOrders;
  final OrderFilterType selectedFilter;
  final String searchQuery;
  final bool isSearchExpanded;
  final Map<OrderFilterType, int> counts;
  final bool isActionInProgress;
  final String? message;

  const OrderLoaded({
    required this.allOrders,
    required this.filteredOrders,
    this.selectedFilter = OrderFilterType.all,
    this.searchQuery = '',
    this.isSearchExpanded = true,
    required this.counts,
    this.isActionInProgress = false,
    this.message,
  });

  OrderLoaded copyWith({
    List<OrderEntity>? allOrders,
    List<OrderEntity>? filteredOrders,
    OrderFilterType? selectedFilter,
    String? searchQuery,
    bool? isSearchExpanded,
    Map<OrderFilterType, int>? counts,
    bool? isActionInProgress,
    String? message,
  }) {
    return OrderLoaded(
      allOrders: allOrders ?? this.allOrders,
      filteredOrders: filteredOrders ?? this.filteredOrders,
      selectedFilter: selectedFilter ?? this.selectedFilter,
      searchQuery: searchQuery ?? this.searchQuery,
      isSearchExpanded: isSearchExpanded ?? this.isSearchExpanded,
      counts: counts ?? this.counts,
      isActionInProgress: isActionInProgress ?? this.isActionInProgress,
      message: message,
    );
  }

  @override
  List<Object?> get props => [
        allOrders,
        filteredOrders,
        selectedFilter,
        searchQuery,
        isSearchExpanded,
        counts,
        isActionInProgress,
        message,
      ];
}

class OrderFailure extends OrderState {
  final String message;

  const OrderFailure(this.message);

  @override
  List<Object?> get props => [message];
}
