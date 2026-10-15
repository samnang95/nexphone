import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../repositories/models/notification_model.dart';

abstract class NotificationRemoteDataSource {
  Future<List<NotificationModel>> getNotifications();
  Future<void> markAsRead(String id);
}

class NotificationRemoteDataSourceImpl implements NotificationRemoteDataSource {
  final ApiClient client;

  NotificationRemoteDataSourceImpl({required this.client});

  @override
  Future<List<NotificationModel>> getNotifications() async {
    try {
      final response = await client.get(ApiEndpoints.notifications);
      final data = response.data;
      if (data is Map<String, dynamic>) {
        final dynamic list = data['notifications'] ?? data['data'];
        if (list is List) {
          return list.map((e) => NotificationModel.fromJson(e as Map<String, dynamic>)).toList();
        }
      }
    } catch (_) {}
    return [];
  }

  @override
  Future<void> markAsRead(String id) async {
    try {
      await client.put('${ApiEndpoints.notifications}/$id/read');
    } catch (_) {}
  }
}
