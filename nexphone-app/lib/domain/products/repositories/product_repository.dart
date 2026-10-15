import '../entities/banner_entity.dart';
import '../entities/product_entity.dart';

abstract class ProductRepository {
  Future<List<ProductEntity>> getProducts({String? category, String? search});
  Future<ProductEntity?> getProductById(String id);
  Future<List<String>> getCategories();
  Future<List<BannerEntity>> getBanners();
}
