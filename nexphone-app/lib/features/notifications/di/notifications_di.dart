import 'package:get_it/get_it.dart';
import '../../../data/notifications/datasources/notification_remote_data_source.dart';
import '../../../data/notifications/repositories/notification_repository_impl.dart';
import '../../../domain/notifications/repositories/notification_repository.dart';
import '../../../domain/notifications/usecases/get_notifications_usecase.dart';

void initNotificationsDI(GetIt sl) {
  // Data Source
  sl.registerLazySingleton<NotificationRemoteDataSource>(() => NotificationRemoteDataSourceImpl(client: sl()));

  // Repository
  sl.registerLazySingleton<NotificationRepository>(() => NotificationRepositoryImpl(remoteDataSource: sl()));

  // Use Case
  sl.registerLazySingleton(() => GetNotificationsUseCase(sl()));
}
