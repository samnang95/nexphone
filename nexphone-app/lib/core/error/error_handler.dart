import 'package:dio/dio.dart';
import 'exceptions.dart';
import 'failures.dart';

class ErrorHandler {
  ErrorHandler._();

  static Failure handle(dynamic error) {
    if (error is DioException) {
      if (error.error is Failure) return error.error as Failure;
      if (error.error is ServerException) {
        final se = error.error as ServerException;
        return ServerFailure(se.message, se.code);
      }
      if (error.error is UnauthorizedException) {
        final ue = error.error as UnauthorizedException;
        return AuthFailure(ue.message, 'UNAUTHORIZED');
      }
      if (error.error is NetworkException) {
        final ne = error.error as NetworkException;
        return NetworkFailure(ne.message);
      }
      return _handleDioError(error);
    } else if (error is ServerException) {
      return ServerFailure(error.message, error.code);
    } else if (error is UnauthorizedException) {
      return AuthFailure(error.message, 'UNAUTHORIZED');
    } else if (error is CacheException) {
      return CacheFailure(error.message);
    } else if (error is NetworkException) {
      return NetworkFailure(error.message);
    } else if (error is Failure) {
      return error;
    }
    return ServerFailure(error.toString());
  }

  static Failure _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.connectionError:
        return const NetworkFailure('Connection timed out. Check your internet connection.');
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final data = error.response?.data;
        String message = 'Server error occurred ($statusCode)';
        String? code;
        if (data is Map<String, dynamic>) {
          message = data['error']?.toString() ?? data['message']?.toString() ?? message;
          code = data['code']?.toString();
        }
        if (statusCode == 401) {
          return AuthFailure(message, code ?? 'UNAUTHORIZED');
        } else if (statusCode == 400 || statusCode == 422) {
          return ValidationFailure(message, code);
        } else if (statusCode == 404) {
          return ServerFailure(message, code ?? 'NOT_FOUND');
        }
        return ServerFailure(message, code);
      case DioExceptionType.cancel:
        return const ServerFailure('Request was cancelled');
      case DioExceptionType.badCertificate:
        return const NetworkFailure('Security certificate validation failed');
      case DioExceptionType.unknown:
      default:
        return NetworkFailure(error.message ?? 'An unexpected network error occurred');
    }
  }
}
