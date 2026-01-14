/**
 * Tier renklendirmesi için utility fonksiyonlar
 * Her tier için soft, pastel renkler
 */

export function getTierBackgroundColor(tier: string): string {
  if (!tier) return '';
  
  const tierNumber = parseInt(tier.split('.')[0]);
  
  switch (tierNumber) {
    case 4:
      // Soft mavi tonları
      return '!bg-blue-50 dark:!bg-blue-950/30 !border-l-4 !border-l-blue-400 dark:!border-l-blue-600';
    case 5:
      // Soft yeşil tonları
      return '!bg-green-50 dark:!bg-green-950/30 !border-l-4 !border-l-green-400 dark:!border-l-green-600';
    case 6:
      // Soft sarı/turuncu tonları
      return '!bg-yellow-50 dark:!bg-yellow-950/30 !border-l-4 !border-l-yellow-400 dark:!border-l-yellow-600';
    case 7:
      // Soft mor tonları
      return '!bg-purple-50 dark:!bg-purple-950/30 !border-l-4 !border-l-purple-400 dark:!border-l-purple-600';
    case 8:
      // Soft kırmızı/pembe tonları
      return '!bg-pink-50 dark:!bg-pink-950/30 !border-l-4 !border-l-pink-400 dark:!border-l-pink-600';
    default:
      // Varsayılan
      return '';
  }
}

export function getTierTextColor(tier: string): string {
  const tierNumber = parseInt(tier.split('.')[0]);
  
  switch (tierNumber) {
    case 4:
      return 'text-blue-700 dark:text-blue-300';
    case 5:
      return 'text-green-700 dark:text-green-300';
    case 6:
      return 'text-yellow-700 dark:text-yellow-300';
    case 7:
      return 'text-purple-700 dark:text-purple-300';
    case 8:
      return 'text-pink-700 dark:text-pink-300';
    default:
      return '';
  }
}
