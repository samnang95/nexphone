import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:nexphone_app/core/error/failures.dart';
import 'package:nexphone_app/core/utils/usecase.dart';
import 'package:nexphone_app/domain/account/entities/account_profile_entity.dart';
import 'package:nexphone_app/domain/account/usecases/get_account_profile_usecase.dart';
import 'package:nexphone_app/domain/auth/usecases/logout_usecase.dart';
import 'package:nexphone_app/features/account/bloc/account_bloc.dart';
import 'package:nexphone_app/features/account/bloc/account_event.dart';
import 'package:nexphone_app/features/account/bloc/account_state.dart';

class MockGetAccountProfileUseCase extends Mock implements GetAccountProfileUseCase {}

class MockLogoutUseCase extends Mock implements LogoutUseCase {}

void main() {
  late MockGetAccountProfileUseCase getProfile;
  late MockLogoutUseCase logout;

  const profile = AccountProfileEntity(id: '1', name: 'Alex Doe', email: 'alex@nexphone.com');

  setUpAll(() => registerFallbackValue(const NoParams()));

  setUp(() {
    getProfile = MockGetAccountProfileUseCase();
    logout = MockLogoutUseCase();
  });

  AccountBloc build() => AccountBloc(getAccountProfileUseCase: getProfile, logoutUseCase: logout);

  test('initial state is AccountInitial', () {
    expect(build().state, const AccountInitial());
  });

  blocTest<AccountBloc, AccountState>(
    'emits [Loading, Loaded] when profile loads',
    setUp: () => when(() => getProfile(any())).thenAnswer((_) async => profile),
    build: build,
    act: (bloc) => bloc.add(const AccountRequested()),
    expect: () => const [AccountLoading(), AccountLoaded(profile)],
  );

  blocTest<AccountBloc, AccountState>(
    'emits [Loading, Unauthenticated] on AuthFailure',
    setUp: () => when(() => getProfile(any())).thenThrow(const AuthFailure()),
    build: build,
    act: (bloc) => bloc.add(const AccountRequested()),
    expect: () => const [AccountLoading(), AccountUnauthenticated()],
  );

  blocTest<AccountBloc, AccountState>(
    'emits [Loading, Failure] on other failures',
    setUp: () => when(() => getProfile(any())).thenThrow(const NetworkFailure('offline')),
    build: build,
    act: (bloc) => bloc.add(const AccountRequested()),
    expect: () => const [AccountLoading(), AccountFailure('offline')],
  );

  blocTest<AccountBloc, AccountState>(
    'refresh emits Loaded without Loading',
    setUp: () => when(() => getProfile(any())).thenAnswer((_) async => profile),
    build: build,
    act: (bloc) => bloc.add(const AccountRefreshed()),
    expect: () => const [AccountLoaded(profile)],
  );

  blocTest<AccountBloc, AccountState>(
    'logout calls use case and emits Unauthenticated',
    setUp: () => when(() => logout(any())).thenAnswer((_) async {}),
    build: build,
    act: (bloc) => bloc.add(const AccountLogoutRequested()),
    expect: () => const [AccountUnauthenticated()],
    verify: (_) => verify(() => logout(any())).called(1),
  );
}
