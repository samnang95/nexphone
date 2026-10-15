import 'package:flutter/widgets.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

abstract class WakelockService {
  void initialize();
  Future<void> enable();
  Future<void> disable();
  Future<void> toggle({required bool enable});
  Future<bool> isEnabled();
}

class WakelockServiceImpl implements WakelockService {
  static AppLifecycleListener? _lifecycleListener;

  const WakelockServiceImpl();

  @override
  void initialize() {
    enable();
    _lifecycleListener?.dispose();
    _lifecycleListener = AppLifecycleListener(
      onResume: () => enable(),
      onShow: () => enable(),
    );
  }

  @override
  Future<void> enable() async {
    try {
      await WakelockPlus.enable();
    } catch (e) {
      debugPrint('WakelockService.enable warning: $e');
    }
  }

  @override
  Future<void> disable() async {
    try {
      await WakelockPlus.disable();
    } catch (e) {
      debugPrint('WakelockService.disable warning: $e');
    }
  }

  @override
  Future<void> toggle({required bool enable}) async {
    try {
      await WakelockPlus.toggle(enable: enable);
    } catch (e) {
      debugPrint('WakelockService.toggle warning: $e');
    }
  }

  @override
  Future<bool> isEnabled() async {
    try {
      return await WakelockPlus.enabled;
    } catch (e) {
      debugPrint('WakelockService.isEnabled warning: $e');
      return false;
    }
  }
}
