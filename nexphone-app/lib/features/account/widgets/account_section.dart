import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';
import 'account_card.dart';
import 'account_menu_tile.dart';

export 'account_badge.dart';
export 'account_card.dart';
export 'account_menu_tile.dart';

class AccountSection extends StatelessWidget {
  final String title;
  final List<AccountMenuTile> tiles;
  final String? actionLabel;
  final VoidCallback? onAction;

  const AccountSection({
    super.key,
    required this.title,
    required this.tiles,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSizes.p4,
            AppSizes.p24,
            AppSizes.p4,
            AppSizes.p10,
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  title.toUpperCase(),
                  style: TextStyle(
                    fontSize: AppFontSizes.s11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                    color: cs.onSurfaceVariant,
                  ),
                ),
              ),
              if (actionLabel != null)
                GestureDetector(
                  onTap: onAction,
                  child: Text(
                    actionLabel!,
                    style: TextStyle(
                      fontSize: AppFontSizes.s12,
                      fontWeight: FontWeight.w700,
                      color: cs.primary,
                    ),
                  ),
                ),
            ],
          ),
        ),
        AccountCard(
          child: Column(
            children: [
              for (var i = 0; i < tiles.length; i++) ...[
                tiles[i],
                if (i < tiles.length - 1)
                  Divider(
                    height: 1,
                    indent: 68,
                    color: cs.outline.withValues(alpha: 0.2),
                  ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}
