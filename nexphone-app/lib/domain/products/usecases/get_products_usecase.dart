import 'package:equatable/equatable.dart';
import '../../../core/utils/usecase.dart';
import '../entities/product_entity.dart';
import '../repositories/product_repository.dart';

class GetProductsParams extends Equatable {
  final String? category;
  final String? search;

  const GetProductsParams({this.category, this.search});

  @override
  List<Object?> get props => [category, search];
}

class GetProductsUseCase implements UseCase<List<ProductEntity>, GetProductsParams> {
  final ProductRepository repository;

  GetProductsUseCase(this.repository);

  @override
  Future<List<ProductEntity>> call(GetProductsParams params) async {
    return await repository.getProducts(category: params.category, search: params.search);
  }
}
