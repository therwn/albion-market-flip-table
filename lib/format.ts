/**
 * Format number with thousand separators
 * Example: 500000 -> "500.000"
 */
export function formatNumber(value: number | string): string {
  if (value === '' || value === null || value === undefined) return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/\./g, '')) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('tr-TR');
}

/**
 * Parse formatted number string to number
 * Example: "500.000" -> 500000
 */
export function parseFormattedNumber(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/\./g, '').replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Format number input value (for controlled inputs)
 */
export function formatNumberInput(value: string): string {
  if (!value) return '';
  const cleaned = value.replace(/[^\d]/g, '');
  if (!cleaned) return '';
  const num = parseFloat(cleaned);
  if (isNaN(num)) return '';
  return num.toLocaleString('tr-TR');
}

/**
 * Format currency without .00 decimals
 * Example: 500000 -> "$500.000" (not "$500.000,00")
 */
export function formatCurrency(value: number): string {
  if (value === 0) return '$0';
  return '$' + Math.round(value).toLocaleString('tr-TR');
}
