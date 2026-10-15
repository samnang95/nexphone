import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nexphone_app/features/home/widgets/store_header_card.dart';

void main() {
  group('StoreHeaderCard Widget Tests', () {
    testWidgets('renders default storeName, period, and tagline', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StoreHeaderCard(),
          ),
        ),
      );

      expect(find.byType(StoreHeaderCard), findsOneWidget);
      expect(find.textContaining('NexPhone'), findsOneWidget);
      expect(find.text('NEXT-GEN SATELLITE & QUANTUM STORE'), findsOneWidget);
    });

    testWidgets('renders custom storeName, tagline, and responds to onTap', (tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: StoreHeaderCard(
              storeName: 'Karman',
              tagline: 'NEXT-GEN FINTECH & TECH STORE',
              isDark: true,
              onTap: () {
                tapped = true;
              },
            ),
          ),
        ),
      );

      expect(find.textContaining('Karman'), findsOneWidget);
      expect(find.text('NEXT-GEN FINTECH & TECH STORE'), findsOneWidget);

      await tester.tap(find.byType(StoreHeaderCard));
      await tester.pumpAndSettle();

      expect(tapped, isTrue);
    });
  });
}
