import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../app/router/app_routes.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/theme/app_colors.dart';

class OrderHeader extends StatelessWidget {
  final VoidCallback? onSearchTap;
  final bool isSearchActive;

  const OrderHeader({
    super.key,
    this.onSearchTap,
    this.isSearchActive = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSizes.p16, vertical: AppSizes.p10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'My Orders',
            style: TextStyle(
              fontSize: AppFontSizes.s24,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
            ),
          ),
          Row(
            children: [
              // Search toggle icon button
              Material(
                color: Colors.transparent,
                shape: const CircleBorder(),
                clipBehavior: Clip.antiAlias,
                child: IconButton(
                  icon: Icon(
                    isSearchActive ? Icons.search_off_rounded : Icons.search_rounded,
                    size: 24,
                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                  ),
                  onPressed: onSearchTap,
                  splashRadius: 22,
                  tooltip: 'Search orders',
                ),
              ),
              AppSizes.w6,
              // Profile circular avatar button
              GestureDetector(
                onTap: () {
                  // Navigate to account if not already there
                  try {
                    context.push(AppRoutes.account);
                  } catch (_) {}
                },
                child: Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.25),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.person_rounded,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
