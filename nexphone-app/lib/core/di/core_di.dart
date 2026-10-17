import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../network/api_client.dart';
import '../services/wakelock_service.dart';
import '../storage/app_preferences.dart';
import '../storage/secure_storage_service.dart';

Future<void> initCoreDI(GetIt sl, {required String baseUrl}) async {
  // sl = serviceLocator
  
  // External & Storage
  final sharedPrefs = await SharedPreferences.getInstance();
  sl.registerLazySingleton<SharedPreferences>(() => sharedPrefs);
  sl.registerLazySingleton<AppPreferences>(() => AppPreferencesImpl(sl()));
  sl.registerLazySingleton<SecureStorageService>(() => SecureStorageServiceImpl());
  sl.registerLazySingleton<WakelockService>(() => const WakelockServiceImpl());

  // Network Client
  sl.registerLazySingleton<ApiClient>(() => ApiClient(baseUrl: baseUrl, secureStorage: sl()));
}
