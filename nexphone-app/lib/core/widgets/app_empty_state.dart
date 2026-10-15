import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import 'app_button.dart';

class AppEmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;
  final String? buttonText;
  final VoidCallback? onRetry;

  const AppEmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.buttonText,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.darkSurfaceElevated,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.darkBorder),
              ),
              child: Icon(icon, size: 48, color: AppColors.textMutedDark),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimaryDark,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondaryDark,
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),
            if (buttonText != null && onRetry != null) ...[
              const SizedBox(height: 24),
              AppButton(
                text: buttonText!,
                onPressed: onRetry,
                width: 160,
                variant: AppButtonVariant.primary,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
