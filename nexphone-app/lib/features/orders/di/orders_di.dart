import 'package:get_it/get_it.dart';
import '../../../data/orders/datasources/order_remote_data_source.dart';
import '../../../data/orders/repositories/order_repository_impl.dart';
import '../../../domain/orders/repositories/order_repository.dart';
import '../../../domain/orders/usecases/cancel_order_usecase.dart';
import '../../../domain/orders/usecases/get_orders_usecase.dart';
import '../../../domain/orders/usecases/rate_order_usecase.dart';
import '../bloc/order_bloc.dart';

void initOrdersDI(GetIt sl) {
  // Data Source
  sl.registerLazySingleton<OrderRemoteDataSource>(() => OrderRemoteDataSourceImpl(client: sl()));

  // Repository
  sl.registerLazySingleton<OrderRepository>(() => OrderRepositoryImpl(remoteDataSource: sl()));

  // Use Cases
  sl.registerLazySingleton(() => GetOrdersUseCase(sl()));
  sl.registerLazySingleton(() => CancelOrderUseCase(sl()));
  sl.registerLazySingleton(() => RateOrderUseCase(sl()));

  // Presentation BLoC
  sl.registerFactory(() => OrderBloc(getOrdersUseCase: sl(),cancelOrderUseCase: sl(),rateOrderUseCase: sl()));
}
