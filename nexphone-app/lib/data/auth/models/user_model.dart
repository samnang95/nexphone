import '../../../domain/auth/entities/user_entity.dart';

class UserModel extends UserEntity {
  const UserModel({
    required super.id,
    required super.name,
    required super.email,
    super.role = 'customer',
    super.tier = 'Regular',
    super.phone,
    super.customerNumber,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? 'customer',
      tier: json['tier']?.toString() ?? 'Regular',
      phone: json['phone']?.toString(),
      customerNumber: json['customerNumber']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'tier': tier,
      'phone': phone,
      'customerNumber': customerNumber,
    };
  }

  factory UserModel.fromEntity(UserEntity entity) {
    return UserModel(
      id: entity.id,
      name: entity.name,
      email: entity.email,
      role: entity.role,
      tier: entity.tier,
      phone: entity.phone,
      customerNumber: entity.customerNumber,
    );
  }
}
