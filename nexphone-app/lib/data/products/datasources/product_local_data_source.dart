import '../models/banner_model.dart';
import '../models/product_model.dart';

abstract class ProductLocalDataSource {
  Future<List<ProductModel>> getCachedProducts();
  Future<List<String>> getCachedCategories();
  Future<ProductModel?> getProductById(String id);
  Future<List<BannerModel>> getCachedBanners();
}

class ProductLocalDataSourceImpl implements ProductLocalDataSource {
  static const List<ProductModel> _seedProducts = [
    ProductModel(
      id: 'prod-001',
      name: 'NexPhone 16 Pro Max',
      subtitle: 'Aerospace Grade Titanium. Neural Chip 6.',
      price: 1199.00,
      rating: 4.95,
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      series: 'Pro Series',
      badge: 'Flagship',
      inStock: true,
      highlightSpecs: ['6.9" Super Retina XDR', '48MP Quad Prism', 'Titanium Finish'],
    ),
    ProductModel(
      id: 'prod-002',
      name: 'NexPhone 16 Pro',
      subtitle: 'Compact Titan. Pro Performance Unleashed.',
      price: 999.00,
      rating: 4.88,
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      series: 'Pro Series',
      badge: 'Best Seller',
      inStock: true,
      highlightSpecs: ['6.3" ProMotion 120Hz', 'A18 Neural Bionic', 'All-Day Battery'],
    ),
    ProductModel(
      id: 'prod-003',
      name: 'NexPhone 16 Ultra Fold',
      subtitle: 'Dual Folding Display. Infinite Canvas.',
      price: 1799.00,
      rating: 4.92,
      imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80',
      series: 'Fold Series',
      badge: 'Innovative',
      inStock: true,
      highlightSpecs: ['8.0" Foldable OLED', 'Zero Gap Hinge', 'Stylus Support'],
    ),
    ProductModel(
      id: 'prod-004',
      name: 'NexPhone 16 Core',
      subtitle: 'Vibrant Dynamic Island. Premium Essentials.',
      price: 799.00,
      rating: 4.75,
      imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
      series: 'Standard',
      badge: 'Popular',
      inStock: true,
      highlightSpecs: ['6.1" OLED Display', '48MP Dual Fusion', '5 Pastel Colors'],
    ),
    ProductModel(
      id: 'prod-005',
      name: 'NexPhone Watch Ultra',
      subtitle: 'Titanium Case with Sapphire Crystal Face.',
      price: 399.00,
      rating: 4.85,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      series: 'Accessories',
      badge: 'Ecosystem',
      inStock: true,
      highlightSpecs: ['ECG & Oxygen Monitor', 'Dual GPS Tracking', '100m Water Depth'],
    ),
  ];

  static const List<String> _seedCategories = [
    'All',
    'Pro Series',
    'Fold Series',
    'Standard',
    'Accessories',
  ];

  static const List<BannerModel> _seedBanners = [
    BannerModel(
      id: 'banner-001',
      title: 'NexPhone 16 Pro Max',
      subtitle: 'Aerospace titanium chassis with uninterrupted global satellite VoIP everywhere on Earth.',
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      badge: 'FLAGSHIP PREMIERE',
      ctaText: 'Explore Flagship',
    ),
  ];

  @override
  Future<List<ProductModel>> getCachedProducts() async => _seedProducts;

  @override
  Future<List<String>> getCachedCategories() async => _seedCategories;

  @override
  Future<ProductModel?> getProductById(String id) async {
    try {
      return _seedProducts.firstWhere((p) => p.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<List<BannerModel>> getCachedBanners() async => _seedBanners;
}
