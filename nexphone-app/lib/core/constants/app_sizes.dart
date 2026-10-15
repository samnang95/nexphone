import 'package:flutter/material.dart';

/// Static constants for UI dimensions, spacing, margins, padding, radii, and element sizes.
class AppSizes {
  AppSizes._();

  // Spacing & Padding
  static const double p2 = 2.0;
  static const double p4 = 4.0;
  static const double p6 = 6.0;
  static const double p8 = 8.0;
  static const double p10 = 10.0;
  static const double p12 = 12.0;
  static const double p14 = 14.0;
  static const double p16 = 16.0;
  static const double p18 = 18.0;
  static const double p20 = 20.0;
  static const double p24 = 24.0;
  static const double p28 = 28.0;
  static const double p32 = 32.0;
  static const double p40 = 40.0;
  static const double p48 = 48.0;
  static const double p56 = 56.0;
  static const double p64 = 64.0;

  // Static Vertical Spacers (SizedBox height)
  static const SizedBox h2 = SizedBox(height: p2);
  static const SizedBox h4 = SizedBox(height: p4);
  static const SizedBox h6 = SizedBox(height: p6);
  static const SizedBox h8 = SizedBox(height: p8);
  static const SizedBox h10 = SizedBox(height: p10);
  static const SizedBox h12 = SizedBox(height: p12);
  static const SizedBox h14 = SizedBox(height: p14);
  static const SizedBox h16 = SizedBox(height: p16);
  static const SizedBox h18 = SizedBox(height: p18);
  static const SizedBox h20 = SizedBox(height: p20);
  static const SizedBox h24 = SizedBox(height: p24);
  static const SizedBox h28 = SizedBox(height: p28);
  static const SizedBox h32 = SizedBox(height: p32);
  static const SizedBox h40 = SizedBox(height: p40);
  static const SizedBox h48 = SizedBox(height: p48);
  static const SizedBox h56 = SizedBox(height: p56);
  static const SizedBox h64 = SizedBox(height: p64);

  // Static Horizontal Spacers (SizedBox width)
  static const SizedBox w2 = SizedBox(width: p2);
  static const SizedBox w4 = SizedBox(width: p4);
  static const SizedBox w6 = SizedBox(width: p6);
  static const SizedBox w8 = SizedBox(width: p8);
  static const SizedBox w10 = SizedBox(width: p10);
  static const SizedBox w12 = SizedBox(width: p12);
  static const SizedBox w14 = SizedBox(width: p14);
  static const SizedBox w16 = SizedBox(width: p16);
  static const SizedBox w18 = SizedBox(width: p18);
  static const SizedBox w20 = SizedBox(width: p20);
  static const SizedBox w24 = SizedBox(width: p24);
  static const SizedBox w28 = SizedBox(width: p28);
  static const SizedBox w32 = SizedBox(width: p32);
  static const SizedBox w40 = SizedBox(width: p40);
  static const SizedBox w48 = SizedBox(width: p48);

  // Gap Aliases
  static const SizedBox gapH4 = h4;
  static const SizedBox gapH8 = h8;
  static const SizedBox gapH10 = h10;
  static const SizedBox gapH12 = h12;
  static const SizedBox gapH16 = h16;
  static const SizedBox gapH20 = h20;
  static const SizedBox gapH24 = h24;
  static const SizedBox gapH32 = h32;

  static const SizedBox gapW4 = w4;
  static const SizedBox gapW8 = w8;
  static const SizedBox gapW10 = w10;
  static const SizedBox gapW12 = w12;
  static const SizedBox gapW16 = w16;
  static const SizedBox gapW20 = w20;
  static const SizedBox gapW24 = w24;
  static const SizedBox gapW32 = w32;

  // Border Radii
  static const double radiusXs = 4.0;
  static const double radiusSm = 6.0;
  static const double radiusMd = 8.0;
  static const double radiusLg = 12.0;
  static const double radiusXl = 16.0;
  static const double radius2Xl = 20.0;
  static const double radiusFull = 999.0;

  // Icon Sizes
  static const double iconXs = 14.0;
  static const double iconSm = 16.0;
  static const double iconMd = 20.0;
  static const double iconLg = 24.0;
  static const double iconXl = 32.0;
  static const double icon2Xl = 48.0;

  // Common UI Component Heights / Widths
  static const double buttonHeightSm = 36.0;
  static const double buttonHeightMd = 48.0;
  static const double buttonHeightLg = 56.0;
  static const double appBarHeight = 56.0;
  static const double bottomNavHeight = 64.0;
}

/// Static constants for font sizes across the application.
class AppFontSizes {
  AppFontSizes._();

  // Raw numeric size scales
  static const double s10 = 10.0;
  static const double s11 = 11.0;
  static const double s12 = 12.0;
  static const double s13 = 13.0;
  static const double s14 = 14.0;
  static const double s15 = 15.0;
  static const double s16 = 16.0;
  static const double s17 = 17.0;
  static const double s18 = 18.0;
  static const double s20 = 20.0;
  static const double s22 = 22.0;
  static const double s24 = 24.0;
  static const double s26 = 26.0;
  static const double s28 = 28.0;
  static const double s32 = 32.0;
  static const double s36 = 36.0;
  static const double s40 = 40.0;

  // Semantic typography aliases
  static const double caption = s11;
  static const double bodySm = s13;
  static const double body = s15;
  static const double subtitle = s17;
  static const double title = s18;
  static const double headline = s22;
  static const double display = s32;
}
