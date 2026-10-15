import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:nexphone_app/app/router/app_router.dart';

void main() {
  setUp(() {
    AppRouter.reset();
  });

  tearDown(() {
    AppRouter.reset();
  });

  group('AppRouter', () {
    test('creates GoRouter with expected initialLocation', () {
      final router = AppRouter.createRouter();
      expect(router.routeInformationProvider.value.uri.path, AppRoutes.home);
    });

    test('has all registered top-level routes', () {
      final router = AppRouter.router;
      final paths = router.configuration.routes
          .whereType<GoRoute>()
          .map((r) => r.path)
          .toList();

      expect(paths, contains(AppRoutes.home));
      expect(paths, contains(AppRoutes.login));
      expect(paths, contains(AppRoutes.register));
      expect(paths, contains(AppRoutes.productDetail));
    });

    test('reset clears router instance', () {
      final router1 = AppRouter.router;
      AppRouter.reset();
      final router2 = AppRouter.router;
      expect(identical(router1, router2), isFalse);
    });
  });
}
