import 'package:dio/dio.dart';
import '../../error/exceptions.dart';

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.sendTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.connectionError) {
      throw const NetworkException('Unable to connect to NexPhone servers');
    }

    if (err.response != null) {
      final statusCode = err.response!.statusCode;
      final data = err.response!.data;

      String message = 'Unexpected error occurred ($statusCode)';
      String? code;

      if (data is Map<String, dynamic>) {
        message = data['error']?.toString() ?? data['message']?.toString() ?? message;
        code = data['code']?.toString();
      }

      if (statusCode == 401) {
        throw UnauthorizedException(message);
      }

      throw ServerException(
        message: message,
        code: code,
        statusCode: statusCode,
      );
    }

    handler.next(err);
  }
}
