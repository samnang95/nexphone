import 'package:flutter_test/flutter_test.dart';
import 'package:nexphone_app/features/home/bloc/home_bloc.dart';
import 'package:nexphone_app/features/home/bloc/home_state.dart';

void main() {
  late HomeBloc homeBloc;

  setUp(() {
    homeBloc = HomeBloc();
  });

  tearDown(() {
    homeBloc.close();
  });

  test('initial state is HomeInitial', () {
    expect(homeBloc.state, const HomeInitial());
  });
}
