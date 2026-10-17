import 'package:flutter/material.dart';
import '../../../core/constants/app_sizes.dart';

class AccountAvatar extends StatelessWidget {
  final String initials;
  final String? imageUrl;

  const AccountAvatar({super.key, required this.initials, this.imageUrl});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final hasImage = imageUrl != null && imageUrl!.startsWith('http');
    return SizedBox(
      width: 68,
      height: 68,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            padding: const EdgeInsets.all(2.5),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(colors: [cs.primary, cs.tertiary]),
            ),
            child: CircleAvatar(
              radius: 32,
              backgroundColor: cs.surface,
              foregroundImage: hasImage ? NetworkImage(imageUrl!) : null,
              child: Text(
                initials,
                style: TextStyle(
                  fontSize: AppFontSizes.s22,
                  fontWeight: FontWeight.w800,
                  color: cs.primary,
                ),
              ),
            ),
          ),
          Positioned(
            right: -2,
            bottom: -2,
            child: Container(
              padding: const EdgeInsets.all(5),
              decoration: BoxDecoration(
                color: cs.primary,
                shape: BoxShape.circle,
                border: Border.all(color: cs.surfaceContainerHighest, width: 2),
              ),
              child: Icon(
                Icons.photo_camera_rounded,
                size: 12,
                color: cs.onPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
