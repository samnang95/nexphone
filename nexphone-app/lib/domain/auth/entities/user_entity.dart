import 'package:equatable/equatable.dart';

class UserEntity extends Equatable {
  final String id;
  final String name;
  final String email;
  final String role;
  final String tier;
  final String? phone;
  final String? customerNumber;

  const UserEntity({
    required this.id,
    required this.name,
    required this.email,
    this.role = 'customer',
    this.tier = 'Regular',
    this.phone,
    this.customerNumber,
  });

  @override
  List<Object?> get props => [id, name, email, role, tier, phone, customerNumber];
}
