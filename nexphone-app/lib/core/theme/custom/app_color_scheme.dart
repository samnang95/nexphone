import 'package:flutter/material.dart';
import '../app_colors.dart';

class AppColorScheme {
  AppColorScheme._();

  static const Color darkScaffoldBackgroundColor = AppColors.darkBackground;
  static const Color lightScaffoldBackgroundColor = AppColors.lightBackground;

  static const ColorScheme darkColorScheme = ColorScheme.dark(
    primary: AppColors.darkPrimary,
    onPrimary: Colors.white,
    primaryContainer: AppColors.darkPrimaryContainer,
    onPrimaryContainer: AppColors.darkOnPrimaryContainer,
    secondary: AppColors.darkSecondary,
    onSecondary: AppColors.darkNeutral,
    tertiary: AppColors.darkTertiary,
    onTertiary: Colors.white,
    surface: AppColors.darkSurface,
    onSurface: AppColors.textPrimaryDark,
    onSurfaceVariant: AppColors.textSecondaryDark,
    surfaceContainerHighest: AppColors.darkSurfaceElevated,
    outline: AppColors.darkBorder,
    error: AppColors.darkError,
    onError: AppColors.darkNeutral,
  );

  static const ColorScheme lightColorScheme = ColorScheme.light(
    primary: AppColors.lightPrimary,
    onPrimary: Colors.white,
    primaryContainer: AppColors.lightPrimaryContainer,
    onPrimaryContainer: AppColors.lightOnPrimaryContainer,
    secondary: AppColors.lightSecondary,
    onSecondary: Colors.white,
    tertiary: AppColors.lightTertiary,
    onTertiary: Colors.white,
    surface: AppColors.lightSurface,
    onSurface: AppColors.textPrimaryLight,
    onSurfaceVariant: AppColors.textSecondaryLight,
    surfaceContainerHighest: AppColors.lightSurfaceElevated,
    outline: AppColors.lightBorder,
    error: AppColors.lightError,
    onError: Colors.white,
  );
}