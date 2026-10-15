import 'package:flutter/material.dart';
import '../../../core/constants/app_assets.dart';
import '../../../core/constants/app_sizes.dart';

class StoreHeaderCard extends StatelessWidget {
  final String storeName;
  final String tagline;
  final String? logoAsset;
  final VoidCallback? onTap;
  final bool isDark;

  const StoreHeaderCard({
    super.key,
    this.storeName = 'NexPhone',
    this.tagline = 'NEXT-GEN SATELLITE & QUANTUM STORE',
    this.logoAsset,
    this.onTap,
    this.isDark = false,
  });

  @override
  Widget build(BuildContext context) {
    final bgColor = isDark ? const Color(0xFF0F172A) : Colors.white;
    final titleColor = isDark ? Colors.white : const Color(0xFF0B1938);
    final dotColor = const Color(0xFF2563EB);
    final subtitleColor = isDark
        ? const Color(0xFF94A3B8)
        : const Color(0xFF475569);
    final borderColor = isDark
        ? const Color(0xFF1E293B)
        : const Color(0xFFE2E8F0);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(AppSizes.radiusLg),
          border: Border.all(color: borderColor, width: 1.2),
          boxShadow: [
            BoxShadow(
              color: isDark
                  ? Colors.black.withValues(alpha: 0.3)
                  : const Color(0xFF0F172A).withValues(alpha: 0.08),
              blurRadius: 20,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Row(
          children: [
            // 3D Orbital Glassmorphic Emblem
            ClipRRect(
              borderRadius: BorderRadius.circular(100),
              child: Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF2563EB).withValues(alpha: 0.35),
                      blurRadius: 16,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: Image.asset(
                  logoAsset ?? AppAssets.appIconLight,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [Color(0xFF38BDF8), Color(0xFF1D4ED8)],
                      ),
                    ),
                    child: const Icon(
                      Icons.blur_on_rounded,
                      color: Colors.white,
                      size: 36,
                    ),
                  ),
                ),
              ),
            ),
            AppSizes.w16,

            // Brand Typography
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text.rich(
                    TextSpan(
                      text: storeName,
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        color: titleColor,
                        letterSpacing: -1.0,
                        height: 1.1,
                      ),
                      children: [
                        TextSpan(
                          text: '.',
                          style: TextStyle(
                            fontSize: 34,
                            fontWeight: FontWeight.w900,
                            color: dotColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    tagline,
                    style: TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                      color: subtitleColor,
                      letterSpacing: 2.2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
