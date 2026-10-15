import 'user_model.dart';

class AuthResponseModel {
  final String accessToken;
  final String refreshToken;
  final String tokenType;
  final UserModel user;

  const AuthResponseModel({
    required this.accessToken,
    required this.refreshToken,
    required this.tokenType,
    required this.user,
  });

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    return AuthResponseModel(
      accessToken: json['accessToken']?.toString() ?? '',
      refreshToken: json['refreshToken']?.toString() ?? '',
      tokenType: json['tokenType']?.toString() ?? 'Bearer',
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}
