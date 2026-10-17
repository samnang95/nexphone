import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../domain/orders/entities/order_entity.dart';

class OrderStatusBadge extends StatelessWidget {
  final OrderStatus status;
  final String label;

  const OrderStatusBadge({
    super.key,
    required this.status,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color bgColor;
    Color fgColor;
    IconData icon;

    switch (status) {
      case OrderStatus.shipped:
        bgColor = isDark ? const Color(0xFF23254A) : const Color(0xFFEBEFFE);
        fgColor = isDark ? const Color(0xFFA5B4FC) : const Color(0xFF3742FA);
        icon = Icons.local_shipping_outlined;
        break;
      case OrderStatus.pending:
        bgColor = isDark ? const Color(0xFF3B1E22) : const Color(0xFFFFEDEA);
        fgColor = isDark ? const Color(0xFFFF8B94) : const Color(0xFFDC2626);
        icon = Icons.error_outline_rounded;
        break;
      case OrderStatus.delivered:
        bgColor = isDark ? const Color(0xFF1B2B48) : const Color(0xFFE8EEFD);
        fgColor = isDark ? const Color(0xFF93C5FD) : const Color(0xFF2563EB);
        icon = label.toLowerCase().contains('on') ? Icons.check_circle_outline_rounded : Icons.inventory_2_outlined;
        break;
      case OrderStatus.cancelled:
        bgColor = isDark ? const Color(0xFF252838) : const Color(0xFFECEEF5);
        fgColor = isDark ? const Color(0xFF9AA0B5) : const Color(0xFF5A6075);
        icon = Icons.cancel_outlined;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSizes.p10, vertical: 5),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(AppSizes.radiusFull),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: fgColor),
          AppSizes.w4,
          Text(
            label,
            style: TextStyle(
              fontSize: AppFontSizes.s11,
              fontWeight: FontWeight.w700,
              color: fgColor,
            ),
          ),
        ],
      ),
    );
  }
}
