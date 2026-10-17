import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nexphone_app/core/constants/storage_keys.dart';
import 'package:nexphone_app/core/theme/theme_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() {
    ThemeService.themeModeNotifier.value = ThemeService.defaultMode;
  });

  test('defaults to dark when nothing is saved', () async {
    SharedPreferences.setMockInitialValues({});
    await ThemeService.init();
    expect(ThemeService.currentMode, ThemeMode.dark);
  });

  test('loads saved mode', () async {
    SharedPreferences.setMockInitialValues({StorageKeys.themeMode: 'light'});
    await ThemeService.init();
    expect(ThemeService.currentMode, ThemeMode.light);
  });

  test('toggle switches mode and persists it', () async {
    SharedPreferences.setMockInitialValues({});
    await ThemeService.init();
    await ThemeService.toggle();

    expect(ThemeService.currentMode, ThemeMode.light);
    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getString(StorageKeys.themeMode), 'light');
  });
}
