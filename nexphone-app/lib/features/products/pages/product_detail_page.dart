import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../domain/products/entities/product_entity.dart';

class ProductDetailPage extends StatelessWidget {
  final ProductEntity product;

  const ProductDetailPage({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: Icon(
              product.isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
              color: product.isFavorite ? AppColors.roseError : AppColors.textSecondaryDark,
            ),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('${product.name} saved to wishlist'),
                  duration: const Duration(seconds: 1),
                ),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Hero(
                tag: 'product_img_${product.id}',
                child: Container(
                  height: 300,
                  margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.25),
                        blurRadius: 40,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: Image.network(
                      product.imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => Container(
                        color: AppColors.darkSurfaceElevated,
                        alignment: Alignment.center,
                        child: const Icon(Icons.smartphone_rounded, size: 80, color: AppColors.cyanAccent),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.cyanAccent.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.cyanAccent.withValues(alpha: 0.4)),
                        ),
                        child: Text(
                          product.badge.toUpperCase(),
                          style: const TextStyle(
                            color: AppColors.cyanAccent,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        product.series,
                        style: const TextStyle(
                          color: AppColors.textSecondaryDark,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const Spacer(),
                      const Icon(Icons.star_rounded, color: AppColors.amberWarning, size: 18),
                      const SizedBox(width: 4),
                      Text(
                        product.rating.toStringAsFixed(1),
                        style: const TextStyle(
                          color: AppColors.textPrimaryDark,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    product.name,
                    style: const TextStyle(
                      color: AppColors.textPrimaryDark,
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    product.subtitle,
                    style: const TextStyle(
                      color: AppColors.textSecondaryDark,
                      fontSize: 15,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Key Innovations & Specifications',
                    style: TextStyle(
                      color: AppColors.textPrimaryDark,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: product.highlightSpecs.map((spec) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.darkSurfaceElevated,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.darkBorder),
                        ),
                        child: Text(
                          spec,
                          style: const TextStyle(
                            color: AppColors.textPrimaryDark,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: AppColors.darkSurface,
          border: Border(top: BorderSide(color: AppColors.darkBorder)),
        ),
        child: SafeArea(
          child: Row(
            children: [
              Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Fleet Price',
                    style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 12),
                  ),
                  Text(
                    CurrencyFormatter.format(product.price),
                    style: const TextStyle(
                      color: AppColors.textPrimaryDark,
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 24),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Added ${product.name} to cart!'),
                        backgroundColor: AppColors.primary,
                      ),
                    );
                  },
                  icon: const Icon(Icons.shopping_bag_outlined, color: Colors.white),
                  label: const Text(
                    'Add to Bag',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
