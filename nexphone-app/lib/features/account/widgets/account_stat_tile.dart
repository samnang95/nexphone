import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';

class AccountStatTile extends StatelessWidget {
  final String label;
  final String value;
  final String caption;
  final IconData icon;
  final Color? accent;

  const AccountStatTile({
    super.key,
    required this.label,
    required this.value,
    required this.caption,
    required this.icon,
    this.accent,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final color = accent ?? cs.primary;
    return Container(
      padding: const EdgeInsets.all(AppSizes.p10),
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  label.toUpperCase(),
                  style: TextStyle(
                    fontSize: AppFontSizes.s10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                    color: cs.onSurfaceVariant,
                  ),
                ),
              ),
              Icon(icon, size: AppSizes.iconXs, color: color),
            ],
          ),
          AppSizes.h4,
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              value,
              style: TextStyle(
                fontSize: AppFontSizes.s17,
                fontWeight: FontWeight.w800,
                color: cs.onSurface,
              ),
            ),
          ),
          Text(
            caption,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: AppFontSizes.s10,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
