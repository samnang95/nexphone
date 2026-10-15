class AppConstants {
  AppConstants._();

  static const String appName = 'NexPhone';
  static const String appTagline = 'Quantum-Safe Satellite Store';

  // Network Timeouts
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);
  static const Duration sendTimeout = Duration(seconds: 15);

  // Pagination Defaults
  static const int defaultPageSize = 20;

  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration standardAnimation = Duration(milliseconds: 300);
}
