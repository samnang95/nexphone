import '../../../core/utils/usecase.dart';
import '../entities/order_entity.dart';
import '../entities/order_filter_type.dart';
import '../repositories/order_repository.dart';

class GetOrdersParams {
  final OrderFilterType? filter;
  final String? query;

  const GetOrdersParams({this.filter, this.query});
}

class GetOrdersUseCase implements UseCase<List<OrderEntity>, GetOrdersParams?> {
  final OrderRepository repository;

  GetOrdersUseCase(this.repository);

  @override
  Future<List<OrderEntity>> call([GetOrdersParams? params]) {
    return repository.getOrders(
      filter: params?.filter,
      query: params?.query,
    );
  }
}
