import '../../../core/utils/usecase.dart';
import '../entities/product_entity.dart';
import '../repositories/product_repository.dart';

class GetProductDetailUseCase implements UseCase<ProductEntity?, String> {
  final ProductRepository repository;

  GetProductDetailUseCase(this.repository);

  @override
  Future<ProductEntity?> call(String id) async {
    return await repository.getProductById(id);
  }
}
