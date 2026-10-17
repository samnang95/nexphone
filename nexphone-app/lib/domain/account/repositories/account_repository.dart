import '../entities/account_profile_entity.dart';

abstract class AccountRepository {
  Future<AccountProfileEntity> getProfile();
}
