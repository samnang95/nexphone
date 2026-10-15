import '../../../core/utils/usecase.dart';
import '../entities/product_entity.dart';
import '../repositories/product_repository.dart';

class SearchProductsUseCase implements UseCase<List<ProductEntity>, String> {
  final ProductRepository repository;

  SearchProductsUseCase(this.repository);

  @override
  Future<List<ProductEntity>> call(String query) async {
    return await repository.getProducts(search: query);
  }
}
