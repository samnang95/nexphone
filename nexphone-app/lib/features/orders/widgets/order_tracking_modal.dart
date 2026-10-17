import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../domain/orders/entities/order_entity.dart';

class OrderTrackingModal extends StatelessWidget {
  final OrderEntity order;

  const OrderTrackingModal({super.key, required this.order});

  static Future<void> show(BuildContext context, OrderEntity order) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => OrderTrackingModal(order: order),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? AppColors.darkSurface : Colors.white;
    final titleColor = isDark ? AppColors.textPrimaryDark : const Color(0xFF111827);
    final subtitleColor = isDark ? AppColors.textMutedDark : const Color(0xFF64748B);

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppSizes.radius2Xl)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      padding: EdgeInsets.fromLTRB(
        AppSizes.p20,
        AppSizes.p12,
        AppSizes.p20,
        MediaQuery.of(context).padding.bottom + AppSizes.p20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkBorder : const Color(0xFFD1D5DB),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          AppSizes.h16,
          // Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Track Order',
                    style: TextStyle(
                      fontSize: AppFontSizes.s18,
                      fontWeight: FontWeight.w800,
                      color: titleColor,
                    ),
                  ),
                  AppSizes.h2,
                  Text(
                    'Order# ${order.orderNumber}',
                    style: TextStyle(
                      fontSize: AppFontSizes.s12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          AppSizes.h12,
          // Delivery Status Card
          Container(
            padding: const EdgeInsets.all(AppSizes.p14),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1B2338) : const Color(0xFFF0F5FF),
              borderRadius: BorderRadius.circular(AppSizes.radiusXl),
              border: Border.all(
                color: isDark ? const Color(0xFF2C3959) : const Color(0xFFD6E3FF),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.local_shipping_rounded,
                    color: AppColors.primary,
                    size: 22,
                  ),
                ),
                AppSizes.w12,
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        order.statusLabel,
                        style: TextStyle(
                          fontSize: AppFontSizes.s14,
                          fontWeight: FontWeight.w700,
                          color: titleColor,
                        ),
                      ),
                      if (order.deliveryEstimate != null) ...[
                        AppSizes.h2,
                        Text(
                          order.deliveryEstimate!,
                          style: TextStyle(
                            fontSize: AppFontSizes.s12,
                            fontWeight: FontWeight.w500,
                            color: subtitleColor,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
          AppSizes.h16,
          // Timeline
          Text(
            'DELIVERY PROGRESS',
            style: TextStyle(
              fontSize: AppFontSizes.s11,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.5,
              color: subtitleColor,
            ),
          ),
          AppSizes.h12,
          if (order.timeline.isNotEmpty)
            ...order.timeline.asMap().entries.map((entry) {
              final idx = entry.key;
              final step = entry.value;
              final isLast = idx == order.timeline.length - 1;

              return IntrinsicHeight(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      children: [
                        Container(
                          width: 20,
                          height: 20,
                          decoration: BoxDecoration(
                            color: step.isCompleted
                                ? (step.isCurrent ? AppColors.primary : AppColors.emeraldSuccess)
                                : (isDark ? AppColors.darkBorder : const Color(0xFFE2E8F0)),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            step.isCompleted ? Icons.check : Icons.circle,
                            size: 12,
                            color: Colors.white,
                          ),
                        ),
                        if (!isLast)
                          Expanded(
                            child: Container(
                              width: 2,
                              color: step.isCompleted
                                  ? AppColors.primary.withValues(alpha: 0.4)
                                  : (isDark ? AppColors.darkBorder : const Color(0xFFE2E8F0)),
                            ),
                          ),
                      ],
                    ),
                    AppSizes.w12,
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: AppSizes.p16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  step.title,
                                  style: TextStyle(
                                    fontSize: AppFontSizes.s13,
                                    fontWeight: step.isCurrent ? FontWeight.w800 : FontWeight.w600,
                                    color: step.isCurrent ? AppColors.primary : titleColor,
                                  ),
                                ),
                                Text(
                                  step.time,
                                  style: TextStyle(
                                    fontSize: AppFontSizes.s11,
                                    color: subtitleColor,
                                  ),
                                ),
                              ],
                            ),
                            AppSizes.h2,
                            Text(
                              step.description,
                              style: TextStyle(
                                fontSize: AppFontSizes.s12,
                                color: subtitleColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
          AppSizes.h8,
          // Courier Information Card
          Container(
            padding: const EdgeInsets.all(AppSizes.p12),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurfaceElevated : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(AppSizes.radiusLg),
              border: Border.all(
                color: isDark ? AppColors.darkBorder : const Color(0xFFE2E8F0),
              ),
            ),
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 20,
                  backgroundColor: AppColors.primaryLight,
                  child: Icon(Icons.person_pin_rounded, color: Colors.white),
                ),
                AppSizes.w10,
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        order.carrier ?? 'NexPhone Express Courier',
                        style: TextStyle(
                          fontSize: AppFontSizes.s13,
                          fontWeight: FontWeight.w700,
                          color: titleColor,
                        ),
                      ),
                      Text(
                        'Tracking: ${order.trackingNumber ?? 'KM-TRK-${order.orderNumber}'}',
                        style: TextStyle(
                          fontSize: AppFontSizes.s11,
                          color: subtitleColor,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.phone_rounded, color: AppColors.primary),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Calling courier driver...')),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
