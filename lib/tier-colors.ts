/**
 * Tier renklendirmesi için utility fonksiyonlar
 * Her tier için soft, pastel renkler
 */

export function getTierBackgroundColor(tier: string): string {
  const tierNumber = parseInt(tier.split('.')[0]);
  
  switch (tierNumber) {
    case 4:
      // Soft mavi tonları
      return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
    case 5:
      // Soft yeşil tonları
      return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
    case 6:
      // Soft sarı/turuncu tonları
      return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
    case 7:
      // Soft mor tonları
      return 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800';
    case 8:
      // Soft kırmızı/pembe tonları
      return 'bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800';
    default:
      // Varsayılan gri tonları
      return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800';
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
