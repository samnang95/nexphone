import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/error/failures.dart';
import '../../../core/utils/usecase.dart';
import '../../../domain/account/usecases/get_account_profile_usecase.dart';
import '../../../domain/auth/usecases/logout_usecase.dart';
import 'account_event.dart';
import 'account_state.dart';

class AccountBloc extends Bloc<AccountEvent, AccountState> {
  final GetAccountProfileUseCase getAccountProfileUseCase;
  final LogoutUseCase logoutUseCase;

  AccountBloc({
    required this.getAccountProfileUseCase,
    required this.logoutUseCase,
  }) : super(const AccountInitial()) {
    on<AccountRequested>(_onRequested);
    on<AccountRefreshed>(_onRefreshed);
    on<AccountLogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onRequested(
    AccountRequested event,
    Emitter<AccountState> emit,
  ) async {
    emit(const AccountLoading());
    await _load(emit);
  }

  Future<void> _onRefreshed(
    AccountRefreshed event,
    Emitter<AccountState> emit,
  ) => _load(emit);

  Future<void> _load(Emitter<AccountState> emit) async {
    try {
      final profile = await getAccountProfileUseCase(const NoParams());
      emit(AccountLoaded(profile));
    } on AuthFailure {
      emit(const AccountUnauthenticated());
    } on Failure catch (f) {
      emit(AccountFailure(f.message));
    } catch (_) {
      emit(const AccountFailure('Unable to load your account'));
    }
  }

  Future<void> _onLogoutRequested(
    AccountLogoutRequested event,
    Emitter<AccountState> emit,
  ) async {
    await logoutUseCase(const NoParams());
    emit(const AccountUnauthenticated());
  }
}
