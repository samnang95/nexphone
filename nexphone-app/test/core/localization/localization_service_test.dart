import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:nexphone_app/core/localization/app_strings.dart';
import 'package:nexphone_app/core/localization/localization_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('LocalizationService Tests', () {
    test('supportedJsonLocales has en and km with correct asset paths and fonts', () {
      final locales = LocalizationService.supportedJsonLocales;
      expect(locales.length, 2);

      final enLocale = locales.firstWhere((l) => l.languageCode == 'en');
      expect(enLocale.assetPath, 'assets/languages/en.json');
      expect(enLocale.fontFamily, LocalizationService.englishFontFamily);
      expect(LocalizationService.englishFontFamily, 'NotoSans');

      final kmLocale = locales.firstWhere((l) => l.languageCode == 'km');
      expect(kmLocale.assetPath, 'assets/languages/km.json');
      expect(kmLocale.fontFamily, LocalizationService.khmerFontFamily);
      expect(LocalizationService.khmerFontFamily, 'Hanuman');
    });

    test('en.json and km.json files exist and are valid JSON', () {
      final enFile = File('assets/languages/en.json');
      final kmFile = File('assets/languages/km.json');

      expect(enFile.existsSync(), isTrue);
      expect(kmFile.existsSync(), isTrue);

      final enMap = jsonDecode(enFile.readAsStringSync()) as Map<String, dynamic>;
      final kmMap = jsonDecode(kmFile.readAsStringSync()) as Map<String, dynamic>;

      expect(enMap.isNotEmpty, isTrue);
      expect(kmMap.isNotEmpty, isTrue);
    });

    test('all AppStrings keys are present in en.json and km.json', () {
      final enMap = jsonDecode(File('assets/languages/en.json').readAsStringSync())
          as Map<String, dynamic>;
      final kmMap = jsonDecode(File('assets/languages/km.json').readAsStringSync())
          as Map<String, dynamic>;

      final expectedKeys = [
        AppStrings.appName,
        AppStrings.appTagline,
        AppStrings.quantumEcosystem,
        AppStrings.welcomeBack,
        AppStrings.signInSubtitle,
        AppStrings.createAccountTitle,
        AppStrings.createAccountSubtitle,
        AppStrings.login,
        AppStrings.register,
        AppStrings.signIn,
        AppStrings.signUp,
        AppStrings.email,
        AppStrings.password,
        AppStrings.fullName,
        AppStrings.dontHaveAccount,
        AppStrings.alreadyHaveAccount,
        AppStrings.createAccount,
        AppStrings.logout,
        AppStrings.guest,
        AppStrings.search,
        AppStrings.all,
        AppStrings.featuredProducts,
        AppStrings.categories,
        AppStrings.viewDetails,
        AppStrings.addToCart,
        AppStrings.savedToWishlist,
        AppStrings.price,
        AppStrings.inStock,
        AppStrings.outOfStock,
        AppStrings.loading,
        AppStrings.error,
        AppStrings.retry,
        AppStrings.language,
        AppStrings.english,
        AppStrings.khmer,
      ];

      for (final key in expectedKeys) {
        expect(enMap.containsKey(key), isTrue, reason: 'en.json is missing key: $key');
        expect(kmMap.containsKey(key), isTrue, reason: 'km.json is missing key: $key');
        expect(enMap[key].toString().isNotEmpty, isTrue, reason: 'en.json has empty value for: $key');
        expect(kmMap[key].toString().isNotEmpty, isTrue, reason: 'km.json has empty value for: $key');
      }
    });
  });
}
