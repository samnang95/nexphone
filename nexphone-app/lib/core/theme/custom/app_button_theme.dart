import 'package:flutter/material.dart';
import '../../constants/app_sizes.dart';
import '../app_colors.dart';

class CustomButtonTheme {
  CustomButtonTheme._();

  static ElevatedButtonThemeData get darkElevatedButtonTheme =>
      ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSizes.p20,
            vertical: AppSizes.p14,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusLg),
          ),
          textStyle: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: AppFontSizes.body,
          ),
        ),
      );

  static ElevatedButtonThemeData get lightElevatedButtonTheme =>
      ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSizes.p20,
            vertical: AppSizes.p14,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusLg),
          ),
          textStyle: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: AppFontSizes.body,
          ),
        ),
      );
}
