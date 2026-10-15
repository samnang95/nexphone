import 'core/app/app.dart';
import 'core/config/app_environment.dart';

Future<void> main() async {
  await runNexPhoneApp(
    envFile: '.env.dev',
    type: EnvironmentType.dev,
  );
}