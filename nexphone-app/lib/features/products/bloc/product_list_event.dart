import 'package:equatable/equatable.dart';

abstract class ProductListEvent extends Equatable {
  const ProductListEvent();

  @override
  List<Object?> get props => [];
}

class ProductListFetchRequested extends ProductListEvent {
  final String? category;
  final String? search;

  const ProductListFetchRequested({this.category, this.search});

  @override
  List<Object?> get props => [category, search];
}

class ProductListCategorySelected extends ProductListEvent {
  final String category;

  const ProductListCategorySelected(this.category);

  @override
  List<Object?> get props => [category];
}

class ProductListSearchChanged extends ProductListEvent {
  final String query;

  const ProductListSearchChanged(this.query);

  @override
  List<Object?> get props => [query];
}
