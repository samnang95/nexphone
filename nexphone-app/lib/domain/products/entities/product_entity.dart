import 'package:equatable/equatable.dart';

class ProductEntity extends Equatable {
  final String id;
  final String name;
  final String subtitle;
  final double price;
  final double rating;
  final String imageUrl;
  final String series;
  final String badge;
  final bool inStock;
  final List<String> highlightSpecs;
  final bool isFavorite;

  const ProductEntity({
    required this.id,
    required this.name,
    required this.subtitle,
    required this.price,
    required this.rating,
    required this.imageUrl,
    required this.series,
    required this.badge,
    this.inStock = true,
    this.highlightSpecs = const [],
    this.isFavorite = false,
  });

  ProductEntity copyWith({
    String? id,
    String? name,
    String? subtitle,
    double? price,
    double? rating,
    String? imageUrl,
    String? series,
    String? badge,
    bool? inStock,
    List<String>? highlightSpecs,
    bool? isFavorite,
  }) {
    return ProductEntity(
      id: id ?? this.id,
      name: name ?? this.name,
      subtitle: subtitle ?? this.subtitle,
      price: price ?? this.price,
      rating: rating ?? this.rating,
      imageUrl: imageUrl ?? this.imageUrl,
      series: series ?? this.series,
      badge: badge ?? this.badge,
      inStock: inStock ?? this.inStock,
      highlightSpecs: highlightSpecs ?? this.highlightSpecs,
      isFavorite: isFavorite ?? this.isFavorite,
    );
  }

  @override
  List<Object?> get props => [
        id,
        name,
        subtitle,
        price,
        rating,
        imageUrl,
        series,
        badge,
        inStock,
        highlightSpecs,
        isFavorite,
      ];
}
