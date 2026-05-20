import 'package:flutter/material.dart';

class AppColors {
  static const Color blueDark = Color(0xFF0B2A4A);
  static const Color blueMid = Color(0xFF164A7A);
  static const Color silver = Color(0xFFBFC9D1);
  static const Color white = Colors.white;
  static const Color accent = Color(0xFF2E86AB);
}

class AppTheme {
  static final ThemeData theme = ThemeData(
    scaffoldBackgroundColor: AppColors.blueDark,
    primaryColor: AppColors.blueMid,
    colorScheme: ColorScheme.fromSwatch().copyWith(secondary: AppColors.accent),
    textTheme: const TextTheme(
      headline6: TextStyle(color: AppColors.white, fontSize: 20, fontWeight: FontWeight.w600),
      bodyText1: TextStyle(color: AppColors.white70),
      bodyText2: TextStyle(color: AppColors.white70),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white12,
      hintStyle: const TextStyle(color: Colors.white70),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.silver.withOpacity(0.2)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.silver.withOpacity(0.12)),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.accent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
      ),
    ),
  );
}
