import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';

class OrderDeliveryBanner extends StatelessWidget {
  final String deliveryEstimate;

  const OrderDeliveryBanner({
    super.key,
    required this.deliveryEstimate,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark ? const Color(0xFF162238) : const Color(0xFFF0F6FF);
    final iconColor = isDark ? const Color(0xFF6E8BFF) : const Color(0xFF2563EB);
    final textColor = isDark ? const Color(0xFFD6E3FF) : const Color(0xFF1E3A8A);

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
            Icons.access_time_rounded,
            size: 16,
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
                children: [
                  const TextSpan(
                    text: 'Estimated Delivery: ',
                    style: TextStyle(fontWeight: FontWeight.w500),
                  ),
                  TextSpan(
                    text: deliveryEstimate,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
