import 'package:flutter_test/flutter_test.dart';
import 'package:nexphone_app/app/di/injection.dart';
import 'package:nexphone_app/app/router/app_router.dart';
import 'package:nexphone_app/core/app/app.dart';
import 'package:nexphone_app/core/config/app_environment.dart';
import 'package:nexphone_app/core/localization/localization_service.dart';
import 'package:nexphone_app/domain/products/entities/banner_entity.dart';
import 'package:nexphone_app/domain/products/entities/product_entity.dart';
import 'package:nexphone_app/domain/products/repositories/product_repository.dart';
import 'package:shared_preferences/shared_preferences.dart';

class FakeTestProductRepository implements ProductRepository {
  @override
  Future<List<ProductEntity>> getProducts({String? category, String? search}) async => [];

  @override
  Future<ProductEntity?> getProductById(String id) async => null;

  @override
  Future<List<String>> getCategories() async => ['All'];

  @override
  Future<List<BannerEntity>> getBanners() async => [];
}

void main() {
  setUp(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    AppRouter.reset();
    AppEnvironment.setup(AppEnvironment.dev);
    SharedPreferences.setMockInitialValues({});
    await LocalizationService.init();
    await sl.reset();
    await initDependencies(baseUrl: 'http://localhost:4000');

    // Override repository with test repository to avoid pending Dio timers
    await sl.unregister<ProductRepository>();
    sl.registerLazySingleton<ProductRepository>(() => FakeTestProductRepository());
  });

  tearDown(() async {
    AppRouter.reset();
    await sl.reset();
  });

  testWidgets('NexPhone app initial load smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const NexPhoneApp());
    await tester.pump();

    // Verify app bar title elements
    expect(find.text('NexPhone'), findsOneWidget);
    expect(find.text('Quantum-Safe Satellite Store'), findsOneWidget);
  });
}
