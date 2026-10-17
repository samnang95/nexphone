import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:nexphone_app/core/error/failures.dart';
import 'package:nexphone_app/core/theme/app_theme.dart';
import 'package:nexphone_app/core/utils/usecase.dart';
import 'package:nexphone_app/domain/account/entities/account_profile_entity.dart';
import 'package:nexphone_app/domain/account/usecases/get_account_profile_usecase.dart';
import 'package:nexphone_app/domain/auth/usecases/logout_usecase.dart';
import 'package:nexphone_app/features/account/bloc/account_bloc.dart';
import 'package:nexphone_app/features/account/bloc/account_event.dart';
import 'package:nexphone_app/features/account/pages/account_page.dart';

class MockGetAccountProfileUseCase extends Mock implements GetAccountProfileUseCase {}

class MockLogoutUseCase extends Mock implements LogoutUseCase {}

final _profile = AccountProfileEntity(
  id: '1',
  name: 'Alexander Vance',
  email: 'alex.vance@nexphone.com',
  tier: 'Gold',
  memberSince: DateTime(2023, 5),
  addresses: const [
    AddressEntity(
      id: 'a1',
      label: 'Home',
      street: '123 Silicon Valley Blvd',
      city: 'San Francisco',
      country: 'US',
      isDefault: true,
    ),
  ],
);

void main() {
  late MockGetAccountProfileUseCase getProfile;

  setUpAll(() => registerFallbackValue(const NoParams()));

  setUp(() => getProfile = MockGetAccountProfileUseCase());

  Widget wrap(ThemeData theme) => MaterialApp(
        theme: theme,
        home: BlocProvider(
          create: (_) => AccountBloc(
            getAccountProfileUseCase: getProfile,
            logoutUseCase: MockLogoutUseCase(),
          )..add(const AccountRequested()),
          child: const AccountPage(),
        ),
      );

  for (final entry in {
    'dark': AppTheme.darkTheme(fontFamily: null),
    'light': AppTheme.lightTheme(fontFamily: null),
  }.entries) {
    testWidgets('renders profile in ${entry.key} mode without overflow', (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);
      when(() => getProfile(any())).thenAnswer((_) async => _profile);

      await tester.pumpWidget(wrap(entry.value));
      await tester.pump();

      expect(find.text('Account & Profile'), findsOneWidget);
      expect(find.text('Alexander Vance'), findsOneWidget);
      expect(find.text('My Orders'), findsOneWidget);

      await tester.scrollUntilVisible(find.text('Log Out'), 300);
      expect(find.text('Log Out'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  }

  testWidgets('shows sign-in prompt when unauthenticated', (tester) async {
    when(() => getProfile(any())).thenThrow(const AuthFailure());

    await tester.pumpWidget(wrap(AppTheme.darkTheme(fontFamily: null)));
    await tester.pump();

    expect(find.text('Sign In'), findsOneWidget);
  });

  testWidgets('shows retry on failure', (tester) async {
    when(() => getProfile(any())).thenThrow(const NetworkFailure('offline'));

    await tester.pumpWidget(wrap(AppTheme.darkTheme(fontFamily: null)));
    await tester.pump();

    expect(find.text('offline'), findsOneWidget);
    expect(find.text('Try Again'), findsOneWidget);
  });
}
