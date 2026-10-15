import 'dart:io' show Platform;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../network/api_endpoints.dart';

enum EnvironmentType { dev, prod }

class AppEnvironment {
  final String appName;
  final String baseUrl;
  final EnvironmentType type;
  final bool showDebugBanner;
  final int connectTimeoutSeconds;
  final int receiveTimeoutSeconds;

  const AppEnvironment({
    required this.appName,
    required this.baseUrl,
    required this.type,
    required this.showDebugBanner,
    this.connectTimeoutSeconds = 15,
    this.receiveTimeoutSeconds = 15,
  });

  bool get isDev => type == EnvironmentType.dev;
  bool get isProd => type == EnvironmentType.prod;

  static AppEnvironment get dev => AppEnvironment(
        appName: 'NexPhone Dev',
        baseUrl: ApiEndpoints.devBaseUrl,
        type: EnvironmentType.dev,
        showDebugBanner: false,
      );

  static const AppEnvironment prod = AppEnvironment(
    appName: 'NexPhone',
    baseUrl: ApiEndpoints.prodBaseUrl,
    type: EnvironmentType.prod,
    showDebugBanner: false,
  );

  static AppEnvironment? _instance;

  static bool get isInitialized => _instance != null;

  static AppEnvironment get instance {
    if (_instance == null) {
      throw StateError(
        'AppEnvironment has not been initialized. Call AppEnvironment.setup() first.',
      );
    }
    return _instance!;
  }

  static void setup(AppEnvironment environment) {
    _instance = environment;
  }

  static Future<AppEnvironment> fromDotEnv(
    String envFile, {
    required EnvironmentType type,
  }) async {
    try {
      await dotenv.load(fileName: envFile);
    } catch (_) {
    }

    final bool hasDotEnv = dotenv.isInitialized;
    final isDev = type == EnvironmentType.dev;
    final defaultBase = isDev ? ApiEndpoints.devBaseUrl : ApiEndpoints.prodBaseUrl;

    String rawBase;
    if (hasDotEnv && Platform.isAndroid && dotenv.isEveryDefined(['API_BASE_URL_ANDROID'])) {
      rawBase = dotenv.get('API_BASE_URL_ANDROID');
    } else if (hasDotEnv && dotenv.isEveryDefined(['API_BASE_URL'])) {
      rawBase = dotenv.get('API_BASE_URL');
    } else {
      rawBase = defaultBase;
    }

    final env = AppEnvironment(
      appName: hasDotEnv ? dotenv.get('APP_NAME', fallback: isDev ? 'NexPhone Dev' : 'NexPhone') : (isDev ? 'NexPhone Dev' : 'NexPhone'),
      baseUrl: rawBase,
      type: type,
      showDebugBanner: hasDotEnv ? (dotenv.get('SHOW_DEBUG_BANNER', fallback: 'false') == 'true') : false,
      connectTimeoutSeconds: hasDotEnv ? (int.tryParse(dotenv.get('CONNECT_TIMEOUT_SECONDS', fallback: '15')) ?? 15) : 15,
      receiveTimeoutSeconds: hasDotEnv ? (int.tryParse(dotenv.get('RECEIVE_TIMEOUT_SECONDS', fallback: '15')) ?? 15) : 15,
    );

    setup(env);
    return env;
  }
}
