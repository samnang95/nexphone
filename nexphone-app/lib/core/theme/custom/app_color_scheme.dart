import 'package:flutter/material.dart';
import '../app_colors.dart';

class AppColorScheme {
  AppColorScheme._();

  static const Color darkScaffoldBackgroundColor = AppColors.darkBackground;
  static const Color lightScaffoldBackgroundColor = AppColors.lightBackground;

  static const ColorScheme darkColorScheme = ColorScheme.dark(
    primary: AppColors.primary,
    secondary: AppColors.cyanAccent,
    surface: AppColors.darkSurface,
    error: AppColors.roseError,
    onPrimary: Colors.white,
    onSecondary: Colors.white,
    onSurface: AppColors.textPrimaryDark,
  );

  static const ColorScheme lightColorScheme = ColorScheme.light(
    primary: AppColors.primary,
    secondary: AppColors.cyanAccent,
    surface: AppColors.lightSurface,
    error: AppColors.roseError,
    onPrimary: Colors.white,
    onSecondary: Colors.white,
    onSurface: AppColors.textPrimaryLight,
  );
}