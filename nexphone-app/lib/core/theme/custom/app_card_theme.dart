import 'package:flutter/material.dart';
import '../../constants/app_sizes.dart';
import '../app_colors.dart';

class CustomCardTheme {
  CustomCardTheme._();

  static CardThemeData get darkCardTheme => CardThemeData(
    color: AppColors.darkSurface,
    elevation: 0,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(AppSizes.radiusXl),
      side: const BorderSide(color: AppColors.darkBorder, width: 1),
    ),
  );

  static CardThemeData get lightCardTheme => CardThemeData(
    color: AppColors.lightSurface,
    elevation: 0,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(AppSizes.radiusXl),
      side: const BorderSide(color: AppColors.lightBorder, width: 1),
    ),
  );
}