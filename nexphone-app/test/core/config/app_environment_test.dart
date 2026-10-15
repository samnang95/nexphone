import 'package:flutter_test/flutter_test.dart';
import 'package:nexphone_app/core/config/app_environment.dart';

void main() {
  group('AppEnvironment', () {
    test('dev environment has correct defaults', () {
      final dev = AppEnvironment.dev;
      expect(dev.isDev, isTrue);
      expect(dev.isProd, isFalse);
      expect(dev.appName, 'NexPhone Dev');
      expect(dev.showDebugBanner, isFalse);
    });

    test('prod environment has correct defaults', () {
      const prod = AppEnvironment.prod;
      expect(prod.isDev, isFalse);
      expect(prod.isProd, isTrue);
      expect(prod.appName, 'NexPhone');
      expect(prod.showDebugBanner, isFalse);
    });

    test('setup updates instance singleton', () {
      AppEnvironment.setup(AppEnvironment.dev);
      expect(AppEnvironment.isInitialized, isTrue);
      expect(AppEnvironment.instance.appName, 'NexPhone Dev');

      AppEnvironment.setup(AppEnvironment.prod);
      expect(AppEnvironment.instance.appName, 'NexPhone');
    });

    test('fromDotEnv falls back cleanly when file absent', () async {
      final env = await AppEnvironment.fromDotEnv(
        'non_existent.env',
        type: EnvironmentType.dev,
      );
      expect(env.isDev, isTrue);
      expect(env.appName, 'NexPhone Dev');
    });
  });
}
