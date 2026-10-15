import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/error/failures.dart';
import '../../../core/utils/usecase.dart';
import '../../../domain/products/entities/banner_entity.dart';
import '../../../domain/products/entities/product_entity.dart';
import '../../../domain/products/usecases/get_banners_usecase.dart';
import '../../../domain/products/usecases/get_categories_usecase.dart';
import '../../../domain/products/usecases/get_products_usecase.dart';
import 'home_event.dart';
import 'home_state.dart';

class HomeBloc extends Bloc<HomeEvent, HomeState> {
  final GetProductsUseCase getProductsUseCase;
  final GetCategoriesUseCase getCategoriesUseCase;
  final GetBannersUseCase getBannersUseCase;

  HomeBloc({
    required this.getProductsUseCase,
    required this.getCategoriesUseCase,
    required this.getBannersUseCase,
  }) : super(const HomeInitial()) {
    on<HomeFetchRequested>(_onFetchRequested);
    on<HomeRefreshRequested>(_onRefreshRequested);
    on<HomeCategorySelected>(_onCategorySelected);
    on<HomeSearchChanged>(_onSearchChanged);
  }

  Future<void> _onFetchRequested(
    HomeFetchRequested event,
    Emitter<HomeState> emit,
  ) async {
    emit(const HomeLoading());
    await _loadData(emit);
  }

  Future<void> _onRefreshRequested(
    HomeRefreshRequested event,
    Emitter<HomeState> emit,
  ) async {
    await _loadData(emit);
  }

  Future<void> _loadData(Emitter<HomeState> emit) async {
    try {
      final results = await Future.wait([
        getProductsUseCase(const GetProductsParams()),
        getCategoriesUseCase(const NoParams()),
        getBannersUseCase(const NoParams()),
      ]);

      final products = results[0] as List<ProductEntity>;
      final categories = results[1] as List<String>;
      final banners = results[2] as List<BannerEntity>;

      final activeCategory = state is HomeLoaded ? (state as HomeLoaded).selectedCategory : 'All';
      final activeQuery = state is HomeLoaded ? (state as HomeLoaded).searchQuery : '';

      final filtered = _applyFilters(products, activeCategory, activeQuery);

      emit(HomeLoaded(
        banners: banners,
        products: products,
        filteredProducts: filtered,
        categories: categories.isNotEmpty ? categories : const ['All'],
        selectedCategory: activeCategory,
        searchQuery: activeQuery,
      ));
    } catch (e) {
      final msg = e is Failure ? e.message : 'Failed to load store content';
      emit(HomeError(msg));
    }
  }

  void _onCategorySelected(
    HomeCategorySelected event,
    Emitter<HomeState> emit,
  ) {
    final current = state;
    if (current is HomeLoaded) {
      final filtered = _applyFilters(current.products, event.category, current.searchQuery);
      emit(current.copyWith(
        selectedCategory: event.category,
        filteredProducts: filtered,
      ));
    }
  }

  void _onSearchChanged(
    HomeSearchChanged event,
    Emitter<HomeState> emit,
  ) {
    final current = state;
    if (current is HomeLoaded) {
      final filtered = _applyFilters(current.products, current.selectedCategory, event.query);
      emit(current.copyWith(
        searchQuery: event.query,
        filteredProducts: filtered,
      ));
    }
  }

  List<ProductEntity> _applyFilters(
    List<ProductEntity> items,
    String category,
    String query,
  ) {
    return items.where((item) {
      final matchesCategory = category == 'All' || item.series.toLowerCase() == category.toLowerCase();
      final matchesQuery = query.isEmpty ||
          item.name.toLowerCase().contains(query.toLowerCase()) ||
          item.subtitle.toLowerCase().contains(query.toLowerCase()) ||
          item.highlightSpecs.any((s) => s.toLowerCase().contains(query.toLowerCase()));
      return matchesCategory && matchesQuery;
    }).toList();
  }
}
