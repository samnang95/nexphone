import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';

class AccountBadge extends StatelessWidget {
  final String label;
  final Color color;
  final IconData? icon;

  const AccountBadge({
    super.key,
    required this.label,
    required this.color,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSizes.p8,
        vertical: AppSizes.p2,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(AppSizes.radiusFull),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 11, color: color),
            AppSizes.w4,
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: AppFontSizes.s11,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
