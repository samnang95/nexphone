import '../../../domain/notifications/entities/notification_entity.dart';
import '../../../domain/notifications/repositories/notification_repository.dart';
import '../datasources/notification_remote_data_source.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  final NotificationRemoteDataSource remoteDataSource;

  NotificationRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<NotificationEntity>> getNotifications() async {
    return await remoteDataSource.getNotifications();
  }

  @override
  Future<void> markAsRead(String id) async {
    await remoteDataSource.markAsRead(id);
  }
}
