import '../../../core/utils/usecase.dart';
import '../entities/banner_entity.dart';
import '../repositories/product_repository.dart';

class GetBannersUseCase implements UseCase<List<BannerEntity>, NoParams> {
  final ProductRepository repository;

  GetBannersUseCase(this.repository);

  @override
  Future<List<BannerEntity>> call(NoParams params) async {
    return await repository.getBanners();
  }
}
