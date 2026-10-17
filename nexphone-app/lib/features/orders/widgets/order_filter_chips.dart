import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../domain/orders/entities/order_filter_type.dart';

class OrderFilterChips extends StatelessWidget {
  final OrderFilterType selectedFilter;
  final Map<OrderFilterType, int> counts;
  final ValueChanged<OrderFilterType> onFilterSelected;

  const OrderFilterChips({
    super.key,
    required this.selectedFilter,
    required this.counts,
    required this.onFilterSelected,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: AppSizes.p16, vertical: AppSizes.p12),
      child: Row(
        children: OrderFilterType.values.map((filter) {
          final isSelected = selectedFilter == filter;
          final count = counts[filter] ?? 0;

          return Padding(
            padding: const EdgeInsets.only(right: AppSizes.p8),
            child: _FilterChipItem(
              filter: filter,
              count: count,
              isSelected: isSelected,
              isDark: isDark,
              onTap: () => onFilterSelected(filter),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _FilterChipItem extends StatelessWidget {
  final OrderFilterType filter;
  final int count;
  final bool isSelected;
  final bool isDark;
  final VoidCallback onTap;

  const _FilterChipItem({
    required this.filter,
    required this.count,
    required this.isSelected,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final activeBg = AppColors.primary;
    final inactiveBg = isDark ? AppColors.darkSurfaceElevated : const Color(0xFFEFF1F7);

    final activeTextColor = Colors.white;
    final inactiveTextColor = isDark ? AppColors.textSecondaryDark : const Color(0xFF4A4D5E);

    final activeBadgeBg = Colors.white.withValues(alpha: 0.25);
    final inactiveBadgeBg = isDark ? AppColors.darkBorder : const Color(0xFFDFE2EC);

    final activeBadgeText = Colors.white;
    final inactiveBadgeText = isDark ? AppColors.textPrimaryDark : const Color(0xFF4A4D5E);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSizes.radiusFull),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOut,
          padding: const EdgeInsets.symmetric(horizontal: AppSizes.p14, vertical: AppSizes.p8),
          decoration: BoxDecoration(
            color: isSelected ? activeBg : inactiveBg,
            borderRadius: BorderRadius.circular(AppSizes.radiusFull),
            border: isSelected
                ? null
                : Border.all(
                    color: isDark ? AppColors.darkBorder : const Color(0xFFE2E5EE),
                    width: 1,
                  ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                filter.label,
                style: TextStyle(
                  fontSize: AppFontSizes.s13,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                  color: isSelected ? activeTextColor : inactiveTextColor,
                ),
              ),
              AppSizes.w6,
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: isSelected ? activeBadgeBg : inactiveBadgeBg,
                  borderRadius: BorderRadius.circular(AppSizes.radiusFull),
                ),
                child: Text(
                  count.toString(),
                  style: TextStyle(
                    fontSize: AppFontSizes.s11,
                    fontWeight: FontWeight.w700,
                    color: isSelected ? activeBadgeText : inactiveBadgeText,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
