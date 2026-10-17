import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';
import 'account_card.dart';

class AccountMembershipBanner extends StatelessWidget {
  final VoidCallback? onTap;

  const AccountMembershipBanner({super.key, this.onTap});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return AccountCard(
      child: GestureDetector(
        onTap: onTap ?? () {},
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.p14),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(AppSizes.radiusLg),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [cs.primary, cs.tertiary],
                  ),
                ),
                child: Icon(
                  Icons.workspace_premium_rounded,
                  color: cs.onPrimary,
                ),
              ),
              AppSizes.w12,
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSizes.p6,
                            vertical: AppSizes.p2,
                          ),
                          decoration: BoxDecoration(
                            color: cs.primary,
                            borderRadius: BorderRadius.circular(
                              AppSizes.radiusXs,
                            ),
                          ),
                          child: Text(
                            'NEXPHONE PRIME',
                            style: TextStyle(
                              fontSize: AppFontSizes.s10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                              color: cs.onPrimary,
                            ),
                          ),
                        ),
                        AppSizes.w6,
                        Flexible(
                          child: Text(
                            'Tier Elite',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: AppFontSizes.s11,
                              color: cs.onSurfaceVariant,
                            ),
                          ),
                        ),
                      ],
                    ),
                    AppSizes.h6,
                    Text(
                      'Complimentary Express Shipping',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: AppFontSizes.s15,
                        fontWeight: FontWeight.w800,
                        color: cs.onSurface,
                      ),
                    ),
                    AppSizes.h2,
                    Text(
                      'Expires in 28 days • 1-Click Checkout',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: AppFontSizes.s11,
                        color: cs.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              AppSizes.w8,
              CircleAvatar(
                radius: 16,
                backgroundColor: cs.primary.withValues(alpha: 0.12),
                child: Icon(
                  Icons.arrow_forward_rounded,
                  size: AppSizes.iconSm,
                  color: cs.primary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
