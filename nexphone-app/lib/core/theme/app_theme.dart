import 'package:flutter/material.dart';
import 'custom/app_bar_theme.dart';
import 'custom/app_button_theme.dart';
import 'custom/app_card_theme.dart';
import 'custom/app_color_scheme.dart';
import 'custom/app_input_theme.dart';

class AppTheme {
  AppTheme._();

  static ThemeData darkTheme({String? fontFamily = 'NotoSans'}) {
    return ThemeData(
      useMaterial3: true,
      fontFamily: fontFamily,
      fontFamilyFallback: const ['NotoSans', 'Hanuman'],
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColorScheme.darkScaffoldBackgroundColor,
      colorScheme: AppColorScheme.darkColorScheme,
      appBarTheme: CustomAppBarTheme.darkAppBarTheme,
      cardTheme: CustomCardTheme.darkCardTheme,
      inputDecorationTheme: CustomInputTheme.darkInputTheme,
      elevatedButtonTheme: CustomButtonTheme.darkElevatedButtonTheme,
    );
  }

  static ThemeData lightTheme({String? fontFamily = 'NotoSans'}) {
    return ThemeData(
      useMaterial3: true,
      fontFamily: fontFamily,
      fontFamilyFallback: const ['NotoSans', 'Hanuman'],
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColorScheme.lightScaffoldBackgroundColor,
      colorScheme: AppColorScheme.lightColorScheme,
      appBarTheme: CustomAppBarTheme.lightAppBarTheme,
      cardTheme: CustomCardTheme.lightCardTheme,
      inputDecorationTheme: CustomInputTheme.lightInputTheme,
      elevatedButtonTheme: CustomButtonTheme.lightElevatedButtonTheme,
    );
  }
}