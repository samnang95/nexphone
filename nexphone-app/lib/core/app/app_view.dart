import 'package:flutter/material.dart';
import '../../app/router/app_router.dart';
import '../config/app_environment.dart';
import '../localization/localization_service.dart';
import '../theme/app_theme.dart';

class NexPhoneAppView extends StatelessWidget {
  const NexPhoneAppView({super.key});

  @override
  Widget build(BuildContext context) {
    final localization = LocalizationService.localization;
    final env = AppEnvironment.isInitialized ? AppEnvironment.instance : AppEnvironment.dev;

    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.languageNotifier,
      builder: (context, currentLanguage, _) {
        return MaterialApp.router(
          title: env.appName,
          debugShowCheckedModeBanner: false,
          theme: AppTheme.darkTheme(fontFamily: LocalizationService.currentFontFamily),
          routerConfig: AppRouter.router,
          supportedLocales: localization.supportedLocales.isNotEmpty ? localization.supportedLocales : const [Locale('en')],
          localizationsDelegates: localization.localizationsDelegates,
        );
      },
    );
  }
}
