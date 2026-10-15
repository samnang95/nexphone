import 'package:shared_preferences/shared_preferences.dart';

abstract class AppPreferences {
  Future<String?> getString(String key);
  Future<bool> setString(String key, String value);
  Future<bool> remove(String key);
  Future<bool> clear();
}

class AppPreferencesImpl implements AppPreferences {
  final SharedPreferences _prefs;

  AppPreferencesImpl(this._prefs);

  @override
  Future<String?> getString(String key) async => _prefs.getString(key);

  @override
  Future<bool> setString(String key, String value) async => await _prefs.setString(key, value);

  @override
  Future<bool> remove(String key) async => await _prefs.remove(key);

  @override
  Future<bool> clear() async => await _prefs.clear();
}
