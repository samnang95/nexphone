import '../../../domain/products/entities/banner_entity.dart';
import '../../../domain/products/entities/product_entity.dart';
import '../../../domain/products/repositories/product_repository.dart';
import '../datasources/product_local_data_source.dart';
import '../datasources/product_remote_data_source.dart';

class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDataSource remoteDataSource;
  final ProductLocalDataSource localDataSource;

  ProductRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<List<ProductEntity>> getProducts({String? category, String? search}) async {
    try {
      final remoteList = await remoteDataSource.getProducts(category: category, search: search);
      if (remoteList.isNotEmpty) {
        return remoteList;
      }
    } catch (_) {}

    final cached = await localDataSource.getCachedProducts();
    return cached.where((p) {
      final matchesCategory = category == null || category == 'All' || p.series.toLowerCase() == category.toLowerCase();
      final matchesSearch = search == null ||
          search.isEmpty ||
          p.name.toLowerCase().contains(search.toLowerCase()) ||
          p.subtitle.toLowerCase().contains(search.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();
  }

  @override
  Future<ProductEntity?> getProductById(String id) async {
    try {
      final product = await remoteDataSource.getProductById(id);
      if (product != null) return product;
    } catch (_) {}

    return await localDataSource.getProductById(id);
  }

  @override
  Future<List<String>> getCategories() async {
    try {
      final remoteCategories = await remoteDataSource.getCategories();
      if (remoteCategories.isNotEmpty) return remoteCategories;
    } catch (_) {}

    return await localDataSource.getCachedCategories();
  }

  @override
  Future<List<BannerEntity>> getBanners() async {
    try {
      final remoteBanners = await remoteDataSource.getBanners();
      if (remoteBanners.isNotEmpty) return remoteBanners;
    } catch (_) {}

    return await localDataSource.getCachedBanners();
  }
}
