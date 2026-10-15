import 'package:flutter/foundation.dart';
import 'package:flutter_localization/flutter_localization.dart';

class LocalizationService {
  LocalizationService._();

  static final FlutterLocalization localization = FlutterLocalization.instance;
  static const String englishFontFamily = 'NotoSans';
  static const String khmerFontFamily = 'Hanuman';

  static const List<JsonLocale> supportedJsonLocales = [
    JsonLocale('en', 'assets/languages/en.json', fontFamily: englishFontFamily),
    JsonLocale('km', 'assets/languages/km.json', fontFamily: khmerFontFamily),
  ];

  static final ValueNotifier<String> languageNotifier = ValueNotifier<String>('en');

  static Future<void> init({String defaultLanguageCode = 'en'}) async {
    await localization.ensureInitialized();
    localization.init(
      initLanguageCode: defaultLanguageCode,
      source: LocalizationSource.jsonAsset,
      jsonLocales: supportedJsonLocales,
    );
    languageNotifier.value = currentLanguageCode;
    localization.onTranslatedLanguage = (locale) {
      if (locale != null) {
        languageNotifier.value = locale.languageCode;
      }
    };
  }

  static void changeLanguage(String languageCode) {
    localization.translate(languageCode);
    languageNotifier.value = languageCode;
  }

  static void toggleLanguage() {
    changeLanguage(isKhmer ? 'en' : 'km');
  }

  static String get currentLanguageCode => localization.currentLocale?.languageCode ?? 'en';
  static bool get isKhmer => currentLanguageCode == 'km';
  static bool get isEnglish => currentLanguageCode == 'en';
  static List<String> get supportedLanguageCodes => ['en', 'km'];
  static String get currentFontFamily => localization.fontFamily ?? (isKhmer ? khmerFontFamily : englishFontFamily);
}