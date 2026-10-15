import 'package:equatable/equatable.dart';

abstract class Failure extends Equatable {
  final String message;
  final String? code;

  const Failure(this.message, {this.code});

  @override
  List<Object?> get props => [message, code];
}

class ServerFailure extends Failure {
  const ServerFailure([super.message = 'Server encountered an error', String? code]) : super(code: code);
}

class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'Network connection unavailable', String? code]) : super(code: code);
}

class CacheFailure extends Failure {
  const CacheFailure([super.message = 'Failed to load local data', String? code]) : super(code: code);
}

class AuthFailure extends Failure {
  const AuthFailure([super.message = 'Invalid authentication credentials', String? code]) : super(code: code);
}

class ValidationFailure extends Failure {
  const ValidationFailure([super.message = 'Invalid input provided', String? code]) : super(code: code);
}
