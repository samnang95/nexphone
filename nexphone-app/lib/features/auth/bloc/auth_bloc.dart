import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/error/failures.dart';
import '../../../core/utils/usecase.dart';
import '../../../domain/auth/usecases/get_current_user_usecase.dart';
import '../../../domain/auth/usecases/login_usecase.dart';
import '../../../domain/auth/usecases/logout_usecase.dart';
import '../../../domain/auth/usecases/register_usecase.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final GetCurrentUserUseCase getCurrentUserUseCase;
  final LogoutUseCase logoutUseCase;

  AuthBloc({
    required this.loginUseCase,
    required this.registerUseCase,
    required this.getCurrentUserUseCase,
    required this.logoutUseCase,
  }) : super(const AuthInitial()) {
    on<AuthCheckRequested>(_onAuthCheckRequested);
    on<AuthLoginSubmitted>(_onAuthLoginSubmitted);
    on<AuthRegisterSubmitted>(_onAuthRegisterSubmitted);
    on<AuthLogoutRequested>(_onAuthLogoutRequested);
  }

  Future<void> _onAuthCheckRequested(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    try {
      final user = await getCurrentUserUseCase(const NoParams());
      if (user != null) {
        emit(Authenticated(user));
      } else {
        emit(const Unauthenticated());
      }
    } catch (_) {
      emit(const Unauthenticated());
    }
  }

  Future<void> _onAuthLoginSubmitted(
    AuthLoginSubmitted event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    try {
      final user = await loginUseCase(
        LoginParams(email: event.email, password: event.password),
      );
      emit(Authenticated(user));
    } catch (e) {
      final message = e is Failure ? e.message : 'Login failed. Please try again.';
      emit(AuthFailureState(message));
    }
  }

  Future<void> _onAuthRegisterSubmitted(
    AuthRegisterSubmitted event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    try {
      final user = await registerUseCase(
        RegisterParams(
          name: event.name,
          email: event.email,
          password: event.password,
          phone: event.phone,
        ),
      );
      emit(Authenticated(user));
    } catch (e) {
      final message = e is Failure ? e.message : 'Registration failed. Please try again.';
      emit(AuthFailureState(message));
    }
  }

  Future<void> _onAuthLogoutRequested(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    try {
      await logoutUseCase(const NoParams());
    } finally {
      emit(const Unauthenticated());
    }
  }
}
