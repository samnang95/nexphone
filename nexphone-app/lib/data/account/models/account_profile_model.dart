import '../../../domain/account/entities/account_profile_entity.dart';

class AddressModel extends AddressEntity {
  const AddressModel({
    required super.id,
    required super.label,
    required super.street,
    required super.city,
    required super.country,
    super.isDefault,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      id: json['id']?.toString() ?? '',
      label: json['label']?.toString() ?? '',
      street: json['street']?.toString() ?? '',
      city: json['city']?.toString() ?? '',
      country: json['country']?.toString() ?? '',
      isDefault: json['isDefault'] == true,
    );
  }
}

class AccountProfileModel extends AccountProfileEntity {
  const AccountProfileModel({
    required super.id,
    required super.name,
    required super.email,
    super.phone,
    super.avatarUrl,
    super.tier,
    super.customerNumber,
    super.memberSince,
    super.addresses,
  });

  factory AccountProfileModel.fromJson(Map<String, dynamic> json) {
    final rawAddresses = json['addresses'];
    return AccountProfileModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString(),
      avatarUrl: json['avatarUrl']?.toString(),
      tier: json['tier']?.toString() ?? 'Regular',
      customerNumber: json['customerNumber']?.toString(),
      memberSince: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
      addresses: rawAddresses is List
          ? rawAddresses
                .whereType<Map<String, dynamic>>()
                .map(AddressModel.fromJson)
                .toList()
          : const [],
    );
  }
}
