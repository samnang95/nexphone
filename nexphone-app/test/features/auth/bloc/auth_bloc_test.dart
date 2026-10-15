import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:nexphone_app/core/utils/usecase.dart';
import 'package:nexphone_app/domain/auth/entities/user_entity.dart';
import 'package:nexphone_app/domain/auth/usecases/get_current_user_usecase.dart';
import 'package:nexphone_app/domain/auth/usecases/login_usecase.dart';
import 'package:nexphone_app/domain/auth/usecases/logout_usecase.dart';
import 'package:nexphone_app/domain/auth/usecases/register_usecase.dart';
import 'package:nexphone_app/features/auth/bloc/auth_bloc.dart';
import 'package:nexphone_app/features/auth/bloc/auth_event.dart';
import 'package:nexphone_app/features/auth/bloc/auth_state.dart';

class MockLoginUseCase extends Mock implements LoginUseCase {}
class MockRegisterUseCase extends Mock implements RegisterUseCase {}
class MockGetCurrentUserUseCase extends Mock implements GetCurrentUserUseCase {}
class MockLogoutUseCase extends Mock implements LogoutUseCase {}

void main() {
  late MockLoginUseCase mockLoginUseCase;
  late MockRegisterUseCase mockRegisterUseCase;
  late MockGetCurrentUserUseCase mockGetCurrentUserUseCase;
  late MockLogoutUseCase mockLogoutUseCase;
  late AuthBloc authBloc;

  const testUser = UserEntity(
    id: 'usr-123',
    name: 'Alex Mercer',
    email: 'alex@nexphone.com',
  );

  setUp(() {
    mockLoginUseCase = MockLoginUseCase();
    mockRegisterUseCase = MockRegisterUseCase();
    mockGetCurrentUserUseCase = MockGetCurrentUserUseCase();
    mockLogoutUseCase = MockLogoutUseCase();

    authBloc = AuthBloc(
      loginUseCase: mockLoginUseCase,
      registerUseCase: mockRegisterUseCase,
      getCurrentUserUseCase: mockGetCurrentUserUseCase,
      logoutUseCase: mockLogoutUseCase,
    );
  });

  tearDown(() {
    authBloc.close();
  });

  test('initial state is AuthInitial', () {
    expect(authBloc.state, const AuthInitial());
  });

  blocTest<AuthBloc, AuthState>(
    'emits [AuthLoading, Authenticated] when session exists',
    build: () {
      when(() => mockGetCurrentUserUseCase(const NoParams()))
          .thenAnswer((_) async => testUser);
      return authBloc;
    },
    act: (bloc) => bloc.add(const AuthCheckRequested()),
    expect: () => [
      const AuthLoading(),
      const Authenticated(testUser),
    ],
  );

  blocTest<AuthBloc, AuthState>(
    'emits [AuthLoading, Unauthenticated] when session does not exist',
    build: () {
      when(() => mockGetCurrentUserUseCase(const NoParams()))
          .thenAnswer((_) async => null);
      return authBloc;
    },
    act: (bloc) => bloc.add(const AuthCheckRequested()),
    expect: () => [
      const AuthLoading(),
      const Unauthenticated(),
    ],
  );

  blocTest<AuthBloc, AuthState>(
    'emits [AuthLoading, Authenticated] when login succeeds',
    build: () {
      when(() => mockLoginUseCase(const LoginParams(email: 'alex@nexphone.com', password: 'password123')))
          .thenAnswer((_) async => testUser);
      return authBloc;
    },
    act: (bloc) => bloc.add(const AuthLoginSubmitted(email: 'alex@nexphone.com', password: 'password123')),
    expect: () => [
      const AuthLoading(),
      const Authenticated(testUser),
    ],
  );

  blocTest<AuthBloc, AuthState>(
    'emits [AuthLoading, Unauthenticated] on logout',
    build: () {
      when(() => mockLogoutUseCase(const NoParams())).thenAnswer((_) async {});
      return authBloc;
    },
    act: (bloc) => bloc.add(const AuthLogoutRequested()),
    expect: () => [
      const AuthLoading(),
      const Unauthenticated(),
    ],
  );
}
