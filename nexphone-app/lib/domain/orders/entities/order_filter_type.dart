enum OrderFilterType {
  all,
  pending,
  shipped,
  delivered,
  cancelled;

  String get label {
    switch (this) {
      case OrderFilterType.all:
        return 'All Orders';
      case OrderFilterType.pending:
        return 'Pending';
      case OrderFilterType.shipped:
        return 'Shipped';
      case OrderFilterType.delivered:
        return 'Delivered';
      case OrderFilterType.cancelled:
        return 'Cancelled';
    }
  }
}
