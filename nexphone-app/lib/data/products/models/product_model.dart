import '../../../domain/products/entities/product_entity.dart';

class ProductModel extends ProductEntity {
  const ProductModel({
    required super.id,
    required super.name,
    required super.subtitle,
    required super.price,
    required super.rating,
    required super.imageUrl,
    required super.series,
    required super.badge,
    super.inStock = true,
    super.highlightSpecs = const [],
    super.isFavorite = false,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? json['productName']?.toString() ?? 'NexPhone Device',
      subtitle: json['subtitle']?.toString() ?? json['productSubtitle']?.toString() ?? '',
      price: (json['price'] as num?)?.toDouble() ?? (json['productPrice'] as num?)?.toDouble() ?? 999.0,
      rating: (json['rating'] as num?)?.toDouble() ?? 4.9,
      imageUrl: json['imageUrl']?.toString() ?? json['productImage']?.toString() ?? '',
      series: json['series']?.toString() ?? 'Pro Series',
      badge: json['badge']?.toString() ?? 'Flagship',
      inStock: json['inStock'] as bool? ?? true,
      highlightSpecs: (json['highlightSpecs'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      isFavorite: json['isFavorite'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'subtitle': subtitle,
      'price': price,
      'rating': rating,
      'imageUrl': imageUrl,
      'series': series,
      'badge': badge,
      'inStock': inStock,
      'highlightSpecs': highlightSpecs,
      'isFavorite': isFavorite,
    };
  }

  factory ProductModel.fromEntity(ProductEntity entity) {
    return ProductModel(
      id: entity.id,
      name: entity.name,
      subtitle: entity.subtitle,
      price: entity.price,
      rating: entity.rating,
      imageUrl: entity.imageUrl,
      series: entity.series,
      badge: entity.badge,
      inStock: entity.inStock,
      highlightSpecs: entity.highlightSpecs,
      isFavorite: entity.isFavorite,
    );
  }
}
