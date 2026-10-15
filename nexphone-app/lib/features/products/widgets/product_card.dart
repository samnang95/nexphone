import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../domain/products/entities/product_entity.dart';

class ProductCard extends StatelessWidget {
  final ProductEntity product;
  final VoidCallback? onTap;
  final VoidCallback? onAddToCart;
  final VoidCallback? onToggleFavorite;

  const ProductCard({
    super.key,
    required this.product,
    this.onTap,
    this.onAddToCart,
    this.onToggleFavorite,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.darkSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.darkBorder, width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image and badges row
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                  child: Container(
                    height: 140,
                    width: double.infinity,
                    color: AppColors.darkSurfaceElevated,
                    child: Image.network(
                      product.imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => const Center(
                        child: Icon(Icons.phone_iphone_rounded, size: 54, color: AppColors.textMutedDark),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.7),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.cyanAccent.withValues(alpha: 0.5)),
                    ),
                    child: Text(
                      product.badge,
                      style: const TextStyle(
                        color: AppColors.cyanAccent,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                if (onToggleFavorite != null)
                  Positioned(
                    top: 6,
                    right: 6,
                    child: IconButton(
                      icon: Icon(
                        product.isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                        color: product.isFavorite ? AppColors.roseError : Colors.white70,
                        size: 20,
                      ),
                      onPressed: onToggleFavorite,
                    ),
                  ),
              ],
            ),

            // Content body
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          product.name,
                          style: const TextStyle(
                            color: AppColors.textPrimaryDark,
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const Icon(Icons.star_rounded, color: AppColors.amberWarning, size: 16),
                      const SizedBox(width: 2),
                      Text(
                        product.rating.toStringAsFixed(1),
                        style: const TextStyle(
                          color: AppColors.textPrimaryDark,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product.subtitle,
                    style: const TextStyle(
                      color: AppColors.textSecondaryDark,
                      fontSize: 11,
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),

                  // Specs chips
                  if (product.highlightSpecs.isNotEmpty)
                    Wrap(
                      spacing: 4,
                      runSpacing: 4,
                      children: product.highlightSpecs.take(2).map((spec) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.darkSurfaceElevated,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            spec,
                            style: const TextStyle(
                              color: AppColors.textSecondaryDark,
                              fontSize: 10,
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  const SizedBox(height: 12),

                  // Price and Add to Cart action
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        CurrencyFormatter.format(product.price),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      if (onAddToCart != null)
                        InkWell(
                          onTap: onAddToCart,
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.shopping_bag_outlined, color: Colors.white, size: 14),
                                SizedBox(width: 4),
                                Text(
                                  'Add',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
