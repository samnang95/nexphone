import 'package:get_it/get_it.dart';
import '../bloc/home_bloc.dart';

void initHomeDI(GetIt sl) {
  // Presentation BLoC
  sl.registerFactory(
    () => HomeBloc(),
  );
}
