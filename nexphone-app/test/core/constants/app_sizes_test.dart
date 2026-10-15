import 'package:flutter_test/flutter_test.dart';
import 'package:nexphone_app/core/constants/app_sizes.dart';
import 'package:nexphone_app/core/theme/app_typography.dart';

void main() {
  group('AppSizes and AppFontSizes Tests', () {
    test('AppSizes constants have positive, ascending values', () {
      expect(AppSizes.p2, 2.0);
      expect(AppSizes.p4, 4.0);
      expect(AppSizes.p8, 8.0);
      expect(AppSizes.p16, 16.0);
      expect(AppSizes.p24, 24.0);
      expect(AppSizes.p32, 32.0);
      expect(AppSizes.p48, 48.0);
      expect(AppSizes.p64, 64.0);

      expect(AppSizes.radiusSm, lessThan(AppSizes.radiusMd));
      expect(AppSizes.radiusMd, lessThan(AppSizes.radiusLg));
      expect(AppSizes.radiusLg, lessThan(AppSizes.radiusXl));

      expect(AppSizes.iconSm, lessThan(AppSizes.iconMd));
      expect(AppSizes.iconMd, lessThan(AppSizes.iconLg));
    });

    test('AppSizes static SizedBox spacers have matching dimensions', () {
      expect(AppSizes.h12.height, 12.0);
      expect(AppSizes.h16.height, 16.0);
      expect(AppSizes.h20.height, 20.0);
      expect(AppSizes.gapH12.height, 12.0);

      expect(AppSizes.w8.width, 8.0);
      expect(AppSizes.w10.width, 10.0);
      expect(AppSizes.w12.width, 12.0);
      expect(AppSizes.gapW12.width, 12.0);
    });

    test('AppFontSizes constants match expected scales', () {
      expect(AppFontSizes.s10, 10.0);
      expect(AppFontSizes.caption, 11.0);
      expect(AppFontSizes.bodySm, 13.0);
      expect(AppFontSizes.body, 15.0);
      expect(AppFontSizes.subtitle, 17.0);
      expect(AppFontSizes.title, 18.0);
      expect(AppFontSizes.headline, 22.0);
      expect(AppFontSizes.display, 32.0);
    });

    test('AppTypography uses AppFontSizes', () {
      expect(AppTypography.displayLarge.fontSize, AppFontSizes.display);
      expect(AppTypography.headlineMedium.fontSize, AppFontSizes.headline);
      expect(AppTypography.titleLarge.fontSize, AppFontSizes.title);
      expect(AppTypography.bodyMedium.fontSize, AppFontSizes.bodySm);
      expect(AppTypography.labelSmall.fontSize, AppFontSizes.caption);
    });
  });
}
