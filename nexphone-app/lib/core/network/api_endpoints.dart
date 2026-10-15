import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiEndpoints {
  ApiEndpoints._();

  static String get devBaseUrl {
    if (kIsWeb) return 'http://localhost:4000';
    if (Platform.isAndroid) return 'http://10.0.2.2:4000';
    return 'http://localhost:4000';
  }

  static const String prodBaseUrl = 'https://api.nexphone.com';

  // Auth
  static const String login = '/api/auth/login';
  static const String register = '/api/auth/register';
  static const String refresh = '/api/auth/refresh';
  static const String logout = '/api/auth/logout';
  static const String me = '/api/auth/me';

  // Content & Home
  static const String homeContent = '/api/content/homepage';
  static const String banners = '/api/content/banners';

  // Products & Catalog
  static const String products = '/api/products';
  static const String productDetail = '/api/products'; // + /:id
  static const String productBySlug = '/api/products/slug'; // + /:slug
  static const String brands = '/api/brands';

  // Cart & Wishlist
  static const String cart = '/api/cart';
  static const String cartItems = '/api/cart/items';
  static const String wishlist = '/api/wishlist';
  static const String wishlistToggle = '/api/wishlist/toggle';

  // Comparison
  static const String comparison = '/api/comparison';

  // Checkout & Orders
  static const String checkoutValidate = '/api/checkout/validate';
  static const String checkoutOrder = '/api/checkout/order';
  static const String orders = '/api/orders';

  // Reviews
  static const String reviews = '/api/reviews';

  // Notifications
  static const String notifications = '/api/notifications';

  // User Profile
  static const String userProfile = '/api/user/profile';
}
