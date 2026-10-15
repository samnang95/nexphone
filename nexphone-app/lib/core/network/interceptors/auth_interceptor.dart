import 'package:dio/dio.dart';
import '../../storage/secure_storage_service.dart';
import '../api_endpoints.dart';

class AuthInterceptor extends QueuedInterceptor {
  final SecureStorageService storage;
  final Dio _authDio;

  AuthInterceptor({
    required this.storage,
    required String baseUrl,
  }) : _authDio = Dio(BaseOptions(baseUrl: baseUrl));

  @override
  Future<void> onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await storage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      final isAuthEndpoint = err.requestOptions.path.contains('/api/auth/login') ||
          err.requestOptions.path.contains('/api/auth/register') ||
          err.requestOptions.path.contains('/api/auth/refresh');

      if (isAuthEndpoint) {
        return handler.next(err);
      }

      final refreshToken = await storage.getRefreshToken();
      if (refreshToken != null && refreshToken.isNotEmpty) {
        try {
          final response = await _authDio.post(
            ApiEndpoints.refresh,
            data: {'refreshToken': refreshToken},
          );

          if (response.statusCode == 200 && response.data is Map<String, dynamic>) {
            final data = response.data as Map<String, dynamic>;
            final newAccess = data['accessToken']?.toString();
            final newRefresh = data['refreshToken']?.toString() ?? refreshToken;

            if (newAccess != null) {
              await storage.saveTokens(accessToken: newAccess, refreshToken: newRefresh);

              // Retry original request with new access token
              final opts = err.requestOptions;
              opts.headers['Authorization'] = 'Bearer $newAccess';

              final retryResponse = await _authDio.fetch(opts);
              return handler.resolve(retryResponse);
            }
          }
        } catch (_) {
          await storage.clearTokens();
        }
      }
      await storage.clearTokens();
    }
    handler.next(err);
  }
}
