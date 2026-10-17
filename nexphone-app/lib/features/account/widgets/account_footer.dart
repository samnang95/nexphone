import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';
import 'account_card.dart';

class AccountFooter extends StatelessWidget {
  final String version;
  final VoidCallback? onLogout;
  final VoidCallback? onDeleteAccount;

  const AccountFooter({
    super.key,
    required this.version,
    this.onLogout,
    this.onDeleteAccount,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final linkStyle = TextStyle(
      fontSize: AppFontSizes.s11,
      color: cs.onSurfaceVariant,
      decoration: TextDecoration.underline,
      decorationColor: cs.onSurfaceVariant,
    );

    return Padding(
      padding: const EdgeInsets.only(top: AppSizes.p24),
      child: AccountCard(
        padding: const EdgeInsets.all(AppSizes.p16),
        child: Column(
          children: [
            Wrap(
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              runSpacing: AppSizes.p6,
              children: [
                Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Text('Terms of Service', style: linkStyle),
                    _dot(cs),
                    Text('Privacy Policy', style: linkStyle),
                  ],
                ),
                Text(
                  version,
                  style: TextStyle(
                    fontSize: AppFontSizes.s11,
                    color: cs.onSurfaceVariant,
                  ),
                ),
              ],
            ),
            AppSizes.h16,
            SizedBox(
              width: double.infinity,
              height: AppSizes.buttonHeightMd,
              child: FilledButton.tonalIcon(
                onPressed: onLogout ?? () {},
                icon: const Icon(Icons.logout_rounded, size: AppSizes.iconMd),
                label: const Text(
                  'Log Out',
                  style: TextStyle(fontWeight: FontWeight.w700),
                ),
                style: FilledButton.styleFrom(
                  backgroundColor: cs.surface,
                  foregroundColor: cs.onSurface,
                  shape: const StadiumBorder(),
                ),
              ),
            ),
            AppSizes.h8,
            TextButton(
              onPressed: onDeleteAccount ?? () {},
              style: TextButton.styleFrom(foregroundColor: cs.error),
              child: const Text(
                'Delete NexPhone Account',
                style: TextStyle(fontSize: AppFontSizes.s12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _dot(ColorScheme cs) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: AppSizes.p6),
    child: Text(
      '•',
      style: TextStyle(color: cs.onSurfaceVariant, fontSize: AppFontSizes.s11),
    ),
  );
}
