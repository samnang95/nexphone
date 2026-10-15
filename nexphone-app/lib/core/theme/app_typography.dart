import 'package:flutter/material.dart';
import '../constants/app_sizes.dart';
import 'app_colors.dart';

class AppTypography {
  AppTypography._();

  static const TextStyle displayLarge = TextStyle(
    fontSize: AppFontSizes.display,
    fontWeight: FontWeight.w800,
    letterSpacing: -1.0,
    color: AppColors.textPrimaryDark,
  );

  static const TextStyle headlineMedium = TextStyle(
    fontSize: AppFontSizes.headline,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.5,
    color: AppColors.textPrimaryDark,
  );

  static const TextStyle titleLarge = TextStyle(
    fontSize: AppFontSizes.title,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimaryDark,
  );

  static const TextStyle titleMedium = TextStyle(
    fontSize: AppFontSizes.body,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimaryDark,
  );

  static const TextStyle bodyLarge = TextStyle(
    fontSize: AppFontSizes.body,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondaryDark,
    height: 1.4,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontSize: AppFontSizes.bodySm,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondaryDark,
    height: 1.3,
  );

  static const TextStyle labelSmall = TextStyle(
    fontSize: AppFontSizes.caption,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
    color: AppColors.textMutedDark,
  );
}