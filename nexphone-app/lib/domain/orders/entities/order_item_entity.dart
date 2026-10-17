import 'package:equatable/equatable.dart';

class OrderItemEntity extends Equatable {
  final String id;
  final String productName;
  final String subtitle;
  final double unitPrice;
  final double? originalPrice;
  final int quantity;
  final String? imageUrl;

  const OrderItemEntity({
    required this.id,
    required this.productName,
    required this.subtitle,
    required this.unitPrice,
    this.originalPrice,
    required this.quantity,
    this.imageUrl,
  });

  @override
  List<Object?> get props => [
        id,
        productName,
        subtitle,
        unitPrice,
        originalPrice,
        quantity,
        imageUrl,
      ];
}
