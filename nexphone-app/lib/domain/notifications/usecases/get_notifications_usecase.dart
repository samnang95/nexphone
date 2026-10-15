import '../../../core/utils/usecase.dart';
import '../entities/notification_entity.dart';
import '../repositories/notification_repository.dart';

class GetNotificationsUseCase implements UseCase<List<NotificationEntity>, NoParams> {
  final NotificationRepository repository;

  GetNotificationsUseCase(this.repository);

  @override
  Future<List<NotificationEntity>> call(NoParams params) async {
    return await repository.getNotifications();
  }
}
