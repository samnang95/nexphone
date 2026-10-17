import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../domain/account/entities/account_profile_entity.dart';
import 'account_avatar.dart';
import 'account_card.dart';
import 'account_info_line.dart';
import 'account_stat_tile.dart';

class AccountProfileCard extends StatelessWidget {
  final AccountProfileEntity profile;
  final VoidCallback? onEdit;

  const AccountProfileCard({super.key, required this.profile, this.onEdit});

  static const _months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  String get _initials {
    final parts = profile.name
        .trim()
        .split(RegExp(r'\s+'))
        .where((p) => p.isNotEmpty);
    return parts.take(2).map((p) => p[0].toUpperCase()).join();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return AccountCard(
      padding: const EdgeInsets.all(AppSizes.p16),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AccountAvatar(initials: _initials, imageUrl: profile.avatarUrl),
              AppSizes.w14,
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            profile.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: AppFontSizes.s18,
                              fontWeight: FontWeight.w800,
                              color: cs.onSurface,
                            ),
                          ),
                        ),
                        AppSizes.w4,
                        Icon(
                          Icons.verified_rounded,
                          size: AppSizes.iconSm,
                          color: cs.primary,
                        ),
                      ],
                    ),
                    AppSizes.h6,
                    if (profile.phone != null && profile.phone!.isNotEmpty) ...[
                      AccountInfoLine(
                        icon: Icons.phone_outlined,
                        text: profile.phone!,
                      ),
                      AppSizes.h4,
                    ],
                    AccountInfoLine(
                      icon: Icons.mail_outline_rounded,
                      text: profile.email,
                    ),
                  ],
                ),
              ),
              TextButton.icon(
                onPressed: onEdit ?? () {},
                icon: const Icon(Icons.edit_rounded, size: AppSizes.iconSm),
                label: const Text('Edit'),
                style: TextButton.styleFrom(
                  foregroundColor: cs.primary,
                  backgroundColor: cs.primary.withValues(alpha: 0.1),
                  visualDensity: VisualDensity.compact,
                  shape: const StadiumBorder(),
                ),
              ),
            ],
          ),
          AppSizes.h16,
          Row(
            children: [
              Expanded(
                child: AccountStatTile(
                  label: 'Tier',
                  value: profile.tier,
                  caption: profile.customerNumber ?? 'Member',
                  icon: Icons.workspace_premium_outlined,
                  accent: AppColors.amberWarning,
                ),
              ),
              AppSizes.w8,
              Expanded(
                child: AccountStatTile(
                  label: 'Since',
                  value: profile.memberSince != null
                      ? '${profile.memberSince!.year}'
                      : '—',
                  caption: profile.memberSince != null
                      ? _months[profile.memberSince!.month - 1]
                      : 'Joined',
                  icon: Icons.calendar_today_outlined,
                ),
              ),
              AppSizes.w8,
              Expanded(
                child: AccountStatTile(
                  label: 'Addresses',
                  value: '${profile.addresses.length}',
                  caption: profile.defaultAddress?.label ?? 'None saved',
                  icon: Icons.location_on_outlined,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
