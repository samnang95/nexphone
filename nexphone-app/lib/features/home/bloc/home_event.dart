import 'package:equatable/equatable.dart';

abstract class HomeEvent extends Equatable {
  const HomeEvent();

  @override
  List<Object?> get props => [];
}

class HomeFetchRequested extends HomeEvent {
  const HomeFetchRequested();
}

class HomeRefreshRequested extends HomeEvent {
  const HomeRefreshRequested();
}

class HomeCategorySelected extends HomeEvent {
  final String category;

  const HomeCategorySelected(this.category);

  @override
  List<Object?> get props => [category];
}

class HomeSearchChanged extends HomeEvent {
  final String query;

  const HomeSearchChanged(this.query);

  @override
  List<Object?> get props => [query];
}
