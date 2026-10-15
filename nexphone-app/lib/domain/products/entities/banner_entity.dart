import 'package:equatable/equatable.dart';

class BannerEntity extends Equatable {
  final String id;
  final String title;
  final String subtitle;
  final String imageUrl;
  final String badge;
  final String ctaText;

  const BannerEntity({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    this.badge = 'FLAGSHIP PREMIERE',
    this.ctaText = 'Explore Flagship',
  });

  @override
  List<Object?> get props => [id, title, subtitle, imageUrl, badge, ctaText];
}
