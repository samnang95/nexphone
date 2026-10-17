import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../domain/orders/entities/order_entity.dart';
import '../../../domain/orders/entities/order_timeline_step_entity.dart';
import '../models/order_model.dart';

abstract class OrderRemoteDataSource {
  Future<List<OrderModel>> getOrders();
  Future<OrderModel> getOrderDetail(String orderId);
  Future<OrderModel> cancelOrder(String orderId);
  Future<OrderModel> rateOrder({required String orderId, required double rating, String? review});
}

class OrderRemoteDataSourceImpl implements OrderRemoteDataSource {
  final ApiClient? client;

  OrderRemoteDataSourceImpl({this.client});

  // In-memory mock store initialized with the exact sample data from UI design
  static final List<OrderModel> _inMemoryOrders = [
    OrderModel(
      id: 'KM-8942109',
      orderNumber: 'KM-8942109',
      dateFormatted: '24-Oct-2024, 10:15 AM',
      status: OrderStatus.shipped,
      statusLabel: 'Shipped • On the Way',
      deliveryEstimate: 'Tomorrow, Oct 25 by 1:00 PM',
      items: const [
        OrderItemModel(
          id: 'item-101',
          productName: 'Apple iPhone 15 Pro Max (256GB)',
          subtitle: 'Color: Natural Titanium • Qty: 1',
          unitPrice: 1199.00,
          originalPrice: 1299.00,
          quantity: 1,
          imageUrl: 'assets/images/products/nexphone_pro.jpg',
        ),
      ],
      subtotal: 1199.00,
      shippingFee: 12.50,
      tax: 0.0,
      discount: 0.0,
      totalAmount: 1211.50,
      paymentMethodLabel: 'Paid via Karman FlexPay (3x Split)',
      paymentAmountText: '\$1,211.50',
      shippingAddress: 'St 2004, Sen Sok, Phnom Penh, Cambodia',
      trackingNumber: 'KM-TRK-8942109',
      carrier: 'Karman Express Express Courier',
      timeline: const [
        OrderTimelineStepEntity(
          title: 'Order Placed',
          description: 'Order confirmed and verified in system',
          time: '24-Oct, 10:15 AM',
          isCompleted: true,
        ),
        OrderTimelineStepEntity(
          title: 'Payment Confirmed',
          description: 'Verified via Karman FlexPay (3x split)',
          time: '24-Oct, 10:18 AM',
          isCompleted: true,
        ),
        OrderTimelineStepEntity(
          title: 'Dispatched from Hub',
          description: 'Package sorted and handed to courier',
          time: '24-Oct, 03:30 PM',
          isCompleted: true,
        ),
        OrderTimelineStepEntity(
          title: 'Out for Delivery',
          description: 'Courier driver en route to Sen Sok',
          time: '25-Oct, 08:45 AM',
          isCompleted: true,
          isCurrent: true,
        ),
        OrderTimelineStepEntity(
          title: 'Estimated Delivery',
          description: 'Delivery expected before 1:00 PM',
          time: '25-Oct, 01:00 PM',
          isCompleted: false,
        ),
      ],
    ),
    OrderModel(
      id: 'KM-9940212',
      orderNumber: 'KM-9940212',
      dateFormatted: 'Today, 02:30 PM',
      status: OrderStatus.pending,
      statusLabel: 'Payment Pending',
      items: const [
        OrderItemModel(
          id: 'item-102',
          productName: 'Apple 20W Power + Clear Case',
          subtitle: 'Bundle • Qty: 2 Items',
          unitPrice: 87.00,
          quantity: 2,
          imageUrl: 'assets/images/products/nexphone_pro.jpg',
        ),
      ],
      subtotal: 87.00,
      shippingFee: 0.0,
      tax: 0.0,
      discount: 0.0,
      totalAmount: 87.00,
      paymentMethodLabel: 'Bakong KHQR',
      khqrNotice: 'Awaiting Bakong KHQR Confirm... Expires in 14m',
      shippingAddress: 'Toul Kork, Phnom Penh, Cambodia',
      timeline: const [
        OrderTimelineStepEntity(
          title: 'Order Created',
          description: 'Awaiting KHQR settlement',
          time: 'Today, 02:30 PM',
          isCompleted: true,
          isCurrent: true,
        ),
      ],
    ),
    OrderModel(
      id: 'KM-6660212',
      orderNumber: 'KM-6660212',
      dateFormatted: '15-Sep-2024, 01:00 PM',
      status: OrderStatus.delivered,
      statusLabel: 'Delivered on 16 Sep',
      items: const [
        OrderItemModel(
          id: 'item-103',
          productName: 'Samsung Galaxy S24 Ultra',
          subtitle: '512GB • Titanium Gray • Qty: 1',
          unitPrice: 1149.00,
          quantity: 1,
          imageUrl: 'assets/images/products/nexphone_pro.jpg',
        ),
      ],
      subtotal: 1149.00,
      shippingFee: 0.0,
      tax: 0.0,
      discount: 0.0,
      totalAmount: 1149.00,
      paymentMethodLabel: 'Visa •••• 4821',
      paymentAmountText: '\$1,149.00',
      userRating: 5.0,
      shippingAddress: 'BKK1, Chamkarmon, Phnom Penh, Cambodia',
      trackingNumber: 'KM-TRK-6660212',
      carrier: 'NexExpress',
      timeline: const [
        OrderTimelineStepEntity(
          title: 'Order Placed',
          description: 'Order confirmed',
          time: '15-Sep, 01:00 PM',
          isCompleted: true,
        ),
        OrderTimelineStepEntity(
          title: 'Delivered',
          description: 'Package delivered to reception',
          time: '16-Sep, 11:15 AM',
          isCompleted: true,
        ),
      ],
    ),
    OrderModel(
      id: 'KM-4445202',
      orderNumber: 'KM-4445202',
      dateFormatted: '12-Aug-2024, 03:00 PM',
      status: OrderStatus.delivered,
      statusLabel: 'Delivered',
      items: const [
        OrderItemModel(
          id: 'item-104',
          productName: 'AeroSound ANC Pro Headphone',
          subtitle: 'Color: Cosmic Navy • Qty: 1',
          unitPrice: 129.99,
          quantity: 1,
          imageUrl: 'assets/images/products/nexphone_pro.jpg',
        ),
      ],
      subtotal: 129.99,
      shippingFee: 0.0,
      tax: 0.0,
      discount: 0.0,
      totalAmount: 129.99,
      paymentMethodLabel: 'Mastercard •••• 1092',
      paymentAmountText: '\$129.99',
      userRating: null, // Unrated: Prompts user to rate
      shippingAddress: 'Chroy Changvar, Phnom Penh, Cambodia',
      timeline: const [
        OrderTimelineStepEntity(
          title: 'Delivered',
          description: 'Signed by recipient',
          time: '13-Aug, 02:40 PM',
          isCompleted: true,
        ),
      ],
    ),
    OrderModel(
      id: 'KM-3355242',
      orderNumber: 'KM-3355242',
      dateFormatted: '08-Aug-2024, 03:00 PM',
      status: OrderStatus.cancelled,
      statusLabel: 'Cancelled & Refunded',
      items: const [
        OrderItemModel(
          id: 'item-105',
          productName: 'Google Pixel 8 Pro (256GB)',
          subtitle: 'Porcelain White • Qty: 1',
          unitPrice: 1099.00,
          quantity: 1,
          imageUrl: 'assets/images/products/nexphone_pro.jpg',
        ),
      ],
      subtotal: 1099.00,
      shippingFee: 0.0,
      tax: 0.0,
      discount: 0.0,
      totalAmount: 1099.00,
      refundNotice: 'Refund of \$1,099.00 credited back to Karman Vault.',
      shippingAddress: 'Boeung Keng Kang, Phnom Penh, Cambodia',
      timeline: const [
        OrderTimelineStepEntity(
          title: 'Order Cancelled',
          description: 'Cancelled by customer',
          time: '08-Aug, 03:30 PM',
          isCompleted: true,
        ),
        OrderTimelineStepEntity(
          title: 'Refund Processed',
          description: '\$1,099.00 credited back to Karman Vault',
          time: '08-Aug, 03:35 PM',
          isCompleted: true,
        ),
      ],
    ),
    OrderModel(
      id: 'KM-2210841',
      orderNumber: 'KM-2210841',
      dateFormatted: '20-Jul-2024, 11:20 AM',
      status: OrderStatus.delivered,
      statusLabel: 'Delivered on 22 Jul',
      items: const [
        OrderItemModel(
          id: 'item-106',
          productName: 'NexPhone Ultra Wireless Charger (15W)',
          subtitle: 'Color: Midnight Black • Qty: 1',
          unitPrice: 49.00,
          quantity: 1,
          imageUrl: 'assets/images/products/nexphone_pro.jpg',
        ),
      ],
      subtotal: 49.00,
      shippingFee: 0.0,
      tax: 0.0,
      discount: 0.0,
      totalAmount: 49.00,
      paymentMethodLabel: 'Bakong KHQR',
      paymentAmountText: '\$49.00',
      userRating: 4.0,
      shippingAddress: 'Daun Penh, Phnom Penh, Cambodia',
      timeline: const [
        OrderTimelineStepEntity(
          title: 'Delivered',
          description: 'Delivered successfully',
          time: '22-Jul, 10:10 AM',
          isCompleted: true,
        ),
      ],
    ),
  ];

  @override
  Future<List<OrderModel>> getOrders() async {
    if (client != null) {
      try {
        final response = await client!.get(ApiEndpoints.orders);
        if (response.data is Map<String, dynamic>) {
          final ordersData = response.data['orders'] ?? response.data['data'];
          if (ordersData is List && ordersData.isNotEmpty) {
            return ordersData.whereType<Map<String, dynamic>>().map(OrderModel.fromJson).toList();
          }
        }
      } catch (_) {
        // Fall back to sample mock orders on network or dev environments
      }
    }
    // Return mock orders matching the exact UI design
    return List<OrderModel>.from(_inMemoryOrders);
  }

  @override
  Future<OrderModel> getOrderDetail(String orderId) async {
    final order = _inMemoryOrders.firstWhere(
      (o) => o.id == orderId || o.orderNumber == orderId,
      orElse: () => _inMemoryOrders.first,
    );
    return order;
  }

  @override
  Future<OrderModel> cancelOrder(String orderId) async {
    final index = _inMemoryOrders.indexWhere((o) => o.id == orderId || o.orderNumber == orderId);
    if (index != -1) {
      final old = _inMemoryOrders[index];
      final updated = old.copyWith(
        status: OrderStatus.cancelled,
        statusLabel: 'Cancelled & Refunded',
        refundNotice: 'Refund of \$${old.totalAmount.toStringAsFixed(2)} credited back to Karman Vault.',
      );
      _inMemoryOrders[index] = OrderModel(
        id: updated.id,
        orderNumber: updated.orderNumber,
        dateFormatted: updated.dateFormatted,
        status: updated.status,
        statusLabel: updated.statusLabel,
        deliveryEstimate: updated.deliveryEstimate,
        items: updated.items,
        subtotal: updated.subtotal,
        shippingFee: updated.shippingFee,
        tax: updated.tax,
        discount: updated.discount,
        totalAmount: updated.totalAmount,
        paymentMethodLabel: updated.paymentMethodLabel,
        paymentAmountText: updated.paymentAmountText,
        khqrNotice: null,
        userRating: updated.userRating,
        refundNotice: updated.refundNotice,
        shippingAddress: updated.shippingAddress,
        trackingNumber: updated.trackingNumber,
        carrier: updated.carrier,
        timeline: updated.timeline,
      );
      return _inMemoryOrders[index];
    }
    throw Exception('Order not found');
  }

  @override
  Future<OrderModel> rateOrder({required String orderId, required double rating, String? review}) async {
    final index = _inMemoryOrders.indexWhere((o) => o.id == orderId || o.orderNumber == orderId);
    if (index != -1) {
      final old = _inMemoryOrders[index];
      _inMemoryOrders[index] = OrderModel(
        id: old.id,
        orderNumber: old.orderNumber,
        dateFormatted: old.dateFormatted,
        status: old.status,
        statusLabel: old.statusLabel,
        deliveryEstimate: old.deliveryEstimate,
        items: old.items,
        subtotal: old.subtotal,
        shippingFee: old.shippingFee,
        tax: old.tax,
        discount: old.discount,
        totalAmount: old.totalAmount,
        paymentMethodLabel: old.paymentMethodLabel,
        paymentAmountText: old.paymentAmountText,
        khqrNotice: old.khqrNotice,
        userRating: rating,
        refundNotice: old.refundNotice,
        shippingAddress: old.shippingAddress,
        trackingNumber: old.trackingNumber,
        carrier: old.carrier,
        timeline: old.timeline,
      );
      return _inMemoryOrders[index];
    }
    throw Exception('Order not found');
  }
}
