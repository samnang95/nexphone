import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/theme/app_colors.dart';

enum OrderButtonVariant {
  primary,
  secondary,
  destructive,
}

class OrderActionButton extends StatelessWidget {
  final String label;
  final IconData? icon;
  final OrderButtonVariant variant;
  final VoidCallback onTap;
  final bool isFullWidth;

  const OrderActionButton({
    super.key,
    required this.label,
    this.icon,
    this.variant = OrderButtonVariant.secondary,
    required this.onTap,
    this.isFullWidth = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color bgColor;
    Color fgColor;
    BorderSide? border;

    switch (variant) {
      case OrderButtonVariant.primary:
        bgColor = AppColors.primary;
        fgColor = Colors.white;
        border = null;
        break;
      case OrderButtonVariant.secondary:
        bgColor = isDark ? AppColors.darkSurfaceElevated : const Color(0xFFEFF2F8);
        fgColor = isDark ? AppColors.textPrimaryDark : const Color(0xFF1E293B);
        border = BorderSide(
          color: isDark ? AppColors.darkBorder : const Color(0xFFE2E6F0),
          width: 0.8,
        );
        break;
      case OrderButtonVariant.destructive:
        bgColor = isDark ? const Color(0xFF381B20) : const Color(0xFFFDECEB);
        fgColor = isDark ? const Color(0xFFFF7A85) : const Color(0xFFDC2626);
        border = null;
        break;
    }

    Widget content = Row(
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (icon != null) ...[
          Icon(icon, size: 16, color: fgColor),
          AppSizes.w6,
        ],
        Text(
          label,
          style: TextStyle(
            fontSize: AppFontSizes.s13,
            fontWeight: FontWeight.w700,
            color: fgColor,
          ),
        ),
      ],
    );

    return SizedBox(
      height: 42,
      width: isFullWidth ? double.infinity : null,
      child: Material(
        color: bgColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSizes.radiusFull),
          side: border ?? BorderSide.none,
        ),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          splashColor: fgColor.withValues(alpha: 0.12),
          highlightColor: fgColor.withValues(alpha: 0.06),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSizes.p16),
            child: Center(child: content),
          ),
        ),
      ),
    );
  }
}
