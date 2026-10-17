import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/theme/app_colors.dart';

class OrderRatingView extends StatelessWidget {
  final double? userRating;
  final ValueChanged<double>? onRate;
  final VoidCallback? onEditReview;

  const OrderRatingView({
    super.key,
    this.userRating,
    this.onRate,
    this.onEditReview,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark ? const Color(0xFF161924) : const Color(0xFFF6F8FD);
    final labelColor = isDark ? AppColors.textMutedDark : const Color(0xFF64748B);
    final starColor = isDark ? const Color(0xFF6E8BFF) : const Color(0xFF2563EB);

    if (userRating != null) {
      // Rated view (Card 3: "You Rated: ★★★★★ 5.0    Edit Review")
      final rating = userRating!;
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: AppSizes.p12, vertical: AppSizes.p8),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(AppSizes.radiusLg),
        ),
        child: Row(
          children: [
            Text(
              'You Rated:',
              style: TextStyle(
                fontSize: AppFontSizes.s12,
                fontWeight: FontWeight.w500,
                color: labelColor,
              ),
            ),
            AppSizes.w6,
            Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(5, (index) {
                return Icon(
                  index < rating.floor() ? Icons.star_rounded : Icons.star_border_rounded,
                  size: 16,
                  color: starColor,
                );
              }),
            ),
            AppSizes.w6,
            Text(
              rating.toStringAsFixed(1),
              style: TextStyle(
                fontSize: AppFontSizes.s12,
                fontWeight: FontWeight.w700,
                color: isDark ? AppColors.textPrimaryDark : const Color(0xFF1E293B),
              ),
            ),
            const Spacer(),
            GestureDetector(
              onTap: onEditReview,
              child: Text(
                'Edit Review',
                style: TextStyle(
                  fontSize: AppFontSizes.s12,
                  fontWeight: FontWeight.w700,
                  color: starColor,
                ),
              ),
            ),
          ],
        ),
      );
    } else {
      // Unrated prompt view (Card 4: "Rate this product:          ☆☆☆☆☆")
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: AppSizes.p12, vertical: AppSizes.p8),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(AppSizes.radiusLg),
        ),
        child: Row(
          children: [
            Text(
              'Rate this product:',
              style: TextStyle(
                fontSize: AppFontSizes.s12,
                fontWeight: FontWeight.w500,
                color: labelColor,
              ),
            ),
            const Spacer(),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(5, (index) {
                return GestureDetector(
                  onTap: () => onRate?.call(index + 1.0),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 2),
                    child: Icon(
                      Icons.star_outline_rounded,
                      size: 18,
                      color: isDark ? AppColors.textMutedDark : const Color(0xFF94A3B8),
                    ),
                  ),
                );
              }),
            ),
          ],
        ),
      );
    }
  }
}
