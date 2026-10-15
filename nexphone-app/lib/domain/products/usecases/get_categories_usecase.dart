import '../../../core/utils/usecase.dart';
import '../repositories/product_repository.dart';

class GetCategoriesUseCase implements UseCase<List<String>, NoParams> {
  final ProductRepository repository;

  GetCategoriesUseCase(this.repository);

  @override
  Future<List<String>> call(NoParams params) async {
    return await repository.getCategories();
  }
}
