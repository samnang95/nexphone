import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../models/banner_model.dart';
import '../models/product_model.dart';

abstract class ProductRemoteDataSource {
  Future<List<ProductModel>> getProducts({String? category, String? search});
  Future<ProductModel?> getProductById(String id);
  Future<List<String>> getCategories();
  Future<List<BannerModel>> getBanners();
}

class ProductRemoteDataSourceImpl implements ProductRemoteDataSource {
  final ApiClient client;

  ProductRemoteDataSourceImpl({required this.client});

  @override
  Future<List<ProductModel>> getProducts({String? category, String? search}) async {
    final queryParams = <String, dynamic>{};
    if (category != null && category.isNotEmpty && category != 'All') {
      queryParams['category'] = category;
    }
    if (search != null && search.isNotEmpty) {
      queryParams['search'] = search;
    }

    final response = await client.get(
      ApiEndpoints.products,
      queryParameters: queryParams.isNotEmpty ? queryParams : null,
    );

    final data = response.data;
    if (data is Map<String, dynamic>) {
      final dynamic list = data['products'] ?? data['data'];
      if (list is List) {
        return list.map((e) => ProductModel.fromJson(e as Map<String, dynamic>)).toList();
      }
    } else if (data is List) {
      return data.map((e) => ProductModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }

  @override
  Future<ProductModel?> getProductById(String id) async {
    final response = await client.get('${ApiEndpoints.productDetail}/$id');
    final data = response.data;
    if (data is Map<String, dynamic>) {
      final dynamic raw = data['product'] ?? data['data'] ?? data;
      if (raw is Map<String, dynamic>) {
        return ProductModel.fromJson(raw);
      }
    }
    return null;
  }

  @override
  Future<List<String>> getCategories() async {
    final response = await client.get(ApiEndpoints.brands);
    final data = response.data;
    if (data is Map<String, dynamic>) {
      final dynamic list = data['brands'] ?? data['data'];
      if (list is List) {
        return list.map((e) => (e is Map ? e['name']?.toString() : e.toString()) ?? '').toList();
      }
    }
    return [];
  }

  @override
  Future<List<BannerModel>> getBanners() async {
    try {
      final response = await client.get(ApiEndpoints.banners);
      final data = response.data;
      if (data is Map<String, dynamic>) {
        final dynamic list = data['banners'] ?? data['data'];
        if (list is List) {
          return list.map((e) => BannerModel.fromJson(e as Map<String, dynamic>)).toList();
        }
      }
    } catch (_) {}
    return [];
  }
}
