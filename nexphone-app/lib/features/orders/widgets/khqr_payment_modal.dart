import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../domain/orders/entities/order_entity.dart';

class KhqrPaymentModal extends StatelessWidget {
  final OrderEntity order;
  final VoidCallback onPaymentSimulated;

  const KhqrPaymentModal({
    super.key,
    required this.order,
    required this.onPaymentSimulated,
  });

  static Future<void> show(BuildContext context, OrderEntity order, VoidCallback onPaymentSimulated) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => KhqrPaymentModal(order: order, onPaymentSimulated: onPaymentSimulated),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? AppColors.darkSurface : Colors.white;
    final subtitleColor = isDark ? AppColors.textMutedDark : const Color(0xFF64748B);

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppSizes.radius2Xl)),
      ),
      padding: EdgeInsets.fromLTRB(
        AppSizes.p24,
        AppSizes.p16,
        AppSizes.p24,
        MediaQuery.of(context).padding.bottom + AppSizes.p24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkBorder : const Color(0xFFD1D5DB),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          AppSizes.h20,
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFDC2626),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'BAKONG',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.2,
                    color: Colors.white,
                  ),
                ),
              ),
              AppSizes.w8,
              const Text(
                'KHQR',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.5,
                  color: Color(0xFF1E293B),
                ),
              ),
            ],
          ),
          AppSizes.h12,
          Text(
            'Scan to pay with any banking app',
            style: TextStyle(
              fontSize: AppFontSizes.s13,
              fontWeight: FontWeight.w500,
              color: subtitleColor,
            ),
          ),
          AppSizes.h16,
          // Amount pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurfaceElevated : const Color(0xFFF1F5FD),
              borderRadius: BorderRadius.circular(AppSizes.radiusFull),
            ),
            child: Text(
              '\$${order.totalAmount.toStringAsFixed(2)} USD',
              style: TextStyle(
                fontSize: AppFontSizes.s18,
                fontWeight: FontWeight.w900,
                color: isDark ? AppColors.primaryLight : AppColors.primary,
              ),
            ),
          ),
          AppSizes.h20,
          // QR container visual
          Container(
            width: 200,
            height: 200,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AppSizes.radiusXl),
              border: Border.all(color: const Color(0xFFE2E8F0), width: 2),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.06),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                const Icon(
                  Icons.qr_code_2_rounded,
                  size: 168,
                  color: Color(0xFF0F172A),
                ),
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
                        blurRadius: 4,
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(Icons.bolt_rounded, color: AppColors.primary, size: 24),
                  ),
                ),
              ],
            ),
          ),
          AppSizes.h16,
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.timer_outlined, size: 16, color: Color(0xFFDC2626)),
              AppSizes.w6,
              const Text(
                'Expires in 13:58 minutes',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFDC2626),
                ),
              ),
            ],
          ),
          AppSizes.h24,
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                onPaymentSimulated();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppSizes.radiusFull),
                ),
              ),
              child: const Text(
                'Simulate Payment Success',
                style: TextStyle(
                  fontSize: AppFontSizes.s14,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
