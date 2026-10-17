import '../../../domain/orders/entities/order_entity.dart';
import '../../../domain/orders/entities/order_filter_type.dart';
import '../../../domain/orders/repositories/order_repository.dart';
import '../datasources/order_remote_data_source.dart';

class OrderRepositoryImpl implements OrderRepository {
  final OrderRemoteDataSource remoteDataSource;

  OrderRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<OrderEntity>> getOrders({OrderFilterType? filter, String? query}) async {
    final all = await remoteDataSource.getOrders();

    Iterable<OrderEntity> filtered = all;

    if (filter != null && filter != OrderFilterType.all) {
      filtered = filtered.where((order) {
        switch (filter) {
          case OrderFilterType.pending:
            return order.status.isPending;
          case OrderFilterType.shipped:
            return order.status.isShipped;
          case OrderFilterType.delivered:
            return order.status.isDelivered;
          case OrderFilterType.cancelled:
            return order.status.isCancelled;
          case OrderFilterType.all:
            return true;
        }
      });
    }

    if (query != null && query.trim().isNotEmpty) {
      final q = query.trim().toLowerCase();
      filtered = filtered.where((order) {
        final matchesOrderNum = order.orderNumber.toLowerCase().contains(q);
        final matchesProduct = order.items.any((item) => item.productName.toLowerCase().contains(q));
        final matchesStatus = order.statusLabel.toLowerCase().contains(q);
        return matchesOrderNum || matchesProduct || matchesStatus;
      });
    }

    return filtered.toList();
  }

  @override
  Future<OrderEntity> getOrderDetail(String orderId) {
    return remoteDataSource.getOrderDetail(orderId);
  }

  @override
  Future<OrderEntity> cancelOrder(String orderId) {
    return remoteDataSource.cancelOrder(orderId);
  }

  @override
  Future<OrderEntity> rateOrder({required String orderId, required double rating, String? review}) {
    return remoteDataSource.rateOrder(orderId: orderId, rating: rating, review: review);
  }
}
