import 'package:get_it/get_it.dart';
import '../../../data/account/datasources/account_remote_data_source.dart';
import '../../../data/account/repositories/account_repository_impl.dart';
import '../../../domain/account/repositories/account_repository.dart';
import '../../../domain/account/usecases/get_account_profile_usecase.dart';
import '../bloc/account_bloc.dart';

void initAccountDI(GetIt sl) {
  // Data Source
  sl.registerLazySingleton<AccountRemoteDataSource>(() => AccountRemoteDataSourceImpl(client: sl()));

  // Repository
  sl.registerLazySingleton<AccountRepository>(() => AccountRepositoryImpl(remoteDataSource: sl()));

  // Use Case
  sl.registerLazySingleton(() => GetAccountProfileUseCase(sl()));

  // Presentation BLoC
  sl.registerFactory(() => AccountBloc(getAccountProfileUseCase: sl(),logoutUseCase: sl(),),);
}