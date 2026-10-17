import 'package:equatable/equatable.dart';
import '../../../domain/account/entities/account_profile_entity.dart';

abstract class AccountState extends Equatable {
  const AccountState();

  @override
  List<Object?> get props => [];
}

class AccountInitial extends AccountState {
  const AccountInitial();
}

class AccountLoading extends AccountState {
  const AccountLoading();
}

class AccountLoaded extends AccountState {
  final AccountProfileEntity profile;

  const AccountLoaded(this.profile);

  @override
  List<Object?> get props => [profile];
}

class AccountUnauthenticated extends AccountState {
  const AccountUnauthenticated();
}

class AccountFailure extends AccountState {
  final String message;

  const AccountFailure(this.message);

  @override
  List<Object?> get props => [message];
}
