import 'package:flutter/material.dart';
import '../app_colors.dart';

class CustomAppBarTheme {
  CustomAppBarTheme._();

  static const AppBarTheme darkAppBarTheme = AppBarTheme(
    backgroundColor: AppColors.darkBackground,
    foregroundColor: AppColors.textPrimaryDark,
    elevation: 0,
    centerTitle: false,
    scrolledUnderElevation: 0,
  );

  static const AppBarTheme lightAppBarTheme = AppBarTheme(
    backgroundColor: AppColors.lightBackground,
    foregroundColor: AppColors.textPrimaryLight,
    elevation: 0,
    centerTitle: false,
    scrolledUnderElevation: 0,
  );
}
