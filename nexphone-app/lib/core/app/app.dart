import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../app/di/injection.dart';
import '../../features/auth/bloc/auth_bloc.dart';
import '../../features/auth/bloc/auth_event.dart';
import '../../features/home/bloc/home_bloc.dart';
import '../../features/products/bloc/product_list_bloc.dart';
import 'app_view.dart';

export 'app_bootstrap.dart';
export 'app_view.dart';

class NexPhoneApp extends StatelessWidget {
  const NexPhoneApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<AuthBloc>(
          create: (_) => sl<AuthBloc>()..add(const AuthCheckRequested()),
        ),
        BlocProvider<HomeBloc>(
          create: (_) => sl<HomeBloc>(),
        ),
        BlocProvider<ProductListBloc>(
          create: (_) => sl<ProductListBloc>(),
        ),
      ],
      child: const NexPhoneAppView(),
    );
  }
}
