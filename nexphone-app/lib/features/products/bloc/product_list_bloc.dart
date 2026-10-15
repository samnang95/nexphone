import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/error/failures.dart';
import '../../../domain/products/entities/product_entity.dart';
import '../../../domain/products/repositories/product_repository.dart';
import '../../../domain/products/usecases/get_products_usecase.dart';
import 'product_list_event.dart';
import 'product_list_state.dart';

class ProductListBloc extends Bloc<ProductListEvent, ProductListState> {
  final GetProductsUseCase getProductsUseCase;
  final ProductRepository productRepository;

  ProductListBloc({
    required this.getProductsUseCase,
    required this.productRepository,
  }) : super(const ProductListInitial()) {
    on<ProductListFetchRequested>(_onFetchRequested);
    on<ProductListCategorySelected>(_onCategorySelected);
    on<ProductListSearchChanged>(_onSearchChanged);
  }

  Future<void> _onFetchRequested(
    ProductListFetchRequested event,
    Emitter<ProductListState> emit,
  ) async {
    emit(const ProductListLoading());
    try {
      final results = await Future.wait([
        getProductsUseCase(GetProductsParams(category: event.category, search: event.search)),
        productRepository.getCategories(),
      ]);

      final products = results[0] as List<ProductEntity>;
      final categories = results[1] as List<String>;

      emit(ProductListLoaded(
        products: products,
        categories: categories.isNotEmpty ? categories : const ['All'],
        selectedCategory: event.category ?? 'All',
        searchQuery: event.search ?? '',
      ));
    } catch (e) {
      final msg = e is Failure ? e.message : 'Failed to load products';
      emit(ProductListError(msg));
    }
  }

  Future<void> _onCategorySelected(
    ProductListCategorySelected event,
    Emitter<ProductListState> emit,
  ) async {
    final current = state;
    if (current is ProductListLoaded) {
      emit(const ProductListLoading());
      try {
        final products = await getProductsUseCase(
          GetProductsParams(category: event.category, search: current.searchQuery),
        );
        emit(current.copyWith(
          products: products,
          selectedCategory: event.category,
        ));
      } catch (e) {
        emit(ProductListError(e is Failure ? e.message : 'Failed to filter products'));
      }
    }
  }

  Future<void> _onSearchChanged(
    ProductListSearchChanged event,
    Emitter<ProductListState> emit,
  ) async {
    final current = state;
    if (current is ProductListLoaded) {
      try {
        final products = await getProductsUseCase(
          GetProductsParams(category: current.selectedCategory, search: event.query),
        );
        emit(current.copyWith(
          products: products,
          searchQuery: event.query,
        ));
      } catch (e) {
        emit(ProductListError(e is Failure ? e.message : 'Search query failed'));
      }
    }
  }
}
