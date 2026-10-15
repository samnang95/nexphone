import '../../../domain/products/entities/banner_entity.dart';

class BannerModel extends BannerEntity {
  const BannerModel({
    required super.id,
    required super.title,
    required super.subtitle,
    required super.imageUrl,
    super.badge = 'FLAGSHIP PREMIERE',
    super.ctaText = 'Explore Flagship',
  });

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    return BannerModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      title: json['title']?.toString() ?? json['headline']?.toString() ?? 'Flagship Premiere',
      subtitle: json['subtitle']?.toString() ?? '',
      imageUrl: json['imageUrl']?.toString() ?? json['image']?.toString() ?? '',
      badge: json['badge']?.toString() ?? 'FLAGSHIP PREMIERE',
      ctaText: json['ctaText']?.toString() ?? 'Explore Flagship',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'subtitle': subtitle,
      'imageUrl': imageUrl,
      'badge': badge,
      'ctaText': ctaText,
    };
  }
}
