import 'package:get_it/get_it.dart';
import '../../../data/auth/datasources/auth_remote_data_source.dart';
import '../../../data/auth/repositories/auth_repository_impl.dart';
import '../../../domain/auth/repositories/auth_repository.dart';
import '../../../domain/auth/usecases/get_current_user_usecase.dart';
import '../../../domain/auth/usecases/login_usecase.dart';
import '../../../domain/auth/usecases/logout_usecase.dart';
import '../../../domain/auth/usecases/register_usecase.dart';
import '../bloc/auth_bloc.dart';

void initAuthDI(GetIt sl) {
  // Data Source
  sl.registerLazySingleton<AuthRemoteDataSource>(() => AuthRemoteDataSourceImpl(client: sl()));

  // Repository
  sl.registerLazySingleton<AuthRepository>(() => AuthRepositoryImpl(remoteDataSource: sl(),secureStorage: sl(),preferences: sl()));

  // Use Cases
  sl.registerLazySingleton(() => LoginUseCase(sl()));
  sl.registerLazySingleton(() => RegisterUseCase(sl()));
  sl.registerLazySingleton(() => GetCurrentUserUseCase(sl()));
  sl.registerLazySingleton(() => LogoutUseCase(sl()));

  // Presentation BLoC
  sl.registerFactory(() => AuthBloc(loginUseCase: sl(),registerUseCase: sl(),getCurrentUserUseCase: sl(),logoutUseCase: sl(),));
}
