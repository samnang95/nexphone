import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../domain/products/entities/product_entity.dart';
import '../../features/account/bloc/account_bloc.dart';
import '../../features/account/bloc/account_event.dart';
import '../../features/account/pages/account_page.dart';
import '../../features/auth/pages/login_page.dart';
import '../../features/auth/pages/register_page.dart';
import '../../features/home/pages/home_page.dart';
import '../../features/products/pages/product_detail_page.dart';
import '../di/injection.dart';
import 'app_routes.dart';

class AppRouter {
  AppRouter._();

  static final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');
  static GoRouter? _router;
  static GoRouter get router => _router ??= createRouter();

  @visibleForTesting
  static void reset() {
    _router = null;
  }

  static GoRouter createRouter({String initialLocation = AppRoutes.home}) {
    return GoRouter(
      navigatorKey: rootNavigatorKey,
      initialLocation: initialLocation,
      routes: [
        GoRoute(
          path: AppRoutes.home,
          name: 'home',
          builder: (context, state) => const HomePage(),
        ),
        GoRoute(
          path: AppRoutes.login,
          name: 'login',
          builder: (context, state) => const LoginPage(),
        ),
        GoRoute(
          path: AppRoutes.register,
          name: 'register',
          builder: (context, state) => const RegisterPage(),
        ),
        GoRoute(
          path: AppRoutes.account,
          name: 'account',
          builder: (context, state) => BlocProvider<AccountBloc>(
            create: (_) => sl<AccountBloc>()..add(const AccountRequested()),
            child: const AccountPage(),
          ),
        ),
        GoRoute(
          path: AppRoutes.productDetail,
          name: 'productDetail',
          builder: (context, state) {
            final product = state.extra as ProductEntity?;
            if (product != null) {
              return ProductDetailPage(product: product);
            }
            return Scaffold(
              appBar: AppBar(title: const Text('Product Details')),
              body: const Center(child: Text('Product not found')),
            );
          },
        ),
      ],
      errorBuilder: (context, state) => Scaffold(
        appBar: AppBar(title: const Text('Page Not Found')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'No route defined for ${state.uri}',
                style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => context.go(AppRoutes.home),
                child: const Text('Go Home'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
