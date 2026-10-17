import 'package:equatable/equatable.dart';

class OrderTimelineStepEntity extends Equatable {
  final String title;
  final String description;
  final String time;
  final bool isCompleted;
  final bool isCurrent;

  const OrderTimelineStepEntity({
    required this.title,
    required this.description,
    required this.time,
    required this.isCompleted,
    this.isCurrent = false,
  });

  @override
  List<Object?> get props => [title, description, time, isCompleted, isCurrent];
}
