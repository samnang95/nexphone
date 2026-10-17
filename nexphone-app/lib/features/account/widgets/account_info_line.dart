import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';

class AccountInfoLine extends StatelessWidget {
  final IconData icon;
  final String text;

  const AccountInfoLine({super.key, required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Row(
      children: [
        Icon(icon, size: 13, color: cs.onSurfaceVariant),
        AppSizes.w6,
        Expanded(
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: AppFontSizes.s12,
              color: cs.onSurfaceVariant,
            ),
          ),
        ),
      ],
    );
  }
}
