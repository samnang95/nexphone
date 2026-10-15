import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:go_router/go_router.dart';
import '../../../app/router/app_router.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/localization/app_strings.dart';
import '../../../core/localization/localization_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_empty_state.dart';
import '../../../core/widgets/app_loading_indicator.dart';
import '../../products/widgets/product_card.dart';
import '../bloc/home_bloc.dart';
import '../bloc/home_event.dart';
import '../bloc/home_state.dart';
import '../widgets/category_selector.dart';
import '../widgets/hero_banner.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    context.read<HomeBloc>().add(const HomeFetchRequested());
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.satellite_alt_rounded, color: AppColors.cyanAccent, size: 20),
            ),
            AppSizes.w10,
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  AppStrings.appName.getString(context),
                  style: const TextStyle(
                    fontSize: AppFontSizes.title,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
                  ),
                ),
                Text(
                  AppStrings.appTagline.getString(context),
                  style: const TextStyle(
                    fontSize: AppFontSizes.caption,
                    color: AppColors.textSecondaryDark,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: AppStrings.language.getString(context),
            icon: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSizes.p8,
                vertical: AppSizes.p4,
              ),
              decoration: BoxDecoration(
                color: AppColors.darkSurfaceElevated,
                borderRadius: BorderRadius.circular(AppSizes.radiusSm),
                border: Border.all(color: AppColors.darkBorder),
              ),
              child: Text(
                LocalizationService.currentLanguageCode.toUpperCase(),
                style: const TextStyle(
                  fontSize: AppFontSizes.caption,
                  fontWeight: FontWeight.w700,
                  color: AppColors.cyanAccent,
                ),
              ),
            ),
            onPressed: () {
              LocalizationService.toggleLanguage();
            },
          ),
          IconButton(
            icon: const Icon(Icons.shopping_bag_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Cart feature ready for checkout.')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.person_outline_rounded),
            onPressed: () {
              context.push(AppRoutes.login);
            },
          ),
          AppSizes.w8,
        ],
      ),
      body: BlocConsumer<HomeBloc, HomeState>(
        listener: (context, state) {
          if (state is HomeError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColors.roseError,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is HomeLoading || state is HomeInitial) {
            return const AppLoadingIndicator(message: 'Connecting to NexPhone fleet...');
          }

          if (state is HomeError) {
            return AppEmptyState(
              icon: Icons.cloud_off_rounded,
              title: 'Unable to reach servers',
              message: state.message,
              buttonText: 'Retry Connection',
              onRetry: () => context.read<HomeBloc>().add(const HomeFetchRequested()),
            );
          }

          if (state is HomeLoaded) {
            return RefreshIndicator(
              onRefresh: () async {
                context.read<HomeBloc>().add(const HomeRefreshRequested());
              },
              color: AppColors.primary,
              backgroundColor: AppColors.darkSurface,
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                children: [
                  // Search Bar
                  TextField(
                    controller: _searchController,
                    onChanged: (val) => context.read<HomeBloc>().add(HomeSearchChanged(val)),
                    decoration: InputDecoration(
                      hintText: AppStrings.search.getString(context),
                      prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMutedDark),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear_rounded, size: 18),
                              onPressed: () {
                                _searchController.clear();
                                context.read<HomeBloc>().add(const HomeSearchChanged(''));
                              },
                            )
                          : null,
                    ),
                  ),
                  AppSizes.h16,

                  // Hero Promotional Banner
                  HeroBanner(
                    banner: state.banners.isNotEmpty ? state.banners.first : null,
                    onCtaPressed: () {
                      if (state.products.isNotEmpty) {
                        context.push(
                          AppRoutes.productDetail,
                          extra: state.products.first,
                        );
                      }
                    },
                  ),
                  AppSizes.h20,

                  // Category Selector
                  Text(
                    AppStrings.categories.getString(context),
                    style: const TextStyle(
                      fontSize: AppFontSizes.subtitle,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimaryDark,
                    ),
                  ),
                  AppSizes.h12,
                  CategorySelector(
                    categories: state.categories,
                    selectedCategory: state.selectedCategory,
                    onSelected: (cat) => context.read<HomeBloc>().add(HomeCategorySelected(cat)),
                  ),
                  AppSizes.h20,

                  // Products Count & Reset
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${AppStrings.featuredProducts.getString(context)} (${state.filteredProducts.length})',
                        style: const TextStyle(
                          fontSize: AppFontSizes.subtitle,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimaryDark,
                        ),
                      ),
                      if (state.selectedCategory != 'All' || state.searchQuery.isNotEmpty)
                        TextButton(
                          onPressed: () {
                            _searchController.clear();
                            context.read<HomeBloc>().add(const HomeCategorySelected('All'));
                            context.read<HomeBloc>().add(const HomeSearchChanged(''));
                          },
                          child: const Text('Reset filters', style: TextStyle(color: AppColors.cyanAccent)),
                        ),
                    ],
                  ),
                  AppSizes.h12,

                  // Product Grid
                  if (state.filteredProducts.isEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 40),
                      alignment: Alignment.center,
                      child: const Text(
                        'No devices matched your query.',
                        style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 14),
                      ),
                    )
                  else
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: state.filteredProducts.length,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        mainAxisSpacing: 14,
                        crossAxisSpacing: 14,
                        childAspectRatio: 0.62,
                      ),
                      itemBuilder: (context, index) {
                        final product = state.filteredProducts[index];
                        return ProductCard(
                          product: product,
                          onTap: () {
                            context.push(
                              AppRoutes.productDetail,
                              extra: product,
                            );
                          },
                          onAddToCart: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Added ${product.name} to cart!'),
                                backgroundColor: AppColors.primary,
                                duration: const Duration(seconds: 1),
                              ),
                            );
                          },
                        );
                      },
                    ),
                ],
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }
}
