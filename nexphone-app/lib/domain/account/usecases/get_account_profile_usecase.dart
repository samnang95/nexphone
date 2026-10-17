import '../../../core/utils/usecase.dart';
import '../entities/account_profile_entity.dart';
import '../repositories/account_repository.dart';

class GetAccountProfileUseCase
    implements UseCase<AccountProfileEntity, NoParams> {
  final AccountRepository repository;

  GetAccountProfileUseCase(this.repository);

  @override
  Future<AccountProfileEntity> call(NoParams params) => repository.getProfile();
}
