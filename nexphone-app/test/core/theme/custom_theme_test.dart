import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nexphone_app/core/theme/app_colors.dart';
import 'package:nexphone_app/core/theme/app_theme.dart';
import 'package:nexphone_app/core/theme/custom/app_bar_theme.dart';
import 'package:nexphone_app/core/theme/custom/app_button_theme.dart';
import 'package:nexphone_app/core/theme/custom/app_card_theme.dart';
import 'package:nexphone_app/core/theme/custom/app_color_scheme.dart';
import 'package:nexphone_app/core/theme/custom/app_input_theme.dart';

void main() {
  group('Custom Theme Modules Tests', () {
    test('AppColorScheme defines dark and light schemes and scaffolds', () {
      expect(AppColorScheme.darkScaffoldBackgroundColor, AppColors.darkBackground);
      expect(AppColorScheme.lightScaffoldBackgroundColor, AppColors.lightBackground);

      expect(AppColorScheme.darkColorScheme.brightness, Brightness.dark);
      expect(AppColorScheme.lightColorScheme.brightness, Brightness.light);

      expect(AppColorScheme.darkColorScheme.primary, AppColors.primary);
      expect(AppColorScheme.lightColorScheme.primary, AppColors.primary);
    });

    test('CustomAppBarTheme defines elevation 0 and transparent/matching background', () {
      expect(CustomAppBarTheme.darkAppBarTheme.backgroundColor, AppColors.darkBackground);
      expect(CustomAppBarTheme.lightAppBarTheme.backgroundColor, AppColors.lightBackground);
      expect(CustomAppBarTheme.darkAppBarTheme.elevation, 0);
    });

    test('CustomCardTheme has shape with rounded corners', () {
      expect(CustomCardTheme.darkCardTheme.color, AppColors.darkSurface);
      expect(CustomCardTheme.lightCardTheme.color, AppColors.lightSurface);
      expect(CustomCardTheme.darkCardTheme.shape, isA<RoundedRectangleBorder>());
    });

    test('CustomInputTheme defines filled input styles', () {
      expect(CustomInputTheme.darkInputTheme.filled, isTrue);
      expect(CustomInputTheme.lightInputTheme.filled, isTrue);
      expect(CustomInputTheme.darkInputTheme.border, isA<OutlineInputBorder>());
    });

    test('CustomButtonTheme defines elevated button styles', () {
      expect(CustomButtonTheme.darkElevatedButtonTheme.style, isNotNull);
      expect(CustomButtonTheme.lightElevatedButtonTheme.style, isNotNull);
    });

    test('AppTheme composes modules into complete ThemeData', () {
      final dark = AppTheme.darkTheme();
      expect(dark.scaffoldBackgroundColor, AppColorScheme.darkScaffoldBackgroundColor);
      expect(dark.colorScheme.brightness, Brightness.dark);
      expect(dark.useMaterial3, isTrue);

      final light = AppTheme.lightTheme();
      expect(light.scaffoldBackgroundColor, AppColorScheme.lightScaffoldBackgroundColor);
      expect(light.colorScheme.brightness, Brightness.light);
      expect(light.useMaterial3, isTrue);
    });
  });
}
