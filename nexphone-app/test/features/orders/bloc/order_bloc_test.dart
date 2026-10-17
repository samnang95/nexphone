import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:nexphone_app/domain/orders/entities/order_entity.dart';
import 'package:nexphone_app/domain/orders/entities/order_filter_type.dart';
import 'package:nexphone_app/domain/orders/entities/order_item_entity.dart';
import 'package:nexphone_app/domain/orders/usecases/cancel_order_usecase.dart';
import 'package:nexphone_app/domain/orders/usecases/get_orders_usecase.dart';
import 'package:nexphone_app/domain/orders/usecases/rate_order_usecase.dart';
import 'package:nexphone_app/features/orders/bloc/order_bloc.dart';
import 'package:nexphone_app/features/orders/bloc/order_event.dart';
import 'package:nexphone_app/features/orders/bloc/order_state.dart';

class MockGetOrdersUseCase extends Mock implements GetOrdersUseCase {}
class MockCancelOrderUseCase extends Mock implements CancelOrderUseCase {}
class MockRateOrderUseCase extends Mock implements RateOrderUseCase {}

void main() {
  late MockGetOrdersUseCase mockGetOrdersUseCase;
  late MockCancelOrderUseCase mockCancelOrderUseCase;
  late MockRateOrderUseCase mockRateOrderUseCase;

  final sampleOrders = [
    const OrderEntity(
      id: 'KM-8942109',
      orderNumber: 'KM-8942109',
      dateFormatted: '24-Oct-2024, 10:15 AM',
      status: OrderStatus.shipped,
      statusLabel: 'Shipped • On the Way',
      deliveryEstimate: 'Tomorrow, Oct 25 by 1:00 PM',
      items: [
        OrderItemEntity(
          id: 'item-1',
          productName: 'Apple iPhone 15 Pro Max (256GB)',
          subtitle: 'Color: Natural Titanium • Qty: 1',
          unitPrice: 1199.0,
          originalPrice: 1299.0,
          quantity: 1,
        ),
      ],
      totalAmount: 1211.50,
      paymentMethodLabel: 'Paid via Karman FlexPay (3x Split)',
      paymentAmountText: '\$1,211.50',
    ),
    const OrderEntity(
      id: 'KM-9940212',
      orderNumber: 'KM-9940212',
      dateFormatted: 'Today, 02:30 PM',
      status: OrderStatus.pending,
      statusLabel: 'Payment Pending',
      items: [
        OrderItemEntity(
          id: 'item-2',
          productName: 'Apple 20W Power + Clear Case',
          subtitle: 'Bundle • Qty: 2 Items',
          unitPrice: 87.0,
          quantity: 2,
        ),
      ],
      totalAmount: 87.0,
      khqrNotice: 'Awaiting Bakong KHQR Confirm...   Expires in 14m',
    ),
    const OrderEntity(
      id: 'KM-6660212',
      orderNumber: 'KM-6660212',
      dateFormatted: '15-Sep-2024, 01:00 PM',
      status: OrderStatus.delivered,
      statusLabel: 'Delivered on 16 Sep',
      items: [
        OrderItemEntity(
          id: 'item-3',
          productName: 'Samsung Galaxy S24 Ultra',
          subtitle: '512GB • Titanium Gray • Qty: 1',
          unitPrice: 1149.0,
          quantity: 1,
        ),
      ],
      totalAmount: 1149.0,
      userRating: 5.0,
    ),
  ];

  setUpAll(() {
    registerFallbackValue(const RateOrderParams(orderId: 'dummy', rating: 5.0));
  });

  setUp(() {
    mockGetOrdersUseCase = MockGetOrdersUseCase();
    mockCancelOrderUseCase = MockCancelOrderUseCase();
    mockRateOrderUseCase = MockRateOrderUseCase();
  });

  group('OrderBloc Tests', () {
    test('initial state is OrderInitial', () {
      final bloc = OrderBloc(
        getOrdersUseCase: mockGetOrdersUseCase,
        cancelOrderUseCase: mockCancelOrderUseCase,
        rateOrderUseCase: mockRateOrderUseCase,
      );
      expect(bloc.state, const OrderInitial());
    });

    blocTest<OrderBloc, OrderState>(
      'emits [OrderLoading, OrderLoaded] on OrdersRequested success',
      build: () {
        when(() => mockGetOrdersUseCase(any())).thenAnswer((_) async => sampleOrders);
        return OrderBloc(
          getOrdersUseCase: mockGetOrdersUseCase,
          cancelOrderUseCase: mockCancelOrderUseCase,
          rateOrderUseCase: mockRateOrderUseCase,
        );
      },
      act: (bloc) => bloc.add(const OrdersRequested()),
      expect: () => [
        const OrderLoading(),
        isA<OrderLoaded>()
            .having((s) => s.allOrders.length, 'allOrders.length', 3)
            .having((s) => s.filteredOrders.length, 'filteredOrders.length', 3)
            .having((s) => s.counts[OrderFilterType.all], 'all count', 3)
            .having((s) => s.counts[OrderFilterType.shipped], 'shipped count', 1)
            .having((s) => s.counts[OrderFilterType.pending], 'pending count', 1),
      ],
    );

    blocTest<OrderBloc, OrderState>(
      'filters orders by status on OrderFilterChanged',
      build: () {
        when(() => mockGetOrdersUseCase(any())).thenAnswer((_) async => sampleOrders);
        return OrderBloc(
          getOrdersUseCase: mockGetOrdersUseCase,
          cancelOrderUseCase: mockCancelOrderUseCase,
          rateOrderUseCase: mockRateOrderUseCase,
        );
      },
      seed: () => OrderLoaded(
        allOrders: sampleOrders,
        filteredOrders: sampleOrders,
        counts: const {
          OrderFilterType.all: 3,
          OrderFilterType.shipped: 1,
          OrderFilterType.pending: 1,
          OrderFilterType.delivered: 1,
          OrderFilterType.cancelled: 0,
        },
      ),
      act: (bloc) => bloc.add(const OrderFilterChanged(OrderFilterType.shipped)),
      expect: () => [
        isA<OrderLoaded>()
            .having((s) => s.selectedFilter, 'selectedFilter', OrderFilterType.shipped)
            .having((s) => s.filteredOrders.length, 'filteredOrders.length', 1)
            .having((s) => s.filteredOrders.first.orderNumber, 'orderNumber', 'KM-8942109'),
      ],
    );

    blocTest<OrderBloc, OrderState>(
      'filters orders by search query on OrderSearchChanged',
      build: () {
        when(() => mockGetOrdersUseCase(any())).thenAnswer((_) async => sampleOrders);
        return OrderBloc(
          getOrdersUseCase: mockGetOrdersUseCase,
          cancelOrderUseCase: mockCancelOrderUseCase,
          rateOrderUseCase: mockRateOrderUseCase,
        );
      },
      seed: () => OrderLoaded(
        allOrders: sampleOrders,
        filteredOrders: sampleOrders,
        counts: const {OrderFilterType.all: 3},
      ),
      act: (bloc) => bloc.add(const OrderSearchChanged('samsung')),
      expect: () => [
        isA<OrderLoaded>()
            .having((s) => s.searchQuery, 'searchQuery', 'samsung')
            .having((s) => s.filteredOrders.length, 'filteredOrders.length', 1)
            .having((s) => s.filteredOrders.first.orderNumber, 'orderNumber', 'KM-6660212'),
      ],
    );

    blocTest<OrderBloc, OrderState>(
      'toggles search bar visibility and clears search query on OrderSearchToggled',
      build: () => OrderBloc(
        getOrdersUseCase: mockGetOrdersUseCase,
        cancelOrderUseCase: mockCancelOrderUseCase,
        rateOrderUseCase: mockRateOrderUseCase,
      ),
      seed: () => OrderLoaded(
        allOrders: sampleOrders,
        filteredOrders: sampleOrders,
        isSearchExpanded: true,
        searchQuery: 'iphone',
        counts: const {OrderFilterType.all: 3},
      ),
      act: (bloc) => bloc.add(const OrderSearchToggled()),
      expect: () => [
        isA<OrderLoaded>()
            .having((s) => s.isSearchExpanded, 'isSearchExpanded', false)
            .having((s) => s.searchQuery, 'searchQuery', ''),
      ],
    );

    blocTest<OrderBloc, OrderState>(
      'updates order status to shipped on OrderPaymentCompleted',
      build: () => OrderBloc(
        getOrdersUseCase: mockGetOrdersUseCase,
        cancelOrderUseCase: mockCancelOrderUseCase,
        rateOrderUseCase: mockRateOrderUseCase,
      ),
      seed: () => OrderLoaded(
        allOrders: sampleOrders,
        filteredOrders: sampleOrders,
        counts: const {
          OrderFilterType.all: 3,
          OrderFilterType.pending: 1,
          OrderFilterType.shipped: 1,
          OrderFilterType.delivered: 1,
          OrderFilterType.cancelled: 0,
        },
      ),
      act: (bloc) => bloc.add(const OrderPaymentCompleted('KM-9940212')),
      expect: () => [
        isA<OrderLoaded>()
            .having((s) => s.allOrders.firstWhere((o) => o.id == 'KM-9940212').status, 'status', OrderStatus.shipped)
            .having((s) => s.message, 'message', contains('Payment confirmed')),
      ],
    );

    blocTest<OrderBloc, OrderState>(
      'emits message on OrderReordered',
      build: () => OrderBloc(
        getOrdersUseCase: mockGetOrdersUseCase,
        cancelOrderUseCase: mockCancelOrderUseCase,
        rateOrderUseCase: mockRateOrderUseCase,
      ),
      seed: () => OrderLoaded(
        allOrders: sampleOrders,
        filteredOrders: sampleOrders,
        counts: const {OrderFilterType.all: 3},
      ),
      act: (bloc) => bloc.add(OrderReordered(sampleOrders.first)),
      expect: () => [
        isA<OrderLoaded>()
            .having((s) => s.message, 'message', contains('Added Apple iPhone 15 Pro Max (256GB) to Cart')),
      ],
    );
  });
}
