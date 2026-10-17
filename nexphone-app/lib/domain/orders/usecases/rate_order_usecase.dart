import '../../../core/utils/usecase.dart';
import '../entities/order_entity.dart';
import '../repositories/order_repository.dart';

class RateOrderParams {
  final String orderId;
  final double rating;
  final String? review;

  const RateOrderParams({
    required this.orderId,
    required this.rating,
    this.review,
  });
}

class RateOrderUseCase implements UseCase<OrderEntity, RateOrderParams> {
  final OrderRepository repository;

  RateOrderUseCase(this.repository);

  @override
  Future<OrderEntity> call(RateOrderParams params) {
    return repository.rateOrder(
      orderId: params.orderId,
      rating: params.rating,
      review: params.review,
    );
  }
}
