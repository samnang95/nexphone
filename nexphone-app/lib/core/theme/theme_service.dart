import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/storage_keys.dart';

class ThemeService {
  ThemeService._();

  static const ThemeMode defaultMode = ThemeMode.dark;

  static final ValueNotifier<ThemeMode> themeModeNotifier = ValueNotifier<ThemeMode>(defaultMode);

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(StorageKeys.themeMode);
    themeModeNotifier.value = ThemeMode.values.firstWhere(
      (m) => m.name == saved,
      orElse: () => defaultMode,
    );
  }

  static Future<void> setThemeMode(ThemeMode mode) async {
    themeModeNotifier.value = mode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(StorageKeys.themeMode, mode.name);
  }

  static Future<void> toggle() => setThemeMode(isDark ? ThemeMode.light : ThemeMode.dark);

  static ThemeMode get currentMode => themeModeNotifier.value;
  static bool get isDark => currentMode == ThemeMode.dark;
}
