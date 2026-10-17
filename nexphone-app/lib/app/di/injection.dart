import 'package:get_it/get_it.dart';
import '../../core/di/core_di.dart';
import '../../features/account/di/account_di.dart';
import '../../features/auth/di/auth_di.dart';
import '../../features/home/di/home_di.dart';
import '../../features/notifications/di/notifications_di.dart';
import '../../features/orders/di/orders_di.dart';
import '../../features/products/di/products_di.dart';

final sl = GetIt.instance;

Future<void> initDependencies({required String baseUrl}) async {
  // 1. Core Infrastructure & Services
  await initCoreDI(sl, baseUrl: baseUrl);

  // 2. Feature Modules
  initAuthDI(sl);
  initProductsDI(sl);
  initNotificationsDI(sl);
  initAccountDI(sl);
  initHomeDI(sl);
  initOrdersDI(sl);
}
