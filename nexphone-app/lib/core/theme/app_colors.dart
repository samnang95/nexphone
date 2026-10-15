import 'package:flutter/material.dart';

/// Design tokens and curated color palette for NexPhone.
class AppColors {
  AppColors._();

  // Primary / Brand Accents
  static const Color primary = Color(0xFF6366F1); // Indigo 500
  static const Color primaryLight = Color(0xFF818CF8); // Indigo 400
  static const Color primaryDark = Color(0xFF4F46E5); // Indigo 600

  // Secondary Accents
  static const Color cyanAccent = Color(0xFF06B6D4); // Cyan 500
  static const Color emeraldSuccess = Color(0xFF10B981); // Emerald 500
  static const Color amberWarning = Color(0xFFF59E0B); // Amber 500
  static const Color roseError = Color(0xFFF43F5E); // Rose 500

  // Dark Theme Backgrounds & Surfaces (Titanium / Obsidian)
  static const Color darkBackground = Color(0xFF090D16);
  static const Color darkSurface = Color(0xFF111827);
  static const Color darkSurfaceElevated = Color(0xFF1E293B);
  static const Color darkBorder = Color(0xFF334155);

  // Text Colors
  static const Color textPrimaryDark = Color(0xFFF8FAFC);
  static const Color textSecondaryDark = Color(0xFF94A3B8);
  static const Color textMutedDark = Color(0xFF64748B);

  // Light Theme Surfaces
  static const Color lightBackground = Color(0xFFF8FAFC);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightBorder = Color(0xFFE2E8F0);
  static const Color textPrimaryLight = Color(0xFF0F172A);
  static const Color textSecondaryLight = Color(0xFF475569);
}
