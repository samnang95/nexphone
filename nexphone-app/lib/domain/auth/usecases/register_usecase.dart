import 'package:equatable/equatable.dart';
import '../../../core/utils/usecase.dart';
import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class RegisterParams extends Equatable {
  final String name;
  final String email;
  final String password;
  final String? phone;

  const RegisterParams({
    required this.name,
    required this.email,
    required this.password,
    this.phone,
  });

  @override
  List<Object?> get props => [name, email, password, phone];
}

class RegisterUseCase implements UseCase<UserEntity, RegisterParams> {
  final AuthRepository repository;

  RegisterUseCase(this.repository);

  @override
  Future<UserEntity> call(RegisterParams params) async {
    return await repository.register(
      name: params.name,
      email: params.email,
      password: params.password,
      phone: params.phone,
    );
  }
}
