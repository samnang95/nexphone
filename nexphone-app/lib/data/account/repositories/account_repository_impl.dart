import '../../../core/error/error_handler.dart';
import '../../../domain/account/entities/account_profile_entity.dart';
import '../../../domain/account/repositories/account_repository.dart';
import '../datasources/account_remote_data_source.dart';

class AccountRepositoryImpl implements AccountRepository {
  final AccountRemoteDataSource remoteDataSource;

  AccountRepositoryImpl({required this.remoteDataSource});

  @override
  Future<AccountProfileEntity> getProfile() async {
    try {
      return await remoteDataSource.getProfile();
    } catch (e) {
      throw ErrorHandler.handle(e);
    }
  }
}
