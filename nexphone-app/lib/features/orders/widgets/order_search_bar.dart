import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/theme/app_colors.dart';

class OrderSearchBar extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onChanged;
  final VoidCallback onClear;
  final FocusNode? focusNode;

  const OrderSearchBar({
    super.key,
    required this.controller,
    required this.onChanged,
    required this.onClear,
    this.focusNode,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark ? AppColors.darkSurfaceElevated : const Color(0xFFF1F3F9);
    final borderColor = isDark ? AppColors.darkBorder : const Color(0xFFE2E5F0);
    final hintColor = isDark ? AppColors.textMutedDark : const Color(0xFF8E94A8);
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSizes.p16),
      child: Container(
        height: 48,
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(AppSizes.radiusFull),
          border: Border.all(color: borderColor, width: 1),
        ),
        padding: const EdgeInsets.symmetric(horizontal: AppSizes.p14),
        child: Row(
          children: [
            Icon(
              Icons.search_rounded,
              color: hintColor,
              size: 20,
            ),
            AppSizes.w10,
            Expanded(
              child: TextField(
                controller: controller,
                focusNode: focusNode,
                onChanged: onChanged,
                style: TextStyle(
                  fontSize: AppFontSizes.s14,
                  fontWeight: FontWeight.w500,
                  color: textColor,
                ),
                decoration: InputDecoration(
                  hintText: 'Search by Order# or device name...',
                  hintStyle: TextStyle(
                    fontSize: AppFontSizes.s13,
                    fontWeight: FontWeight.w400,
                    color: hintColor,
                  ),
                  isDense: true,
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            ),
            ValueListenableBuilder<TextEditingValue>(
              valueListenable: controller,
              builder: (context, value, _) {
                if (value.text.isEmpty) return const SizedBox.shrink();
                return GestureDetector(
                  onTap: () {
                    controller.clear();
                    onClear();
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(AppSizes.p4),
                    child: Icon(
                      Icons.cancel_rounded,
                      size: 18,
                      color: hintColor,
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
