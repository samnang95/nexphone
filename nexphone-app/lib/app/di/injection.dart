import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/network/api_client.dart';
import '../../core/services/wakelock_service.dart';
import '../../core/storage/app_preferences.dart';
import '../../core/storage/secure_storage_service.dart';
import '../../data/account/datasources/account_remote_data_source.dart';
import '../../data/account/repositories/account_repository_impl.dart';
import '../../data/auth/datasources/auth_remote_data_source.dart';
import '../../data/auth/repositories/auth_repository_impl.dart';
import '../../data/notifications/datasources/notification_remote_data_source.dart';
import '../../data/notifications/repositories/notification_repository_impl.dart';
import '../../data/products/datasources/product_local_data_source.dart';
import '../../data/products/datasources/product_remote_data_source.dart';
import '../../data/products/repositories/product_repository_impl.dart';
import '../../domain/account/repositories/account_repository.dart';
import '../../domain/account/usecases/get_account_profile_usecase.dart';
import '../../domain/auth/repositories/auth_repository.dart';
import '../../domain/auth/usecases/get_current_user_usecase.dart';
import '../../domain/auth/usecases/login_usecase.dart';
import '../../domain/auth/usecases/logout_usecase.dart';
import '../../domain/auth/usecases/register_usecase.dart';
import '../../domain/notifications/repositories/notification_repository.dart';
import '../../domain/notifications/usecases/get_notifications_usecase.dart';
import '../../domain/products/repositories/product_repository.dart';
import '../../domain/products/usecases/get_banners_usecase.dart';
import '../../domain/products/usecases/get_categories_usecase.dart';
import '../../domain/products/usecases/get_product_detail_usecase.dart';
import '../../domain/products/usecases/get_products_usecase.dart';
import '../../domain/products/usecases/search_products_usecase.dart';
import '../../features/account/bloc/account_bloc.dart';
import '../../features/auth/bloc/auth_bloc.dart';
import '../../features/home/bloc/home_bloc.dart';
import '../../features/products/bloc/product_list_bloc.dart';

final sl = GetIt.instance;

Future<void> initDependencies({required String baseUrl}) async {
  // 1. External & Storage
  final sharedPrefs = await SharedPreferences.getInstance();
  sl.registerLazySingleton<SharedPreferences>(() => sharedPrefs);
  sl.registerLazySingleton<AppPreferences>(() => AppPreferencesImpl(sl()));
  sl.registerLazySingleton<SecureStorageService>(() => SecureStorageServiceImpl());
  sl.registerLazySingleton<WakelockService>(() => const WakelockServiceImpl());

  // 2. Network Client
  sl.registerLazySingleton<ApiClient>(
    () => ApiClient(baseUrl: baseUrl, secureStorage: sl()),
  );

  // 3. Data Sources
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(client: sl()),
  );
  sl.registerLazySingleton<ProductRemoteDataSource>(
    () => ProductRemoteDataSourceImpl(client: sl()),
  );
  sl.registerLazySingleton<ProductLocalDataSource>(
    () => ProductLocalDataSourceImpl(),
  );
  sl.registerLazySingleton<NotificationRemoteDataSource>(
    () => NotificationRemoteDataSourceImpl(client: sl()),
  );
  sl.registerLazySingleton<AccountRemoteDataSource>(
    () => AccountRemoteDataSourceImpl(client: sl()),
  );

  // 4. Repositories
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl(),
      secureStorage: sl(),
      preferences: sl(),
    ),
  );
  sl.registerLazySingleton<ProductRepository>(
    () => ProductRepositoryImpl(
      remoteDataSource: sl(),
      localDataSource: sl(),
    ),
  );
  sl.registerLazySingleton<NotificationRepository>(
    () => NotificationRepositoryImpl(remoteDataSource: sl()),
  );
  sl.registerLazySingleton<AccountRepository>(
    () => AccountRepositoryImpl(remoteDataSource: sl()),
  );

  // 5. Use Cases
  sl.registerLazySingleton(() => LoginUseCase(sl()));
  sl.registerLazySingleton(() => RegisterUseCase(sl()));
  sl.registerLazySingleton(() => GetCurrentUserUseCase(sl()));
  sl.registerLazySingleton(() => LogoutUseCase(sl()));

  sl.registerLazySingleton(() => GetProductsUseCase(sl()));
  sl.registerLazySingleton(() => GetProductDetailUseCase(sl()));
  sl.registerLazySingleton(() => SearchProductsUseCase(sl()));
  sl.registerLazySingleton(() => GetCategoriesUseCase(sl()));
  sl.registerLazySingleton(() => GetBannersUseCase(sl()));

  sl.registerLazySingleton(() => GetNotificationsUseCase(sl()));

  sl.registerLazySingleton(() => GetAccountProfileUseCase(sl()));

  // 6. Presentation BLoCs (Factories)
  sl.registerFactory(
    () => AuthBloc(
      loginUseCase: sl(),
      registerUseCase: sl(),
      getCurrentUserUseCase: sl(),
      logoutUseCase: sl(),
    ),
  );

  sl.registerFactory(
    () => HomeBloc(),
  );

  sl.registerFactory(
    () => AccountBloc(
      getAccountProfileUseCase: sl(),
      logoutUseCase: sl(),
    ),
  );

  sl.registerFactory(
    () => ProductListBloc(
      getProductsUseCase: sl(),
      productRepository: sl(),
    ),
  );
}
