import '../../../core/utils/usecase.dart';
import '../entities/order_entity.dart';
import '../repositories/order_repository.dart';

class CancelOrderUseCase implements UseCase<OrderEntity, String> {
  final OrderRepository repository;

  CancelOrderUseCase(this.repository);

  @override
  Future<OrderEntity> call(String orderId) {
    return repository.cancelOrder(orderId);
  }
}
