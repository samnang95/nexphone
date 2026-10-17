import 'package:flutter/material.dart';
import '../../app/router/app_router.dart';
import '../config/app_environment.dart';
import '../localization/localization_service.dart';
import '../theme/app_theme.dart';
import '../theme/theme_service.dart';

class NexPhoneAppView extends StatelessWidget {
  const NexPhoneAppView({super.key});

  @override
  Widget build(BuildContext context) {
    final localization = LocalizationService.localization;
    final env = AppEnvironment.isInitialized ? AppEnvironment.instance : AppEnvironment.dev;

    return ListenableBuilder(
      listenable: Listenable.merge([
        LocalizationService.languageNotifier,
        ThemeService.themeModeNotifier,
      ]),
      builder: (context, _) {
        final fontFamily = LocalizationService.currentFontFamily;
        return MaterialApp.router(
          title: env.appName,
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme(fontFamily: fontFamily),
          darkTheme: AppTheme.darkTheme(fontFamily: fontFamily),
          themeMode: ThemeService.currentMode,
          themeAnimationDuration: Duration.zero,
          routerConfig: AppRouter.router,
          supportedLocales: localization.supportedLocales.isNotEmpty ? localization.supportedLocales : const [Locale('en')],
          localizationsDelegates: localization.localizationsDelegates,
        );
      },
    );
  }
}
