import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../domain/products/entities/banner_entity.dart';

class HeroBanner extends StatelessWidget {
  final BannerEntity? banner;
  final VoidCallback? onCtaPressed;

  const HeroBanner({super.key, this.banner, this.onCtaPressed});

  @override
  Widget build(BuildContext context) {
    final title = banner?.title ?? 'NexPhone 16 Pro Max';
    final subtitle = banner?.subtitle ??
        'Titanium aerospace chassis with uninterrupted global satellite VoIP everywhere on Earth.';
    final badge = banner?.badge ?? 'FLAGSHIP PREMIERE';
    final ctaText = banner?.ctaText ?? 'Explore Flagship';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF1E1B4B), // Deep Indigo
            Color(0xFF0F172A), // Slate 900
          ],
        ),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: 0.3),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.15),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.primaryLight.withValues(alpha: 0.4)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.bolt_rounded, color: AppColors.cyanAccent, size: 14),
                const SizedBox(width: 4),
                Text(
                  badge,
                  style: const TextStyle(
                    color: AppColors.cyanAccent,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            style: const TextStyle(
              color: AppColors.textSecondaryDark,
              fontSize: 13,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              ElevatedButton.icon(
                onPressed: onCtaPressed,
                icon: const Icon(Icons.arrow_forward_rounded, size: 16),
                label: Text(ctaText),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                ),
              ),
              const Spacer(),
              const Text(
                'From \$1,199',
                style: TextStyle(
                  color: AppColors.cyanAccent,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
