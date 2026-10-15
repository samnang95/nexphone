import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:nexphone_app/core/utils/usecase.dart';
import 'package:nexphone_app/domain/products/entities/banner_entity.dart';
import 'package:nexphone_app/domain/products/entities/product_entity.dart';
import 'package:nexphone_app/domain/products/usecases/get_banners_usecase.dart';
import 'package:nexphone_app/domain/products/usecases/get_categories_usecase.dart';
import 'package:nexphone_app/domain/products/usecases/get_products_usecase.dart';
import 'package:nexphone_app/features/home/bloc/home_bloc.dart';
import 'package:nexphone_app/features/home/bloc/home_event.dart';
import 'package:nexphone_app/features/home/bloc/home_state.dart';

class MockGetProductsUseCase extends Mock implements GetProductsUseCase {}
class MockGetCategoriesUseCase extends Mock implements GetCategoriesUseCase {}
class MockGetBannersUseCase extends Mock implements GetBannersUseCase {}

void main() {
  late MockGetProductsUseCase mockGetProductsUseCase;
  late MockGetCategoriesUseCase mockGetCategoriesUseCase;
  late MockGetBannersUseCase mockGetBannersUseCase;
  late HomeBloc homeBloc;

  const testProducts = [
    ProductEntity(
      id: 'prod-001',
      name: 'NexPhone 16 Pro Max',
      subtitle: 'Titanium Flagship',
      price: 1199.0,
      rating: 4.9,
      imageUrl: '',
      series: 'Pro Series',
      badge: 'Flagship',
      inStock: true,
    ),
    ProductEntity(
      id: 'prod-002',
      name: 'NexPhone 16 Fold',
      subtitle: 'Folding Flagship',
      price: 1799.0,
      rating: 4.95,
      imageUrl: '',
      series: 'Fold Series',
      badge: 'Innovative',
      inStock: true,
    ),
  ];

  const testBanners = [
    BannerEntity(
      id: 'banner-001',
      title: 'NexPhone 16 Pro Max',
      subtitle: 'Titanium chassis',
      imageUrl: '',
    ),
  ];

  const testCategories = ['All', 'Pro Series', 'Fold Series'];

  setUp(() {
    mockGetProductsUseCase = MockGetProductsUseCase();
    mockGetCategoriesUseCase = MockGetCategoriesUseCase();
    mockGetBannersUseCase = MockGetBannersUseCase();

    homeBloc = HomeBloc(
      getProductsUseCase: mockGetProductsUseCase,
      getCategoriesUseCase: mockGetCategoriesUseCase,
      getBannersUseCase: mockGetBannersUseCase,
    );
  });

  tearDown(() {
    homeBloc.close();
  });

  test('initial state is HomeInitial', () {
    expect(homeBloc.state, const HomeInitial());
  });

  blocTest<HomeBloc, HomeState>(
    'emits [HomeLoading, HomeLoaded] when data fetch succeeds',
    build: () {
      when(() => mockGetProductsUseCase(const GetProductsParams()))
          .thenAnswer((_) async => testProducts);
      when(() => mockGetCategoriesUseCase(const NoParams()))
          .thenAnswer((_) async => testCategories);
      when(() => mockGetBannersUseCase(const NoParams()))
          .thenAnswer((_) async => testBanners);
      return homeBloc;
    },
    act: (bloc) => bloc.add(const HomeFetchRequested()),
    expect: () => [
      const HomeLoading(),
      const HomeLoaded(
        banners: testBanners,
        products: testProducts,
        filteredProducts: testProducts,
        categories: testCategories,
        selectedCategory: 'All',
        searchQuery: '',
      ),
    ],
  );
}
