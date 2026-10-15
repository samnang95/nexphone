class ServerException implements Exception {
  final String message;
  final String? code;
  final int? statusCode;

  const ServerException({
    required this.message,
    this.code,
    this.statusCode,
  });

  @override
  String toString() => 'ServerException(message: $message, code: $code, statusCode: $statusCode)';
}

class CacheException implements Exception {
  final String message;
  const CacheException([this.message = 'Cache operation failed']);
}

class UnauthorizedException implements Exception {
  final String message;
  const UnauthorizedException([this.message = 'Authentication token expired or invalid']);
}

class NetworkException implements Exception {
  final String message;
  const NetworkException([this.message = 'No active internet connection']);
}
