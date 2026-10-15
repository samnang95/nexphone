import 'package:flutter_test/flutter_test.dart';
import 'package:nexphone_app/core/services/wakelock_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('WakelockService Tests', () {
    test('WakelockServiceImpl instantiation and safe fallback execution', () async {
      const service = WakelockServiceImpl();

      // Ensure calling initialize, enable, disable, and toggle execute without uncaught exceptions
      service.initialize();
      await service.enable();
      await service.disable();
      await service.toggle(enable: true);
      await service.toggle(enable: false);

      final isEnabled = await service.isEnabled();
      expect(isEnabled, isA<bool>());
    });
  });
}
