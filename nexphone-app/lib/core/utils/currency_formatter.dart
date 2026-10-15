class CurrencyFormatter {
  CurrencyFormatter._();

  static String format(double amount, {String symbol = '\$'}) {
    final hasDecimals = amount % 1 != 0;
    if (hasDecimals) {
      final parts = amount.toStringAsFixed(2).split('.');
      final whole = _formatWithCommas(parts[0]);
      return '$symbol$whole.${parts[1]}';
    } else {
      return '$symbol${_formatWithCommas(amount.toStringAsFixed(0))}';
    }
  }

  static String _formatWithCommas(String str) {
    return str.replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }
}
