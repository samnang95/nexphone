import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/theme/app_colors.dart';

class OrderRefundBanner extends StatelessWidget {
  final String refundNotice;

  const OrderRefundBanner({
    super.key,
    required this.refundNotice,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark ? const Color(0xFF1B1E2D) : const Color(0xFFF3F6FD);
    final iconColor = isDark ? const Color(0xFF8A9FFF) : const Color(0xFF3B66FF);
    final textColor = isDark ? AppColors.textSecondaryDark : const Color(0xFF475569);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: AppSizes.p12, vertical: AppSizes.p10),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(
            Icons.account_balance_wallet_outlined,
            size: 18,
            color: iconColor,
          ),
          AppSizes.w8,
          Expanded(
            child: Text(
              refundNotice,
              style: TextStyle(
                fontSize: AppFontSizes.s12,
                fontWeight: FontWeight.w600,
                color: textColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
