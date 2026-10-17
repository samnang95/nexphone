import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../app/router/app_routes.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/theme_service.dart';
import '../../../domain/account/entities/account_profile_entity.dart';
import '../bloc/account_bloc.dart';
import '../bloc/account_event.dart';
import '../bloc/account_state.dart';
import '../widgets/account_footer.dart';
import '../widgets/account_membership_banner.dart';
import '../widgets/account_profile_card.dart';
import '../widgets/account_section.dart';

class AccountPage extends StatelessWidget {
  const AccountPage({super.key});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: AppSizes.p20,
        title: Text(
          'Account & Profile',
          style: TextStyle(
            fontSize: AppFontSizes.s22,
            fontWeight: FontWeight.w800,
            color: cs.onSurface,
          ),
        ),
        actions: [
          GestureDetector(
            onTap: () {},
            child: Badge.count(
              count: 2,
              backgroundColor: cs.primary,
              child: const Icon(Icons.notifications_none_rounded),
            ),
          ),
          ValueListenableBuilder<ThemeMode>(
            valueListenable: ThemeService.themeModeNotifier,
            builder: (context, mode, _) => GestureDetector(
              onTap: ThemeService.toggle,
              child: Icon(
                mode == ThemeMode.dark
                    ? Icons.light_mode_outlined
                    : Icons.dark_mode_outlined,
              ),
            ),
          ),
          GestureDetector(
            onTap: () {},
            child: const Icon(Icons.settings_outlined),
          ),
          AppSizes.w8,
        ],
      ),
      body: BlocBuilder<AccountBloc, AccountState>(
        builder: (context, state) {
          return switch (state) {
            AccountLoaded(:final profile) => RefreshIndicator(
              onRefresh: () async =>
                  context.read<AccountBloc>().add(const AccountRefreshed()),
              child: _AccountContent(profile: profile),
            ),
            AccountUnauthenticated() => _AccountMessage(
              icon: Icons.lock_outline_rounded,
              title: 'Sign in to view your account',
              message: 'Your orders, addresses and settings will appear here.',
              actionLabel: 'Sign In',
              onAction: () => context.push(AppRoutes.login),
            ),
            AccountFailure(:final message) => _AccountMessage(
              icon: Icons.cloud_off_rounded,
              title: 'Couldn\'t load your account',
              message: message,
              actionLabel: 'Try Again',
              onAction: () =>
                  context.read<AccountBloc>().add(const AccountRequested()),
            ),
            _ => const Center(child: CircularProgressIndicator()),
          };
        },
      ),
    );
  }
}

class _AccountContent extends StatelessWidget {
  final AccountProfileEntity profile;

  const _AccountContent({required this.profile});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final address = profile.defaultAddress;

    return ListView(
      padding: const EdgeInsets.fromLTRB(
        AppSizes.p16,
        AppSizes.p8,
        AppSizes.p16,
        AppSizes.p32,
      ),
      children: [
        AccountProfileCard(profile: profile),
        AppSizes.h12,
        const AccountMembershipBanner(),
        AccountSection(
          title: 'Order & Shopping Hub',
          actionLabel: 'View History',
          onAction: () => context.push(AppRoutes.orders),
          tiles: [
            AccountMenuTile(
              icon: Icons.inventory_2_outlined,
              title: 'My Orders',
              subtitle: '6 total orders placed this year',
              badge: AccountBadge(label: '1 on the way', color: cs.primary),
              onTap: () => context.push(AppRoutes.orders),
            ),
            AccountMenuTile(
              icon: Icons.bookmark_border_rounded,
              title: 'Saved Wishlist & Alerts',
              subtitle: '5 items tracking price drops',
              badge: AccountBadge(label: '\$270 saved', color: cs.primary),
            ),
            AccountMenuTile(
              icon: Icons.shopping_bag_outlined,
              title: 'Shopping Cart',
              subtitle: 'Ready for checkout • NexPhone Pay',
              badge: AccountBadge(label: '2 items', color: cs.onSurfaceVariant),
            ),
          ],
        ),
        AccountSection(
          title: 'Account Settings & Management',
          tiles: [
            AccountMenuTile(
              icon: Icons.location_on_outlined,
              title: 'Manage Addresses',
              subtitle: address != null
                  ? 'Default: ${address.shortLine}'
                  : 'No address saved yet',
              badge: AccountBadge(
                label:
                    '${profile.addresses.length} ${profile.addresses.length == 1 ? 'Address' : 'Addresses'}',
                color: cs.onSurfaceVariant,
              ),
            ),
            const AccountMenuTile(
              icon: Icons.account_balance_wallet_outlined,
              title: 'Payment Methods',
              subtitle: 'Visa •••• 8979 • Bakong KHQR Connected',
              badge: AccountBadge(
                label: 'KHQR Live',
                color: AppColors.emeraldSuccess,
              ),
            ),
            AccountMenuTile(
              icon: Icons.shield_outlined,
              title: 'Security & Biometrics',
              subtitle: 'Face ID enabled • Password updated',
              badge: AccountBadge(
                label: '2FA Active',
                color: cs.primary,
                icon: Icons.lock_rounded,
              ),
            ),
          ],
        ),
        AccountSection(
          title: 'Activity & Engagement',
          tiles: [
            const AccountMenuTile(
              icon: Icons.rate_review_outlined,
              title: 'Reviews & Ratings',
              subtitle: '4 submitted • Earn 50 pts on next review',
              badge: AccountBadge(
                label: '1 Pending',
                color: AppColors.amberWarning,
              ),
            ),
            AccountMenuTile(
              icon: Icons.tune_rounded,
              title: 'Notification Preferences',
              subtitle: 'Order updates, Flash sales, SMS alerts',
              badge: AccountBadge(label: 'Active', color: cs.primary),
            ),
          ],
        ),
        AccountSection(
          title: 'Support & Help',
          tiles: [
            AccountMenuTile(
              icon: Icons.support_agent_rounded,
              title: 'Concierge & Live Chat',
              subtitle: '24/7 priority support agent available',
              badge: AccountBadge(label: 'KM-8821', color: cs.primary),
            ),
            const AccountMenuTile(
              icon: Icons.help_outline_rounded,
              title: 'FAQs & Knowledge Base',
              subtitle: 'Returns, Bakong payments & warranty',
            ),
          ],
        ),
        AccountFooter(
          version: 'v1.0.0 (Build 1)',
          onLogout: () =>
              context.read<AccountBloc>().add(const AccountLogoutRequested()),
        ),
      ],
    );
  }
}

class _AccountMessage extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;
  final String actionLabel;
  final VoidCallback onAction;

  const _AccountMessage({
    required this.icon,
    required this.title,
    required this.message,
    required this.actionLabel,
    required this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSizes.p32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircleAvatar(
              radius: 36,
              backgroundColor: cs.primary.withValues(alpha: 0.12),
              child: Icon(icon, size: AppSizes.iconXl, color: cs.primary),
            ),
            AppSizes.h20,
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: AppFontSizes.s18,
                fontWeight: FontWeight.w800,
                color: cs.onSurface,
              ),
            ),
            AppSizes.h8,
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: AppFontSizes.s13,
                color: cs.onSurfaceVariant,
              ),
            ),
            AppSizes.h24,
            FilledButton(
              onPressed: onAction,
              style: FilledButton.styleFrom(
                shape: const StadiumBorder(),
                minimumSize: const Size(180, 48),
              ),
              child: Text(actionLabel),
            ),
          ],
        ),
      ),
    );
  }
}
