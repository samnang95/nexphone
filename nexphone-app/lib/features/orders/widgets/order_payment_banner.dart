import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/theme/app_colors.dart';

class OrderPaymentBanner extends StatelessWidget {
  final String? paymentNote;
  final String? paymentAmount;
  final String? khqrNotice;

  const OrderPaymentBanner({
    super.key,
    this.paymentNote,
    this.paymentAmount,
    this.khqrNotice,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark ? const Color(0xFF1B1E2D) : const Color(0xFFF3F6FD);
    final iconColor = isDark ? const Color(0xFF8A9FFF) : const Color(0xFF3B66FF);
    final textColor = isDark ? AppColors.textPrimaryDark : const Color(0xFF2D3748);

    if (khqrNotice != null && khqrNotice!.isNotEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: AppSizes.p12, vertical: AppSizes.p8),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(AppSizes.radiusLg),
        ),
        child: Row(
          children: [
            Icon(
              Icons.qr_code_2_rounded,
              size: 18,
              color: iconColor,
            ),
            AppSizes.w8,
            Expanded(
              child: RichText(
                text: TextSpan(
                  style: TextStyle(
                    fontSize: AppFontSizes.s12,
                    fontFamily: 'NotoSans',
                    color: textColor,
                  ),
                  children: const [
                    TextSpan(text: 'Awaiting '),
                    TextSpan(
                      text: 'Bakong KHQR',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                    TextSpan(text: ' Confirm...'),
                  ],
                ),
              ),
            ),
            const Text(
              'Expires in 14m',
              style: TextStyle(
                fontSize: AppFontSizes.s11,
                fontWeight: FontWeight.w700,
                color: Color(0xFFDC2626),
              ),
            ),
          ],
        ),
      );
    }

    if (paymentNote != null && paymentNote!.isNotEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: AppSizes.p12, vertical: AppSizes.p8),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(AppSizes.radiusLg),
        ),
        child: Row(
          children: [
            Icon(
              Icons.bolt_rounded,
              size: 18,
              color: iconColor,
            ),
            AppSizes.w6,
            Expanded(
              child: Text(
                paymentNote!,
                style: TextStyle(
                  fontSize: AppFontSizes.s12,
                  fontWeight: FontWeight.w600,
                  color: textColor,
                ),
              ),
            ),
            if (paymentAmount != null)
              Text(
                paymentAmount!,
                style: TextStyle(
                  fontSize: AppFontSizes.s12,
                  fontWeight: FontWeight.w800,
                  color: textColor,
                ),
              ),
          ],
        ),
      );
    }

    return const SizedBox.shrink();
  }
}
