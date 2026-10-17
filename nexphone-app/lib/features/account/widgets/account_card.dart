import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';

class AccountCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;

  const AccountCard({
    super.key,
    required this.child,
    this.padding = EdgeInsets.zero,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(AppSizes.radius2Xl),
        border: Border.all(color: cs.outline.withValues(alpha: 0.25)),
      ),
      clipBehavior: Clip.antiAlias,
      child: child,
    );
  }
}
