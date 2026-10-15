import 'package:equatable/equatable.dart';
import '../../../domain/products/entities/product_entity.dart';

abstract class ProductListState extends Equatable {
  const ProductListState();

  @override
  List<Object?> get props => [];
}

class ProductListInitial extends ProductListState {
  const ProductListInitial();
}

class ProductListLoading extends ProductListState {
  const ProductListLoading();
}

class ProductListLoaded extends ProductListState {
  final List<ProductEntity> products;
  final List<String> categories;
  final String selectedCategory;
  final String searchQuery;

  const ProductListLoaded({
    required this.products,
    required this.categories,
    this.selectedCategory = 'All',
    this.searchQuery = '',
  });

  ProductListLoaded copyWith({
    List<ProductEntity>? products,
    List<String>? categories,
    String? selectedCategory,
    String? searchQuery,
  }) {
    return ProductListLoaded(
      products: products ?? this.products,
      categories: categories ?? this.categories,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }

  @override
  List<Object?> get props => [products, categories, selectedCategory, searchQuery];
}

class ProductListError extends ProductListState {
  final String message;

  const ProductListError(this.message);

  @override
  List<Object?> get props => [message];
}
