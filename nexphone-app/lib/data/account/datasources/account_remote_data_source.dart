import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../models/account_profile_model.dart';

abstract class AccountRemoteDataSource {
  Future<AccountProfileModel> getProfile();
}

class AccountRemoteDataSourceImpl implements AccountRemoteDataSource {
  final ApiClient client;

  AccountRemoteDataSourceImpl({required this.client});

  @override
  Future<AccountProfileModel> getProfile() async {
    final response = await client.get(ApiEndpoints.userProfile);
    final data = response.data as Map<String, dynamic>;
    final user = data['user'] is Map<String, dynamic>
        ? data['user'] as Map<String, dynamic>
        : data;
    return AccountProfileModel.fromJson(user);
  }
}
