import 'package:equatable/equatable.dart';
import '../../../domain/products/entities/banner_entity.dart';
import '../../../domain/products/entities/product_entity.dart';

abstract class HomeState extends Equatable {
  const HomeState();

  @override
  List<Object?> get props => [];
}

class HomeInitial extends HomeState {
  const HomeInitial();
}

class HomeLoading extends HomeState {
  const HomeLoading();
}

class HomeLoaded extends HomeState {
  final List<BannerEntity> banners;
  final List<ProductEntity> products;
  final List<ProductEntity> filteredProducts;
  final List<String> categories;
  final String selectedCategory;
  final String searchQuery;
  final int cartCount;

  const HomeLoaded({
    required this.banners,
    required this.products,
    required this.filteredProducts,
    required this.categories,
    this.selectedCategory = 'All',
    this.searchQuery = '',
    this.cartCount = 0,
  });

  HomeLoaded copyWith({
    List<BannerEntity>? banners,
    List<ProductEntity>? products,
    List<ProductEntity>? filteredProducts,
    List<String>? categories,
    String? selectedCategory,
    String? searchQuery,
    int? cartCount,
  }) {
    return HomeLoaded(
      banners: banners ?? this.banners,
      products: products ?? this.products,
      filteredProducts: filteredProducts ?? this.filteredProducts,
      categories: categories ?? this.categories,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      searchQuery: searchQuery ?? this.searchQuery,
      cartCount: cartCount ?? this.cartCount,
    );
  }

  @override
  List<Object?> get props => [
        banners,
        products,
        filteredProducts,
        categories,
        selectedCategory,
        searchQuery,
        cartCount,
      ];
}

class HomeError extends HomeState {
  final String message;

  const HomeError(this.message);

  @override
  List<Object?> get props => [message];
}
