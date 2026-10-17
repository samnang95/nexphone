import 'package:equatable/equatable.dart';

abstract class AccountEvent extends Equatable {
  const AccountEvent();

  @override
  List<Object?> get props => [];
}

class AccountRequested extends AccountEvent {
  const AccountRequested();
}

class AccountRefreshed extends AccountEvent {
  const AccountRefreshed();
}

class AccountLogoutRequested extends AccountEvent {
  const AccountLogoutRequested();
}
