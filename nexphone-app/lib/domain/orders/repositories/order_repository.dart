import '../entities/order_entity.dart';
import '../entities/order_filter_type.dart';

abstract class OrderRepository {
  Future<List<OrderEntity>> getOrders({OrderFilterType? filter, String? query});
  Future<OrderEntity> getOrderDetail(String orderId);
  Future<OrderEntity> cancelOrder(String orderId);
  Future<OrderEntity> rateOrder({required String orderId, required double rating, String? review});
}
