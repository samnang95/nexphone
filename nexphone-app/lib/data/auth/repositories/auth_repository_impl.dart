import 'dart:convert';
import '../../../core/constants/storage_keys.dart';
import '../../../core/error/error_handler.dart';
import '../../../core/storage/app_preferences.dart';
import '../../../core/storage/secure_storage_service.dart';
import '../../../domain/auth/entities/user_entity.dart';
import '../../../domain/auth/repositories/auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';
import '../models/user_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final SecureStorageService secureStorage;
  final AppPreferences preferences;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.secureStorage,
    required this.preferences,
  });

  @override
  Future<UserEntity> login({required String email, required String password}) async {
    try {
      final authResponse = await remoteDataSource.login(email: email, password: password);
      await secureStorage.saveTokens(
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
      );
      await preferences.setString(
        StorageKeys.currentUser,
        jsonEncode(authResponse.user.toJson()),
      );
      return authResponse.user;
    } catch (e) {
      throw ErrorHandler.handle(e);
    }
  }

  @override
  Future<UserEntity> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    try {
      final authResponse = await remoteDataSource.register(
        name: name,
        email: email,
        password: password,
        phone: phone,
      );
      await secureStorage.saveTokens(
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
      );
      await preferences.setString(
        StorageKeys.currentUser,
        jsonEncode(authResponse.user.toJson()),
      );
      return authResponse.user;
    } catch (e) {
      throw ErrorHandler.handle(e);
    }
  }

  @override
  Future<UserEntity?> getCurrentUser() async {
    final cached = await preferences.getString(StorageKeys.currentUser);
    if (cached != null) {
      try {
        final map = jsonDecode(cached) as Map<String, dynamic>;
        return UserModel.fromJson(map);
      } catch (_) {}
    }

    final token = await secureStorage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      try {
        final remoteUser = await remoteDataSource.getMe();
        await preferences.setString(
          StorageKeys.currentUser,
          jsonEncode(remoteUser.toJson()),
        );
        return remoteUser;
      } catch (_) {}
    }
    return null;
  }

  @override
  Future<void> logout() async {
    try {
      await remoteDataSource.logout();
    } finally {
      await secureStorage.clearTokens();
      await preferences.remove(StorageKeys.currentUser);
    }
  }

  @override
  Future<bool> isAuthenticated() async {
    final token = await secureStorage.getAccessToken();
    return token != null && token.isNotEmpty;
  }
}
