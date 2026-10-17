import 'package:get_it/get_it.dart';
import '../../../data/products/datasources/product_local_data_source.dart';
import '../../../data/products/datasources/product_remote_data_source.dart';
import '../../../data/products/repositories/product_repository_impl.dart';
import '../../../domain/products/repositories/product_repository.dart';
import '../../../domain/products/usecases/get_banners_usecase.dart';
import '../../../domain/products/usecases/get_categories_usecase.dart';
import '../../../domain/products/usecases/get_product_detail_usecase.dart';
import '../../../domain/products/usecases/get_products_usecase.dart';
import '../../../domain/products/usecases/search_products_usecase.dart';
import '../bloc/product_list_bloc.dart';

void initProductsDI(GetIt sl) {
  // Data Sources
  sl.registerLazySingleton<ProductRemoteDataSource>(() => ProductRemoteDataSourceImpl(client: sl()));
  sl.registerLazySingleton<ProductLocalDataSource>(() => ProductLocalDataSourceImpl());

  // Repository
  sl.registerLazySingleton<ProductRepository>(() => ProductRepositoryImpl(remoteDataSource: sl(), localDataSource: sl()));

  // Use Cases
  sl.registerLazySingleton(() => GetProductsUseCase(sl()));
  sl.registerLazySingleton(() => GetProductDetailUseCase(sl()));
  sl.registerLazySingleton(() => SearchProductsUseCase(sl()));
  sl.registerLazySingleton(() => GetCategoriesUseCase(sl()));
  sl.registerLazySingleton(() => GetBannersUseCase(sl()));

  // Presentation BLoC
  sl.registerFactory(() => ProductListBloc(getProductsUseCase: sl(), productRepository: sl()));
}
