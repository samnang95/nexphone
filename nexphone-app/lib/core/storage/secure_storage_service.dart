import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/storage_keys.dart';

abstract class SecureStorageService {
  Future<String?> getAccessToken();
  Future<String?> getRefreshToken();
  Future<void> saveTokens({required String accessToken, required String refreshToken});
  Future<void> clearTokens();
  Future<String?> read(String key);
  Future<void> write(String key, String value);
  Future<void> delete(String key);
}

class SecureStorageServiceImpl implements SecureStorageService {
  final FlutterSecureStorage _storage;

  SecureStorageServiceImpl({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage(
          aOptions: AndroidOptions(),
          mOptions: MacOsOptions(accessibility: KeychainAccessibility.first_unlock),
        );

  @override
  Future<String?> getAccessToken() async => await _storage.read(key: StorageKeys.accessToken);

  @override
  Future<String?> getRefreshToken() async => await _storage.read(key: StorageKeys.refreshToken);

  @override
  Future<void> saveTokens({required String accessToken, required String refreshToken}) async {
    await Future.wait([
      _storage.write(key: StorageKeys.accessToken, value: accessToken),
      _storage.write(key: StorageKeys.refreshToken, value: refreshToken),
    ]);
  }

  @override
  Future<void> clearTokens() async {
    await Future.wait([
      _storage.delete(key: StorageKeys.accessToken),
      _storage.delete(key: StorageKeys.refreshToken),
    ]);
  }

  @override
  Future<String?> read(String key) async => await _storage.read(key: key);

  @override
  Future<void> write(String key, String value) async => await _storage.write(key: key, value: value);

  @override
  Future<void> delete(String key) async => await _storage.delete(key: key);
}