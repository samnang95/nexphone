import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../domain/orders/entities/order_entity.dart';
import 'order_status_badge.dart';

class OrderDetailsModal extends StatelessWidget {
  final OrderEntity order;

  const OrderDetailsModal({super.key, required this.order});

  static Future<void> show(BuildContext context, OrderEntity order) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => OrderDetailsModal(order: order),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? AppColors.darkSurface : Colors.white;
    final titleColor = isDark ? AppColors.textPrimaryDark : const Color(0xFF111827);
    final subtitleColor = isDark ? AppColors.textMutedDark : const Color(0xFF64748B);
    final dividerColor = isDark ? AppColors.darkBorder : const Color(0xFFE5E7EB);

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppSizes.radius2Xl)),
      ),
      padding: EdgeInsets.fromLTRB(
        AppSizes.p20,
        AppSizes.p12,
        AppSizes.p20,
        MediaQuery.of(context).padding.bottom + AppSizes.p20,
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Order Details',
                      style: TextStyle(
                        fontSize: AppFontSizes.s18,
                        fontWeight: FontWeight.w800,
                        color: titleColor,
                      ),
                    ),
                    Text(
                      'Order# ${order.orderNumber}',
                      style: TextStyle(
                        fontSize: AppFontSizes.s12,
                        fontWeight: FontWeight.w600,
                        color: subtitleColor,
                      ),
                    ),
                  ],
                ),
                OrderStatusBadge(status: order.status, label: order.statusLabel),
              ],
            ),
            AppSizes.h16,
            Divider(color: dividerColor),
            AppSizes.h12,
            Text(
              'PURCHASED ITEMS',
              style: TextStyle(
                fontSize: AppFontSizes.s11,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
                color: subtitleColor,
              ),
            ),
            AppSizes.h10,
            ...order.items.map((item) {
              return Padding(
                padding: const EdgeInsets.only(bottom: AppSizes.p12),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.darkSurfaceElevated : const Color(0xFFF3F5FA),
                        borderRadius: BorderRadius.circular(AppSizes.radiusMd),
                      ),
                      child: const Center(
                        child: Icon(Icons.phone_iphone_rounded, color: AppColors.primary, size: 24),
                      ),
                    ),
                    AppSizes.w12,
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.productName,
                            style: TextStyle(
                              fontSize: AppFontSizes.s13,
                              fontWeight: FontWeight.w700,
                              color: titleColor,
                            ),
                          ),
                          Text(
                            item.subtitle,
                            style: TextStyle(fontSize: AppFontSizes.s11, color: subtitleColor),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '\$${item.unitPrice.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: AppFontSizes.s13,
                        fontWeight: FontWeight.w700,
                        color: titleColor,
                      ),
                    ),
                  ],
                ),
              );
            }),
            Divider(color: dividerColor),
            AppSizes.h12,
            Text(
              'PAYMENT BREAKDOWN',
              style: TextStyle(
                fontSize: AppFontSizes.s11,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
                color: subtitleColor,
              ),
            ),
            AppSizes.h10,
            _priceRow('Subtotal', '\$${order.subtotal.toStringAsFixed(2)}', titleColor, subtitleColor),
            AppSizes.h6,
            _priceRow('Shipping Fee', '\$${order.shippingFee.toStringAsFixed(2)}', titleColor, subtitleColor),
            if (order.discount > 0) ...[
              AppSizes.h6,
              _priceRow('Discount', '-\$${order.discount.toStringAsFixed(2)}', AppColors.emeraldSuccess, subtitleColor),
            ],
            AppSizes.h8,
            Divider(color: dividerColor),
            AppSizes.h8,
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total Amount',
                  style: TextStyle(
                    fontSize: AppFontSizes.s15,
                    fontWeight: FontWeight.w800,
                    color: titleColor,
                  ),
                ),
                Text(
                  '\$${order.totalAmount.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: AppFontSizes.s17,
                    fontWeight: FontWeight.w900,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
            AppSizes.h16,
            Divider(color: dividerColor),
            AppSizes.h12,
            Text(
              'DELIVERY ADDRESS',
              style: TextStyle(
                fontSize: AppFontSizes.s11,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
                color: subtitleColor,
              ),
            ),
            AppSizes.h8,
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 18, color: AppColors.primary),
                AppSizes.w8,
                Expanded(
                  child: Text(
                    order.shippingAddress ?? 'Toul Kork, Phnom Penh, Cambodia',
                    style: TextStyle(
                      fontSize: AppFontSizes.s12,
                      fontWeight: FontWeight.w500,
                      color: titleColor,
                    ),
                  ),
                ),
              ],
            ),
            AppSizes.h24,
            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.check_rounded, color: Colors.white, size: 18),
                label: const Text('Close Details', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSizes.radiusFull)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _priceRow(String label, String value, Color valueColor, Color labelColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(fontSize: AppFontSizes.s12, color: labelColor)),
        Text(value, style: TextStyle(fontSize: AppFontSizes.s12, fontWeight: FontWeight.w600, color: valueColor)),
      ],
    );
  }
}
