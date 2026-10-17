import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../domain/orders/entities/order_entity.dart';
import 'khqr_payment_modal.dart';
import 'order_action_button.dart';
import 'order_delivery_banner.dart';
import 'order_details_modal.dart';
import 'order_payment_banner.dart';
import 'order_product_item.dart';
import 'order_rating_view.dart';
import 'order_refund_banner.dart';
import 'order_status_badge.dart';
import 'order_tracking_modal.dart';

class OrderCard extends StatelessWidget {
  final OrderEntity order;
  final VoidCallback? onCancelOrder;
  final ValueChanged<double>? onRateOrder;
  final VoidCallback? onBuyAgain;
  final VoidCallback? onCompletePayment;

  const OrderCard({
    super.key,
    required this.order,
    this.onCancelOrder,
    this.onRateOrder,
    this.onBuyAgain,
    this.onCompletePayment,
  });

  void _copyOrderNumber(BuildContext context) {
    Clipboard.setData(ClipboardData(text: order.orderNumber));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white, size: 18),
            AppSizes.w8,
            Text('Order #${order.orderNumber} copied to clipboard'),
          ],
        ),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _showHelpDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSizes.radiusXl)),
        title: const Text('Order Support', style: TextStyle(fontWeight: FontWeight.w800)),
        content: Text(
          'Need help regarding Order #${order.orderNumber}? Our 24/7 support team is available via live chat or phone.',
          style: const TextStyle(fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Opening NexPhone Live Chat...')),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('Chat Support', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showInvoice(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.receipt_long_rounded, color: Colors.white, size: 18),
            AppSizes.w8,
            Text('Downloading invoice for #${order.orderNumber}...'),
          ],
        ),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final cardBg = isDark ? AppColors.darkSurface : Colors.white;
    final cardBorder = isDark ? AppColors.darkBorder : const Color(0xFFE9ECF2);
    final titleColor = isDark ? AppColors.textPrimaryDark : const Color(0xFF111827);
    final subtitleColor = isDark ? AppColors.textMutedDark : const Color(0xFF777B8E);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppSizes.p16, vertical: AppSizes.p6),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(AppSizes.radius2Xl),
        border: Border.all(color: cardBorder, width: 1),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black.withValues(alpha: 0.3) : const Color(0x08000000),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      padding: const EdgeInsets.all(AppSizes.p16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Order ID + Date & Status Badge
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Order Number + Copy Icon + Date
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Flexible(
                          child: Text(
                            'Order# ${order.orderNumber}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: AppFontSizes.s14,
                              fontWeight: FontWeight.w800,
                              color: titleColor,
                            ),
                          ),
                        ),
                        AppSizes.w6,
                        GestureDetector(
                          onTap: () => _copyOrderNumber(context),
                          child: Icon(
                            Icons.copy_rounded,
                            size: 14,
                            color: subtitleColor,
                          ),
                        ),
                      ],
                    ),
                    AppSizes.h2,
                    Text(
                      order.dateFormatted,
                      style: TextStyle(
                        fontSize: AppFontSizes.s11,
                        fontWeight: FontWeight.w500,
                        color: subtitleColor,
                      ),
                    ),
                  ],
                ),
              ),
              AppSizes.w8,
              OrderStatusBadge(
                status: order.status,
                label: order.statusLabel,
              ),
            ],
          ),

          // Estimated Delivery Banner (if present)
          if (order.deliveryEstimate != null) ...[
            AppSizes.h12,
            OrderDeliveryBanner(deliveryEstimate: order.deliveryEstimate!),
          ],

          // Product item row
          AppSizes.h12,
          OrderProductItem(
            item: order.primaryItem,
            isBluePrice: order.primaryItem.originalPrice != null,
          ),

          // Payment / KHQR Banner (if present)
          if (order.khqrNotice != null || order.paymentMethodLabel != null) ...[
            AppSizes.h12,
            OrderPaymentBanner(
              khqrNotice: order.khqrNotice,
              paymentNote: order.paymentMethodLabel,
              paymentAmount: order.paymentAmountText,
            ),
          ],

          // Rating section (for delivered orders)
          if (order.status.isDelivered) ...[
            AppSizes.h12,
            OrderRatingView(
              userRating: order.userRating,
              onRate: onRateOrder,
              onEditReview: () {
                _showEditReviewSheet(context);
              },
            ),
          ],

          // Refund Banner (for cancelled orders)
          if (order.refundNotice != null) ...[
            AppSizes.h12,
            OrderRefundBanner(refundNotice: order.refundNotice!),
          ],

          // Action buttons
          AppSizes.h14,
          _buildActionButtons(context),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    // 1. Shipped order: [Track Live Order] [View Details]
    if (order.status.isShipped) {
      return Row(
        children: [
          Expanded(
            child: OrderActionButton(
              label: 'Track Live Order',
              icon: Icons.near_me_outlined,
              variant: OrderButtonVariant.primary,
              onTap: () => OrderTrackingModal.show(context, order),
            ),
          ),
          AppSizes.w10,
          Expanded(
            child: OrderActionButton(
              label: 'View Details',
              variant: OrderButtonVariant.secondary,
              onTap: () => OrderDetailsModal.show(context, order),
            ),
          ),
        ],
      );
    }

    // 2. Pending payment: [Cancel Order] [Complete Payment]
    if (order.status.isPending) {
      return Row(
        children: [
          Expanded(
            child: OrderActionButton(
              label: 'Cancel Order',
              variant: OrderButtonVariant.destructive,
              onTap: () {
                _confirmCancelDialog(context);
              },
            ),
          ),
          AppSizes.w10,
          Expanded(
            child: OrderActionButton(
              label: 'Complete Payment',
              icon: Icons.check_circle_outline_rounded,
              variant: OrderButtonVariant.primary,
              onTap: () {
                KhqrPaymentModal.show(context, order, () {
                  onCompletePayment?.call();
                });
              },
            ),
          ),
        ],
      );
    }

    // 3. Delivered with rated review: [Buy Again] [Invoice]
    if (order.status.isDelivered && order.userRating != null) {
      return Row(
        children: [
          Expanded(
            child: OrderActionButton(
              label: 'Buy Again',
              icon: Icons.restart_alt_rounded,
              variant: OrderButtonVariant.primary,
              onTap: () {
                onBuyAgain?.call();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Added ${order.primaryItem.productName} to Cart'),
                    backgroundColor: AppColors.primary,
                    duration: const Duration(seconds: 2),
                  ),
                );
              },
            ),
          ),
          AppSizes.w10,
          Expanded(
            child: OrderActionButton(
              label: 'Invoice',
              icon: Icons.receipt_long_outlined,
              variant: OrderButtonVariant.secondary,
              onTap: () => _showInvoice(context),
            ),
          ),
        ],
      );
    }

    // 4. Delivered unrated: Full-width [Buy Again]
    if (order.status.isDelivered && order.userRating == null) {
      return OrderActionButton(
        label: 'Buy Again',
        icon: Icons.restart_alt_rounded,
        variant: OrderButtonVariant.secondary,
        isFullWidth: true,
        onTap: () {
          onBuyAgain?.call();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Added ${order.primaryItem.productName} to Cart'),
              backgroundColor: AppColors.primary,
              duration: const Duration(seconds: 2),
            ),
          );
        },
      );
    }

    // 5. Cancelled & Refunded: Full-width [Need Help with this Order?]
    if (order.status.isCancelled) {
      return OrderActionButton(
        label: 'Need Help with this Order?',
        icon: Icons.help_outline_rounded,
        variant: OrderButtonVariant.secondary,
        isFullWidth: true,
        onTap: () => _showHelpDialog(context),
      );
    }

    // Fallback default
    return OrderActionButton(
      label: 'View Details',
      variant: OrderButtonVariant.secondary,
      isFullWidth: true,
      onTap: () => OrderDetailsModal.show(context, order),
    );
  }

  void _confirmCancelDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSizes.radiusXl)),
        title: const Text('Cancel Order?', style: TextStyle(fontWeight: FontWeight.w800)),
        content: Text(
          'Are you sure you want to cancel Order #${order.orderNumber}? If any payments were processed, they will be refunded.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Keep Order'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              onCancelOrder?.call();
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFDC2626)),
            child: const Text('Yes, Cancel', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showEditReviewSheet(BuildContext context) {
    final reviewController = TextEditingController();
    var currentRating = order.userRating ?? 5.0;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) {
          final isDark = Theme.of(ctx).brightness == Brightness.dark;
          return Container(
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(AppSizes.radius2Xl)),
            ),
            padding: EdgeInsets.fromLTRB(
              AppSizes.p20,
              AppSizes.p16,
              AppSizes.p20,
              MediaQuery.of(ctx).viewInsets.bottom + AppSizes.p20,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
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
                Text(
                  'Edit Review for ${order.primaryItem.productName}',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                ),
                AppSizes.h12,
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (index) {
                    return GestureDetector(
                      onTap: () {
                        setSheetState(() {
                          currentRating = index + 1.0;
                        });
                      },
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: Icon(
                          index < currentRating ? Icons.star_rounded : Icons.star_border_rounded,
                          size: 32,
                          color: AppColors.primary,
                        ),
                      ),
                    );
                  }),
                ),
                AppSizes.h16,
                TextField(
                  controller: reviewController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: 'Share your thoughts about this product...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppSizes.radiusLg),
                    ),
                  ),
                ),
                AppSizes.h16,
                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      onRateOrder?.call(currentRating);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSizes.radiusFull)),
                    ),
                    child: const Text('Update Review', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
