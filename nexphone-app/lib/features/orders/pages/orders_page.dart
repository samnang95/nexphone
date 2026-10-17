import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../app/router/app_routes.dart';
import '../../../core/constants/app_sizes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_empty_state.dart';
import '../../../core/widgets/app_loading_indicator.dart';
import '../../../domain/orders/entities/order_filter_type.dart';
import '../actions/order_actions.dart';
import '../bloc/order_bloc.dart';
import '../bloc/order_state.dart';
import '../widgets/order_card.dart';
import '../widgets/order_filter_chips.dart';
import '../widgets/order_header.dart';
import '../widgets/order_search_bar.dart';

class OrdersPage extends StatefulWidget {
  const OrdersPage({super.key});

  @override
  State<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage> {
  late final TextEditingController _searchController;
  late final FocusNode _searchFocusNode;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    _searchFocusNode = FocusNode();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final scaffoldBg = isDark
        ? AppColors.darkBackground
        : const Color(0xFFF3F4F9);

    return Scaffold(
      backgroundColor: scaffoldBg,
      body: SafeArea(
        bottom: false,
        child: BlocConsumer<OrderBloc, OrderState>(
          listener: (context, state) {
            if (state is OrderLoaded) {
              if (!state.isSearchExpanded &&
                  _searchController.text.isNotEmpty) {
                _searchController.clear();
              }
              if (state.message != null) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(state.message!),
                    backgroundColor: AppColors.primary,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                );
              }
            }
          },
          builder: (context, state) {
            final isSearchExpanded = state is OrderLoaded
                ? state.isSearchExpanded
                : true;

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Header (Title "My Orders", Search toggle, Profile avatar)
                OrderHeader(
                  onSearchTap: () {
                    context.orderActions.toggleSearch();
                    if (!isSearchExpanded) {
                      _searchFocusNode.requestFocus();
                    } else {
                      _searchFocusNode.unfocus();
                    }
                  },
                  isSearchActive: isSearchExpanded,
                ),

                // Search Bar (driven by BLoC state)
                if (isSearchExpanded) ...[
                  OrderSearchBar(
                    controller: _searchController,
                    focusNode: _searchFocusNode,
                    onChanged: (val) => context.orderActions.search(val),
                    onClear: () {
                      _searchController.clear();
                      context.orderActions.clearSearch();
                    },
                  ),
                ],

                // Content based on state
                Expanded(
                  child: switch (state) {
                    OrderLoading() => const Center(
                      child: AppLoadingIndicator(message: 'Loading orders...'),
                    ),
                    OrderFailure(:final message) => Center(
                      child: AppEmptyState(
                        icon: Icons.error_outline_rounded,
                        title: 'Unable to Load Orders',
                        message: message,
                        buttonText: 'Retry',
                        onRetry: () => context.orderActions.requestOrders(),
                      ),
                    ),
                    OrderLoaded(
                      :final filteredOrders,
                      :final selectedFilter,
                      :final counts,
                    ) =>
                      RefreshIndicator(
                        color: AppColors.primary,
                        onRefresh: () async => context.orderActions.refresh(),
                        child: Column(
                          children: [
                            // Horizontal Filter Chips
                            OrderFilterChips(
                              selectedFilter: selectedFilter,
                              counts: counts,
                              onFilterSelected: (filter) =>
                                  context.orderActions.selectFilter(filter),
                            ),

                            // Orders List or Empty State
                            Expanded(
                              child: filteredOrders.isEmpty
                                  ? Center(
                                      child: SingleChildScrollView(
                                        physics:
                                            const AlwaysScrollableScrollPhysics(),
                                        child: Padding(
                                          padding: const EdgeInsets.all(
                                            AppSizes.p24,
                                          ),
                                          child: AppEmptyState(
                                            icon: Icons.receipt_long_outlined,
                                            title: 'No Orders Found',
                                            message:
                                                selectedFilter ==
                                                    OrderFilterType.all
                                                ? 'You have not placed any orders matching your search yet.'
                                                : 'No ${selectedFilter.label.toLowerCase()} orders found.',
                                            buttonText:
                                                selectedFilter ==
                                                    OrderFilterType.all
                                                ? 'Start Shopping'
                                                : 'View All Orders',
                                            onRetry: () {
                                              if (selectedFilter !=
                                                  OrderFilterType.all) {
                                                context.orderActions
                                                    .selectFilter(
                                                      OrderFilterType.all,
                                                    );
                                              } else {
                                                context.go(AppRoutes.home);
                                              }
                                            },
                                          ),
                                        ),
                                      ),
                                    )
                                  : ListView.builder(
                                      physics:
                                          const AlwaysScrollableScrollPhysics(
                                            parent: BouncingScrollPhysics(),
                                          ),
                                      padding: const EdgeInsets.only(
                                        bottom: AppSizes.p32,
                                      ),
                                      itemCount: filteredOrders.length,
                                      itemBuilder: (context, index) {
                                        final order = filteredOrders[index];
                                        return OrderCard(
                                          order: order,
                                          onCancelOrder: () => context
                                              .orderActions
                                              .cancelOrder(order.id),
                                          onRateOrder: (rating) =>
                                              context.orderActions.rateOrder(
                                                orderId: order.id,
                                                rating: rating,
                                              ),
                                          onBuyAgain: () => context.orderActions
                                              .buyAgain(order),
                                          onCompletePayment: () => context
                                              .orderActions
                                              .completePayment(order.id),
                                        );
                                      },
                                    ),
                            ),
                          ],
                        ),
                      ),
                    _ => const SizedBox.shrink(),
                  },
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
