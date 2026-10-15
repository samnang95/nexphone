import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../models/auth_response_model.dart';
import '../models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<AuthResponseModel> login({required String email, required String password});
  Future<AuthResponseModel> register({required String name, required String email, required String password, String? phone});
  Future<UserModel> getMe();
  Future<void> logout();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final ApiClient client;

  AuthRemoteDataSourceImpl({required this.client});

  @override
  Future<AuthResponseModel> login({required String email, required String password}) async {
    final response = await client.post(
      ApiEndpoints.login,
      data: {'email': email, 'password': password},
    );
    return AuthResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<AuthResponseModel> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    final payload = <String, dynamic>{
      'name': name,
      'email': email,
      'password': password,
    };
    if (phone != null) {
      payload['phone'] = phone;
    }

    final response = await client.post(
      ApiEndpoints.register,
      data: payload,
    );
    return AuthResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<UserModel> getMe() async {
    final response = await client.get(ApiEndpoints.me);
    final data = response.data as Map<String, dynamic>;
    final userMap = data['user'] as Map<String, dynamic>;
    return UserModel.fromJson(userMap);
  }

  @override
  Future<void> logout() async {
    try {
      await client.post(ApiEndpoints.logout);
    } catch (_) {}
  }
}
