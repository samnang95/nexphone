import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:wakelock_plus/wakelock_plus.dart';
import '../../app/di/injection.dart';
import '../../firebase_options.dart';
import '../config/app_environment.dart';
import '../localization/localization_service.dart';
import '../services/wakelock_service.dart';
import '../theme/theme_service.dart';
import 'app.dart';

Future<void> runNexPhoneApp({
  String? envFile,
  EnvironmentType type = EnvironmentType.dev,
  AppEnvironment? environment,
}) async {
  WidgetsFlutterBinding.ensureInitialized();

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
  ]);

  try {
    await WakelockPlus.enable();
  } catch (e) {
    debugPrint('WakelockPlus warning: $e');
  }

  try {
    await LocalizationService.init();
  } catch (e) {
    debugPrint('LocalizationService.init warning: $e');
  }

  try {
    await ThemeService.init();
  } catch (e) {
    debugPrint('ThemeService.init warning: $e');
  }

  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    debugPrint('Firebase.initializeApp warning: $e');
  }

  final env = environment ?? (envFile != null ? await AppEnvironment.fromDotEnv(envFile, type: type) : (type == EnvironmentType.dev ? AppEnvironment.dev : AppEnvironment.prod));

  AppEnvironment.setup(env);
  await initDependencies(baseUrl: env.baseUrl);

  try {
    sl<WakelockService>().initialize();
  } catch (e) {
    debugPrint('WakelockService.initialize warning: $e');
  }

  runApp(const NexPhoneApp());
}
