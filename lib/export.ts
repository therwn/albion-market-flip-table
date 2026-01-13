import { Table, Item, ProfitCalculation } from '@/types';
import { calculateItemProfit } from './calculations';

/**
 * Export table data to CSV format
 */
export function exportTableToCSV(table: Table, calculations: ProfitCalculation[]): string {
  const headers = [
    'Item Adı',
    'Tier',
    'Quality',
    'Toplam Maliyet',
    'Toplam Gelir',
    'Kar/Zarar',
    'Kar Marjı (%)',
    'Adet',
    'Black Market Tax',
    'Black Market Setup Fee',
    'Buy Order Setup Fee',
  ];

  const rows = calculations.map((calc) => [
    calc.itemName || 'İsimsiz',
    calc.tier,
    calc.quality,
    calc.totalCost.toFixed(2),
    calc.totalRevenue.toFixed(2),
    calc.profit.toFixed(2),
    calc.profitMargin.toFixed(2),
    calc.quantity.toString(),
    (calc.blackMarketTax || 0).toFixed(2),
    (calc.blackMarketSetupFee || 0).toFixed(2),
    (calc.buyOrderSetupFee || 0).toFixed(2),
  ]);

  // Add summary row
  const totalProfit = calculations.reduce((sum, c) => sum + c.profit, 0);
  const totalCost = calculations.reduce((sum, c) => sum + c.totalCost, 0);
  const totalRevenue = calculations.reduce((sum, c) => sum + c.totalRevenue, 0);
  const totalQuantity = calculations.reduce((sum, c) => sum + c.quantity, 0);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    '', // Empty row
    'TOPLAM,,,',
    `"${totalCost.toFixed(2)}","${totalRevenue.toFixed(2)}","${totalProfit.toFixed(2)}",,"${totalQuantity}"`,
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
