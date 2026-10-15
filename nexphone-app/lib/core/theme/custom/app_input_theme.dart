import 'package:flutter/material.dart';
import '../../constants/app_sizes.dart';
import '../app_colors.dart';

class CustomInputTheme {
  CustomInputTheme._();

  static InputDecorationTheme get darkInputTheme => InputDecorationTheme(
    filled: true,
    fillColor: AppColors.darkSurfaceElevated,
    contentPadding: const EdgeInsets.symmetric(
      horizontal: AppSizes.p16,
      vertical: AppSizes.p14,
    ),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      borderSide: const BorderSide(color: AppColors.darkBorder),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      borderSide: const BorderSide(color: AppColors.darkBorder),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
    ),
    hintStyle: const TextStyle(color: AppColors.textMutedDark),
  );

  static InputDecorationTheme get lightInputTheme => InputDecorationTheme(
    filled: true,
    fillColor: AppColors.lightSurface,
    contentPadding: const EdgeInsets.symmetric(
      horizontal: AppSizes.p16,
      vertical: AppSizes.p14,
    ),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      borderSide: const BorderSide(color: AppColors.lightBorder),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      borderSide: const BorderSide(color: AppColors.lightBorder),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
    ),
    hintStyle: const TextStyle(color: AppColors.textSecondaryLight),
  );
}
