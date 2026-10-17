import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:nexphone_app/domain/orders/entities/order_entity.dart';
import 'package:nexphone_app/domain/orders/entities/order_filter_type.dart';
import 'package:nexphone_app/domain/orders/entities/order_item_entity.dart';
import 'package:nexphone_app/features/orders/bloc/order_bloc.dart';
import 'package:nexphone_app/features/orders/bloc/order_event.dart';
import 'package:nexphone_app/features/orders/bloc/order_state.dart';
import 'package:nexphone_app/features/orders/pages/orders_page.dart';

class MockOrderBloc extends MockBloc<OrderEvent, OrderState> implements OrderBloc {}

void main() {
  late MockOrderBloc mockOrderBloc;

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
  ];

  setUp(() {
    mockOrderBloc = MockOrderBloc();
  });

  Widget buildTestableWidget() {
    return MaterialApp(
      home: BlocProvider<OrderBloc>.value(
        value: mockOrderBloc,
        child: const OrdersPage(),
      ),
    );
  }

  group('OrdersPage Widget Tests', () {
    testWidgets('renders title "My Orders" and filter chips', (tester) async {
      when(() => mockOrderBloc.state).thenReturn(
        OrderLoaded(
          allOrders: sampleOrders,
          filteredOrders: sampleOrders,
          counts: const {
            OrderFilterType.all: 1,
            OrderFilterType.pending: 0,
            OrderFilterType.shipped: 1,
            OrderFilterType.delivered: 0,
            OrderFilterType.cancelled: 0,
          },
        ),
      );

      await tester.pumpWidget(buildTestableWidget());
      await tester.pumpAndSettle();

      expect(find.text('My Orders'), findsOneWidget);
      expect(find.text('All Orders'), findsOneWidget);
      expect(find.text('Shipped'), findsOneWidget);
      expect(find.text('Apple iPhone 15 Pro Max (256GB)'), findsOneWidget);
      expect(find.text('Track Live Order'), findsOneWidget);
      expect(find.text('View Details'), findsOneWidget);
    });

    testWidgets('renders empty state when filteredOrders is empty', (tester) async {
      when(() => mockOrderBloc.state).thenReturn(
        const OrderLoaded(
          allOrders: [],
          filteredOrders: [],
          counts: {
            OrderFilterType.all: 0,
            OrderFilterType.pending: 0,
            OrderFilterType.shipped: 0,
            OrderFilterType.delivered: 0,
            OrderFilterType.cancelled: 0,
          },
        ),
      );

      await tester.pumpWidget(buildTestableWidget());
      await tester.pumpAndSettle();

      expect(find.text('No Orders Found'), findsOneWidget);
      expect(find.text('Start Shopping'), findsOneWidget);
    });
  });
}
