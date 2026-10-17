import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../domain/orders/entities/order_item_entity.dart';

class OrderProductItem extends StatelessWidget {
  final OrderItemEntity item;
  final bool isBluePrice;

  const OrderProductItem({
    super.key,
    required this.item,
    this.isBluePrice = false,
  });

  IconData _getProductIcon(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('headphone') || lower.contains('audio') || lower.contains('sound')) {
      return Icons.headphones_rounded;
    }
    if (lower.contains('watch')) {
      return Icons.watch_rounded;
    }
    if (lower.contains('charger') || lower.contains('power') || lower.contains('case')) {
      return Icons.power_rounded;
    }
    return Icons.phone_iphone_rounded;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final titleColor = isDark ? AppColors.textPrimaryDark : const Color(0xFF111827);
    final subtitleColor = isDark ? AppColors.textMutedDark : const Color(0xFF64748B);
    final thumbBg = isDark ? AppColors.darkSurfaceElevated : const Color(0xFFF3F5FA);
    final thumbBorder = isDark ? AppColors.darkBorder : const Color(0xFFE5E8F2);

    final priceColor = isBluePrice
        ? (isDark ? const Color(0xFF8A9FFF) : const Color(0xFF2563EB))
        : (isDark ? AppColors.textPrimaryDark : const Color(0xFF111827));

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Thumbnail container
        Container(
          width: 62,
          height: 62,
          decoration: BoxDecoration(
            color: thumbBg,
            borderRadius: BorderRadius.circular(AppSizes.radiusLg),
            border: Border.all(color: thumbBorder, width: 1),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(AppSizes.radiusLg),
            child: Stack(
              fit: StackFit.expand,
              children: [
                if (item.imageUrl != null && item.imageUrl!.isNotEmpty)
                  Image.asset(
                    item.imageUrl!,
                    fit: BoxFit.cover,
                    errorBuilder: (_, _, _) => Center(
                      child: Icon(
                        _getProductIcon(item.productName),
                        color: isDark ? AppColors.textMutedDark : const Color(0xFF94A3B8),
                        size: 28,
                      ),
                    ),
                  )
                else
                  Center(
                    child: Icon(
                      _getProductIcon(item.productName),
                      color: isDark ? AppColors.textMutedDark : const Color(0xFF94A3B8),
                      size: 28,
                    ),
                  ),
              ],
            ),
          ),
        ),
        AppSizes.w12,
        // Product Details
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                item.productName,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: AppFontSizes.s14,
                  fontWeight: FontWeight.w700,
                  color: titleColor,
                ),
              ),
              AppSizes.h4,
              Text(
                item.subtitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: AppFontSizes.s12,
                  fontWeight: FontWeight.w500,
                  color: subtitleColor,
                ),
              ),
              AppSizes.h6,
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    '\$${item.unitPrice.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: AppFontSizes.s15,
                      fontWeight: FontWeight.w800,
                      color: priceColor,
                    ),
                  ),
                  if (item.originalPrice != null) ...[
                    AppSizes.w8,
                    Text(
                      '\$${item.originalPrice!.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: AppFontSizes.s12,
                        fontWeight: FontWeight.w500,
                        color: isDark ? AppColors.textMutedDark : const Color(0xFF94A3B8),
                        decoration: TextDecoration.lineThrough,
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
