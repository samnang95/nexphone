import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../app/router/app_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';
import '../widgets/auth_header.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onLoginPressed() {
    if (_formKey.currentState?.validate() ?? false) {
      context.read<AuthBloc>().add(
            AuthLoginSubmitted(
              email: _emailController.text.trim(),
              password: _passwordController.text,
            ),
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      body: SafeArea(
        child: BlocConsumer<AuthBloc, AuthState>(
          listener: (context, state) {
            if (state is Authenticated) {
              context.go(AppRoutes.home);
            } else if (state is AuthFailureState) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(state.message),
                  backgroundColor: AppColors.roseError,
                  behavior: SnackBarBehavior.floating,
                ),
              );
            }
          },
          builder: (context, state) {
            final isLoading = state is AuthLoading;

            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const AuthHeader(
                      title: 'Welcome Back',
                      subtitle: 'Sign in to access your satellite communications and quantum device orders.',
                    ),
                    const SizedBox(height: 32),

                    AppTextField(
                      controller: _emailController,
                      labelText: 'Email Address',
                      hintText: 'alex@company.com',
                      prefixIcon: Icons.email_outlined,
                      keyboardType: TextInputType.emailAddress,
                      validator: Validators.email,
                      enabled: !isLoading,
                    ),
                    const SizedBox(height: 20),

                    AppTextField(
                      controller: _passwordController,
                      labelText: 'Password',
                      hintText: '••••••••',
                      prefixIcon: Icons.lock_outline_rounded,
                      isPassword: true,
                      validator: Validators.password,
                      enabled: !isLoading,
                    ),
                    const SizedBox(height: 12),

                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Please contact support to reset your enterprise key.'),
                            ),
                          );
                        },
                        child: const Text(
                          'Forgot Password?',
                          style: TextStyle(color: AppColors.cyanAccent, fontSize: 13),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    AppButton(
                      text: 'Sign In',
                      onPressed: _onLoginPressed,
                      isLoading: isLoading,
                      variant: AppButtonVariant.primary,
                    ),
                    const SizedBox(height: 16),

                    // Demo Credentials Helper
                    Center(
                      child: TextButton(
                        onPressed: () {
                          _emailController.text = 'customer@nexphone.com';
                          _passwordController.text = 'NexPass123!';
                        },
                        child: const Text(
                          'Fill Demo Credentials',
                          style: TextStyle(color: AppColors.textMutedDark, fontSize: 13),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          "Don't have an account? ",
                          style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 14),
                        ),
                        GestureDetector(
                          onTap: () => context.push(AppRoutes.register),
                          child: const Text(
                            'Create Account',
                            style: TextStyle(
                              color: AppColors.cyanAccent,
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
