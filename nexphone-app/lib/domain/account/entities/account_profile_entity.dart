import 'package:equatable/equatable.dart';

class AddressEntity extends Equatable {
  final String id;
  final String label;
  final String street;
  final String city;
  final String country;
  final bool isDefault;

  const AddressEntity({
    required this.id,
    required this.label,
    required this.street,
    required this.city,
    required this.country,
    this.isDefault = false,
  });

  String get shortLine => [street, city].where((s) => s.isNotEmpty).join(', ');

  @override
  List<Object?> get props => [id, label, street, city, country, isDefault];
}

class AccountProfileEntity extends Equatable {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? avatarUrl;
  final String tier;
  final String? customerNumber;
  final DateTime? memberSince;
  final List<AddressEntity> addresses;

  const AccountProfileEntity({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.avatarUrl,
    this.tier = 'Regular',
    this.customerNumber,
    this.memberSince,
    this.addresses = const [],
  });

  AddressEntity? get defaultAddress {
    if (addresses.isEmpty) return null;
    return addresses.firstWhere(
      (a) => a.isDefault,
      orElse: () => addresses.first,
    );
  }

  @override
  List<Object?> get props => [
    id,
    name,
    email,
    phone,
    avatarUrl,
    tier,
    customerNumber,
    memberSince,
    addresses,
  ];
}
